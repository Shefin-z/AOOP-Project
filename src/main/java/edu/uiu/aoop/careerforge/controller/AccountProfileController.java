package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.AccountProfileRequest;
import edu.uiu.aoop.careerforge.dto.AccountProfileResponse;
import edu.uiu.aoop.careerforge.service.AccountProfileService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/account/profile")
public class AccountProfileController {
    private final AccountProfileService profile;

    public AccountProfileController(AccountProfileService profile) { this.profile = profile; }

    @GetMapping
    public AccountProfileResponse get(@RequestHeader(name = "X-User-Id", required = false) Long sessionUserId) {
        return profile.get(sessionUserId);
    }

    @PutMapping
    public AccountProfileResponse update(@RequestHeader(name = "X-User-Id", required = false) Long sessionUserId,
                                         @Valid @RequestBody AccountProfileRequest request) {
        return profile.update(sessionUserId, request);
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AccountProfileResponse uploadPhoto(@RequestHeader(name = "X-User-Id", required = false) Long sessionUserId,
                                              @RequestPart("photo") org.springframework.web.multipart.MultipartFile photo) {
        return profile.uploadPhoto(sessionUserId, photo);
    }

    @GetMapping("/{userId}/photo")
    public ResponseEntity<Resource> photo(@PathVariable Long userId) {
        AccountProfileService.ProfilePhoto photo = profile.profilePhoto(userId);
        MediaType contentType; try { contentType = MediaType.parseMediaType(photo.contentType()); } catch (Exception ignored) { contentType = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(contentType).body(photo.resource());
    }
}
