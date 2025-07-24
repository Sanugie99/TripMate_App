import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

const ScheduleHeader = ({ schedule, isOwner, onEdit, onLike, onShare, onCopy }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.title} numberOfLines={1}>{schedule.title}</Text>
        {isOwner && (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.authorText}>작성자: {schedule.username || '알 수 없음'}</Text>
      <Text style={styles.dateRange}>
        {dayjs(schedule.startDate).format('YYYY.MM.DD')} - {dayjs(schedule.endDate).format('YYYY.MM.DD')}
      </Text>
      <View style={styles.metaContainer}>
        <View style={styles.likeContainer}>
          <TouchableOpacity onPress={() => onLike('like')} style={styles.iconButton}>
            <Ionicons name="thumbs-up-outline" size={20} color="#007bff" />
            <Text style={styles.likeText}>{schedule.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onLike('dislike')} style={styles.iconButton}>
            <Ionicons name="thumbs-down-outline" size={20} color="#dc3545" />
            <Text style={styles.likeText}>{schedule.dislikes}</Text>
          </TouchableOpacity>
        </View>
        {isOwner ? (
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Ionicons
              name={schedule.isPublic ? 'lock-open-outline' : 'lock-closed-outline'}
              size={20}
              color="#17a2b8"
            />
            <Text style={styles.shareText}>{schedule.isPublic ? '공유 중' : '비공개'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
            <Ionicons name="duplicate-outline" size={20} color="white" />
            <Text style={styles.copyButtonText}>내 일정에 넣기</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 10 },
  editButton: { backgroundColor: '#6c757d', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  editButtonText: { color: 'white', fontWeight: 'bold' },
  authorText: { fontSize: 14, color: '#868e96', marginTop: 4 },
  dateRange: { fontSize: 16, color: '#868e96', marginTop: 4 },
  metaContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  likeContainer: { flexDirection: 'row', gap: 15 },
  iconButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeText: { fontSize: 16, color: '#495057' },
  shareText: { fontSize: 16, color: '#17a2b8' },
  copyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#28a745', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  copyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default ScheduleHeader;