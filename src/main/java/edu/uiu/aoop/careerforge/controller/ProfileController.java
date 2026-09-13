package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ProfileRequest;
import edu.uiu.aoop.careerforge.dto.ProfileResponse;
import edu.uiu.aoop.careerforge.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/profiles")
public class ProfileController {
    private final ProfileService profiles;
    public ProfileController(ProfileService profiles) { this.profiles = profiles; }
    @GetMapping("/{userId}") public ProfileResponse get(@PathVariable Long userId, @RequestHeader(name = "X-User-Id", required = false) Long sessionUserId) { return profiles.get(userId, sessionUserId); }
    @PutMapping("/{userId}") public ProfileResponse save(@PathVariable Long userId, @RequestHeader(name = "X-User-Id", required = false) Long sessionUserId, @Valid @RequestBody ProfileRequest request) { return profiles.save(userId, sessionUserId, request); }
}
