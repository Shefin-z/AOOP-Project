package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.ConnectionRequest;
import edu.uiu.aoop.careerforge.dto.ConnectionResponse;
import edu.uiu.aoop.careerforge.dto.MessageRequest;
import edu.uiu.aoop.careerforge.dto.MessageResponse;
import edu.uiu.aoop.careerforge.dto.StudentDirectoryResponse;
import edu.uiu.aoop.careerforge.service.CommunityChatService;
import edu.uiu.aoop.careerforge.dto.ConnectedStudentProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/community")
public class CommunityChatController {
    private final CommunityChatService community;
    public CommunityChatController(CommunityChatService community) { this.community = community; }
    @GetMapping("/students") public List<StudentDirectoryResponse> students(@RequestHeader(name = "X-User-Id", required = false) Long userId, @RequestParam(required = false) String query) { return community.directory(userId, query); }
    @GetMapping("/connections") public List<ConnectionResponse> connections(@RequestHeader(name = "X-User-Id", required = false) Long userId) { return community.connections(userId); }
    @PostMapping("/connections") @ResponseStatus(HttpStatus.CREATED) public ConnectionResponse request(@RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody ConnectionRequest request) { return community.requestConnection(userId, request.studentId()); }
    @PutMapping("/connections/{connectionId}/accept") public ConnectionResponse accept(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId) { return community.acceptConnection(userId, connectionId); }
    @DeleteMapping("/connections/{connectionId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void remove(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId) { community.deleteConnection(userId, connectionId); }
    @GetMapping("/connections/{connectionId}/messages") public List<MessageResponse> messages(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId) { return community.messages(userId, connectionId); }
    @GetMapping("/connections/{connectionId}/profile") public ConnectedStudentProfileResponse profile(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId) { return community.connectedProfile(userId, connectionId); }
    @PostMapping("/connections/{connectionId}/messages") @ResponseStatus(HttpStatus.CREATED) public MessageResponse send(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId, @Valid @RequestBody MessageRequest request) { return community.send(userId, connectionId, request.content()); }
    @DeleteMapping("/connections/{connectionId}/messages/{messageId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteMessage(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId, @PathVariable Long messageId) { community.deleteMessage(userId, connectionId, messageId); }
    @DeleteMapping("/connections/{connectionId}/messages") @ResponseStatus(HttpStatus.NO_CONTENT) public void clearConversation(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long connectionId) { community.clearConversation(userId, connectionId); }
}
