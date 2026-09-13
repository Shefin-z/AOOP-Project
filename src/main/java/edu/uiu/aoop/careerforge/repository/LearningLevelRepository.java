package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.LearningLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LearningLevelRepository extends JpaRepository<LearningLevel, Long> {
    List<LearningLevel> findByPathIdOrderByLevelNumber(Long pathId);
    Optional<LearningLevel> findByPathIdAndLevelNumber(Long pathId, int levelNumber);
}
