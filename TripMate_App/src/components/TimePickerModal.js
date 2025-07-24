
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;

const TimePickerModal = ({ visible, onClose, onSelect }) => {
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');

  const handleSelect = () => {
    onSelect(`${hour}:${minute}`);
    onClose();
  };

  const handleMomentumScrollEnd = (event, type) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (type === 'hour' && index >= 0 && index < HOURS.length) {
      setHour(HOURS[index]);
    } else if (type === 'minute' && index >= 0 && index < MINUTES.length) {
      setMinute(MINUTES[index]);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item}</Text>
    </View>
  );

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent}>
          <Text style={styles.title}>시간 선택</Text>
          <View style={styles.pickerContainer}>
            <View style={styles.selectionIndicator} />
            <FlatList
              data={HOURS}
              renderItem={renderItem}
              keyExtractor={(item) => `h-${item}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{ paddingTop: PADDING, paddingBottom: PADDING }}
              onMomentumScrollEnd={(e) => handleMomentumScrollEnd(e, 'hour')}
              initialScrollIndex={9}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              style={styles.list}
            />
            <Text style={styles.separator}>:</Text>
            <FlatList
              data={MINUTES}
              renderItem={renderItem}
              keyExtractor={(item) => `m-${item}`}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={{ paddingTop: PADDING, paddingBottom: PADDING }}
              onMomentumScrollEnd={(e) => handleMomentumScrollEnd(e, 'minute')}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              style={styles.list}
            />
          </View>
          <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
            <Text style={styles.selectButtonText}>선택 완료</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '70%', height: '50%', backgroundColor: 'white', borderRadius: 15, padding: 20, display: 'flex', flexDirection: 'column' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  pickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' },
  list: { flex: 1 },
  selectionIndicator: { position: 'absolute', top: '50%', transform: [{ translateY: -ITEM_HEIGHT / 2 }], left: 0, right: 0, height: ITEM_HEIGHT, backgroundColor: '#f0f8ff', borderRadius: 10 },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  itemText: { fontSize: 24, fontWeight: '600', color: '#333' },
  separator: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 10 },
  selectButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, marginTop: 20 },
  selectButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});

export default TimePickerModal;
