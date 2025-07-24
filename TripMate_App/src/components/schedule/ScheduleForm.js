
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const ScheduleForm = ({ onSubmit, defaultArrival = '', defaultDays = 3 }) => {
  const [departure, setDeparture] = useState('서울'); // Default departure
  const [arrival, setArrival] = useState(defaultArrival);
  const [date, setDate] = useState(''); // YYYY-MM-DD format
  const [days, setDays] = useState(defaultDays.toString());

  useEffect(() => {
    setArrival(defaultArrival);
  }, [defaultArrival]);

  const handleSubmit = () => {
    if (!departure || !arrival || !date || !days) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }
    // Basic date format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('입력 오류', '날짜 형식을 YYYY-MM-DD에 맞게 입력해주세요.');
      return;
    }
    onSubmit({
      departure,
      arrival,
      date,
      days: parseInt(days, 10),
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>출발지:</Text>
        <TextInput
          style={styles.input}
          value={departure}
          onChangeText={setDeparture}
          placeholder="예: 서울"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>도착지:</Text>
        <TextInput
          style={styles.input}
          value={arrival}
          onChangeText={setArrival}
          placeholder="예: 부산"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>출발 날짜:</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>여행 기간 (일):</Text>
        <TextInput
          style={styles.input}
          value={days}
          onChangeText={setDays}
          keyboardType="number-pad"
        />
      </View>
      <Button title="일정 생성" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
  },
  formGroup: {
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    fontSize: 16,
  },
});

export default ScheduleForm;
