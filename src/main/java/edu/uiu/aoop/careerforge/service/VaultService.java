package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import edu.uiu.aoop.careerforge.dto.DocumentResponse;
import edu.uiu.aoop.careerforge.dto.ResumeRequest;
import edu.uiu.aoop.careerforge.dto.ResumeResponse;
import edu.uiu.aoop.careerforge.model.ResumeVersion;
import edu.uiu.aoop.careerforge.model.StudentDocument;
import edu.uiu.aoop.careerforge.repository.ResumeVersionRepository;
import edu.uiu.aoop.careerforge.repository.StudentDocumentRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class VaultService {
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx");
    private final ResumeVersionRepository resumes;
    private final StudentDocumentRepository documents;
    private final AccessService access;
    private final ObjectMapper objectMapper;
    private final Path uploadRoot = Path.of(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize();
    public VaultService(ResumeVersionRepository resumes, StudentDocumentRepository documents, AccessService access, ObjectMapper objectMapper) { this.resumes = resumes; this.documents = documents; this.access = access; this.objectMapper = objectMapper; }
    @Transactional(readOnly = true) public List<ResumeResponse> listResumes(Long userId) { access.requireStudent(userId); return resumes.findByUserIdOrderByUpdatedAtDesc(userId).stream().map(this::resumeResponse).toList(); }
    public ResumeResponse createResume(Long userId, ResumeRequest request) { access.requireStudent(userId); boolean defaultValue = request.isDefault() || !resumes.existsByUserIdAndIsDefaultTrue(userId); if (defaultValue) clearDefault(userId); return resumeResponse(resumes.save(new ResumeVersion(userId, request.title().trim(), request.content().toString(), defaultValue))); }
    public ResumeResponse updateResume(Long userId, Long id, ResumeRequest request) { access.requireStudent(userId); ResumeVersion resume = resume(userId, id); resume.update(request.title().trim(), request.content().toString()); if (request.isDefault()) { clearDefault(userId); resume.setDefault(true); } return resumeResponse(resumes.save(resume)); }
    public ResumeResponse makeDefault(Long userId, Long id) { access.requireStudent(userId); ResumeVersion resume = resume(userId, id); clearDefault(userId); resume.setDefault(true); return resumeResponse(resumes.save(resume)); }
    public void deleteResume(Long userId, Long id) { access.requireStudent(userId); resumes.delete(resume(userId, id)); }
    @Transactional(readOnly = true) public List<DocumentResponse> listDocuments(Long userId) { access.requireStudent(userId); return documents.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::documentResponse).toList(); }
    public DocumentResponse upload(Long userId, MultipartFile file) {
        access.requireStudent(userId);
        if (file == null || file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a CV or document to upload.");
        if (file.getSize() > MAX_FILE_SIZE) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Files must be 5 MB or smaller.");
        String original = file.getOriginalFilename() == null ? "document" : Path.of(file.getOriginalFilename()).getFileName().toString();
        String extension = extension(original);
        if (!ALLOWED_EXTENSIONS.contains(extension)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF, DOC, and DOCX files are allowed.");
        try {
            Path userDirectory = uploadRoot.resolve("user-" + userId); Files.createDirectories(userDirectory);
            Path saved = userDirectory.resolve(UUID.randomUUID() + "-" + original.replaceAll("[^A-Za-z0-9._-]", "_"));
            Files.copy(file.getInputStream(), saved, StandardCopyOption.REPLACE_EXISTING);
            String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
            return documentResponse(documents.save(new StudentDocument(userId, original, contentType, saved.toString(), file.getSize())));
        } catch (IOException exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the uploaded file."); }
    }
    public void deleteDocument(Long userId, Long id) { access.requireStudent(userId); StudentDocument document = document(userId, id); try { Files.deleteIfExists(Path.of(document.getStoragePath())); } catch (IOException ignored) { } documents.delete(document); }
    @Transactional(readOnly = true) public Resource download(Long userId, Long id) { access.requireStudent(userId); StudentDocument document = document(userId, id); Resource resource = new FileSystemResource(document.getStoragePath()); if (!resource.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The uploaded file is missing."); return resource; }
    @Transactional(readOnly = true) public StudentDocument documentForDownload(Long userId, Long id) { access.requireStudent(userId); return document(userId, id); }
    @Transactional(readOnly = true) public String applicationSnapshot(Long userId, String sourceType, Long sourceId) {
        access.requireStudent(userId); ObjectNode snapshot = objectMapper.createObjectNode();
        if ("resume".equals(sourceType)) { ResumeVersion resume = resume(userId, sourceId); snapshot.put("source", "resume_version"); snapshot.put("sourceId", resume.getId()); snapshot.put("title", resume.getTitle()); try { snapshot.set("content", objectMapper.readTree(resume.getContent())); } catch (IOException exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Saved resume data is invalid."); } }
        else if ("document".equals(sourceType)) { StudentDocument document = document(userId, sourceId); snapshot.put("source", "uploaded_document"); snapshot.put("sourceId", document.getId()); snapshot.put("title", document.getFileName()); snapshot.put("contentType", document.getContentType()); snapshot.put("fileSizeBytes", document.getFileSizeBytes()); }
        else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a resume version or uploaded document.");
        snapshot.put("selectedAt", LocalDateTime.now().toString()); return snapshot.toString();
    }
    public String snapshotTitle(String snapshot) { try { return snapshot == null ? "No CV selected" : objectMapper.readTree(snapshot).path("title").asText("Selected CV"); } catch (IOException exception) { return "Selected CV"; } }
    private ResumeVersion resume(Long userId, Long id) { return resumes.findByIdAndUserId(id, userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume version not found.")); }
    private StudentDocument document(Long userId, Long id) { return documents.findByIdAndUserId(id, userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found.")); }
    private void clearDefault(Long userId) { resumes.findByUserIdOrderByUpdatedAtDesc(userId).forEach(item -> item.setDefault(false)); }
    private ResumeResponse resumeResponse(ResumeVersion resume) { try { return new ResumeResponse(resume.getId(), resume.getTitle(), objectMapper.readTree(resume.getContent()), resume.isDefault(), resume.getUpdatedAt()); } catch (IOException exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Saved resume data is invalid."); } }
    private DocumentResponse documentResponse(StudentDocument document) { return new DocumentResponse(document.getId(), document.getFileName(), document.getContentType(), document.getFileSizeBytes(), document.getCreatedAt()); }
    private String extension(String filename) { int dot = filename.lastIndexOf('.'); return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(); }
}
