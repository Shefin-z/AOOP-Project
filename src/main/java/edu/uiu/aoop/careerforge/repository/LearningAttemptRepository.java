package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.LearningAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LearningAttemptRepository extends JpaRepository<LearningAttempt, Long> {
    List<LearningAttempt> findByLevelPathIdAndUserId(Long pathId, Long userId);
}
