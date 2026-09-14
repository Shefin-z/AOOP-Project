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
public class RemotiveJobImportProvider implements JobSourceAdapter {
    private static final String SOURCE = "Remotive";
    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String remotiveEndpoint;
    private final String rapidApiKey;
    private final String rapidApiHost;
    private final String jsearchEndpoint;

    public RemotiveJobImportProvider(JobRepository jobs, CompanyRepository companies, ObjectMapper mapper,
                                    @Value("${careerforge.jobs.remotive-url:https://remotive.com/api/remote-jobs?limit=20}") String remotiveEndpoint,
                                    @Value("${careerforge.jobs.rapidapi-key:}") String rapidApiKey,
                                    @Value("${careerforge.jobs.rapidapi-host:jsearch.p.rapidapi.com}") String rapidApiHost,
                                    @Value("${careerforge.jobs.jsearch-url:https://jsearch.p.rapidapi.com/search-v2?query=software%20engineer%20intern&page=1&num_pages=1&date_posted=week}") String jsearchEndpoint) {
        this.jobs = jobs; this.companies = companies; this.mapper = mapper;
        this.client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
        this.remotiveEndpoint = remotiveEndpoint; this.rapidApiKey = rapidApiKey == null ? "" : rapidApiKey.trim();
        this.rapidApiHost = rapidApiHost; this.jsearchEndpoint = jsearchEndpoint;
    }

    @Override
    public int importJobs() {
        return rapidApiKey.isBlank() ? importRemotive() : importJsearch();
    }

    @Override public String sourceKey() { return "remotive"; }
    @Override public String displayName() { return rapidApiKey.isBlank() ? "Remotive" : "JSearch"; }

    private int importRemotive() {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(remotiveEndpoint))
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
            for (JsonNode listing : listings) if (saveRemotive(listing)) imported++;
            return imported;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not import jobs from Remotive. Please try again later.");
        }
    }

    private int importJsearch() {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(jsearchEndpoint))
                    .header("Accept", "application/json").header("X-RapidAPI-Key", rapidApiKey)
                    .header("X-RapidAPI-Host", rapidApiHost).GET().build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 401 || response.statusCode() == 403) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "JSearch rejected the RapidAPI key. Check RAPIDAPI_KEY and your JSearch subscription.");
            if (response.statusCode() < 200 || response.statusCode() >= 300) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "JSearch could not be reached right now.");
            JsonNode listings = mapper.readTree(response.body()).path("data");
            if (listings.isObject()) listings = listings.path("jobs");
            if (!listings.isArray()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "JSearch returned an unexpected response.");
            int imported = 0;
            for (JsonNode listing : listings) if (saveJsearch(listing)) imported++;
            return imported;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not import jobs from JSearch. Please try again later.");
        }
    }

    private boolean saveRemotive(JsonNode listing) {
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

    private boolean saveJsearch(JsonNode listing) {
        String externalId = listing.path("job_id").asText("").trim();
        String title = listing.path("job_title").asText("").trim();
        String companyName = listing.path("employer_name").asText("").trim();
        if (externalId.isBlank() || title.isBlank() || companyName.isBlank()) return false;
        Job job = jobs.findBySourceAndExternalId("JSearch", externalId).orElse(null);
        boolean isNew = job == null;
        if (isNew) job = new Job(company(companyName, clean(listing.path("employer_website").asText())), null);
        String location = String.join(", ", java.util.stream.Stream.of(clean(listing.path("job_city").asText()), clean(listing.path("job_state").asText()), clean(listing.path("job_country").asText())).filter(java.util.Objects::nonNull).toList());
        String description = text(listing.path("job_description").asText());
        job.update(title, location.isBlank() ? null : location, employmentType(listing.path("job_employment_type").asText()), listing.path("job_is_remote").asBoolean(false) ? "remote" : "onsite", salary(listing), description == null ? "See the original job listing for full details." : description, LocalDate.now().plusDays(30), "published");
        job.markImported("JSearch", externalId, clean(listing.path("job_apply_link").asText()));
        jobs.save(job);
        return isNew;
    }

    private Company company(String name) { return company(name, null); }
    private Company company(String name, String website) {
        Company company = companies.findByNameIgnoreCase(name).orElseGet(() -> new Company(name, website, null));
        return companies.save(company);
    }
    private String salary(JsonNode listing) {
        String currency = clean(listing.path("job_salary_currency").asText());
        String minimum = clean(listing.path("job_min_salary").asText()); String maximum = clean(listing.path("job_max_salary").asText());
        if (minimum == null && maximum == null) return null;
        return (currency == null ? "" : currency + " ") + (minimum == null ? "" : minimum) + (maximum == null ? "" : " - " + maximum);
    }

    private String employmentType(String value) {
        return switch (value == null ? "" : value.toLowerCase(Locale.ROOT)) {
            case "internship" -> "internship";
            case "part_time", "parttime" -> "part_time";
            case "full_time", "fulltime" -> "full_time";
            default -> "contract";
        };
    }

    private String text(String value) {
        return clean(value == null ? "" : value.replaceAll("(?is)<[^>]*>", " ").replace("&nbsp;", " ").replace("&amp;", "&").replaceAll("\\s+", " "));
    }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
