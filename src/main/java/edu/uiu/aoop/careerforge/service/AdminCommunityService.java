package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.AdminCommunityConnectionResponse;
import edu.uiu.aoop.careerforge.dto.AdminCommunityPostResponse;
import edu.uiu.aoop.careerforge.model.CommunityPost;
import edu.uiu.aoop.careerforge.repository.CommunityCommentRepository;
import edu.uiu.aoop.careerforge.repository.CommunityPostRepository;
import edu.uiu.aoop.careerforge.repository.PostLikeStore;
import edu.uiu.aoop.careerforge.repository.StudentConnectionRepository;
import edu.uiu.aoop.careerforge.repository.StudentMessageRepository;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class AdminCommunityService {
    private final AccessService access; private final CommunityPostRepository posts; private final CommunityCommentRepository comments;
    private final PostLikeStore likes; private final StudentConnectionRepository connections; private final StudentMessageRepository messages; private final UserRepository users;

    public AdminCommunityService(AccessService access, CommunityPostRepository posts, CommunityCommentRepository comments,
                                 PostLikeStore likes, StudentConnectionRepository connections, StudentMessageRepository messages, UserRepository users) {
        this.access = access; this.posts = posts; this.comments = comments; this.likes = likes; this.connections = connections; this.messages = messages; this.users = users;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> overview(Long adminId) {
        access.requireAdmin(adminId);
        return Map.of("visiblePosts", posts.countByStatus("visible"), "removedPosts", posts.countByStatus("removed"),
                "pendingConnections", connections.countByStatus("pending"), "acceptedConnections", connections.countByStatus("accepted"),
                "messages", messages.count());
    }

    @Transactional(readOnly = true)
    public List<AdminCommunityPostResponse> posts(Long adminId) {
        access.requireAdmin(adminId);
        return posts.findAllByOrderByCreatedAtDescIdDesc().stream().map(this::postResponse).toList();
    }

    @Transactional
    public AdminCommunityPostResponse updatePostStatus(Long adminId, Long postId, String status) {
        access.requireAdmin(adminId);
        if (!"visible".equals(status) && !"removed".equals(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post status must be visible or removed.");
        CommunityPost post = posts.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found."));
        post.moderate(status);
        return postResponse(post);
    }

    @Transactional(readOnly = true)
    public List<AdminCommunityConnectionResponse> connections(Long adminId) {
        access.requireAdmin(adminId);
        return connections.findAllByOrderByUpdatedAtDescIdDesc().stream().map(connection -> new AdminCommunityConnectionResponse(
                connection.getId(), users.findById(connection.getUserLowId()).map(user -> user.getName()).orElse("Unknown student"),
                users.findById(connection.getUserHighId()).map(user -> user.getName()).orElse("Unknown student"),
                connection.getStatus(), connection.getUpdatedAt())).toList();
    }

    private AdminCommunityPostResponse postResponse(CommunityPost post) {
        String author = users.findById(post.getUserId()).map(user -> user.getName()).orElse("Former student");
        return new AdminCommunityPostResponse(post.getId(), author, post.getContent(), post.getStatus(), likes.countForPost(post.getId()),
                comments.countByPostIdAndStatus(post.getId(), "visible"), post.getCreatedAt());
    }
}
