
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView,
  Platform
} from 'react-native';
import CustomButton from '../components/CustomButton';
import client from '../api/client';

const SignUpScreen = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'userId') setUserId(value), setIsIdChecked(false);
    else if (field === 'username') setUsername(value), setIsUsernameChecked(false);
    else if (field === 'password') setPassword(value);
    else if (field === 'email') setEmail(value);
    
    setErrors(prev => ({ ...prev, [field]: null }));
    setSuccess(prev => ({ ...prev, [field]: null }));
  };

  const handleCheckUserId = async () => {
    if (!userId.trim()) return setErrors(prev => ({ ...prev, userId: '아이디를 입력해주세요.' }));
    try {
      const response = await client.post('/api/auth/check-userid', { userId });
      if (response.data.exists) {
        setErrors(prev => ({ ...prev, userId: '이미 사용 중인 아이디입니다.' }));
        setIsIdChecked(false);
      } else {
        setSuccess(prev => ({ ...prev, userId: '사용 가능한 아이디입니다.' }));
        setIsIdChecked(true);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, userId: '중복 확인 중 오류 발생' }));
    }
  };

  const handleCheckUsername = async () => {
    if (!username.trim()) return setErrors(prev => ({ ...prev, username: '이름을 입력해주세요.' }));
    try {
      const response = await client.post('/api/auth/check-username', { username });
      if (response.data.exists) {
        setErrors(prev => ({ ...prev, username: '이미 사용 중인 이름입니다.' }));
        setIsUsernameChecked(false);
      } else {
        setSuccess(prev => ({ ...prev, username: '사용 가능한 이름입니다.' }));
        setIsUsernameChecked(true);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, username: '중복 확인 중 오류 발생' }));
    }
  };

  const handleSignUp = async () => {
    if (!isIdChecked) return Alert.alert('확인 필요', '아이디 중복 확인을 해주세요.');
    if (!isUsernameChecked) return Alert.alert('확인 필요', '이름 중복 확인을 해주세요.');
    if (!password || !email) return Alert.alert('입력 오류', '비밀번호와 이메일을 모두 입력해주세요.');
    if (!email.includes('@')) return setErrors(prev => ({ ...prev, email: '유효한 이메일 형식이 아닙니다.'}));

    try {
      await client.post('/api/auth/signup', { userId, username, password, email });
      Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('SignUp failed:', error.response?.data || error.message);
      Alert.alert('회원가입 실패', '오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const Message = ({ type, message }) => {
    if (!message) return null;
    return <Text style={type === 'success' ? styles.successText : styles.errorText}>{message}</Text>;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>회원가입</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="아이디"
              value={userId}
              onChangeText={(val) => handleInputChange('userId', val)}
            />
            <TouchableOpacity style={styles.checkButton} onPress={handleCheckUserId}>
              <Text style={styles.checkButtonText}>중복 확인</Text>
            </TouchableOpacity>
          </View>
          <Message type="error" message={errors.userId} />
          <Message type="success" message={success.userId} />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이름"
              value={username}
              onChangeText={(val) => handleInputChange('username', val)}
            />
            <TouchableOpacity style={styles.checkButton} onPress={handleCheckUsername}>
              <Text style={styles.checkButtonText}>중복 확인</Text>
            </TouchableOpacity>
          </View>
          <Message type="error" message={errors.username} />
          <Message type="success" message={success.username} />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              value={password}
              onChangeText={(val) => handleInputChange('password', val)}
              secureTextEntry
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="이메일"
              value={email}
              onChangeText={(val) => handleInputChange('email', val)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Message type="error" message={errors.email} />
        </View>

        <CustomButton title="가입하기" onPress={handleSignUp} style={{ marginTop: 20 }} />
        <CustomButton title="뒤로가기" onPress={() => navigation.goBack()} type="SECONDARY" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  checkButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 10,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    marginLeft: 5,
  },
  successText: {
    color: 'green',
    marginTop: 5,
    marginLeft: 5,
  },
});

export default SignUpScreen;
