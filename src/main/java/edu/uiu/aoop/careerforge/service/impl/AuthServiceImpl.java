package edu.uiu.aoop.careerforge.service.impl;

import edu.uiu.aoop.careerforge.dto.AuthResponse;
import edu.uiu.aoop.careerforge.dto.LoginRequest;
import edu.uiu.aoop.careerforge.dto.RegisterRequest;
import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.model.UserStatus;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import edu.uiu.aoop.careerforge.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponse registerStudent(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account already exists for this email.");
        }
        User user = userRepository.save(new User(
                request.name().trim(), email, passwordEncoder.encode(request.password())
        ));
        return toResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is suspended.");
        }
        if (!user.getRole().name().equalsIgnoreCase(request.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Use the correct sign-in portal for this account.");
        }
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name().toLowerCase(Locale.ROOT), user.getPublicUuid());
    }
}
