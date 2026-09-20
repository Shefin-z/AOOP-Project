package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.AdminCommunityPostResponse;
import edu.uiu.aoop.careerforge.dto.AdminChatConversationResponse;
import edu.uiu.aoop.careerforge.dto.MessageResponse;
import edu.uiu.aoop.careerforge.dto.PostRequest;
import edu.uiu.aoop.careerforge.service.AdminCommunityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/community")
public class AdminCommunityController {
    private final AdminCommunityService community;
    public AdminCommunityController(AdminCommunityService community) { this.community = community; }
    @GetMapping("/overview") public Map<String, Long> overview(@RequestHeader(name = "X-User-Id", required = false) Long adminId) { return community.overview(adminId); }
    @GetMapping("/posts") public List<AdminCommunityPostResponse> posts(@RequestHeader(name = "X-User-Id", required = false) Long adminId) { return community.posts(adminId); }
    @PostMapping("/posts") public AdminCommunityPostResponse publish(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @Valid @RequestBody PostRequest request) { return community.publish(adminId, request); }
    @PutMapping("/posts/{postId}/status") public AdminCommunityPostResponse status(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @PathVariable Long postId, @RequestParam String status) { return community.updatePostStatus(adminId, postId, status); }
    @PutMapping("/posts/{postId}/rescan") public AdminCommunityPostResponse rescan(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @PathVariable Long postId) { return community.rescan(adminId, postId); }
    @GetMapping("/chats") public List<AdminChatConversationResponse> chats(@RequestHeader(name = "X-User-Id", required = false) Long adminId) { return community.chats(adminId); }
    @GetMapping("/chats/{connectionId}/messages") public List<MessageResponse> chatMessages(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @PathVariable Long connectionId) { return community.chatMessages(adminId, connectionId); }
    @DeleteMapping("/chats/{connectionId}/messages/{messageId}") public void removeChatMessage(@RequestHeader(name = "X-User-Id", required = false) Long adminId, @PathVariable Long connectionId, @PathVariable Long messageId) { community.removeChatMessage(adminId, connectionId, messageId); }
}
