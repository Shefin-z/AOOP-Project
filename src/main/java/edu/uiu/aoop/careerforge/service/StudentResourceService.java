package edu.uiu.aoop.careerforge.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.Map;

@Service
public class StudentResourceService {
    private final JdbcTemplate jdbc;
    private final AccessService access;

    public StudentResourceService(JdbcTemplate jdbc, AccessService access) {
        this.jdbc = jdbc;
        this.access = access;
    }

    @PostConstruct
    void addSavedColumnToProgress() {
        Integer count = jdbc.queryForObject("""
                select count(*) from information_schema.columns
                where table_schema = database() and table_name = 'resource_progress' and column_name = 'saved'
                """, Integer.class);
        if (count != null && count == 0) {
            jdbc.execute("alter table resource_progress add column saved boolean not null default false after completed_at");
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> publishedResources(Long studentId) {
        access.requireStudent(studentId);
        return jdbc.queryForList("""
                select r.id, r.title, r.description, r.category, r.resource_type as type,
                       r.resource_url as resourceUrl, r.thumbnail_url as thumbnailUrl,
                       coalesce(nullif(r.provider_name, ''), case when r.resource_url like '%youtube.com%' or r.resource_url like '%youtu.be%' then 'YouTube' else 'CareerForge library' end) as providerName,
                       r.featured, r.recommendation_note as recommendationNote, r.estimated_minutes as estimatedMinutes,
                       r.created_at as createdAt, coalesce(p.saved, false) as saved,
                       case when p.completed_at is not null or coalesce(p.progress_percentage, 0) >= 100 then true else false end as completed
                from learning_resources r
                left join resource_progress p on p.resource_id = r.id and p.user_id = ?
                where r.status = 'published'
                order by r.featured desc, r.created_at desc
                """, studentId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> featuredSuggestions(Long studentId, String skill) {
        access.requireStudent(studentId);
        String term = "%" + skill.trim().toLowerCase() + "%";
        return jdbc.queryForList("""
                select r.id, r.title, r.description, r.category, r.resource_type as type, r.resource_url as resourceUrl,
                       r.thumbnail_url as thumbnailUrl, r.provider_name as providerName, r.featured, r.recommendation_note as recommendationNote,
                       r.estimated_minutes as estimatedMinutes, coalesce(p.saved, false) as saved,
                       case when p.completed_at is not null or coalesce(p.progress_percentage, 0) >= 100 then true else false end as completed
                from learning_resources r left join resource_progress p on p.resource_id=r.id and p.user_id=?
                where r.status='published' and r.featured=true and (lower(r.title) like ? or lower(r.category) like ? or lower(coalesce(r.description,'')) like ?)
                order by r.created_at desc
                """, studentId, term, term, term);
    }

    @Transactional
    public Map<String, Boolean> toggleSaved(Long studentId, Long resourceId) {
        validatePublishedResource(studentId, resourceId);
        Map<String, Boolean> current = progress(studentId, resourceId);
        jdbc.update("""
                insert into resource_progress (user_id, resource_id, saved) values (?, ?, ?)
                on duplicate key update saved = values(saved), updated_at = current_timestamp
                """, studentId, resourceId, !current.get("saved"));
        return cleanupIfEmpty(studentId, resourceId);
    }

    @Transactional
    public Map<String, Boolean> toggleCompleted(Long studentId, Long resourceId) {
        validatePublishedResource(studentId, resourceId);
        Map<String, Boolean> current = progress(studentId, resourceId);
        if (current.get("completed")) {
            jdbc.update("""
                    insert into resource_progress (user_id, resource_id, progress_percentage, completed_at) values (?, ?, 0, null)
                    on duplicate key update progress_percentage = 0, completed_at = null, updated_at = current_timestamp
                    """, studentId, resourceId);
        } else {
            jdbc.update("""
                    insert into resource_progress (user_id, resource_id, progress_percentage, completed_at) values (?, ?, 100, current_timestamp)
                    on duplicate key update progress_percentage = 100, completed_at = current_timestamp, updated_at = current_timestamp
                    """, studentId, resourceId);
        }
        return cleanupIfEmpty(studentId, resourceId);
    }

    private void validatePublishedResource(Long studentId, Long resourceId) {
        access.requireStudent(studentId);
        Long count = jdbc.queryForObject("select count(*) from learning_resources where id = ? and status = 'published'", Long.class, resourceId);
        if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Published resource not found.");
    }

    private Map<String, Boolean> progress(Long studentId, Long resourceId) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                select saved, case when completed_at is not null or progress_percentage >= 100 then true else false end as completed
                from resource_progress where user_id = ? and resource_id = ?
                """, studentId, resourceId);
        if (rows.isEmpty()) return Map.of("saved", false, "completed", false);
        Map<String, Object> row = rows.get(0);
        return Map.of("saved", bool(row.get("saved")), "completed", bool(row.get("completed")));
    }

    private Map<String, Boolean> cleanupIfEmpty(Long studentId, Long resourceId) {
        Map<String, Boolean> updated = progress(studentId, resourceId);
        if (!updated.get("saved") && !updated.get("completed")) {
            jdbc.update("delete from resource_progress where user_id = ? and resource_id = ?", studentId, resourceId);
        }
        return updated;
    }

    private boolean bool(Object value) { return value instanceof Boolean flag ? flag : value instanceof Number number && number.intValue() != 0; }
}
