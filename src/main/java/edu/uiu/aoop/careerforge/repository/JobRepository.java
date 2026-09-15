package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByLastVerifiedAtDescCreatedAtDescIdDesc();
    List<Job> findByStatusAndExpiryDateGreaterThanEqualOrderByLastVerifiedAtDescCreatedAtDescIdDesc(String status, LocalDate date);
    Optional<Job> findBySourceAndExternalId(String source, String externalId);
    long countBySourceIgnoreCaseAndStatus(String source, String status);
    long countBySourceIgnoreCaseAndValidationStatus(String source, String validationStatus);
    long countBySourceIgnoreCase(String source);
    @Modifying
    @Query("update Job j set j.status = 'closed' where j.expiryDate < :today and j.status <> 'closed'")
    int closeExpired(@Param("today") LocalDate today);
}
