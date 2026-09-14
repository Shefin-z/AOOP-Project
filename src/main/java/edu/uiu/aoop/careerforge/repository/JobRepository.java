package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByCreatedAtDescIdDesc();
    List<Job> findByStatusAndExpiryDateGreaterThanEqualOrderByCreatedAtDescIdDesc(String status, LocalDate date);
    Optional<Job> findBySourceAndExternalId(String source, String externalId);
}
