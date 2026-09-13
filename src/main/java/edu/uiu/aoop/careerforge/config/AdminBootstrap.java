package edu.uiu.aoop.careerforge.config;

import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrap {

    @Bean
    CommandLineRunner createInitialAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${careerforge.admin.name:}") String name,
            @Value("${careerforge.admin.email:}") String email,
            @Value("${careerforge.admin.password:}") String password
    ) {
        return args -> {
            if (name.isBlank() || email.isBlank() || password.isBlank()
                    || userRepository.existsByEmailIgnoreCase(email.trim())) {
                return;
            }
            userRepository.save(new User(
                    name.trim(),
                    email.trim().toLowerCase(),
                    passwordEncoder.encode(password),
                    Role.ADMIN
            ));
        };
    }
}
