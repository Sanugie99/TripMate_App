
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import client from '../api/client';

const FindIdScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleFindId = async () => {
    if (!username || !email) {
      Alert.alert('아이디 찾기 오류', '이름과 이메일을 모두 입력해주세요.');
      return;
    }

    try {
      const response = await client.post('/api/auth/find-id', { username, email });
      Alert.alert('아이디 확인', `회원님의 아이디는 [${response.data.userId}] 입니다.`);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Find ID failed:', error);
      Alert.alert('아이디 찾기 실패', '입력하신 정보와 일치하는 사용자가 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>
      <CustomInput placeholder="사용자 이름" value={username} onChangeText={setUsername} />
      <CustomInput placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <CustomButton title="아이디 찾기" onPress={handleFindId} />
      <CustomButton title="뒤로가기" onPress={() => navigation.goBack()} type="SECONDARY" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});

export default FindIdScreen;
