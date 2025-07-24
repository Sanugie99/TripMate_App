
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import client from '../api/client';

// 실제 앱에서는 DatePicker 라이브러리를 사용하는 것이 좋습니다.
// 여기서는 간단하게 텍스트 입력(YYYY-MM-DD)으로 대체합니다.

const ManualCreateScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState('');   // YYYY-MM-DD

  const handleCreate = async () => {
    if (!title || !startDate || !endDate) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      const requestBody = {
        title,
        startDate,
        endDate,
        places: [], // 장소는 상세화면에서 추가하도록 단순화
      };
      const response = await client.post('/api/schedule', requestBody);
      
      Alert.alert('성공', '일정이 생성되었습니다. 이제 장소를 추가해보세요!');
      // 생성된 일정의 상세 페이지로 이동
      navigation.replace('ScheduleDetail', { scheduleId: response.data.id });
    } catch (error) {
      console.error('Failed to create schedule:', error);
      Alert.alert('오류', '일정 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>수동 일정 생성</Text>
      
      <CustomInput
        placeholder="일정 제목"
        value={title}
        onChangeText={setTitle}
      />
      <CustomInput
        placeholder="시작일 (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
      />
      <CustomInput
        placeholder="종료일 (YYYY-MM-DD)"
        value={endDate}
        onChangeText={setEndDate}
      />

      <CustomButton title="생성하기" onPress={handleCreate} />
      <CustomButton title="뒤로가기" onPress={() => navigation.goBack()} type="SECONDARY" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
});

export default ManualCreateScreen;
