package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.AccountProfileRequest;
import edu.uiu.aoop.careerforge.dto.AccountProfileResponse;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AccountProfileService {
    private static final long MAX_PHOTO_SIZE = 2 * 1024 * 1024;
    private static final Set<String> PHOTO_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private final AccessService access;
    private final UserRepository users;
    private final JdbcTemplate jdbc;
    private final Path photoRoot = Path.of(System.getProperty("user.dir"), "uploads", "admin-profile-photos").toAbsolutePath().normalize();

    public AccountProfileService(AccessService access, UserRepository users, JdbcTemplate jdbc) {
        this.access = access;
        this.users = users;
        this.jdbc = jdbc;
    }

    @PostConstruct
    void preparePhotoStorage() {
        jdbc.execute("create table if not exists admin_profile_photos (user_id bigint not null primary key, photo_path varchar(100) not null, updated_at timestamp not null default current_timestamp on update current_timestamp)");
    }

    public AccountProfileResponse get(Long sessionUserId) {
        return response(access.requireAdmin(sessionUserId));
    }

    @Transactional
    public AccountProfileResponse update(Long sessionUserId, AccountProfileRequest request) {
        User user = access.requireAdmin(sessionUserId);
        String name = request.name().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (name.isBlank() || email.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and email are required.");
        users.findByEmailIgnoreCase(email)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "That email is already used by another account."); });
        user.updateAccount(name, email);
        return response(users.save(user));
    }

    public AccountProfileResponse uploadPhoto(Long sessionUserId, MultipartFile photo) {
        User user = access.requireAdmin(sessionUserId);
        if (photo == null || photo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a profile photo to upload.");
        if (photo.getSize() > MAX_PHOTO_SIZE) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Profile photos must be 2 MB or smaller.");
        String original = photo.getOriginalFilename() == null ? "photo" : Path.of(photo.getOriginalFilename()).getFileName().toString();
        String extension = extension(original);
        if (!PHOTO_EXTENSIONS.contains(extension) || photo.getContentType() == null || !photo.getContentType().startsWith("image/")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a JPG, PNG, or WEBP image.");
        String previous = storedPhoto(user.getId());
        try {
            Path directory = photoRoot.resolve("user-" + user.getId());
            Files.createDirectories(directory);
            String savedName = UUID.randomUUID() + "." + extension;
            Files.copy(photo.getInputStream(), photoPath(user.getId(), savedName), StandardCopyOption.REPLACE_EXISTING);
            jdbc.update("insert into admin_profile_photos (user_id, photo_path) values (?, ?) on duplicate key update photo_path = values(photo_path)", user.getId(), savedName);
            deletePhoto(user.getId(), previous);
            return response(user);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the profile photo.");
        }
    }

    public ProfilePhoto profilePhoto(Long userId) {
        String savedName = storedPhoto(userId);
        if (savedName == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found.");
        Path path = photoPath(userId, savedName);
        if (!Files.isRegularFile(path)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile photo not found.");
        try { return new ProfilePhoto(new FileSystemResource(path), Files.probeContentType(path)); }
        catch (IOException exception) { return new ProfilePhoto(new FileSystemResource(path), "application/octet-stream"); }
    }

    private AccountProfileResponse response(User user) {
        String photoUrl = storedPhoto(user.getId()) == null ? null : "/account/profile/" + user.getId() + "/photo";
        return new AccountProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name().toLowerCase(Locale.ROOT), photoUrl);
    }

    private String storedPhoto(Long userId) { return jdbc.query("select photo_path from admin_profile_photos where user_id = ?", result -> result.next() ? result.getString("photo_path") : null, userId); }
    private void deletePhoto(Long userId, String savedName) { if (savedName == null) return; try { Files.deleteIfExists(photoPath(userId, savedName)); } catch (IOException ignored) { } }
    private Path photoPath(Long userId, String savedName) { Path path = photoRoot.resolve("user-" + userId).resolve(savedName).normalize(); if (!path.startsWith(photoRoot)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile photo path."); return path; }
    private String extension(String filename) { int dot = filename.lastIndexOf('.'); return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT); }
    public record ProfilePhoto(Resource resource, String contentType) { }
}
