
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import client from '../api/client';

const FindPasswordScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');

  const handleFindPassword = async () => {
    if (!userId || !email) {
      Alert.alert('비밀번호 찾기 오류', '아이디와 이메일을 모두 입력해주세요.');
      return;
    }

    try {
      await client.post('/api/auth/find-password', { userId, email });
      Alert.alert('비밀번호 찾기 성공', '임시 비밀번호가 이메일로 전송되었습니다. 로그인 후 비밀번호를 변경해주세요.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Find Password failed:', error);
      Alert.alert('비밀번호 찾기 실패', '입력하신 정보와 일치하는 사용자가 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 찾기</Text>
      <CustomInput placeholder="아이디" value={userId} onChangeText={setUserId} />
      <CustomInput placeholder="이메일" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <CustomButton title="임시 비밀번호 발급" onPress={handleFindPassword} />
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

export default FindPasswordScreen;
