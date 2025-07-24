
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ScheduleCard = ({ item, onShare, onDelete }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('ScheduleDetail', { scheduleId: item.id, fromMySchedules: true })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={24} color="#6c757d" />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#495057" />
            <Text style={styles.infoText}>{item.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#495057" />
            <Text style={styles.infoText}>{item.startDate} ~ {item.endDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.shareButton]}
          onPress={() => onShare(item.id, !item.isPublic)}
        >
          <Ionicons name={item.isPublic ? "lock-open-outline" : "lock-closed-outline"} size={16} color="white" />
          <Text style={styles.buttonText}>{item.isPublic ? '공유 중' : '공유하기'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text style={styles.buttonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 20, fontWeight: '600', color: '#343a40' },
  cardBody: { 
    gap: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    marginBottom: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 16, color: '#495057' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  shareButton: {
    backgroundColor: '#17a2b8',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default ScheduleCard;
