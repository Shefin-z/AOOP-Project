package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "users")
public class User extends BaseEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, length = 120) private String name;
  @Column(nullable = false, unique = true, length = 190) private String email;
  @Column(name = "password_hash", nullable = false) private String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role = Role.student;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private UserStatus status = UserStatus.active;
  @Column(name = "last_login_at") private Instant lastLoginAt;
  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) private StudentProfile profile;

  protected User() { }
  public User(String name, String email, String passwordHash, Role role) { this.name = name; this.email = email; this.passwordHash = passwordHash; this.role = role; }
  public Long getId() { return id; } public String getName() { return name; } public String getEmail() { return email; }
  public String getPasswordHash() { return passwordHash; } public Role getRole() { return role; } public UserStatus getStatus() { return status; }
  public StudentProfile getProfile() { return profile; } public Instant getLastLoginAt() { return lastLoginAt; }
  public void rename(String value) { this.name = value; } public void changeEmail(String value) { this.email = value; }
  public void setProfile(StudentProfile value) { this.profile = value; value.setUser(this); }
  public void setStatus(UserStatus value) { this.status = value; } public void recordLogin() { this.lastLoginAt = Instant.now(); }
}
