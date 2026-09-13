package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.DocumentResponse;
import edu.uiu.aoop.careerforge.dto.ResumeRequest;
import edu.uiu.aoop.careerforge.dto.ResumeResponse;
import edu.uiu.aoop.careerforge.model.StudentDocument;
import edu.uiu.aoop.careerforge.service.VaultService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/vault")
public class VaultController {
    private final VaultService vault;
    public VaultController(VaultService vault) { this.vault = vault; }
    @GetMapping("/resumes") public List<ResumeResponse> resumes(@RequestHeader(name = "X-User-Id", required = false) Long userId) { return vault.listResumes(userId); }
    @PostMapping("/resumes") public ResumeResponse createResume(@RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody ResumeRequest request) { return vault.createResume(userId, request); }
    @PutMapping("/resumes/{id}") public ResumeResponse updateResume(@PathVariable Long id, @RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody ResumeRequest request) { return vault.updateResume(userId, id, request); }
    @PutMapping("/resumes/{id}/default") public ResumeResponse defaultResume(@PathVariable Long id, @RequestHeader(name = "X-User-Id", required = false) Long userId) { return vault.makeDefault(userId, id); }
    @DeleteMapping("/resumes/{id}") public void deleteResume(@PathVariable Long id, @RequestHeader(name = "X-User-Id", required = false) Long userId) { vault.deleteResume(userId, id); }
    @GetMapping("/documents") public List<DocumentResponse> documents(@RequestHeader(name = "X-User-Id", required = false) Long userId) { return vault.listDocuments(userId); }
    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE) public DocumentResponse upload(@RequestHeader(name = "X-User-Id", required = false) Long userId, @RequestPart("file") MultipartFile file) { return vault.upload(userId, file); }
    @DeleteMapping("/documents/{id}") public void deleteDocument(@PathVariable Long id, @RequestHeader(name = "X-User-Id", required = false) Long userId) { vault.deleteDocument(userId, id); }
    @GetMapping("/documents/{id}/download") public ResponseEntity<Resource> download(@PathVariable Long id, @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        StudentDocument document = vault.documentForDownload(userId, id); Resource file = vault.download(userId, id);
        MediaType contentType; try { contentType = MediaType.parseMediaType(document.getContentType()); } catch (Exception ignored) { contentType = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().contentType(contentType).header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(document.getFileName(), StandardCharsets.UTF_8).build().toString()).body(file);
    }
}
