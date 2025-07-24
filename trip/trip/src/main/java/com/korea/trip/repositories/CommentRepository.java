package com.korea.trip.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.korea.trip.models.Comment;
import com.korea.trip.models.Schedule;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByScheduleAndParentIsNullOrderByCreatedAtAsc(Schedule schedule);
}
