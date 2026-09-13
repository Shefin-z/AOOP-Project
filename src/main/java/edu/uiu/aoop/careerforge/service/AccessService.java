package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccessService {
    private final UserRepository users;
    public AccessService(UserRepository users) { this.users = users; }
    public User requireUser(Long userId) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in first.");
        return users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Your session is no longer valid."));
    }
    public User requireAdmin(Long userId) {
        User user = requireUser(userId);
        if (user.getRole() != Role.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administrator access is required.");
        return user;
    }
    public User requireStudent(Long userId) {
        User user = requireUser(userId);
        if (user.getRole() != Role.STUDENT) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student access is required.");
        return user;
    }
}
