package edu.uiu.aoop.careerforge.dto;

public record ProfileResponse(Long userId, String name, String email, String university, String degree,
                              Integer graduationYear, String targetRole, String location, String bio,
                              String skills, String hobbies, String profilePhotoUrl, java.util.UUID publicUuid) { }
