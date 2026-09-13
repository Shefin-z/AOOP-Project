package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.ProfileRequest;
import edu.uiu.aoop.careerforge.dto.ProfileResponse;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.StudentProfileRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileService {
    private static final long MAX_PHOTO_SIZE = 2 * 1024 * 1024;
    private static final Set<String> PHOTO_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final String UPLOADED_PHOTO_PREFIX = "profile-upload:";
    private final StudentProfileRepository profiles;
    private final AccessService access;
    private final Path photoRoot = Path.of(System.getProperty("user.dir"), "uploads", "profile-photos").toAbsolutePath().normalize();
    public ProfileService(StudentProfileRepository profiles, AccessService access) { this.profiles = profiles; this.access = access; }
    public ProfileResponse get(Long userId, Long sessionUserId) { return toResponse(access.requireUser(sessionUserId), profiles.findById(userId).orElse(null), userId, sessionUserId); }
    public ProfileResponse save(Long userId, Long sessionUserId, ProfileRequest request) {
        if (!userId.equals(sessionUserId)) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "You can only edit your own profile.");
        User user = access.requireUser(sessionUserId);
        StudentProfile profile = profiles.findById(userId).orElseGet(() -> new StudentProfile(userId));
        profile.update(trim(request.university()), trim(request.degree()), request.graduationYear(), trim(request.targetRole()), trim(request.location()), trim(request.bio()), trim(request.skills()), trim(request.hobbies()), photoUrl(userId, profile, request.profilePhotoUrl()));
        return toResponse(user, profiles.save(profile), userId, sessionUserId);
    }
    public ProfileResponse uploadPhoto(Long userId, Long sessionUserId, MultipartFile photo) {
        if (!userId.equals(sessionUserId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own profile.");
        User user = access.requireStudent(sessionUserId);
        if (photo == null || photo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a profile photo to upload.");
        if (photo.getSize() > MAX_PHOTO_SIZE) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Profile photos must be 2 MB or smaller.");
        String original = photo.getOriginalFilename() == null ? "photo" : Path.of(photo.getOriginalFilename()).getFileName().toString();
        String extension = extension(original);
        if (!PHOTO_EXTENSIONS.contains(extension) || photo.getContentType() == null || !photo.getContentType().startsWith("image/")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a JPG, PNG, or WEBP image.");
        StudentProfile profile = profiles.findById(userId).orElseGet(() -> new StudentProfile(userId));
        try {
            Path userDirectory = photoRoot.resolve("user-" + userId); Files.createDirectories(userDirectory);
            deleteUploadedPhoto(userId, profile.getProfilePhotoUrl());
            String savedName = UUID.randomUUID() + "." + extension;
            Files.copy(photo.getInputStream(), userDirectory.resolve(savedName), StandardCopyOption.REPLACE_EXISTING);
            profile.setProfilePhotoUrl(UPLOADED_PHOTO_PREFIX + savedName);
            return toResponse(user, profiles.save(profile), userId, sessionUserId);
        } catch (IOException exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the profile photo."); }
    }
    public ProfilePhoto profilePhoto(Long userId) {
        StudentProfile profile = profiles.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found."));
        String value = profile.getProfilePhotoUrl();
        if (!isUploadedPhoto(value)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found.");
        Path file = photoPath(userId, value.substring(UPLOADED_PHOTO_PREFIX.length()));
        if (!Files.isRegularFile(file)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found.");
        try { return new ProfilePhoto(new FileSystemResource(file), Files.probeContentType(file)); }
        catch (IOException exception) { return new ProfilePhoto(new FileSystemResource(file), "application/octet-stream"); }
    }
    private ProfileResponse toResponse(User user, StudentProfile profile, Long userId, Long sessionUserId) {
        if (!userId.equals(sessionUserId)) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "You can only view your own profile.");
        return new ProfileResponse(userId, user.getName(), user.getEmail(), profile == null ? null : profile.getUniversity(), profile == null ? null : profile.getDegree(), profile == null ? null : profile.getGraduationYear(), profile == null ? null : profile.getTargetRole(), profile == null ? null : profile.getLocation(), profile == null ? null : profile.getBio(), profile == null ? null : profile.getSkills(), profile == null ? null : profile.getHobbies(), profile == null ? null : publicPhotoUrl(userId, profile.getProfilePhotoUrl()));
    }
    private String trim(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String photoUrl(Long userId, StudentProfile profile, String value) {
        String trimmed = trim(value);
        if (trimmed == null) return null;
        if (trimmed.equals("/profiles/" + userId + "/photo") && isUploadedPhoto(profile.getProfilePhotoUrl())) return profile.getProfilePhotoUrl();
        if (trimmed.startsWith(UPLOADED_PHOTO_PREFIX)) return null;
        return trimmed;
    }
    private String publicPhotoUrl(Long userId, String value) { return isUploadedPhoto(value) ? "/profiles/" + userId + "/photo" : value; }
    private boolean isUploadedPhoto(String value) { return value != null && value.startsWith(UPLOADED_PHOTO_PREFIX); }
    private void deleteUploadedPhoto(Long userId, String value) { if (!isUploadedPhoto(value)) return; try { Files.deleteIfExists(photoPath(userId, value.substring(UPLOADED_PHOTO_PREFIX.length()))); } catch (IOException ignored) { } }
    private Path photoPath(Long userId, String filename) {
        Path path = photoRoot.resolve("user-" + userId).resolve(filename).normalize();
        if (!path.startsWith(photoRoot)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile photo path.");
        return path;
    }
    private String extension(String filename) { int dot = filename.lastIndexOf('.'); return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(); }
    public record ProfilePhoto(Resource resource, String contentType) { }
}
