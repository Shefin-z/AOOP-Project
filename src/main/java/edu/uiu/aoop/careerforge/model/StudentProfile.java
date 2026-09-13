package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @Column(name = "user_id")
    private Long userId;
    private String university;
    private String degree;
    @Column(name = "graduation_year")
    private Integer graduationYear;
    @Column(name = "target_role")
    private String targetRole;
    private String location;
    @Column(columnDefinition = "TEXT")
    private String bio;
    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    protected StudentProfile() { }

    public StudentProfile(Long userId) { this.userId = userId; }

    public Long getUserId() { return userId; }
    public String getUniversity() { return university; }
    public String getDegree() { return degree; }
    public Integer getGraduationYear() { return graduationYear; }
    public String getTargetRole() { return targetRole; }
    public String getLocation() { return location; }
    public String getBio() { return bio; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void update(String university, String degree, Integer graduationYear, String targetRole, String location, String bio, String profilePhotoUrl) {
        this.university = university;
        this.degree = degree;
        this.graduationYear = graduationYear;
        this.targetRole = targetRole;
        this.location = location;
        this.bio = bio;
        this.profilePhotoUrl = profilePhotoUrl;
    }
}
