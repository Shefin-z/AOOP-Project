package edu.uiu.aoop.careerforge.dto;

/** Profile details shared only between students with an accepted connection. */
public record ConnectedStudentProfileResponse(Long studentId, String name, String university, String degree,
                                              String targetRole, String location, String skills, String hobbies,
                                              String bio, String profilePhotoUrl) { }
