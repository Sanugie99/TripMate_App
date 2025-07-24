// components/schedule/DayTabBar.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const DayTabBar = ({ dates, selectedDate, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
      {dates.map((date, index) => (
        <TouchableOpacity key={date} onPress={() => onSelect(date)} style={[styles.dayTab, selectedDate === date && styles.dayTabActive]}>
          <Text style={styles.dayTabText}>Day {index + 1}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // dayTabs 관련 스타일 복붙
});

export default DayTabBar;
