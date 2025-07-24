
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/tabs/HomeScreen';
import MySchedulesScreen from '../screens/tabs/MySchedulesScreen';
import PlannerSetupScreen from '../screens/PlannerSetupScreen'; // Import new screen
import SharedSchedulesScreen from '../screens/tabs/SharedSchedulesScreen';
import MyProfileScreen from '../screens/tabs/MyProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MySchedules') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'PlannerSetup') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'SharedSchedules') {
            iconName = focused ? 'share-social' : 'share-social-outline';
          } else if (route.name === 'MyProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="MySchedules" component={MySchedulesScreen} options={{ title: '내 일정' }} />
      <Tab.Screen name="PlannerSetup" component={PlannerSetupScreen} options={{ title: '일정 생성' }} />
      <Tab.Screen name="SharedSchedules" component={SharedSchedulesScreen} options={{ title: '공유 일정' }} />
      <Tab.Screen name="MyProfile" component={MyProfileScreen} options={{ title: '내 정보' }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
