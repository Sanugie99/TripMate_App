
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import client from '../api/client';

// 실제 앱에서는 DatePicker, TimePicker 라이브러리를 사용하는 것이 좋습니다.
// 여기서는 간단하게 텍스트 입력으로 대체합니다.

const AutoCreateScreen = ({ navigation }) => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [startTime, setStartTime] = useState('09:00'); // 예: HH:mm
  const [endTime, setEndTime] = useState('18:00');   // 예: HH:mm
  const [transportType, setTransportType] = useState('대중교통'); // 또는 '자가용' 등

  const handleCreate = async () => {
    if (!departure || !arrival || !startTime || !endTime) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      const requestBody = {
        departure,
        arrival,
        startTime,
        endTime,
        transportType,
      };
      const response = await client.post('/api/schedule/auto-generate', requestBody);
      
      Alert.alert('성공', '자동으로 일정이 생성되었습니다!');
      // 생성된 일정의 상세 페이지로 이동
      navigation.replace('ScheduleDetail', { scheduleId: response.data.scheduleId });
    } catch (error) {
      console.error('Failed to auto-create schedule:', error);
      Alert.alert('오류', '일정 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>자동 일정 생성</Text>
      
      <CustomInput
        placeholder="출발지"
        value={departure}
        onChangeText={setDeparture}
      />
      <CustomInput
        placeholder="도착지 (여행할 도시)"
        value={arrival}
        onChangeText={setArrival}
      />
      <CustomInput
        placeholder="시작 시간 (예: 09:00)"
        value={startTime}
        onChangeText={setStartTime}
      />
      <CustomInput
        placeholder="종료 시간 (예: 18:00)"
        value={endTime}
        onChangeText={setEndTime}
      />
      <CustomInput
        placeholder="교통수단 (예: 대중교통)"
        value={transportType}
        onChangeText={setTransportType}
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

export default AutoCreateScreen;
