package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findByStatusOrderByCreatedAtDescIdDesc(String status);
    List<CommunityPost> findAllByOrderByCreatedAtDescIdDesc();
    long countByStatus(String status);
    Optional<CommunityPost> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    List<CommunityPost> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime createdAt);
}
