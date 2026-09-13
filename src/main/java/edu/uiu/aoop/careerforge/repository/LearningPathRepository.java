package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {
    List<LearningPath> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<LearningPath> findByIdAndUserId(Long id, Long userId);
}
