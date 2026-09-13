package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ProfileRequest;
import edu.uiu.aoop.careerforge.dto.ProfileResponse;
import edu.uiu.aoop.careerforge.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/profiles")
public class ProfileController {
    private final ProfileService profiles;
    public ProfileController(ProfileService profiles) { this.profiles = profiles; }
    @GetMapping("/{userId}") public ProfileResponse get(@PathVariable Long userId, @RequestHeader(name = "X-User-Id", required = false) Long sessionUserId) { return profiles.get(userId, sessionUserId); }
    @PutMapping("/{userId}") public ProfileResponse save(@PathVariable Long userId, @RequestHeader(name = "X-User-Id", required = false) Long sessionUserId, @Valid @RequestBody ProfileRequest request) { return profiles.save(userId, sessionUserId, request); }
    @PostMapping(value = "/{userId}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) public ProfileResponse uploadPhoto(@PathVariable Long userId, @RequestHeader(name = "X-User-Id", required = false) Long sessionUserId, @RequestPart("photo") MultipartFile photo) { return profiles.uploadPhoto(userId, sessionUserId, photo); }
    @GetMapping("/{userId}/photo") public ResponseEntity<Resource> photo(@PathVariable Long userId) {
        ProfileService.ProfilePhoto photo = profiles.profilePhoto(userId);
        MediaType contentType; try { contentType = MediaType.parseMediaType(photo.contentType()); } catch (Exception ignored) { contentType = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().contentType(contentType).body(photo.resource());
    }
}
