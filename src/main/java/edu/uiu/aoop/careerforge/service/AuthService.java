package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.AuthResponse;
import edu.uiu.aoop.careerforge.dto.LoginRequest;
import edu.uiu.aoop.careerforge.dto.RegisterRequest;

public interface AuthService {
    AuthResponse registerStudent(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
