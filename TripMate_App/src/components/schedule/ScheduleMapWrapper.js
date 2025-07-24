import React from 'react';
import { View, StyleSheet } from 'react-native';
import ScheduleMapComponent from '../map/ScheduleMapComponent';

const ScheduleMapWrapper = ({ dailyPlan, selectedDate, selectedPlace }) => {
  return (
    <View style={styles.mapContainer}>
      <ScheduleMapComponent dailyPlan={dailyPlan} selectedDate={selectedDate} selectedPlace={selectedPlace} />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: '35%',
    backgroundColor: '#e9ecef',
  },
});

export default ScheduleMapWrapper;