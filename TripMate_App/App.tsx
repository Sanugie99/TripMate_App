
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import all screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import FindIdScreen from './src/screens/FindIdScreen';
import FindPasswordScreen from './src/screens/FindPasswordScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';

import ScheduleEditorScreen from './src/screens/ScheduleEditorScreen';
import ScheduleDetailScreen from './src/screens/ScheduleDetailScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import MySchedulesScreen from './src/screens/tabs/MySchedulesScreen';
import Step1DestinationScreen from './src/screens/Step1DestinationScreen';
import Step2DateSelectScreen from './src/screens/Step2DateSelectScreen';
import Step3TimeSelectScreen from './src/screens/Step3TimeSelectScreen';
import Step4TransportSelectScreen from './src/screens/Step4TransportSelectScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={user ? "Main" : "Login"}
      screenOptions={{ headerShown: false }} // 모든 화면에서 헤더 제거
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Step1Destination" component={Step1DestinationScreen} />
          <Stack.Screen name="Step2DateSelect" component={Step2DateSelectScreen} />
          <Stack.Screen name="Step3TimeSelect" component={Step3TimeSelectScreen} />
          <Stack.Screen name="Step4TransportSelect" component={Step4TransportSelectScreen} />
          <Stack.Screen name="ScheduleEditor" component={ScheduleEditorScreen} />
          <Stack.Screen name="ScheduleDetail" component={ScheduleDetailScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="MySchedules" component={MySchedulesScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="FindId" component={FindIdScreen} />
          <Stack.Screen name="FindPassword" component={FindPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
