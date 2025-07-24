
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import client from '../api/client';

const JoinScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    userId: '',
    username: '',
    password: '',
    passwordConfirm: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setSuccess({ ...success, [name]: '' });
    if (name === 'userId') setIsIdChecked(false);
    if (name === 'username') setIsUsernameChecked(false);
  };

  const handleCheckUserId = async () => {
    const { userId } = formData;
    if (!/^[A-Za-z0-9]{1,10}$/.test(userId)) {
      setErrors({ ...errors, userId: '아이디는 영문/숫자 포함 10자 이내여야 합니다.' });
      return;
    }
    try {
      // Note: The web app uses '/auth/check-userid', but the backend controller might be different.
      // Assuming the backend has a similar endpoint. Let's use '/user/check-userid' for now.
      const response = await client.post('/user/check-userid', { userId });
      if (response.data.exists) {
        setErrors({ ...errors, userId: '이미 사용 중인 아이디입니다.' });
        setIsIdChecked(false);
      } else {
        setSuccess({ ...success, userId: '사용 가능한 아이디입니다.' });
        setIsIdChecked(true);
      }
    } catch (error) {
      setErrors({ ...errors, userId: '중복 확인 중 오류가 발생했습니다.' });
    }
  };

  const handleCheckUsername = async () => {
    const { username } = formData;
    if (!username.trim()) {
      setErrors({ ...errors, username: '이름을 입력해주세요.' });
      return;
    }
    try {
      // Assuming '/user/check-username' endpoint
      const response = await client.post('/user/check-username', { username });
      if (response.data.exists) {
        setErrors({ ...errors, username: '이미 사용 중인 이름입니다.' });
        setIsUsernameChecked(false);
      } else {
        setSuccess({ ...success, username: '사용 가능한 이름입니다.' });
        setIsUsernameChecked(true);
      }
    } catch (error) {
      setErrors({ ...errors, username: '중복 확인 중 오류가 발생했습니다.' });
    }
  };

  const handleSubmit = async () => {
    const { password, passwordConfirm, email } = formData;

    if (!isIdChecked) {
      Alert.alert('오류', '아이디 중복 확인을 해주세요.');
      return;
    }
    if (!isUsernameChecked) {
      Alert.alert('오류', '이름 중복 확인을 해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrors({ ...errors, passwordConfirm: '비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (password.length < 8) {
      setErrors({ ...errors, password: '비밀번호는 최소 8자 이상이어야 합니다.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrors({ ...errors, email: '유효한 이메일 주소를 입력해주세요.' });
      return;
    }

    try {
      // Assuming '/user/join' endpoint from backend controllers
      await client.post('/user/join', formData);
      Alert.alert('성공', '회원가입에 성공했습니다. 로그인 페이지로 이동합니다.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('오류', error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>아이디</Text>
        <View style={styles.fieldWrapper}>
          <TextInput
            style={styles.inputFlex}
            placeholder="영문/숫자 10자 이내"
            value={formData.userId}
            onChangeText={(val) => handleChange('userId', val)}
          />
          <Button title="중복 확인" onPress={handleCheckUserId} />
        </View>
        {errors.userId && <Text style={styles.errorText}>{errors.userId}</Text>}
        {success.userId && <Text style={styles.successText}>{success.userId}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="8자 이상 입력"
          value={formData.password}
          onChangeText={(val) => handleChange('password', val)}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 다시 입력해주세요."
          value={formData.passwordConfirm}
          onChangeText={(val) => handleChange('passwordConfirm', val)}
          secureTextEntry
        />
        {errors.passwordConfirm && <Text style={styles.errorText}>{errors.passwordConfirm}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>이름</Text>
        <View style={styles.fieldWrapper}>
          <TextInput
            style={styles.inputFlex}
            placeholder="이름"
            value={formData.username}
            onChangeText={(val) => handleChange('username', val)}
          />
          <Button title="중복 확인" onPress={handleCheckUsername} />
        </View>
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        {success.username && <Text style={styles.successText}>{success.username}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={formData.email}
          onChangeText={(val) => handleChange('email', val)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <Button title="회원가입" onPress={handleSubmit} />
      <View style={styles.buttonSpacer} />
      <Button title="로그인 화면으로" onPress={() => navigation.navigate('Login')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  successText: {
    color: 'green',
    marginTop: 5,
  },
  buttonSpacer: {
    height: 10,
  }
});

export default JoinScreen;
