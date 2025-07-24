
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity,
  TextInput, SectionList, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import client from '../api/client';
import dayjs from 'dayjs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScheduleMapComponent from '../components/map/ScheduleMapComponent';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// 🚀 [추가] 댓글 컴포넌트
const CommentItem = ({ comment, onReply, onDelete, user }) => {
  const isAuthor = user && comment.user && user.userId === comment.user.userId;
  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{comment.user?.username || '익명'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onReply(comment)} style={styles.replyButton}>
            <Text style={styles.replyButtonText}>답글</Text>
          </TouchableOpacity>
          {isAuthor && (
            <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <Text style={styles.commentDate}>{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} user={user} />
          ))}
        </View>
      )}
    </View>
  );
};

const ScheduleDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { scheduleId } = route.params;
  const { user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [comments, setComments] = useState([]); // 🚀 [수정] reviews -> comments
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null); // 🚀 [추가] 답글 대상 상태

  // 🚀 [최종 수정] scheduleId가 변경될 때마다 모든 데이터를 새로고침하는 가장 확실한 방법
  useEffect(() => {
    let isActive = true; // 컴포넌트가 활성화 상태인지 추적

    const loadScheduleDetails = async () => {
      // 1. API 요청 전에 모든 상태를 즉시, 확실하게 초기화
      setLoading(true);
      setSchedule(null);
      setComments([]);
      setSelectedDate(null);

      try {
        const [scheduleResponse, commentsResponse] = await Promise.all([
          client.get(`/api/schedule/${scheduleId}`),
          client.get(`/api/schedule/${scheduleId}/comments`)
        ]);

        if (!isActive) return; // 데이터를 불러오는 동안 화면을 벗어나면 상태 업데이트 중단

        // 2. 새로운 데이터로 상태 업데이트
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
          
          const dates = Object.keys(dailyPlan).sort();
          setSelectedDate(dates[0] || null);
        }
        if (commentsResponse.data) {
          setComments(commentsResponse.data);
        }
      } catch (error) {
        if (!isActive) return;
        Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
        navigation.goBack();
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    if (scheduleId) {
      loadScheduleDetails();
    }

    // 3. 화면을 벗어나면 isActive를 false로 설정하여 모든 비동기 작업 중단
    return () => {
      isActive = false;
    };
  }, [scheduleId, navigation]); // 오직 scheduleId가 바뀔 때만 이 모든 로직이 실행됨

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

  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    try {
      const requestBody = {
        content: newComment,
        parentId: replyTo ? replyTo.id : null,
      };
      // 🚀 [수정] API 호출 후, 전체 목록을 다시 불러오는 대신 로컬 상태를 직접 업데이트
      const response = await client.post(`/api/schedule/${scheduleId}/comments`, requestBody);
      const newCommentData = response.data;

      if (replyTo) {
        // 답글인 경우, 부모 댓글을 찾아 replies 배열에 추가
        setComments(prevComments => {
          const findAndAddReply = (comments) => {
            return comments.map(comment => {
              if (comment.id === replyTo.id) {
                return { ...comment, replies: [...comment.replies, newCommentData] };
              }
              if (comment.replies && comment.replies.length > 0) {
                return { ...comment, replies: findAndAddReply(comment.replies) };
              }
              return comment;
            });
          };
          return findAndAddReply(prevComments);
        });
      } else {
        // 새 댓글인 경우, 목록 맨 뒤에 추가
        setComments(prevComments => [...prevComments, newCommentData]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("댓글 삭제", "정말로 이 댓글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          onPress: async () => {
            try {
              await client.delete(`/api/comments/${commentId}`);
              // 🚀 [수정] API 호출 후, 전체 목록을 다시 불러오는 대신 로컬 상태를 직접 업데이트
              setComments(prevComments => {
                const removeComment = (comments) => {
                  return comments.filter(comment => {
                    if (comment.id === commentId) {
                      return false;
                    }
                    if (comment.replies && comment.replies.length > 0) {
                      comment.replies = removeComment(comment.replies);
                    }
                    return true;
                  });
                };
                return removeComment(prevComments);
              });
            } catch (error) {
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
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

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }
  if (!schedule) {
    return <View style={styles.centered}><Text>일정 정보를 불러오지 못했습니다.</Text></View>;
  }

  const isOwner = user && schedule.user && String(user.userId) === String(schedule.user.userId);

  const sections = [
    { title: '장소 목록', data: schedule.dailyPlan && selectedDate ? schedule.dailyPlan[selectedDate] : [], renderItem: renderPlaceItem },
    { title: '댓글', data: comments, renderItem: ({ item }) => <CommentItem comment={item} onReply={setReplyTo} onDelete={handleDeleteComment} user={user} /> },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
            stickySectionHeadersEnabled={false}
            style={{ flex: 1 }}
          />
          
          {/* 🚀 [수정] 세련된 댓글 입력창 UI */}
          <View style={styles.commentInputContainer}>
            {replyTo && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>@{replyTo?.user?.username || '익명'}님에게 답글 남기는 중...</Text>
                <TouchableOpacity onPress={() => setReplyTo(null)}>
                  <Ionicons name="close-circle-outline" size={20} color="#6c757d" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.commentInput} 
                placeholder="따뜻한 댓글을 남겨주세요 :)" 
                value={newComment} 
                onChangeText={setNewComment} 
                placeholderTextColor="#868e96"
              />
              <TouchableOpacity style={styles.submitCommentButton} onPress={handleCreateComment}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// 🚀 [수정] 새로운 댓글 스타일 추가
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
  commentContainer: { paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentUser: { fontWeight: 'bold' },
  commentContent: { marginTop: 4 },
  commentDate: { fontSize: 12, color: '#868e96', marginTop: 4 },
  replyButton: { padding: 5 },
  replyButtonText: { color: '#007bff', fontSize: 12 },
  deleteButton: { padding: 5, marginLeft: 10 },
  deleteButtonText: { color: 'red', fontSize: 12 },
  repliesContainer: { marginLeft: 20, borderLeftWidth: 1, borderLeftColor: '#e9ecef', marginTop: 10, paddingTop: 5 },
  commentInputContainer: { padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9ecef' },
  replyingToContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 5 },
  replyingToText: { fontSize: 12, color: '#6c757d', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  commentInput: { flex: 1, height: 40, backgroundColor: '#f1f3f5', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  submitCommentButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center' },
  submitCommentButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ScheduleDetailScreen;
