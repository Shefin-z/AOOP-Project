package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, Long> {
    List<ResumeVersion> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<ResumeVersion> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndIsDefaultTrue(Long userId);
}
