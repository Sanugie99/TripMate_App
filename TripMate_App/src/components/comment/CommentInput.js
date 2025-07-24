// components/comment/CommentInput.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommentInput = ({ newComment, setNewComment, handleCreateComment, replyTo, cancelReply }) => {
  return (
    <View style={styles.commentInputContainer}>
      {replyTo && (
        <View style={styles.replyingToContainer}>
          <Text style={styles.replyingToText}>@{replyTo.user?.username || '익명'}님에게 답글 남기는 중...</Text>
          <TouchableOpacity onPress={cancelReply}>
            <Ionicons name="close-circle-outline" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.commentInput} 
          placeholder="따뜻한 댓글을 남겨주세요 :)" 
          value={newComment} 
          onChangeText={setNewComment} 
          placeholderTextColor="#868e96"
        />
        <TouchableOpacity style={styles.submitCommentButton} onPress={handleCreateComment}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  commentInputContainer: { padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9ecef' },
  replyingToContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 5 },
  replyingToText: { fontSize: 12, color: '#6c757d', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  commentInput: { flex: 1, height: 40, backgroundColor: '#f1f3f5', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
  submitCommentButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center' },
});

export default CommentInput;
