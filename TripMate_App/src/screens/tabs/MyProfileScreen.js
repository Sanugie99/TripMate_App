import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const MyProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('my');
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState({ my: [], shared: [], saved: [] });
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!user || !user.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [profileRes, myRes, sharedRes, savedRes] = await Promise.all([
        client.get(`/api/users/${user.userId}`),
        client.get(`/api/schedule/my-schedules`), // Correct endpoint for user's own schedules
        client.get(`/api/schedule/shared/my`),   // Correct endpoint for schedules shared with the user
        client.get(`/api/schedule/saved/my`),     // Correct endpoint for user's saved schedules
      ]);
      setProfile(profileRes.data);
      setSchedules({
        my: myRes.data,
        shared: sharedRes.data,
        saved: savedRes.data,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('오류', '데이터를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );

  const handleLogout = () => {
    logout();
    // App.js에서 user 상태가 변경되어 자동으로 로그인 화면으로 전환됩니다.
  };

  const handleDeleteSchedule = async (scheduleId) => {
    Alert.alert('삭제 확인', '정말로 이 일정을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        onPress: async () => {
          try {
            await client.delete(`/api/schedule/${scheduleId}`);
            Alert.alert('성공', '일정이 삭제되었습니다.');
            fetchAllData(); // 데이터 다시 로드
          } catch (error) {
            Alert.alert('오류', '일정 삭제에 실패했습니다.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderScheduleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scheduleItem}
      onPress={() => navigation.navigate('ScheduleDetail', { scheduleId: item.id })}
    >
      <Text style={styles.scheduleTitle}>{item.title}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteSchedule(item.id)}
        >
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {profile && (
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>{profile.username}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.profileButtons}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('EditProfile', { profile })}
            >
              <Text style={styles.profileButtonText}>정보 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton} onPress={handleLogout}>
              <Text style={styles.profileButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={styles.tabText}>내 일정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shared' && styles.activeTab]}
          onPress={() => setActiveTab('shared')}
        >
          <Text style={styles.tabText}>공유된 일정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={styles.tabText}>저장된 일정</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={schedules[activeTab]}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>해당 일정이 없습니다.</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    marginTop: 20, // 상단 여백 추가
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  profileButtons: {
    flexDirection: 'row',
    marginTop: 15,
  },
  profileButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingTop: 10,
  },
  tab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20, // Add padding to the bottom
  },
  scheduleItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTitle: {
    fontSize: 18,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default MyProfileScreen;
