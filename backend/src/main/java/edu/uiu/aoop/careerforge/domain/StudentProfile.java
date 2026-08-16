package edu.uiu.aoop.careerforge.domain;

import jakarta.persistence.*;

@Entity @Table(name = "student_profiles")
public class StudentProfile {
  @Id @Column(name = "user_id") private Long userId;
  @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "user_id") private User user;
  private String university; private String degree;
  @Column(name = "graduation_year") private Integer graduationYear;
  @Column(name = "target_role") private String targetRole;
  private String location; private String phone; @Column(columnDefinition = "TEXT") private String bio;
  @Column(name = "avatar_url") private String avatarUrl; @Column(name = "resume_url") private String resumeUrl;
  @Column(name = "readiness_score") private Double readinessScore = 0d;
  @Column(name = "profile_completion") private Double profileCompletion = 0d;
  @Column(name = "career_interests", columnDefinition = "json") private String careerInterests = "[]";
  @Column(columnDefinition = "json") private String preferences = "{}";
  @Column(name = "avatar_data", columnDefinition = "LONGTEXT") private String avatarData;
  protected StudentProfile() { }
  public void setUser(User value) { user = value; } public User getUser() { return user; }
  public String getUniversity() { return university; } public String getDegree() { return degree; } public Integer getGraduationYear() { return graduationYear; }
  public String getTargetRole() { return targetRole; } public String getLocation() { return location; } public String getPhone() { return phone; }
  public String getBio() { return bio; } public String getAvatarUrl() { return avatarUrl; } public String getResumeUrl() { return resumeUrl; }
  public Double getReadinessScore() { return readinessScore; } public Double getProfileCompletion() { return profileCompletion; }
  public String getCareerInterests() { return careerInterests; } public String getAvatarData() { return avatarData; }
  public void update(String university, String degree, Integer graduationYear, String targetRole, String location, String phone, String bio, String interests, String avatarData) {
    this.university = university; this.degree = degree; this.graduationYear = graduationYear; this.targetRole = targetRole; this.location = location; this.phone = phone; this.bio = bio; this.careerInterests = interests == null ? "[]" : interests; this.avatarData = avatarData;
    int complete = (university != null && !university.isBlank() ? 1 : 0) + (degree != null && !degree.isBlank() ? 1 : 0) + (targetRole != null && !targetRole.isBlank() ? 1 : 0) + (location != null && !location.isBlank() ? 1 : 0) + (interests != null && !interests.equals("[]") ? 1 : 0);
    this.profileCompletion = complete * 20d; this.readinessScore = Math.min(100d, complete * 16d);
  }
}
