package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.CommentResponse;
import edu.uiu.aoop.careerforge.dto.PostResponse;
import edu.uiu.aoop.careerforge.model.CommunityComment;
import edu.uiu.aoop.careerforge.model.CommunityPost;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.CommunityCommentRepository;
import edu.uiu.aoop.careerforge.repository.CommunityPostRepository;
import edu.uiu.aoop.careerforge.repository.PostLikeStore;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CommunityFeedService {
    private final AccessService access; private final UserRepository users; private final CommunityPostRepository posts; private final CommunityCommentRepository comments; private final PostLikeStore likes;
    public CommunityFeedService(AccessService access, UserRepository users, CommunityPostRepository posts, CommunityCommentRepository comments, PostLikeStore likes) { this.access = access; this.users = users; this.posts = posts; this.comments = comments; this.likes = likes; }
    @Transactional(readOnly = true) public List<PostResponse> list(Long userId) { access.requireStudent(userId); return posts.findByStatusOrderByCreatedAtDescIdDesc("visible").stream().map(post -> response(post, userId)).toList(); }
    @Transactional public PostResponse create(Long userId, String content) { access.requireStudent(userId); return response(posts.save(new CommunityPost(userId, clean(content, 5000))), userId); }
    @Transactional public PostResponse toggleLike(Long userId, Long postId) { access.requireStudent(userId); CommunityPost post = visiblePost(postId); if (likes.likedBy(postId, userId)) likes.remove(postId, userId); else likes.add(postId, userId); return response(post, userId); }
    @Transactional public CommentResponse comment(Long userId, Long postId, String content) { access.requireStudent(userId); visiblePost(postId); return commentResponse(comments.save(new CommunityComment(postId, userId, clean(content, 2000)))); }
    private CommunityPost visiblePost(Long postId) { return posts.findById(postId).filter(post -> "visible".equals(post.getStatus())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found.")); }
    private PostResponse response(CommunityPost post, Long userId) { User author = users.findById(post.getUserId()).orElseThrow(); List<CommentResponse> postComments = comments.findByPostIdAndStatusOrderByCreatedAtAsc(post.getId(), "visible").stream().map(this::commentResponse).toList(); return new PostResponse(post.getId(), author.getName(), post.getContent(), likes.countForPost(post.getId()), likes.likedBy(post.getId(), userId), postComments.size(), post.getCreatedAt(), postComments); }
    private CommentResponse commentResponse(CommunityComment comment) { return new CommentResponse(comment.getId(), users.findById(comment.getUserId()).orElseThrow().getName(), comment.getContent(), comment.getCreatedAt()); }
    private String clean(String content, int maximum) { String value = content == null ? "" : content.trim(); if (value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot be empty."); if (value.length() > maximum) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is too long."); return value; }
}
