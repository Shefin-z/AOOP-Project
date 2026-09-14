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
import java.util.Locale;

/** Imports a small, rate-friendly batch of active remote jobs from Remotive. */
@Service
@Transactional
public class RemotiveJobImportProvider implements JobImportProvider {
    private static final String SOURCE = "Remotive";
    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String endpoint;

    public RemotiveJobImportProvider(JobRepository jobs, CompanyRepository companies, ObjectMapper mapper,
                                    @Value("${careerforge.jobs.remotive-url:https://remotive.com/api/remote-jobs?limit=20}") String endpoint) {
        this.jobs = jobs; this.companies = companies; this.mapper = mapper;
        this.client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
        this.endpoint = endpoint;
    }

    @Override
    public int importJobs() {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                    .header("Accept", "application/json")
                    .header("User-Agent", "CareerForge-AOOP-Project/1.0")
                    .GET().build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The job provider could not be reached right now.");
            }
            JsonNode listings = mapper.readTree(response.body()).path("jobs");
            if (!listings.isArray()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The job provider returned an unexpected response.");
            int imported = 0;
            for (JsonNode listing : listings) if (save(listing)) imported++;
            return imported;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not import jobs from Remotive. Please try again later.");
        }
    }

    private boolean save(JsonNode listing) {
        String externalId = listing.path("id").asText("").trim();
        String title = listing.path("title").asText("").trim();
        String companyName = listing.path("company_name").asText("").trim();
        if (externalId.isBlank() || title.isBlank() || companyName.isBlank()) return false;
        Job job = jobs.findBySourceAndExternalId(SOURCE, externalId).orElse(null);
        boolean isNew = job == null;
        if (isNew) job = new Job(company(companyName), null);
        String location = clean(listing.path("candidate_required_location").asText());
        String description = text(listing.path("description").asText());
        job.update(title, location, employmentType(listing.path("job_type").asText()), "remote", clean(listing.path("salary").asText()), description.isBlank() ? "See the original job listing for full details." : description, LocalDate.now().plusDays(30), "published");
        job.markImported(SOURCE, externalId, clean(listing.path("url").asText()));
        jobs.save(job);
        return isNew;
    }

    private Company company(String name) {
        Company company = companies.findByNameIgnoreCase(name).orElseGet(() -> new Company(name, null, null));
        return companies.save(company);
    }

    private String employmentType(String value) {
        return switch (value == null ? "" : value.toLowerCase(Locale.ROOT)) {
            case "internship" -> "internship";
            case "part_time" -> "part_time";
            case "full_time" -> "full_time";
            default -> "contract";
        };
    }

    private String text(String value) {
        return clean(value == null ? "" : value.replaceAll("(?is)<[^>]*>", " ").replace("&nbsp;", " ").replace("&amp;", "&").replaceAll("\\s+", " "));
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
