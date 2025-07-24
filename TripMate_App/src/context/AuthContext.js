import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');

      if (token && savedUser) {
        try {
          const decoded = jwtDecode(token);
          const parsedUser = JSON.parse(savedUser);
          setUser({ token, ...decoded, ...parsedUser });
          client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Invalid token or user data:', error);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (token, userData) => {
    try {
      const decoded = jwtDecode(token);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ token, ...decoded, ...userData });
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken'); // 혹시 모를 이전 토큰 삭제
      delete client.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
