package edu.uiu.aoop.careerforge.security;
import edu.uiu.aoop.careerforge.model.Role;
public record AppPrincipal(Long id, String email, Role role, String name) { }
