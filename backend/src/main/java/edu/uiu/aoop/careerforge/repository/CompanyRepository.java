package edu.uiu.aoop.careerforge.repository;
import edu.uiu.aoop.careerforge.domain.Company; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface CompanyRepository extends JpaRepository<Company, Long> { Optional<Company> findByNameIgnoreCase(String name); }
