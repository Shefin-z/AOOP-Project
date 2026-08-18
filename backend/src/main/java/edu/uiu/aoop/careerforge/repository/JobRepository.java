package edu.uiu.aoop.careerforge.repository;
import edu.uiu.aoop.careerforge.model.Job; import java.util.List; import org.springframework.data.jpa.repository.JpaRepository;
public interface JobRepository extends JpaRepository<Job, Long> { List<Job> findByStatusOrderByCreatedAtDesc(edu.uiu.aoop.careerforge.model.JobStatus status); }
