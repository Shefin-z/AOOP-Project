package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    List<CommunityPost> findByStatusOrderByCreatedAtDescIdDesc(String status);
}
