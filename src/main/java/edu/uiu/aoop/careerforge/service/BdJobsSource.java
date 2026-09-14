package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uiu.aoop.careerforge.model.Company;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.repository.CompanyRepository;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Reads the public BDJobs listing payload and stores validated listings as admin drafts. */
@Service
@Transactional
public class BdJobsSource implements JobSourceAdapter {
    private static final String SOURCE = "BDJobs";
    private static final Pattern NG_STATE = Pattern.compile(
            "<script[^>]*id=[\\\"']ng-state[\\\"'][^>]*>(.*?)</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final DateTimeFormatter BD_DATE = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);

    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String endpoint;

    public BdJobsSource(JobRepository jobs, CompanyRepository companies, ObjectMapper mapper,
                        @Value("${careerforge.jobs.bdjobs-url:https://jobs.bdjobs.com/jobsearch.asp}") String endpoint) {
        this.jobs = jobs;
        this.companies = companies;
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
        this.endpoint = endpoint;
    }

    @Override public String sourceKey() { return "bdjobs"; }
    @Override public String displayName() { return SOURCE; }

    @Override
    public int importJobs() {
        try {
            JsonNode listings = fetchListings();
            int imported = 0;
            for (JsonNode listing : listings) if (save(listing)) imported++;
            return imported;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not import jobs from BDJobs. The public listing format may be unavailable right now.");
        }
    }

    private JsonNode fetchListings() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                .header("Accept", "text/html,application/xhtml+xml")
                .header("User-Agent", "CareerForge-AOOP-Project/1.0")
                .GET().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "BDJobs could not be reached right now.");
        }
        Matcher matcher = NG_STATE.matcher(response.body());
        if (!matcher.find()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "BDJobs returned an unexpected page.");
        JsonNode listings = findJobArray(mapper.readTree(matcher.group(1)));
        if (listings == null || !listings.isArray()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "BDJobs returned no readable job listings.");
        }
        return listings;
    }

    private JsonNode findJobArray(JsonNode node) {
        if (node == null) return null;
        if (node.isArray() && node.size() > 0 && node.get(0).has("Jobid")) return node;
        if (node.isObject()) {
            for (JsonNode child : node) {
                JsonNode result = findJobArray(child);
                if (result != null) return result;
            }
        } else if (node.isArray()) {
            for (JsonNode child : node) {
                JsonNode result = findJobArray(child);
                if (result != null) return result;
            }
        }
        return null;
    }

    private boolean save(JsonNode listing) {
        String externalId = text(listing, "Jobid");
        String title = firstText(listing, "jobTitle", "JobTitleBng");
        String companyName = text(listing, "companyName");
        LocalDate deadline = deadline(listing);
        if (externalId.isBlank() || title.isBlank() || companyName.isBlank() || deadline == null || deadline.isBefore(LocalDate.now())) return false;

        Job job = jobs.findBySourceAndExternalId(SOURCE, externalId).orElse(null);
        boolean isNew = job == null;
        if (isNew) job = new Job(company(companyName), null);
        String description = description(listing);
        String existingStatus = job.getStatus();
        String status = "published".equalsIgnoreCase(existingStatus) ? "published" : "draft";
        job.update(title, nullable(text(listing, "location")), employmentType(text(listing, "JobType")),
                workMode(text(listing, "WorkPlace")), nullable(text(listing, "Salary")), description, deadline, status);
        job.markImported(SOURCE, externalId, "https://jobs.bdjobs.com/jobdetails.asp?id=" + externalId);
        jobs.save(job);
        return isNew;
    }

    private Company company(String name) {
        return companies.findByNameIgnoreCase(name).orElseGet(() -> companies.save(new Company(name, null, null)));
    }

    private LocalDate deadline(JsonNode listing) {
        String iso = text(listing, "deadlineDB");
        if (iso.length() >= 10) {
            try { return LocalDate.parse(iso.substring(0, 10)); } catch (DateTimeParseException ignored) { }
        }
        String readable = text(listing, "deadline");
        if (readable.isBlank()) return null;
        try { return LocalDate.parse(readable, BD_DATE); } catch (DateTimeParseException ignored) { return null; }
    }

    private String description(JsonNode listing) {
        List<String> parts = new ArrayList<>();
        for (String field : List.of("jobDescription", "eduRec", "jobContext")) {
            String value = stripHtml(text(listing, field));
            if (!value.isBlank() && !parts.contains(value)) parts.add(value);
        }
        return parts.isEmpty() ? "See the original BDJobs listing for full details." : String.join(" ", parts);
    }

    private String employmentType(String value) {
        String normalized = value.toLowerCase(Locale.ROOT);
        if (normalized.contains("intern")) return "internship";
        if (normalized.contains("part")) return "part_time";
        if (normalized.contains("contract")) return "contract";
        return "full_time";
    }

    private String workMode(String value) {
        String normalized = value.toLowerCase(Locale.ROOT);
        if (normalized.contains("remote") || normalized.contains("home")) return "remote";
        if (normalized.contains("hybrid")) return "hybrid";
        return "onsite";
    }

    private String firstText(JsonNode node, String... fields) {
        for (String field : fields) { String value = text(node, field); if (!value.isBlank()) return value; }
        return "";
    }
    private String text(JsonNode node, String field) { return node.path(field).asText("").replaceAll("\\s+", " ").trim(); }
    private String nullable(String value) { return value.isBlank() ? null : value; }
    private String stripHtml(String value) { return value.replaceAll("(?is)<[^>]*>", " ").replace("&nbsp;", " ").replace("&amp;", "&").replaceAll("\\s+", " ").trim(); }
}
