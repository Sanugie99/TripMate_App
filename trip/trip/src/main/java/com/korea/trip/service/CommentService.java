package com.korea.trip.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.trip.dto.CommentDto;
import com.korea.trip.models.Comment;
import com.korea.trip.models.Schedule;
import com.korea.trip.models.User;
import com.korea.trip.repositories.CommentRepository;
import com.korea.trip.repositories.ScheduleRepository;
import com.korea.trip.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid schedule Id:" + scheduleId));
        
        return commentRepository.findByScheduleAndParentIsNullOrderByCreatedAtAsc(schedule)
                .stream()
                .map(CommentDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto createComment(Long scheduleId, String content, Long userId, Long parentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user Id:" + userId));
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid schedule Id:" + scheduleId));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setSchedule(schedule);
        comment.setCreatedAt(LocalDateTime.now());

        if (parentId != null) {
            Comment parentComment = commentRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid parent comment Id:" + parentId));
            comment.setParent(parentComment);
        }

        Comment savedComment = commentRepository.save(comment);
        return new CommentDto(savedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid comment Id:" + commentId));
        
        // 댓글 작성자만 삭제할 수 있도록 확인
        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }
        
        commentRepository.delete(comment);
    }
}
