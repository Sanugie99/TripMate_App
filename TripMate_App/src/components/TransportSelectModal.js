import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Button
} from 'react-native';
import client from '../api/client';

const TransportSelectModal = ({ visible, onClose, onSelect, mode, departure, arrival, date, departureTime }) => {
  const [loading, setLoading] = useState(false);
  const [transportData, setTransportData] = useState({ trains: [], buses: [] });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (visible) {
      fetchTransportData();
    } else {
      setTransportData({ trains: [], buses: [] });
      setError('');
      setFilter('all');
    }
  }, [visible, departure, arrival, date, departureTime]);

  const fetchTransportData = async () => {
    if (!date) return;
    setLoading(true);
    setError('');
    try {
      const formattedDate = date.replace(/-/g, '');
      const requestBody = { departure, arrival, date: formattedDate, departureTime };
      const response = await client.post('/api/transport/search', requestBody);

      const parseTime = (timeStr) => `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;

      // 데이터 파싱 전 유효성 검사 추가
      const safeParse = (items) => {
        if (!items || !Array.isArray(items)) return [];
        return items
          .filter(item => typeof item === 'string' && !item.includes('정보가 없습니다') && item.split('|').length >= 4)
          .map(item => {
            try {
              const parts = item.split('|');
              const timeParts = parts[2].split('→');
              if (timeParts.length < 2) return null; // 시간 정보가 올바르지 않으면 제외
              
              return {
                name: parts[0].trim(),
                depTime: parseTime(timeParts[0].trim()),
                arrTime: parseTime(timeParts[1].trim()),
                price: parts[3].trim().replace('원', ''),
              };
            } catch {
              return null; // 파싱 중 오류 발생 시 해당 항목 제외
            }
          })
          .filter(Boolean); // null 항목 최종 제거
      };

      const trains = safeParse(response.data?.korailOptions);
      const buses = safeParse(response.data?.busOptions);

      setTransportData({ trains, buses });
    } catch (err) {
      setError('교통편 정보를 불러오는 데 실패했습니다.');
      setTransportData({ trains: [], buses: [] });
    } finally {
      setLoading(false);
    }
  };

  const renderTransportItem = (item, type, index) => (
    <TouchableOpacity 
      key={`${type}-${item.name}-${item.depTime}-${index}`}
      style={styles.itemContainer} 
      onPress={() => onSelect(`${item.name}|${item.depTime}|${item.arrTime}|${item.price}`)}
    >
      <Text style={styles.time}>{item.depTime} → {item.arrTime}</Text>
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.price}>{item.price}원</Text>
    </TouchableOpacity>
  );

  const trains = transportData?.trains ?? [];
  const buses = transportData?.buses ?? [];
  const isAllDataEmpty = trains.length === 0 && buses.length === 0;

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{mode === 'go' ? '가는 편' : '오는 편'}: {departure} → {arrival}</Text>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, filter === 'all' && styles.activeFilter]} onPress={() => setFilter('all')}>
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>전체</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filter === 'train' && styles.activeFilter]} onPress={() => setFilter('train')}>
            <Text style={[styles.filterText, filter === 'train' && styles.activeFilterText]}>기차</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, filter === 'bus' && styles.activeFilter]} onPress={() => setFilter('bus')}>
            <Text style={[styles.filterText, filter === 'bus' && styles.activeFilterText]}>버스</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" style={{ marginTop: 20, flex: 1 }} />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        {!loading && !error && (
          <ScrollView style={{flex: 1}}>
            {(filter === 'all' || filter === 'train') && (
              <View>
                <Text style={styles.sectionTitle}>기차</Text>
                {trains.length > 0 ? trains.map((item, index) => renderTransportItem(item, '기차', index)) : <Text style={styles.emptyText}>운행 정보 없음</Text>}
              </View>
            )}
            {(filter === 'all' || filter === 'bus') && (
              <View>
                <Text style={styles.sectionTitle}>버스</Text>
                {buses.length > 0 ? buses.map((item, index) => renderTransportItem(item, '버스', index)) : <Text style={styles.emptyText}>운행 정보 없음</Text>}
              </View>
            )}
            {isAllDataEmpty && (
              <TouchableOpacity style={styles.proceedButton} onPress={() => onSelect('선택 안함|00:00|00:00')}>
                <Text style={styles.proceedButtonText}>교통편 없이 진행</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
        <Button title="닫기" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 10 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
  filterButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#e9ecef' },
  activeFilter: { backgroundColor: '#007bff' },
  filterText: { fontSize: 16, fontWeight: 'bold', color: '#495057' },
  activeFilterText: { color: 'white' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, paddingLeft: 5, backgroundColor: '#f8f9fa' },
  itemContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, backgroundColor: 'white', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee'
  },
  time: { fontSize: 16, fontWeight: '500', width: 130 },
  name: { fontSize: 16, flex: 1, textAlign: 'center', marginHorizontal: 5 },
  price: { fontSize: 16, color: '#007bff', width: 70, textAlign: 'right' },
  emptyText: { textAlign: 'center', padding: 10, color: '#6c757d' },
  proceedButton: { backgroundColor: '#6c757d', padding: 15, borderRadius: 8, alignItems: 'center', margin: 20 },
  proceedButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default TransportSelectModal;