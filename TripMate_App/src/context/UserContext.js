
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token on app startup
    const loadUser = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('token');
        if (token) {
          // If token exists, you might want to verify it with the backend
          // and get fresh user data. For now, we'll assume the token is valid
          // and we'll need a way to get user data if it's not stored.
          // Let's try to get user data from storage first.
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // If user data is not in storage, fetch it from the server
            // This requires an endpoint like '/user/me'
            const response = await client.get('/user/me'); // Assumes this endpoint exists
            await AsyncStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
          }
        }
      } catch (e) {
        console.error('Failed to load user.', e);
        // If token is invalid, clear it
        if (token) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Failed to save user session.', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (e) {
      console.error('Failed to clear user session.', e);
    }
  };

  // In LoginScreen, we call setUser directly. Let's adjust that to use this login function.
  // For now, we'll provide a way to set the user that also stores it.
  const handleSetUser = async (userData) => {
      try {
        // This is used after login, where the token is already set.
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch(e) {
        console.error('Failed to save user.', e);
      }
  }


  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
