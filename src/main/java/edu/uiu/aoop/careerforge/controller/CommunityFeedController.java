package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.CommentRequest;
import edu.uiu.aoop.careerforge.dto.CommentResponse;
import edu.uiu.aoop.careerforge.dto.PostRequest;
import edu.uiu.aoop.careerforge.dto.PostResponse;
import edu.uiu.aoop.careerforge.service.CommunityFeedService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/community/posts")
public class CommunityFeedController {
    private final CommunityFeedService feed;
    public CommunityFeedController(CommunityFeedService feed) { this.feed = feed; }
    @GetMapping public List<PostResponse> list(@RequestHeader(name = "X-User-Id", required = false) Long userId) { return feed.list(userId); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public PostResponse create(@RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody PostRequest request) { return feed.create(userId, request.content()); }
    @PostMapping("/{postId}/likes") public PostResponse like(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long postId) { return feed.toggleLike(userId, postId); }
    @PostMapping("/{postId}/comments") @ResponseStatus(HttpStatus.CREATED) public CommentResponse comment(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long postId, @Valid @RequestBody CommentRequest request) { return feed.comment(userId, postId, request.content()); }
}
