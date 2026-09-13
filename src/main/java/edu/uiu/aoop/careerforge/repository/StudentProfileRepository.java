package edu.uiu.aoop.careerforge.repository;

import edu.uiu.aoop.careerforge.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> { }
