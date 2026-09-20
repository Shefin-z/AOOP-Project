package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.ConnectionResponse;
import edu.uiu.aoop.careerforge.dto.ConnectedStudentProfileResponse;
import edu.uiu.aoop.careerforge.dto.MessageResponse;
import edu.uiu.aoop.careerforge.dto.StudentDirectoryResponse;
import edu.uiu.aoop.careerforge.model.Role;
import edu.uiu.aoop.careerforge.model.StudentConnection;
import edu.uiu.aoop.careerforge.model.StudentMessage;
import edu.uiu.aoop.careerforge.model.User;
import edu.uiu.aoop.careerforge.repository.StudentConnectionRepository;
import edu.uiu.aoop.careerforge.repository.StudentMessageRepository;
import edu.uiu.aoop.careerforge.repository.StudentProfileRepository;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CommunityChatService {
    private final AccessService access;
    private final UserRepository users;
    private final StudentConnectionRepository connections;
    private final StudentMessageRepository messages;
    private final StudentProfileRepository profiles;

    public CommunityChatService(AccessService access, UserRepository users, StudentConnectionRepository connections, StudentMessageRepository messages, StudentProfileRepository profiles) {
        this.access = access; this.users = users; this.connections = connections; this.messages = messages; this.profiles = profiles;
    }

    /**
     * Both a student and an administrator may open the live socket.  The
     * returned flag tells the socket handler whether the session is a
     * read-only moderation monitor instead of a student chat session.
     */
    public boolean openSocket(Long userId) { return access.requireUser(userId).getRole() == Role.ADMIN; }

    @Transactional(readOnly = true)
    public List<StudentDirectoryResponse> directory(Long userId, String query) {
        access.requireStudent(userId);
        String needle = query == null ? "" : query.trim().toLowerCase();
        return users.findAll().stream()
                .filter(user -> user.getRole() == Role.STUDENT && !user.getId().equals(userId))
                .filter(user -> {
                    var profile = profiles.findById(user.getId()).orElse(null);
                    String searchable = user.getId() + " " + user.getName() + " " + user.getEmail() + " "
                            + (profile == null ? "" : String.join(" ", safe(profile.getUniversity()), safe(profile.getTargetRole())));
                    return needle.isBlank() || searchable.toLowerCase().contains(needle);
                })
                .limit(30)
                .map(user -> {
                    StudentConnection connection = pair(userId, user.getId()).orElse(null);
                    return new StudentDirectoryResponse(user.getId(), user.getName(), user.getEmail(), connection == null ? "none" : connection.getStatus(), connection == null ? null : connection.getId(), connection != null && connection.getRequestedBy().equals(userId));
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<ConnectionResponse> connections(Long userId) {
        access.requireStudent(userId);
        return connections.findAllForUser(userId).stream().map(connection -> connectionResponse(connection, userId)).toList();
    }

    @Transactional
    public ConnectionResponse requestConnection(Long userId, Long studentId) {
        access.requireStudent(userId);
        User other = requireOtherStudent(userId, studentId);
        StudentConnection connection = pair(userId, other.getId()).orElse(null);
        if (connection == null) connection = connections.save(new StudentConnection(userId, other.getId(), userId));
        else if ("pending".equals(connection.getStatus()) && !connection.getRequestedBy().equals(userId)) connection.accept();
        return connectionResponse(connection, userId);
    }

    @Transactional
    public ConnectionResponse acceptConnection(Long userId, Long connectionId) {
        access.requireStudent(userId);
        StudentConnection connection = requireConnection(connectionId, userId);
        if (!"pending".equals(connection.getStatus()) || connection.getRequestedBy().equals(userId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This connection request cannot be accepted.");
        connection.accept();
        return connectionResponse(connection, userId);
    }

    @Transactional
    public void deleteConnection(Long userId, Long connectionId) {
        access.requireStudent(userId);
        connections.delete(requireConnection(connectionId, userId));
    }

    @Transactional
    public List<MessageResponse> messages(Long userId, Long connectionId) {
        access.requireStudent(userId);
        StudentConnection connection = requireAcceptedConnection(connectionId, userId);
        List<StudentMessage> conversation = messages.findByConnectionIdOrderByCreatedAtAsc(connection.getId());
        conversation.stream().filter(message -> !message.getSenderId().equals(userId)).forEach(StudentMessage::markRead);
        return conversation.stream().map(this::messageResponse).toList();
    }

    @Transactional(readOnly = true)
    public ConnectedStudentProfileResponse connectedProfile(Long userId, Long connectionId) {
        access.requireStudent(userId);
        StudentConnection connection = requireAcceptedConnection(connectionId, userId);
        User other = users.findById(connection.otherUserId(userId)).orElseThrow();
        return profiles.findById(other.getId())
                .map(profile -> new ConnectedStudentProfileResponse(other.getId(), other.getName(), profile.getUniversity(),
                        profile.getDegree(), profile.getTargetRole(), profile.getLocation(), profile.getSkills(),
                        profile.getHobbies(), profile.getBio(), profile.getProfilePhotoUrl()))
                .orElseGet(() -> new ConnectedStudentProfileResponse(other.getId(), other.getName(), null, null,
                        null, null, null, null, null, null));
    }

    @Transactional
    public MessageResponse send(Long userId, Long connectionId, String text) {
        access.requireStudent(userId);
        StudentConnection connection = requireAcceptedConnection(connectionId, userId);
        String content = text == null ? "" : text.trim();
        if (content.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A message cannot be empty.");
        if (content.length() > 2000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Messages can contain up to 2,000 characters.");
        return messageResponse(messages.save(new StudentMessage(connection, userId, content)));
    }

    @Transactional
    public void deleteMessage(Long userId, Long connectionId, Long messageId) {
        access.requireStudent(userId); requireAcceptedConnection(connectionId, userId);
        if (messages.deleteByIdAndConnectionIdAndSenderId(messageId, connectionId, userId) == 0) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete messages that you sent.");
    }

    @Transactional
    public void clearConversation(Long userId, Long connectionId) {
        access.requireStudent(userId); StudentConnection connection = requireAcceptedConnection(connectionId, userId);
        messages.deleteByConnectionId(connection.getId());
    }

    @Transactional(readOnly = true)
    public List<Long> participants(Long connectionId, Long userId) {
        StudentConnection connection = requireAcceptedConnection(connectionId, userId);
        return List.of(connection.getUserLowId(), connection.getUserHighId());
    }

    private StudentConnection requireConnection(Long connectionId, Long userId) {
        StudentConnection connection = connections.findById(connectionId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Connection not found."));
        if (!connection.includes(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This connection does not belong to you.");
        return connection;
    }
    private StudentConnection requireAcceptedConnection(Long connectionId, Long userId) {
        StudentConnection connection = requireConnection(connectionId, userId);
        if (!"accepted".equals(connection.getStatus())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accept the connection request before messaging.");
        return connection;
    }
    private User requireOtherStudent(Long userId, Long studentId) {
        if (studentId == null || studentId.equals(userId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose another student.");
        User other = users.findById(studentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found."));
        if (other.getRole() != Role.STUDENT) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can only connect with students.");
        return other;
    }
    private java.util.Optional<StudentConnection> pair(Long first, Long second) { return connections.findByUserLowIdAndUserHighId(Math.min(first, second), Math.max(first, second)); }
    private String safe(String value) { return value == null ? "" : value; }
    private ConnectionResponse connectionResponse(StudentConnection connection, Long currentUserId) {
        User other = users.findById(connection.otherUserId(currentUserId)).orElseThrow();
        return new ConnectionResponse(connection.getId(), other.getId(), other.getName(), connection.getStatus(), connection.getRequestedBy().equals(currentUserId), messages.countByConnectionIdAndSenderIdNotAndReadAtIsNull(connection.getId(), currentUserId), connection.getUpdatedAt());
    }
    private MessageResponse messageResponse(StudentMessage message) {
        User sender = users.findById(message.getSenderId()).orElseThrow();
        return new MessageResponse(message.getId(), message.getConnection().getId(), message.getSenderId(), sender.getName(), message.getContent(), message.getCreatedAt(), message.getReadAt());
    }
}
