import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: 실제 배포 시에는 .env 파일 등으로 관리하는 것이 좋습니다.
const BASE_URL = 'http://192.168.219.100:5000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 180000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터: 모든 요청에 인증 토큰(예: AsyncStorage에서 가져온)을 추가합니다.
client.interceptors.request.use(
  async (config) => {
    // 'userToken'은 로그인 시 저장한 토큰의 키입니다.
    const token = await AsyncStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;