
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, SafeAreaView, Alert } from 'react-native';
import CustomButton from './CustomButton';

const AddPlaceModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSave = () => {
    if (!name || !latitude || !longitude) {
      Alert.alert("입력 오류", "장소 이름, 위도, 경도는 필수입니다.");
      return;
    }
    onSave({
      name,
      category: category || '기타',
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    });
    // Clear fields after saving
    setName('');
    setCategory('');
    setLatitude('');
    setLongitude('');
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>새 장소 추가</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="장소 이름 (예: 해운대 해수욕장)"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="카테고리 (예: 명소, 식당)"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="위도 (Latitude)"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="경도 (Longitude)"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />
          <CustomButton title="저장하기" onPress={handleSave} />
          <CustomButton title="취소" onPress={onClose} type="SECONDARY" />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default AddPlaceModal;
