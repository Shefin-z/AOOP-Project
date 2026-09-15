package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.AdminCommunityConnectionResponse;
import edu.uiu.aoop.careerforge.dto.AdminCommunityPostResponse;
import edu.uiu.aoop.careerforge.service.AdminCommunityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/community")
public class AdminCommunityController {
    private final AdminCommunityService community;
    public AdminCommunityController(AdminCommunityService community) { this.community = community; }
    @GetMapping("/overview") public Map<String, Long> overview(@RequestHeader(name = "X-User-Id", required = false) Long adminId) { return community.overview(adminId); }
    @GetMapping("/posts") public List<AdminCommunityPostResponse> posts(@RequestHeader(name = "X-User-Id", required = false) Long adminId) { return community.posts(adminId); }
    @PutMapping("/posts/{postId}/status") public AdminCommunityPostResponse status(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @PathVariable Long postId, @RequestParam String status) { return community.updatePostStatus(adminId, postId, status); }
    @GetMapping("/connections") public List<AdminCommunityConnectionResponse> connections(@RequestHeader(name = "X-User-Id", required = false) Long adminId) { return community.connections(adminId); }
}
