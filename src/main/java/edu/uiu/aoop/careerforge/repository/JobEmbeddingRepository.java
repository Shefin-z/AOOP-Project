package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.JobEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface JobEmbeddingRepository extends JpaRepository<JobEmbedding, Long> {
    List<JobEmbedding> findByJobIdIn(Collection<Long> jobIds);
    long countByStatus(String status);
}
