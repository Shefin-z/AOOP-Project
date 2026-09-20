package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {
    List<CommunityComment> findByPostIdAndStatusOrderByCreatedAtAsc(Long postId, String status);
    long countByPostIdAndStatus(Long postId, String status);
    Optional<CommunityComment> findByIdAndPostId(Long id, Long postId);
}
