import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Modal, Alert,
  KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import PrimaryButton from '../components/PrimaryButton';
import TransportSelectModal from '../components/TransportSelectModal';
import TimePickerModal from '../components/TimePickerModal';

const PlannerSetupScreen = ({ route }) => {
  const navigation = useNavigation();
  
  const [departure, setDeparture] = useState('서울');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  const [goTime, setGoTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('09:00');

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isTransportModalVisible, setTransportModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  
  const [timePickerTarget, setTimePickerTarget] = useState('go');
  const [transportMode, setTransportMode] = useState('go');
  const [goTransport, setGoTransport] = useState(null);
  const [returnTransport, setReturnTransport] = useState(null);

  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (route.params?.destination) {
      setDestination(route.params.destination);
    }
  }, [route.params?.destination]);

  const onDayPress = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({ [day.dateString]: { startingDay: true, color: '#007bff', textColor: 'white' } });
    } else if (day.dateString >= startDate) {
      const newEndDate = day.dateString;
      setEndDate(newEndDate);
      let newMarkedDates = {};
      for (let d = dayjs(startDate); d.isBefore(dayjs(newEndDate).add(1, 'day')); d = d.add(1, 'day')) {
        const dateStr = d.format('YYYY-MM-DD');
        newMarkedDates[dateStr] = { color: '#50a0ff', textColor: 'white' };
      }
      newMarkedDates[startDate] = { ...newMarkedDates[startDate], startingDay: true };
      newMarkedDates[newEndDate] = { ...newMarkedDates[newEndDate], endingDay: true };
      setMarkedDates(newMarkedDates);
    }
  };

  const handleDateSelectDone = () => {
    if (!startDate || !endDate) {
      Alert.alert("알림", "여행 시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    setCalendarVisible(false);
  };

  const openTimePicker = (target) => {
    setTimePickerTarget(target);
    setTimePickerVisible(true);
  };

  const handleTimeSelect = (time) => {
    if (timePickerTarget === 'go') {
      setGoTime(time);
    } else {
      setReturnTime(time);
    }
  };

  const handleShowTransport = () => {
    if (!startDate || !endDate) {
      Alert.alert("알림", "여행 날짜를 먼저 선택해주세요.");
      return;
    }
    setTransportMode('go');
    setTransportModalVisible(true);
  };

  const handleTransportSelect = (transport) => {
    // If user chooses to proceed without transport, apply to both and close.
    if (transport.startsWith('선택 안함')) {
      setGoTransport(transport);
      setReturnTransport(transport);
      setTransportModalVisible(false);
      return;
    }

    if (transportMode === 'go') {
      setGoTransport(transport);
      setTransportMode('return'); // Stay in modal, switch to return mode
    } else {
      setReturnTransport(transport);
      setTransportModalVisible(false);
    }
  };

  const handleNextStep = () => {
    if (!destination || !startDate || !endDate || !goTransport || !returnTransport) {
      Alert.alert('입력 필요', '모든 정보를 선택해야 다음 단계로 진행할 수 있습니다.');
      return;
    }
    
    const plannerData = {
      departure,
      destination,
      startDate,
      endDate,
      days: dayjs(endDate).diff(dayjs(startDate), 'day') + 1,
      goTransport,
      returnTransport,
    };

    navigation.navigate('ScheduleEditor', { plannerData });
  };

  const displayDate = () => {
    if (startDate && endDate) return `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
    if (startDate) return `${dayjs(startDate).format('YYYY.MM.DD')} - (종료일 선택)`;
    return '날짜를 선택해주세요';
  };

  const displayTransport = (transport) => {
    if (!transport || transport.startsWith('선택 안함')) return '선택 안함';
    const [type, dep, arr] = transport.split('|');
    return `${type} (${dep} ~ ${arr})`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>어디로 떠나시나요?</Text>
          <View style={styles.form}>
            <Text style={styles.label}>출발지</Text>
            <TextInput style={styles.input} value={departure} onChangeText={setDeparture} />
            
            <Text style={styles.label}>도착지</Text>
            <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="예: 부산" />

            <Text style={styles.label}>여행 날짜</Text>
            <TouchableOpacity style={styles.input} onPress={() => setCalendarVisible(true)}>
              <Text style={styles.dateText}>{displayDate()}</Text>
            </TouchableOpacity>

            <View style={styles.timeRow}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>가는 편 출발 시간</Text>
                <TouchableOpacity style={styles.input} onPress={() => openTimePicker('go')}>
                  <Text style={styles.dateText}>{goTime}</Text>
                </TouchableOpacity>
              </View>
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.label}>오는 편 출발 시간</Text>
                <TouchableOpacity style={styles.input} onPress={() => openTimePicker('return')}>
                  <Text style={styles.dateText}>{returnTime}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <PrimaryButton title="교통편 조회하기" onPress={handleShowTransport} style={{marginTop: 20}} />

            <View style={styles.transportInfo}>
              <Text>가는 편: {displayTransport(goTransport)}</Text>
              <Text>오는 편: {displayTransport(returnTransport)}</Text>
            </View>

            <PrimaryButton 
              title="상세 일정 만들러 가기" 
              onPress={handleNextStep}
              style={{ marginTop: 30 }}
              disabled={!returnTransport}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isCalendarVisible} onRequestClose={() => setCalendarVisible(false)} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <Calendar onDayPress={onDayPress} markedDates={markedDates} markingType={'period'} />
          <PrimaryButton title="날짜 선택 완료" onPress={handleDateSelectDone} style={{ margin: 20 }} />
        </SafeAreaView>
      </Modal>

      <TransportSelectModal
        visible={isTransportModalVisible}
        onClose={() => setTransportModalVisible(false)}
        onSelect={handleTransportSelect}
        mode={transportMode}
        departure={transportMode === 'go' ? departure : destination}
        arrival={transportMode === 'go' ? destination : departure}
        date={transportMode === 'go' ? startDate : endDate}
        departureTime={transportMode === 'go' ? goTime : returnTime}
      />

      <TimePickerModal
        visible={isTimePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onSelect={handleTimeSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '600', color: '#495057', marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#f8f9fa', height: 50, borderRadius: 10, paddingHorizontal: 15,
    fontSize: 16, borderWidth: 1, borderColor: '#dee2e6', justifyContent: 'center'
  },
  dateText: { fontSize: 16 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transportInfo: {
    fontSize: 16, padding: 15, backgroundColor: '#f8f9fa',
    borderRadius: 10, marginTop: 20, gap: 5, borderWidth: 1, borderColor: '#dee2e6'
  },
});

export default PlannerSetupScreen;