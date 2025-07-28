
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';

const SharedSchedulesScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedSchedules = async () => {
    try {
      setLoading(true);
      const response = await client.get('/api/schedule/shared');
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch shared schedules:', error);
      Alert.alert('오류', '공유된 일정 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 화면이 포커스될 때마다 데이터를 새로고침
  useFocusEffect(
    useCallback(() => {
      fetchSharedSchedules();
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ScheduleDetail', { scheduleId: item.id, fromMySchedules: false })}
    >
      <Text style={styles.itemTitle}>{item.title || '제목 없음'}</Text>
      <Text style={styles.itemUser}>작성자: {item.username || '알 수 없음'}</Text>
      <Text style={styles.itemDate}>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.container}><Text>로딩 중...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>공유된 일정</Text>
      <FlatList
        data={schedules}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>공유된 일정이 없습니다.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40, // 상단 여백 추가
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemUser: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default SharedSchedulesScreen;
