// components/comment/CommentItem.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

const CommentItem = ({ comment, onReply, onDelete, user }) => {
  const isAuthor = user && comment.user && user.userId === comment.user.userId;

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{comment.user?.username || '익명'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onReply(comment)} style={styles.replyButton}>
            <Text style={styles.replyButtonText}>답글</Text>
          </TouchableOpacity>
          {isAuthor && (
            <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <Text style={styles.commentDate}>{dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}</Text>
      {comment.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              user={user}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  commentContainer: { paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentUser: { fontWeight: 'bold' },
  commentContent: { marginTop: 4 },
  commentDate: { fontSize: 12, color: '#868e96', marginTop: 4 },
  replyButton: { padding: 5 },
  replyButtonText: { color: '#007bff', fontSize: 12 },
  deleteButton: { padding: 5, marginLeft: 10 },
  deleteButtonText: { color: 'red', fontSize: 12 },
  repliesContainer: { marginLeft: 20, borderLeftWidth: 1, borderLeftColor: '#e9ecef', marginTop: 10, paddingTop: 5 }
});

export default CommentItem;
