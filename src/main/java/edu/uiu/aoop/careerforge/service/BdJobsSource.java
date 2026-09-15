package edu.uiu.aoop.careerforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uiu.aoop.careerforge.model.Company;
import edu.uiu.aoop.careerforge.model.Job;
import edu.uiu.aoop.careerforge.repository.CompanyRepository;
import edu.uiu.aoop.careerforge.repository.JobRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Reads the public BDJobs listing payload and stores validated listings as admin drafts. */
@Service
@Transactional
public class BdJobsSource implements JobSourceAdapter {
    private static final Logger log = LoggerFactory.getLogger(BdJobsSource.class);
    private static final String SOURCE = "BDJobs";
    private static final Pattern NG_STATE = Pattern.compile(
            "<script[^>]*id=[\\\"']ng-state[\\\"'][^>]*>(.*?)</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final DateTimeFormatter BD_DATE = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);

    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final ObjectMapper mapper;
    private final HttpClient client;
    private final String endpoint;
    private final String apiEndpoint;
    private final JobNlpService nlp;
    private final EmbeddingService embeddings;

    public BdJobsSource(JobRepository jobs, CompanyRepository companies, ObjectMapper mapper,
                        @Value("${careerforge.jobs.bdjobs-url:https://jobs.bdjobs.com/jobsearch.asp}") String endpoint,
                        @Value("${careerforge.jobs.bdjobs-api-url:https://api.bdjobs.com/Jobs/api/JobSearch/GetJobSearch}") String apiEndpoint,
                        JobNlpService nlp, EmbeddingService embeddings) {
        this.jobs = jobs;
        this.companies = companies;
        this.mapper = mapper;
        this.client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
        this.endpoint = endpoint;
        this.apiEndpoint = apiEndpoint;
        this.nlp = nlp;
        this.embeddings = embeddings;
    }

    @Override public String sourceKey() { return "bdjobs"; }
    @Override public String displayName() { return SOURCE; }

    @Override
    public synchronized int importJobs() {
        try {
            List<JsonNode> listings = fetchListings();
            int imported = 0;
            for (JsonNode listing : listings) if (save(listing)) imported++;
            return imported;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("BDJobs import failed", exception);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not import jobs from BDJobs. The public listing format may be unavailable right now.");
        }
    }

    private List<JsonNode> fetchListings() throws Exception {
        try {
            return fetchApiListings();
        } catch (Exception apiException) {
            return fetchHtmlListings();
        }
    }

    /** The public API exposes all result pages and includes premium listings separately. */
    private List<JsonNode> fetchApiListings() throws Exception {
        Map<String, JsonNode> unique = new LinkedHashMap<>();
        JsonNode first = fetchApiPage(1);
        int totalPages = Math.max(1, first.path("common").path("totalpages").asInt(1));
        addListings(unique, first.path("data"));
        addListings(unique, first.path("premiumData"));
        for (int page = 2; page <= totalPages; page++) {
            JsonNode result = fetchApiPage(page);
            addListings(unique, result.path("data"));
            addListings(unique, result.path("premiumData"));
        }
        if (unique.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "BDJobs returned no readable job listings.");
        return new ArrayList<>(unique.values());
    }

    private JsonNode fetchApiPage(int page) throws Exception {
        String query = "Icat=&industry=&category=&org=&jobNature=&Fcat=&location=&Qot=&jobType=&jobLevel=&postedWithin=&deadline="
                + "&keyword=&pg=" + page + "&qAge=&Salary=&experience=&gender=&MExp=&genderB=&MPostings=&MCat=&version="
                + "&rpp=5000&Newspaper=&armyp=&QDisablePerson=&pwd=&workplace=&facilitiesForPWD=&SaveFilterList="
                + "&UserFilterName=&HUserFilterName=&earlyJobAccess=&isPro=0&ToggleJobs=true&isFresher=false";
        HttpRequest request = HttpRequest.newBuilder(URI.create(apiEndpoint + (apiEndpoint.contains("?") ? "&" : "?") + query))
                .header("Accept", "application/json")
                .header("User-Agent", "CareerForge-AOOP-Project/1.0")
                .GET().build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) throw new IllegalStateException("BDJobs API unavailable");
        JsonNode root = mapper.readTree(response.body());
        if (!root.path("data").isArray() && !root.path("premiumData").isArray()) throw new IllegalStateException("BDJobs API returned an unexpected payload");
        return root;
    }

    private void addListings(Map<String, JsonNode> unique, JsonNode listings) {
        if (!listings.isArray()) return;
        for (JsonNode listing : listings) {
            String id = text(listing, "Jobid");
            if (!id.isBlank()) unique.putIfAbsent(id, listing);
        }
    }

    /** Fallback for a custom/legacy endpoint that still embeds listings in ng-state. */
    private List<JsonNode> fetchHtmlListings() throws Exception {
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
        List<JsonNode> result = new ArrayList<>();
        listings.forEach(result::add);
        return result;
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
        boolean needsReview = needsReview(listing, title, companyName, description);
        // Active, complete listings are safe to publish automatically. Keep an admin-closed job closed.
        String status = "closed".equalsIgnoreCase(existingStatus) ? "closed" : needsReview ? "draft" : "published";
        job.update(title, nullable(text(listing, "location")), employmentType(text(listing, "JobType")),
                workMode(text(listing, "WorkPlace")), nullable(text(listing, "Salary")), description, deadline, status);
        int[] experience = experienceRange(text(listing, "experience"));
        job.setExperienceRange(experience[0] < 0 ? null : experience[0], experience[1] < 0 ? null : experience[1]);
        job.markVerified(publishedAt(listing), needsReview ? "needs_review" : "valid");
        job.markImported(SOURCE, externalId, "https://jobs.bdjobs.com/jobdetails.asp?id=" + externalId);
        nlp.analyze(job);
        Job saved = jobs.save(job);
        if (isNew) embeddings.enqueueJob(saved);
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

    private boolean needsReview(JsonNode listing, String title, String companyName, String description) {
        String location = text(listing, "location");
        // Salary is optional; title, company, description, deadline and location are the minimum quality gate.
        if (title.length() < 4 || companyName.length() < 2 || location.isBlank() || description.length() < 40) return true;
        String lowerCompany = companyName.toLowerCase(Locale.ROOT);
        return lowerCompany.contains("confidential") || lowerCompany.contains("undisclosed") || lowerCompany.equals("n/a");
    }

    private int[] experienceRange(String value) {
        String normalized = value.toLowerCase(Locale.ROOT);
        if (normalized.isBlank() || normalized.equals("na") || normalized.contains("fresh")) return new int[]{0, -1};
        Matcher range = Pattern.compile("(\\d+)\\s*(?:to|-|–)\\s*(\\d+)").matcher(normalized);
        if (range.find()) return new int[]{Integer.parseInt(range.group(1)), Integer.parseInt(range.group(2))};
        Matcher atLeast = Pattern.compile("(?:at least|minimum|over)\\s*(\\d+)").matcher(normalized);
        if (atLeast.find()) return new int[]{Integer.parseInt(atLeast.group(1)), -1};
        Matcher one = Pattern.compile("(\\d+)").matcher(normalized);
        return one.find() ? new int[]{Integer.parseInt(one.group(1)), -1} : new int[]{0, -1};
    }

    private LocalDateTime publishedAt(JsonNode listing) {
        String value = text(listing, "publishDate");
        if (value.isBlank()) return null;
        try { return OffsetDateTime.parse(value).toLocalDateTime(); }
        catch (DateTimeParseException ignored) { return null; }
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
