
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity,
  TextInput, SectionList, SafeAreaView, ScrollView
} from 'react-native';
import client from '../api/client';
import dayjs from 'dayjs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScheduleMapComponent from '../components/map/ScheduleMapComponent';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ScheduleDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { scheduleId } = route.params;
  const { user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newReview, setNewReview] = useState('');

  const fetchDetails = useCallback(async () => {
    try {
      const [scheduleResponse, reviewsResponse] = await Promise.all([
        client.get(`/api/schedule/${scheduleId}`),
        client.get(`/api/reviews/schedule/${scheduleId}`)
      ]);

      if (scheduleResponse.data) {
        const rawSchedule = scheduleResponse.data;
        
        const dailyPlan = (rawSchedule.places || []).reduce((acc, place) => {
          const date = dayjs(place.date).format('YYYY-MM-DD');
          if (!acc[date]) acc[date] = [];
          acc[date].push(place);
          return acc;
        }, {});

        const transformedSchedule = { ...rawSchedule, dailyPlan };
        setSchedule(transformedSchedule);

        const dates = Object.keys(dailyPlan);
        if (!selectedDate || !dates.includes(selectedDate)) {
          setSelectedDate(dates[0] || null);
        }
      }
      if (reviewsResponse.data) {
        setReviews(reviewsResponse.data);
      }
    } catch (error) {
      Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [scheduleId, navigation]); // selectedDate removed from dependency array

  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Set loading true on focus
      fetchDetails();

      return () => {
        // Optional: Cleanup when the screen loses focus
        setSchedule(null);
        setReviews([]);
        setSelectedDate(null);
      };
    }, [fetchDetails])
  );

  const handleLike = async (type) => {
    try {
      const response = await client.post(`/api/schedule/${scheduleId}/${type}`);
      setSchedule(prev => ({ ...prev, likes: response.data.likes, dislikes: response.data.dislikes }));
    } catch (error) {
      Alert.alert('오류', '요청에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    try {
      await client.put(`/api/schedule/${scheduleId}/share`, { isPublic: !schedule.isPublic });
      setSchedule(prev => ({ ...prev, isPublic: !prev.isPublic }));
      Alert.alert('성공', `일정이 ${!schedule.isPublic ? '공개' : '비공개'} 처리되었습니다.`);
    } catch (error) {
      Alert.alert('오류', '공유 상태 변경에 실패했습니다.');
    }
  };

  const handleCreateReview = async () => {
    if (!newReview.trim()) return;
    try {
      const response = await client.post(`/api/reviews/schedule/${scheduleId}`, { content: newReview });
      setReviews(prevReviews => [...prevReviews, response.data]);
      setNewReview('');
    } catch (error) {
      Alert.alert('오류', '리뷰 작성에 실패했습니다.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert(
      "리뷰 삭제",
      "정말로 이 리뷰를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          onPress: async () => {
            try {
              await client.delete(`/api/reviews/${reviewId}`);
              setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
            } catch (error) {
              Alert.alert('오류', '리뷰 삭제에 실패했습니다.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('ScheduleEditor', { existingSchedule: schedule });
  };

  const handleCopyToMySchedules = async () => {
    try {
      await client.post(`/api/schedule/copy/${scheduleId}`);
      Alert.alert('성공', '일정이 내 정보에 저장되었습니다.');
    } catch (error) {
      Alert.alert('오류', '일정 저장에 실패했습니다.');
    }
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity style={styles.placeItem} onPress={() => setSelectedPlace(item)}>
      <Text style={styles.placeName}>{item.name}</Text>
      <Text style={styles.placeAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  const renderReviewItem = ({ item }) => {
    const isAuthor = user && item.user && user.userId === item.user.userId;
    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewUser}>{item.user?.username || '익명'}</Text>
          {isAuthor && (
            <TouchableOpacity onPress={() => handleDeleteReview(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.reviewContent}>{item.content}</Text>
        <Text style={styles.reviewDate}>{dayjs(item.createdAt).format('YYYY-MM-DD')}</Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }
  if (!schedule) {
    return <View style={styles.centered}><Text>일정 정보를 불러오지 못했습니다.</Text></View>;
  }

  const isOwner = user && schedule.user && String(user.userId) === String(schedule.user.userId);

  const sections = [
    { title: '장소 목록', data: schedule.dailyPlan && selectedDate ? schedule.dailyPlan[selectedDate] : [], renderItem: renderPlaceItem },
    { title: '리뷰', data: reviews, renderItem: renderReviewItem },
  ];

  return (
    <SafeAreaView style={styles.container}>
     
      <View style={styles.mapContainer}>
        <ScheduleMapComponent dailyPlan={schedule.dailyPlan} selectedDate={selectedDate} selectedPlace={selectedPlace} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.title} numberOfLines={1}>{schedule.title}</Text>
            {isOwner && (
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.authorText}>작성자: {schedule.user?.username || '알 수 없음'}</Text>
          <Text style={styles.dateRange}>
            {dayjs(schedule.startDate).format('YYYY.MM.DD')} - {dayjs(schedule.endDate).format('YYYY.MM.DD')}
          </Text>
          <View style={styles.metaContainer}>
            <View style={styles.likeContainer}>
              <TouchableOpacity onPress={() => handleLike('like')} style={styles.iconButton}>
                <Ionicons name="thumbs-up-outline" size={20} color="#007bff" />
                <Text style={styles.likeText}>{schedule.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLike('dislike')} style={styles.iconButton}>
                <Ionicons name="thumbs-down-outline" size={20} color="#dc3545" />
                <Text style={styles.likeText}>{schedule.dislikes}</Text>
              </TouchableOpacity>
            </View>
            {isOwner ? (
              <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Ionicons name={schedule.isPublic ? "lock-open-outline" : "lock-closed-outline"} size={20} color="#17a2b8" />
                <Text style={styles.shareText}>{schedule.isPublic ? '공유 중' : '비공개'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCopyToMySchedules} style={styles.copyButton}>
                <Ionicons name="duplicate-outline" size={20} color="white" />
                <Text style={styles.copyButtonText}>내 일정에 넣기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 44 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
            {Object.keys(schedule.dailyPlan).sort().map((date, index) => (
              <TouchableOpacity key={date} style={[styles.dayTab, selectedDate === date && styles.dayTabActive]} onPress={() => setSelectedDate(date)}>
                <Text style={styles.dayTabText}>Day {index + 1}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
          renderItem={({ section, ...rest }) => section.renderItem({ ...rest })}
          renderSectionHeader={({ section: { title, data } }) => (
            data.length > 0 ? <Text style={styles.sectionTitle}>{title}</Text> : null
          )}
          ListFooterComponent={
            <View style={styles.reviewInputContainer}>
              <TextInput style={styles.reviewInput} placeholder="리뷰를 남겨주세요..." value={newReview} onChangeText={setNewReview} />
              <TouchableOpacity style={styles.submitReviewButton} onPress={handleCreateReview}>
                <Text style={styles.submitReviewButtonText}>등록</Text>
              </TouchableOpacity>
            </View>
          }
          stickySectionHeadersEnabled={false}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { height: '35%', backgroundColor: '#e9ecef' },
  contentContainer: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20 },
  header: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10 },
  editButton: { backgroundColor: '#6c757d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  editButtonText: { color: 'white', fontWeight: 'bold' },
  authorText: { fontSize: 14, color: '#868e96', marginTop: 4 },
  dateRange: { fontSize: 16, color: '#868e96', marginTop: 4 },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  likeContainer: { flexDirection: 'row', gap: 15 },
  iconButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeText: { fontSize: 16, color: '#495057' },
  shareText: { fontSize: 16, color: '#17a2b8' },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  copyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  dayTabs: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', alignSelf: 'flex-start' },
  dayTab: { paddingVertical: 8, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: '#007bff' },
  dayTabText: { fontSize: 16, fontWeight: 'bold', color: '#495057' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5, backgroundColor: 'white' },
  placeItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', backgroundColor: 'white' },
  placeName: { fontSize: 18 },
  placeAddress: { fontSize: 14, color: '#868e96' },
  reviewItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f3f5', backgroundColor: 'white' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { fontWeight: 'bold' },
  reviewContent: { marginTop: 4 },
  reviewDate: { fontSize: 12, color: '#868e96', marginTop: 4 },
  deleteButton: { padding: 5 },
  deleteButtonText: { color: 'red', fontSize: 12 },
  reviewInputContainer: { flexDirection: 'row', padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee' },
  reviewInput: { flex: 1, borderColor: '#ced4da', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10 },
  submitReviewButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginLeft: 10, justifyContent: 'center' },
  submitReviewButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ScheduleDetailScreen;
