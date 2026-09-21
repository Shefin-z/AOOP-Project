package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.StudentConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StudentConnectionRepository extends JpaRepository<StudentConnection, Long> {
    Optional<StudentConnection> findByUserLowIdAndUserHighId(Long userLowId, Long userHighId);
    @Query("select c from StudentConnection c where c.userLowId = :userId or c.userHighId = :userId order by c.updatedAt desc, c.id desc")
    List<StudentConnection> findAllForUser(Long userId);
    List<StudentConnection> findAllByOrderByUpdatedAtDescIdDesc();
    long countByStatus(String status);
}
