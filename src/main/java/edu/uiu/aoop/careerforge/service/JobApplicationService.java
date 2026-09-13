package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.JobApplicationRequest;
import edu.uiu.aoop.careerforge.dto.JobApplicationResponse;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.model.JobApplication;
import edu.uiu.aoop.careerforge.model.StudentProfile;
import edu.uiu.aoop.careerforge.repository.JobApplicationRepository;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uiu.aoop.careerforge.repository.StudentProfileRepository;

@Service
@Transactional
public class JobApplicationService {
    private final JobApplicationRepository applications;
    private final JobRepository jobs;
    private final AccessService access;
    private final VaultService vault;
    private final StudentProfileRepository profiles;
    private final JobMatchingStrategy matching;
    private final ObjectMapper objectMapper;
    public JobApplicationService(JobApplicationRepository applications, JobRepository jobs, AccessService access, VaultService vault, StudentProfileRepository profiles, JobMatchingStrategy matching, ObjectMapper objectMapper) { this.applications = applications; this.jobs = jobs; this.access = access; this.vault = vault; this.profiles = profiles; this.matching = matching; this.objectMapper = objectMapper; }
    public JobApplicationResponse apply(Long userId, Long jobId, JobApplicationRequest request) {
        access.requireStudent(userId);
        Job job = jobs.findById(jobId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
        if (!"published".equals(job.getStatus()) || job.getExpiryDate().isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This job is no longer accepting applications.");
        if (applications.existsByUserIdAndJobId(userId, jobId)) throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied to this job.");
        String cvSnapshot = vault.applicationSnapshot(userId, request.cvSourceType(), request.cvSourceId());
        StudentProfile profile = profiles.findById(userId).orElse(null);
        JobMatch match = matching.match(job, profile, cvSnapshot);
        return toResponse(applications.save(new JobApplication(userId, job, cvSnapshot, match.percentage(), writeReasons(match.reasons()))));
    }
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> listForStudent(Long userId) { access.requireStudent(userId); return applications.findAllForStudent(userId).stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> listForAdmin(Long userId) { access.requireAdmin(userId); return applications.findAllForAdmin().stream().map(this::toResponse).toList(); }
    public JobApplicationResponse updateStatus(Long adminId, Long applicationId, String status) {
        access.requireAdmin(adminId);
        if (!List.of("submitted", "under_review", "shortlisted", "rejected", "cancelled").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a valid application status.");
        JobApplication application = applications.findById(applicationId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        application.updateStatus(status);
        return toResponse(applications.save(application));
    }
    private JobApplicationResponse toResponse(JobApplication application) { Job job = application.getJob(); return new JobApplicationResponse(application.getId(), job.getId(), job.getTitle(), job.getCompany().getName(), application.getStatus(), application.getMatchPercentage(), readReasons(application.getMatchExplanation()), vault.snapshotTitle(application.getCvSnapshot()), application.getAppliedAt()); }
    private String writeReasons(List<String> reasons) { try { return objectMapper.writeValueAsString(reasons); } catch (Exception exception) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the job match explanation."); } }
    private List<String> readReasons(String reasons) { try { return reasons == null ? List.of() : objectMapper.readValue(reasons, new TypeReference<List<String>>() { }); } catch (Exception exception) { return List.of(); } }
}
