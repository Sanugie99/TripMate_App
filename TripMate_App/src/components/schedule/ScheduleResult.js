
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';

const ScheduleResult = ({ schedule, selectedDate, setSelectedDate, onPlaceClick }) => {
  const places = schedule.dailyPlan[selectedDate] || [];

  const renderDateTab = (date) => (
    <TouchableOpacity
      key={date}
      style={[styles.tabButton, selectedDate === date && styles.activeTab]}
      onPress={() => setSelectedDate(date)}
    >
      <Text style={[styles.tabText, selectedDate === date && styles.activeTabText]}>
        {date}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaceCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPlaceClick(item)}>
      <Image
        style={styles.placeImage}
        source={{ uri: item.photoUrl || 'https://via.placeholder.com/150' }}
      />
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.address}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {Object.keys(schedule.dailyPlan).map(renderDateTab)}
        </ScrollView>
      </View>

      <FlatList
        data={places}
        renderItem={renderPlaceCard}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        ListEmptyComponent={<Text style={styles.noDataText}>선택된 날짜에 일정이 없습니다.</Text>}
        contentContainerStyle={{ paddingTop: 10 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
  },
  tabsContainer: {
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#007BFF',
  },
  tabText: {
    color: '#333',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  placeImage: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    padding: 10,
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#888',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ScheduleResult;
