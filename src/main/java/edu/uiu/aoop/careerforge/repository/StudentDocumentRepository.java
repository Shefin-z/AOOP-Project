package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.StudentDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentDocumentRepository extends JpaRepository<StudentDocument, Long> {
    List<StudentDocument> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<StudentDocument> findByIdAndUserId(Long id, Long userId);
}
