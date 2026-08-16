package edu.uiu.aoop.careerforge.repository;
import edu.uiu.aoop.careerforge.domain.JobApplication; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> { Optional<JobApplication> findByStudentIdAndJobId(Long studentId,Long jobId); List<JobApplication> findByStudentIdOrderByAppliedAtDesc(Long studentId); }
