package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByCreatedAtDesc();
    List<Job> findByStatusAndExpiryDateGreaterThanEqualOrderByCreatedAtDesc(String status, LocalDate date);
}
