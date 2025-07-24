import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Button,
  TouchableOpacity, ScrollView, Modal, FlatList, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 🚀 [추가]
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
  const insets = useSafeAreaInsets(); // 🚀 [추가] 안전 영역 insets 가져오기

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
        
        const sortedDates = Object.keys(newDailyPlan).sort();
        
        // 🚀 [수정] 상태 업데이트 순서를 명확히 하여 지도 갱신을 보장
        setSchedule({ ...response.data, dailyPlan: newDailyPlan });
        setDateTabs(sortedDates);
        setSelectedDate(sortedDates[0]); // 가장 마지막에 업데이트하여 변경 감지를 유도

      }
    } catch (err) {
      Alert.alert('오류', '자동 일정 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendPlaces = async () => {
    // 🚀 [최종 수정] 목적지 정보를 가장 안전하게 가져오고, 모든 예외 상황을 처리합니다.
    const destination = isEditing ? schedule?.arrival : plannerData?.destination;
    if (!destination) {
      Alert.alert('알림', '추천 장소를 검색할 목적지를 찾을 수 없습니다.');
      return;
    }

    setRecommendModalVisible(true);
    setRecommendLoading(true);
    
    try {
      const response = await client.get('/api/schedule/places/recommend', {
        params: { keyword: destination }
      });

      if (Array.isArray(response.data)) {
        setRecommendedPlaces(response.data.map(addTempId));
      } else {
        console.warn("API 응답이 배열이 아닙니다:", response.data);
        setRecommendedPlaces([]);
      }
    } catch (error) {
      console.error("장소 추천 API 호출 중 오류 발생:", error);
      Alert.alert('오류', '추천 장소를 불러오는 중 문제가 발생했습니다. 네트워크 상태를 확인해 주세요.');
      setRecommendedPlaces([]); // 실패 시에도 모달은 닫지 않고, 목록만 비웁니다.
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
    // 🚀 [수정] 불변성을 지키기 위해 새로운 객체와 배열로 상태 업데이트
    setSchedule(prev => {
      const newDailyPlan = { ...prev.dailyPlan };
      const currentPlaces = prev.dailyPlan[selectedDate] || [];
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
    // 🚀 [수정] 불변성을 지키기 위해 새로운 객체로 상태 업데이트
    setSchedule(prev => {
      const newDailyPlan = { ...prev.dailyPlan };
      newDailyPlan[selectedDate] = data;
      return { ...prev, dailyPlan: newDailyPlan };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {/* 🚀 [수정] 항상 유효한 dailyPlan 객체를 전달하도록 보장 */}
        <ScheduleMapComponent 
          dailyPlan={schedule?.dailyPlan ?? {}} 
          selectedDate={selectedDate} 
          selectedPlace={setSelectedPlace} 
        />
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
                <TouchableOpacity onLongPress={drag} disabled={isActive}>
                  {/* 🚀 [수정] onPlaceClick에 setSelectedPlace 함수를 전달 */}
                  <PlaceCard item={item} onPlaceClick={setSelectedPlace} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.tempId}
              onDragEnd={onDragEnd}
              // 🚀 [수정] 시스템 네비게이션 바 높이만큼 하단 여백 추가
              ListFooterComponent={<View style={{ paddingBottom: insets.bottom + 20 }}><Button title="일정 저장하기" onPress={handleSaveSchedule} /></View>}
              ListEmptyComponent={<Text style={styles.noDataText}>일정이 없습니다.</Text>}
            />
          )}
        </View>
      </View>

      {/* 🚀 [수정] transparent 옵션과 modalOverlay를 다시 적용하여 카드 형태 유지 */}
      <Modal visible={isRecommendModalVisible} onRequestClose={() => setRecommendModalVisible(false)} transparent animationType="fade">
        {/* The overlay now has its own dedicated View */}
        <View style={styles.modalOverlay}>
          {/* The card's shape and style are defined in this View */}
          <View style={styles.modalContent}>
            {/* SafeAreaView is now safely inside the card */}
            <SafeAreaView style={styles.modalSafeArea}>
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
              <Button title="닫기" onPress={() => setRecommendModalVisible(false)} style={{length:60}} />
            </SafeAreaView>
          </View>
        </View>
      </Modal>
      {/* 🚀 [수정] transparent 옵션과 modalOverlay를 다시 적용하여 카드 형태 유지 */}
      <Modal visible={isSearchModalVisible} onRequestClose={() => setSearchModalVisible(false)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <SafeAreaView style={styles.modalSafeArea}>
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
              <Button title="닫기" onPress={() => setSearchModalVisible(false)} style={{length:40}} />
            </SafeAreaView>
          </View>
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
  modalContent: { width: '90%', height: '70%', backgroundColor: 'white', borderRadius: 15, overflow: 'hidden' },
  modalSafeArea: { flex: 1, alignItems: 'center' },
  modalWrapper: { flex: 1, width: '100%', marginTop: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  recommendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%' },
  recommendName: { fontSize: 16, fontWeight: 'bold' },
  recommendAddress: { fontSize: 12, color: '#666' },
  addButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  searchBar: { padding: 10 },
  searchInput: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10 },
  searchItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
});

export default ScheduleEditorScreen;