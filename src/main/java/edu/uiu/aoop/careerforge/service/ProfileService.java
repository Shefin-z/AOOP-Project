package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.ProfileRequest;
import edu.uiu.aoop.careerforge.dto.ProfileResponse;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {
    private final StudentProfileRepository profiles;
    private final AccessService access;
    public ProfileService(StudentProfileRepository profiles, AccessService access) { this.profiles = profiles; this.access = access; }
    public ProfileResponse get(Long userId, Long sessionUserId) { return toResponse(access.requireUser(sessionUserId), profiles.findById(userId).orElse(null), userId, sessionUserId); }
    public ProfileResponse save(Long userId, Long sessionUserId, ProfileRequest request) {
        if (!userId.equals(sessionUserId)) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "You can only edit your own profile.");
        User user = access.requireUser(sessionUserId);
        StudentProfile profile = profiles.findById(userId).orElseGet(() -> new StudentProfile(userId));
        profile.update(trim(request.university()), trim(request.degree()), request.graduationYear(), trim(request.targetRole()), trim(request.location()), trim(request.bio()), trim(request.profilePhotoUrl()));
        return toResponse(user, profiles.save(profile), userId, sessionUserId);
    }
    private ProfileResponse toResponse(User user, StudentProfile profile, Long userId, Long sessionUserId) {
        if (!userId.equals(sessionUserId)) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "You can only view your own profile.");
        return new ProfileResponse(userId, user.getName(), user.getEmail(), profile == null ? null : profile.getUniversity(), profile == null ? null : profile.getDegree(), profile == null ? null : profile.getGraduationYear(), profile == null ? null : profile.getTargetRole(), profile == null ? null : profile.getLocation(), profile == null ? null : profile.getBio(), profile == null ? null : profile.getProfilePhotoUrl());
    }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
