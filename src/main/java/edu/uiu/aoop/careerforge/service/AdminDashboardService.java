package edu.uiu.aoop.careerforge.service;

import edu.uiu.aoop.careerforge.dto.AdminContentRequest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminDashboardService {
    private final JdbcTemplate jdbc;
    private final AccessService access;

    public AdminDashboardService(JdbcTemplate jdbc, AccessService access) {
        this.jdbc = jdbc;
        this.access = access;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> overview(Long adminId) {
        access.requireAdmin(adminId);
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("students", count("select count(*) from users where role = 'student'"));
        counts.put("publishedJobs", count("select count(*) from jobs where status = 'published'"));
        counts.put("applications", count("select count(*) from applications"));
        counts.put("assessmentAttempts", count("select count(*) from assessment_attempts"));
        counts.put("resources", count("select count(*) from learning_resources where status = 'published'"));
        counts.put("events", count("select count(*) from events where status = 'published'"));
        return counts;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> students(Long adminId) {
        access.requireAdmin(adminId);
        return jdbc.queryForList("""
                select u.id, u.name, u.email, u.status, u.created_at as createdAt,
                       p.university, p.degree, p.target_role as targetRole, p.location
                from users u left join student_profiles p on p.user_id = u.id
                where u.role = 'student' order by u.created_at desc
                """);
    }

    public void updateStudentStatus(Long adminId, Long studentId, String status) {
        access.requireAdmin(adminId);
        int changed = jdbc.update("update users set status = ? where id = ? and role = 'student'", status, studentId);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student account not found.");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> applications(Long adminId) {
        access.requireAdmin(adminId);
        return jdbc.queryForList("""
                select a.id, a.status, a.match_percentage as matchPercentage, a.match_explanation as matchReasons, a.applied_at as appliedAt,
                       u.id as studentId, u.name as studentName, u.email as studentEmail,
                       j.id as jobId, j.title as jobTitle, c.name as companyName
                from applications a
                join users u on u.id = a.user_id
                join jobs j on j.id = a.job_id
                join companies c on c.id = j.company_id
                order by a.applied_at desc
                """);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> content(Long adminId, String kind) {
        access.requireAdmin(adminId);
        return jdbc.queryForList(selectSql(kind));
    }

    public Map<String, Object> createContent(Long adminId, String kind, AdminContentRequest request) {
        access.requireAdmin(adminId);
        validate(kind, request);
        long id;
        if ("assessments".equals(kind)) {
            jdbc.update("insert into assessments (created_by,title,description,category,difficulty,duration_minutes,passing_percentage,status) values (?,?,?,?,?,?,?,?)",
                    adminId, request.title(), nullable(request.description()), request.category(), request.difficulty(), valueOr(request.durationMinutes(), 15), valueOr(request.passingPercentage(), 60.0), request.status());
            id = lastId();
        } else if ("resources".equals(kind)) {
            jdbc.update("insert into learning_resources (created_by,title,description,category,resource_type,resource_url,estimated_minutes,status) values (?,?,?,?,?,?,?,?)",
                    adminId, request.title(), nullable(request.description()), request.category(), request.type(), request.resourceUrl(), request.estimatedMinutes(), request.status());
            id = lastId();
        } else if ("events".equals(kind)) {
            jdbc.update("insert into events (created_by,title,description,category,location,event_url,starts_at,ends_at,capacity,status) values (?,?,?,?,?,?,?,?,?,?)",
                    adminId, request.title(), nullable(request.description()), request.category(), nullable(request.location()), nullable(request.eventUrl()), time(request.startsAt()), time(request.endsAt()), request.capacity(), request.status());
            id = lastId();
        } else throw invalidKind();
        return item(adminId, kind, id);
    }

    public Map<String, Object> updateContent(Long adminId, String kind, Long id, AdminContentRequest request) {
        access.requireAdmin(adminId);
        validate(kind, request);
        int updated;
        if ("assessments".equals(kind)) {
            updated = jdbc.update("update assessments set title=?,description=?,category=?,difficulty=?,duration_minutes=?,passing_percentage=?,status=? where id=?",
                    request.title(), nullable(request.description()), request.category(), request.difficulty(), valueOr(request.durationMinutes(), 15), valueOr(request.passingPercentage(), 60.0), request.status(), id);
        } else if ("resources".equals(kind)) {
            updated = jdbc.update("update learning_resources set title=?,description=?,category=?,resource_type=?,resource_url=?,estimated_minutes=?,status=? where id=?",
                    request.title(), nullable(request.description()), request.category(), request.type(), request.resourceUrl(), request.estimatedMinutes(), request.status(), id);
        } else if ("events".equals(kind)) {
            updated = jdbc.update("update events set title=?,description=?,category=?,location=?,event_url=?,starts_at=?,ends_at=?,capacity=?,status=? where id=?",
                    request.title(), nullable(request.description()), request.category(), nullable(request.location()), nullable(request.eventUrl()), time(request.startsAt()), time(request.endsAt()), request.capacity(), request.status(), id);
        } else throw invalidKind();
        if (updated == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found.");
        return item(adminId, kind, id);
    }

    public void deleteContent(Long adminId, String kind, Long id) {
        access.requireAdmin(adminId);
        String table = switch (kind) { case "assessments" -> "assessments"; case "resources" -> "learning_resources"; case "events" -> "events"; default -> throw invalidKind(); };
        if (jdbc.update("delete from " + table + " where id = ?", id) == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found.");
    }

    private Map<String, Object> item(Long adminId, String kind, long id) {
        return content(adminId, kind).stream().filter(row -> ((Number) row.get("id")).longValue() == id).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found."));
    }
    private long lastId() { return jdbc.queryForObject("select last_insert_id()", Long.class); }
    private long count(String sql) { Long value = jdbc.queryForObject(sql, Long.class); return value == null ? 0 : value; }
    private String selectSql(String kind) {
        return switch (kind) {
            case "assessments" -> "select id,title,description,category,difficulty,duration_minutes as durationMinutes,passing_percentage as passingPercentage,status,created_at as createdAt from assessments order by created_at desc";
            case "resources" -> "select id,title,description,category,resource_type as type,resource_url as resourceUrl,estimated_minutes as estimatedMinutes,status,created_at as createdAt from learning_resources order by created_at desc";
            case "events" -> "select id,title,description,category,location,event_url as eventUrl,starts_at as startsAt,ends_at as endsAt,capacity,status,created_at as createdAt from events order by starts_at desc";
            default -> throw invalidKind();
        };
    }
    private void validate(String kind, AdminContentRequest r) {
        if (blank(r.title()) || blank(r.category()) || blank(r.status())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, category, and status are required.");
        if ("assessments".equals(kind) && blank(r.difficulty())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assessment difficulty is required.");
        if ("resources".equals(kind) && (blank(r.type()) || blank(r.resourceUrl()))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource type and URL are required.");
        if ("events".equals(kind) && (blank(r.startsAt()) || blank(r.endsAt()))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event start and end times are required.");
    }
    private Object nullable(String value) { return blank(value) ? null : value.trim(); }
    private boolean blank(String value) { return value == null || value.isBlank(); }
    private int valueOr(Integer value, int defaultValue) { return value == null ? defaultValue : value; }
    private double valueOr(Double value, double defaultValue) { return value == null ? defaultValue : value; }
    private Timestamp time(String value) { try { return Timestamp.valueOf(LocalDateTime.parse(value)); } catch (Exception ignored) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a valid date and time."); } }
    private ResponseStatusException invalidKind() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown content type."); }
}
