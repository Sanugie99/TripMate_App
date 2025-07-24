import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Button,
  TouchableOpacity, ScrollView, Modal, FlatList, TextInput
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import axios from 'axios';
import dayjs from 'dayjs';
import client from '../api/client';
import ScheduleMapComponent from '../components/map/ScheduleMapComponent';
import PlaceCard from '../components/schedule/PlaceCard';

const KAKAO_API_KEY = "1bf61ebd329fb75d565cfa8dcb9ab263";

const addTempId = (place) => ({ ...place, tempId: Math.random().toString() });

const ScheduleEditorScreen = ({ route, navigation }) => {
  const { plannerData, existingSchedule } = route.params;
  const isEditing = !!existingSchedule;

  const [schedule, setSchedule] = useState({ dailyPlan: {} });
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [isRecommendModalVisible, setRecommendModalVisible] = useState(false);
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [searchedPlaces, setSearchedPlaces] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateTabs, setDateTabs] = useState([]);

  useEffect(() => {
    if (isEditing && existingSchedule) {
      const dailyPlanWithTempIds = {};
      for (const date in existingSchedule.dailyPlan) {
        dailyPlanWithTempIds[date] = existingSchedule.dailyPlan[date].map(addTempId);
      }
      setSchedule({ ...existingSchedule, dailyPlan: dailyPlanWithTempIds });
      setScheduleTitle(existingSchedule.title);
      const sortedDates = Object.keys(existingSchedule.dailyPlan).sort();
      setDateTabs(sortedDates);
      setSelectedDate(sortedDates[0]);
    } else if (plannerData) {
      const dailyPlan = {};
      const dates = [];
      const start = dayjs(plannerData.startDate);
      for (let i = 0; i < plannerData.days; i++) {
        const date = start.add(i, 'day').format('YYYY-MM-DD');
        dailyPlan[date] = [];
        dates.push(date);
      }
      setSchedule({ dailyPlan });
      setScheduleTitle(`${plannerData.destination} 여행`);
      setDateTabs(dates);
      setSelectedDate(plannerData.startDate);
    }
  }, [plannerData, existingSchedule, isEditing]);

  const handleGenerateSchedule = async () => {
    if (isEditing) return;
    setLoading(true);
    try {
      const response = await client.post('/api/schedule/generate-multi', {
        departure: plannerData.departure,
        arrival: plannerData.destination,
        date: plannerData.startDate,
        days: plannerData.days,
      });
      if (response.data && Object.keys(response.data.dailyPlan).length > 0) {
        const newDailyPlan = {};
        for (const date in response.data.dailyPlan) {
          newDailyPlan[date] = response.data.dailyPlan[date].map(addTempId);
        }
        setSchedule({ ...response.data, dailyPlan: newDailyPlan });
        const firstDate = Object.keys(response.data.dailyPlan)[0];
        setSelectedDate(firstDate);
      }
    } catch (err) {
      Alert.alert('오류', '자동 일정 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendPlaces = async () => {
    const destination = isEditing ? schedule.arrival : plannerData.destination;
    setRecommendLoading(true);
    setRecommendModalVisible(true);
    try {
      const response = await client.get('/api/schedule/places/recommend', {
        params: { keyword: destination }
      });
      setRecommendedPlaces(response.data.map(addTempId));
    } catch (error) {
      Alert.alert('오류', '추천 장소를 불러오는 데 실패했습니다.');
      setRecommendModalVisible(false);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleSearchPlaces = async (query) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    try {
      const response = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
        params: { query: query.trim(), size: 15 },
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
      });
      setSearchedPlaces(response.data.documents);
    } catch (error) {
      Alert.alert('오류', '장소 검색에 실패했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddPlaceToSchedule = (place) => {
    if (!selectedDate) {
      Alert.alert('알림', '장소를 추가할 날짜를 먼저 선택해주세요.');
      return;
    }
    setSchedule(prev => {
      const newDailyPlan = { ...prev.dailyPlan };
      const currentPlaces = newDailyPlan[selectedDate] || [];
      newDailyPlan[selectedDate] = [...currentPlaces, addTempId(place)];
      return { ...prev, dailyPlan: newDailyPlan };
    });
    Alert.alert('성공', `${place.name}을(를) ${selectedDate} 일정에 추가했습니다.`);
  };

  const handleAddSearchedPlace = (place) => {
    const newPlace = {
      name: place.place_name,
      address: place.address_name,
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      category: place.category_group_name,
    };
    handleAddPlaceToSchedule(newPlace);
    setSearchModalVisible(false);
    setSearchedPlaces([]);
    setSearchQuery('');
  };

  const handleSaveSchedule = async () => {
    if (!schedule || !schedule.dailyPlan) return;
    const places = Object.entries(schedule.dailyPlan).flatMap(([date, placesOnDate]) =>
      placesOnDate.map(({ tempId, ...rest }) => ({ ...rest, date }))
    );

    let requestBody = {
      title: scheduleTitle,
      places: places,
    };

    try {
      if (isEditing) {
        requestBody.id = schedule.id;
        requestBody.departure = schedule.departure;
        requestBody.arrival = schedule.arrival;
        requestBody.date = schedule.startDate;
        requestBody.days = schedule.days;
        requestBody.startTime = schedule.startTime;
        requestBody.endTime = schedule.endTime;

        await client.put(`/api/schedule/${schedule.id}`, requestBody);
        Alert.alert('성공', '일정이 수정되었습니다!');
      } else {
        const goTime = plannerData.goTransport.split('|')[1];
        const returnTime = plannerData.returnTransport.split('|')[2];
        requestBody = {
          ...requestBody,
          departure: plannerData.departure,
          arrival: plannerData.destination,
          date: plannerData.startDate,
          days: plannerData.days,
          startTime: `${plannerData.startDate}T${goTime}:00`,
          endTime: `${plannerData.endDate}T${returnTime}:00`,
        };
        await client.post('/api/schedule', requestBody);
        Alert.alert('성공', '일정이 저장되었습니다!');
      }
      navigation.navigate('MySchedules');
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const onDragEnd = ({ data }) => {
    setSchedule(prev => ({
      ...prev,
      dailyPlan: { ...prev.dailyPlan, [selectedDate]: data }
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <ScheduleMapComponent dailyPlan={schedule?.dailyPlan || {}} selectedDate={selectedDate} selectedPlace={setSelectedPlace} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.controlsContainer}>
          <TextInput style={styles.titleInput} value={scheduleTitle} onChangeText={setScheduleTitle} />
          <Text style={styles.dates}>
            {isEditing
              ? `${dayjs(schedule.startDate).format('YYYY.MM.DD')} ~ ${dayjs(schedule.endDate).format('YYYY.MM.DD')}`
              : `${plannerData.startDate} ~ ${plannerData.endDate}`
            }
          </Text>
          <View style={styles.buttonRow}>
            <Button title="자동 일정 생성" onPress={handleGenerateSchedule} disabled={isEditing} />
            <Button title="장소 추천" onPress={handleRecommendPlaces} />
            <Button title="위치 추가" onPress={() => setSearchModalVisible(true)} />
          </View>
        </View>
        
        <View style={{ height: 55 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {dateTabs.map(date => (
              <TouchableOpacity key={date} style={[styles.tabButton, selectedDate === date && styles.activeTab]} onPress={() => setSelectedDate(date)}>
                <Text style={[styles.tabText, selectedDate === date && styles.activeTabText]}>{date.substring(5)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ flex: 1 }}>
          {loading ? <ActivityIndicator size="large" style={{ flex: 1 }} /> : (
            <DraggableFlatList
              data={schedule.dailyPlan[selectedDate] || []}
              renderItem={({ item, drag, isActive }) => (
                <TouchableOpacity onLongPress={drag} disabled={isActive} onPress={() => setSelectedPlace(item)}>
                  <PlaceCard item={item} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.tempId}
              onDragEnd={onDragEnd}
              ListFooterComponent={<View style={{ padding: 10 }}><Button title="일정 저장하기" onPress={handleSaveSchedule} /></View>}
              ListEmptyComponent={<Text style={styles.noDataText}>일정이 없습니다.</Text>}
            />
          )}
        </View>
      </View>

      <Modal visible={isRecommendModalVisible} onRequestClose={() => setRecommendModalVisible(false)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <Text style={styles.modalTitle}>추천 장소</Text>
            <View style={styles.modalWrapper}>
              {recommendLoading ? <ActivityIndicator size="large" /> : (
                <FlatList
                  data={recommendedPlaces}
                  keyExtractor={(item) => item.tempId}
                  renderItem={({ item }) => (
                    <View style={styles.recommendItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.recommendName}>{item.name}</Text>
                        <Text style={styles.recommendAddress}>{item.address}</Text>
                      </View>
                      <TouchableOpacity style={styles.addButton} onPress={() => handleAddPlaceToSchedule(item)}>
                        <Text style={styles.addButtonText}>추가</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
            </View>
            <Button title="닫기" onPress={() => setRecommendModalVisible(false)} />
          </SafeAreaView>
        </View>
      </Modal>
      <Modal visible={isSearchModalVisible} onRequestClose={() => setSearchModalVisible(false)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <Text style={styles.modalTitle}>위치 검색</Text>
            <View style={styles.searchBar}>
              <TextInput style={styles.searchInput} placeholder="장소, 주소 검색" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={() => handleSearchPlaces(searchQuery)} />
            </View>
            <View style={styles.modalWrapper}>
              {searchLoading ? <ActivityIndicator /> : (
                <FlatList
                  data={searchedPlaces}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.searchItem} onPress={() => handleAddSearchedPlace(item)}>
                      <Text style={styles.recommendName}>{item.place_name}</Text>
                      <Text style={styles.recommendAddress}>{item.address_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
            <Button title="닫기" onPress={() => setSearchModalVisible(false)} />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  mapContainer: { height: '40%', backgroundColor: '#e9ecef' },
  contentContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  controlsContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  titleInput: { fontSize: 22, fontWeight: 'bold', padding: 5 },
  dates: { fontSize: 16, color: '#666', marginTop: 4, paddingLeft: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  tabsContainer: { paddingVertical: 10, paddingHorizontal: 10 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#eee', borderRadius: 20, marginRight: 10 },
  activeTab: { backgroundColor: '#007BFF' },
  tabText: { color: '#333', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: 'white' },
  noDataText: { textAlign: 'center', marginTop: 40, color: '#6c757d', fontSize: 16 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', height: '70%', backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalWrapper: { flex: 1 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  recommendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  recommendName: { fontSize: 16, fontWeight: 'bold' },
  recommendAddress: { fontSize: 12, color: '#666' },
  addButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  searchBar: { padding: 10 },
  searchInput: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10 },
  searchItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export default ScheduleEditorScreen;