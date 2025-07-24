import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const DayTabs = ({ dates, selectedDate, onSelectDate }) => {
  return (
    <View style={{ height: 44 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabs}>
        {dates.map((date, index) => (
          <TouchableOpacity
            key={date}
            style={[styles.dayTab, selectedDate === date && styles.dayTabActive]}
            onPress={() => onSelectDate(date)}
          >
            <Text style={styles.dayTabText}>Day {index + 1}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dayTabs: { flexDirection: 'row', backgroundColor: 'white', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', alignSelf: 'flex-start' },
  dayTab: { paddingVertical: 8, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: '#007bff' },
  dayTabText: { fontSize: 16, fontWeight: 'bold', color: '#495057' },
});

export default DayTabs;

