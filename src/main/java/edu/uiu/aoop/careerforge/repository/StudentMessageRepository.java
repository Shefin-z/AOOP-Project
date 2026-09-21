package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.StudentMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentMessageRepository extends JpaRepository<StudentMessage, Long> {
    List<StudentMessage> findByConnectionIdOrderByCreatedAtAsc(Long connectionId);
    long countByConnectionIdAndSenderIdNotAndReadAtIsNull(Long connectionId, Long senderId);
    long deleteByIdAndConnectionIdAndSenderId(Long id, Long connectionId, Long senderId);
    long deleteByConnectionId(Long connectionId);
}
