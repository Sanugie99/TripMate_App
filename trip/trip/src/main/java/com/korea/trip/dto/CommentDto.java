package com.korea.trip.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.korea.trip.models.Comment;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private UserDto user;
    private List<CommentDto> replies;

    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.createdAt = comment.getCreatedAt();
        if (comment.getUser() != null) {
            this.user = new UserDto(comment.getUser());
        }
        this.replies = comment.getReplies().stream()
                .map(CommentDto::new)
                .collect(Collectors.toList());
    }
}
