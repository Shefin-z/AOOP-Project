package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByUserIdAndJobId(Long userId, Long jobId);
    @Query("select a from JobApplication a join fetch a.job j join fetch j.company where a.userId = :userId order by a.appliedAt desc")
    List<JobApplication> findAllForStudent(Long userId);
    @Query("select a from JobApplication a join fetch a.job j join fetch j.company order by a.appliedAt desc")
    List<JobApplication> findAllForAdmin();
}
