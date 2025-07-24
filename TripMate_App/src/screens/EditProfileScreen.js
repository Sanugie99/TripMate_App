
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import client from '../api/client';

const EditProfileScreen = ({ route, navigation }) => {
  const { profile } = route.params;

  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const updateData = {
      username,
      email,
    };

    if (password) {
      updateData.password = password;
    }

    try {
      await client.put('/api/users/me', updateData);
      Alert.alert('성공', '프로필 정보가 성공적으로 업데이트되었습니다.');
      navigation.goBack();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>프로필 수정</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>아이디</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={profile.userId} editable={false} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>이름</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>새 비밀번호 (선택 사항)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="변경할 경우에만 입력하세요"
            secureTextEntry
          />
        </View>
        <Button title={loading ? '저장 중...' : '저장'} onPress={handleUpdateProfile} disabled={loading} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
});

export default EditProfileScreen;
