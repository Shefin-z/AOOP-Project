package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.JobRequest;
import edu.uiu.aoop.careerforge.dto.JobResponse;
import edu.uiu.aoop.careerforge.model.Company;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.repository.CompanyRepository;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class JobService {
    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final AccessService access;
    public JobService(JobRepository jobs, CompanyRepository companies, AccessService access) { this.jobs = jobs; this.companies = companies; this.access = access; }
    @Transactional(readOnly = true)
    public List<JobResponse> list() { return jobs.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList(); }
    @Transactional(readOnly = true)
    public List<JobResponse> listPublished() { return jobs.findByStatusAndExpiryDateGreaterThanEqualOrderByCreatedAtDesc("published", java.time.LocalDate.now()).stream().map(this::toResponse).toList(); }
    public List<JobResponse> listForAdmin(Long adminId) { access.requireAdmin(adminId); return list(); }
    public JobResponse create(Long adminId, JobRequest request) { access.requireAdmin(adminId); Job job = new Job(company(request), adminId); apply(job, request); return toResponse(jobs.save(job)); }
    public int importFromProvider(Long adminId, JobImportProvider provider) { access.requireAdmin(adminId); return provider.importJobs(); }
    public JobResponse update(Long id, Long adminId, JobRequest request) { access.requireAdmin(adminId); Job job = find(id); apply(job, request); return toResponse(jobs.save(job)); }
    public void delete(Long id, Long adminId) { access.requireAdmin(adminId); jobs.delete(find(id)); }
    private Job find(Long id) { return jobs.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found.")); }
    private Company company(JobRequest request) {
        String name = request.companyName().trim();
        Company company = companies.findByNameIgnoreCase(name).orElseGet(() -> new Company(name, clean(request.companyWebsite()), clean(request.companyLocation())));
        company.update(clean(request.companyWebsite()), clean(request.companyLocation()));
        return companies.save(company);
    }
    private void apply(Job job, JobRequest request) {
        String employment = request.employmentType().trim().toLowerCase(Locale.ROOT);
        String workMode = request.workMode().trim().toLowerCase(Locale.ROOT);
        String status = request.status().trim().toLowerCase(Locale.ROOT);
        if (!List.of("internship", "part_time", "full_time", "contract").contains(employment) || !List.of("onsite", "hybrid", "remote").contains(workMode) || !List.of("draft", "published", "closed").contains(status)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a valid job type, work mode, and status.");
        job.update(request.title().trim(), clean(request.location()), employment, workMode, clean(request.salaryText()), request.description().trim(), request.expiryDate(), status);
    }
    private JobResponse toResponse(Job job) { Company c = job.getCompany(); return new JobResponse(job.getId(), c.getName(), c.getWebsite(), c.getLocation(), job.getTitle(), job.getLocation(), job.getEmploymentType(), job.getWorkMode(), job.getSalaryText(), job.getDescription(), job.getExpiryDate(), job.getStatus(), job.getPublicUuid()); }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
