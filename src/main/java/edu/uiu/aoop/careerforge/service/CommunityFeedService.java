package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.CommentResponse;
import edu.uiu.aoop.careerforge.dto.PostResponse;
import edu.uiu.aoop.careerforge.model.CommunityComment;
import edu.uiu.aoop.careerforge.model.CommunityPost;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.CommunityCommentRepository;
import edu.uiu.aoop.careerforge.repository.CommunityPostRepository;
import edu.uiu.aoop.careerforge.repository.ContentReportStore;
import edu.uiu.aoop.careerforge.repository.PostLikeStore;
import edu.uiu.aoop.careerforge.repository.PostShareStore;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommunityFeedService {
    private final AccessService access; private final UserRepository users; private final CommunityPostRepository posts; private final CommunityCommentRepository comments;
    private final PostLikeStore likes; private final PostShareStore shares; private final ContentReportStore reports; private final CommunityModerationService moderation; private final CommunityAllowanceService allowance;
    public CommunityFeedService(AccessService access, UserRepository users, CommunityPostRepository posts, CommunityCommentRepository comments, PostLikeStore likes, PostShareStore shares, ContentReportStore reports, CommunityModerationService moderation, CommunityAllowanceService allowance) { this.access = access; this.users = users; this.posts = posts; this.comments = comments; this.likes = likes; this.shares = shares; this.reports = reports; this.moderation = moderation; this.allowance = allowance; }

    @Transactional(readOnly = true) public List<PostResponse> list(Long userId) { access.requireStudent(userId); return posts.findAllByOrderByCreatedAtDescIdDesc().stream().filter(post -> "visible".equals(post.getStatus()) || post.getUserId().equals(userId)).limit(100).map(post -> response(post, userId)).toList(); }
    @Transactional public PostResponse create(Long userId, String content, String mediaUrl, String topicTags) { access.requireStudent(userId); LocalDateTime now = LocalDateTime.now(); String cleaned = clean(content, 5000); CommunityModerationService.Result result = moderation.analyse(cleaned, posts.findByUserIdAndCreatedAtAfter(userId, now.minusHours(24))); allowance.consume(userId); CommunityPost post = new CommunityPost(userId, cleaned, optional(mediaUrl, 500), optional(topicTags, 500), result.spamScore(), result.fraudScore(), result.riskScore(), result.riskLabel(), result.reasons(), result.status()); return response(posts.save(post), userId); }
    @Transactional public PostResponse toggleLike(Long userId, Long postId) { access.requireStudent(userId); CommunityPost post = visiblePost(postId); if (likes.likedBy(postId, userId)) likes.remove(postId, userId); else likes.add(postId, userId); return response(post, userId); }
    @Transactional public CommentResponse comment(Long userId, Long postId, String content) { access.requireStudent(userId); visiblePost(postId); String cleaned = clean(content, 2000); allowance.consume(userId); return commentResponse(comments.save(new CommunityComment(postId, userId, cleaned))); }
    @Transactional public PostResponse share(Long userId, Long postId) { access.requireStudent(userId); CommunityPost post = visiblePost(postId); if (shares.addOnce(postId, userId)) post.incrementShareCount(); return response(post, userId); }
    @Transactional public void report(Long userId, Long postId, String reason) { access.requireStudent(userId); CommunityPost post = visiblePost(postId); if (post.getUserId().equals(userId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot report your own post."); String value = reason == null ? "" : reason.trim().toLowerCase(); if (!List.of("spam", "fraud", "harassment", "misinformation", "other").contains(value)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid report reason."); if (!reports.open(postId, userId, value)) throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an open report for this post."); }
    @Transactional public void deleteOwnPost(Long userId, Long postId) { access.requireStudent(userId); CommunityPost post = posts.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found.")); if (!post.getUserId().equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own post."); post.moderate("removed"); }
    @Transactional public void deleteOwnComment(Long userId, Long postId, Long commentId) { access.requireStudent(userId); CommunityComment comment = comments.findByIdAndPostId(commentId, postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found.")); if (!comment.getUserId().equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comment."); comment.remove(); }
    private CommunityPost visiblePost(Long postId) { return posts.findById(postId).filter(post -> "visible".equals(post.getStatus())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found.")); }
    private PostResponse response(CommunityPost post, Long userId) { User author = users.findById(post.getUserId()).orElseThrow(); List<CommentResponse> postComments = comments.findByPostIdAndStatusOrderByCreatedAtAsc(post.getId(), "visible").stream().map(this::commentResponse).toList(); return new PostResponse(post.getId(), author.getName(), post.getContent(), post.getMediaUrl(), post.getTopicTags(), post.getStatus(), post.getRiskScore(), post.getRiskLabel(), likes.countForPost(post.getId()), likes.likedBy(post.getId(), userId), post.getShareCount(), shares.sharedBy(post.getId(), userId), postComments.size(), post.getCreatedAt(), postComments); }
    private CommentResponse commentResponse(CommunityComment comment) { return new CommentResponse(comment.getId(), users.findById(comment.getUserId()).orElseThrow().getName(), comment.getContent(), comment.getCreatedAt()); }
    private String clean(String content, int maximum) { String value = content == null ? "" : content.trim(); if (value.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot be empty."); if (value.length() > maximum) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is too long."); return value; }
    private String optional(String value, int maximum) { String cleaned = value == null ? null : value.trim(); if (cleaned != null && cleaned.length() > maximum) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Optional post information is too long."); return cleaned == null || cleaned.isBlank() ? null : cleaned; }
}
