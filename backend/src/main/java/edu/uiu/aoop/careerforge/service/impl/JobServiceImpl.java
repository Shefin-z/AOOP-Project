package edu.uiu.aoop.careerforge.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.uiu.aoop.careerforge.model.*;
import edu.uiu.aoop.careerforge.event.CareerMilestoneEvent;
import edu.uiu.aoop.careerforge.service.JobMatchingStrategy;
import edu.uiu.aoop.careerforge.service.JobService;
import edu.uiu.aoop.careerforge.repository.*;
import edu.uiu.aoop.careerforge.exception.ApiException;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JobServiceImpl implements JobService {
  private final JobRepository jobs; private final UserRepository users; private final JobApplicationRepository applications;
  private final JobMatchingStrategy matcher; private final JdbcTemplate jdbc; private final ApplicationEventPublisher events; private final ObjectMapper json;
  public JobServiceImpl(JobRepository jobs, UserRepository users, JobApplicationRepository applications, JobMatchingStrategy matcher, JdbcTemplate jdbc, ApplicationEventPublisher events, ObjectMapper json) { this.jobs=jobs; this.users=users; this.applications=applications; this.matcher=matcher; this.jdbc=jdbc; this.events=events; this.json=json; }

  @Override @Transactional(readOnly=true)
  public List<Map<String,Object>> recommendations(Long userId) {
    User user=users.findById(userId).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"Session user no longer exists"));
    List<String> skills=jdbc.query("SELECT s.name FROM user_skills us JOIN skills s ON s.id=us.skill_id WHERE us.user_id=?",(rs,n)->rs.getString(1),userId);
    return jobs.findByStatusOrderByCreatedAtDesc(JobStatus.live).stream().filter(Job::visibleNow).map(job->{var match=matcher.score(user.getProfile(),job,skills);return jobDto(job,match.percentage(),match.reasons());}).toList();
  }

  @Override @Transactional
  public Map<String,Object> apply(Long userId, Long jobId, Map<String,Object> body) {
    User user=users.findById(userId).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"Session user no longer exists"));
    Job job=jobs.findById(jobId).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Job not found"));
    if(user.getRole()!=Role.student) throw new ApiException(HttpStatus.FORBIDDEN,"Only students can apply for jobs");
    if(!job.visibleNow()) throw new ApiException(HttpStatus.CONFLICT,"This job is no longer accepting applications");
    if(!"careerforge".equalsIgnoreCase(job.getApplicationMode())) throw new ApiException(HttpStatus.CONFLICT,"This opportunity uses an external application link");
    if(applications.findByStudentIdAndJobId(userId,jobId).isPresent()) throw new ApiException(HttpStatus.CONFLICT,"You already applied to this job");
    var match=matcher.score(user.getProfile(),job,List.of());
    String cover=body.get("coverLetter")==null?null:String.valueOf(body.get("coverLetter"));
    String snapshot=json(body.get("resumeSnapshot"));
    Map<?,?> file=body.get("resumeFile") instanceof Map<?,?> value ? value : Map.of();
    String fileName=text(file.get("name"),255); String fileType=text(file.get("type"),100); String fileData=text(file.get("data"),1_750_000);
    JobApplication application=applications.save(new JobApplication(user,job,(double)match.percentage(),cover,snapshot,fileName,fileType,fileData));
    events.publishEvent(new CareerMilestoneEvent(userId,CareerMilestoneEvent.Type.APPLICATION_SUBMITTED));
    return Map.of("id",application.getId(),"message","Application submitted","status",application.getStatus().name());
  }

  @Override @Transactional
  public Map<String,Object> withdraw(Long userId, Long applicationId) {
    JobApplication application=applications.findById(applicationId).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Application not found"));
    if(!application.getStudent().getId().equals(userId)) throw new ApiException(HttpStatus.FORBIDDEN,"You can only cancel your own application");
    application.transitionTo(ApplicationStatus.withdrawn);
    return Map.of("message","Application cancelled","status","withdrawn");
  }

  @Override @Transactional(readOnly=true)
  public List<Map<String,Object>> myApplications(Long userId) {
    return applications.findByStudentIdOrderByAppliedAtDesc(userId).stream().map(a->{Map<String,Object> r=new LinkedHashMap<>();r.put("id",a.getId());r.put("job_id",a.getJob().getId());r.put("status",a.getStatus().name());r.put("match_percentage",a.getMatchPercentage());r.put("applied_at",a.getAppliedAt());r.put("title",a.getJob().getTitle());r.put("company",a.getJob().getCompany().getName());r.put("location",a.getJob().getLocation());return r;}).toList();
  }

  private Map<String,Object> jobDto(Job job,int match,List<String> reasons) {
    Map<String,Object> result=new LinkedHashMap<>();result.put("id",job.getId());result.put("title",job.getTitle());result.put("company",job.getCompany().getName());result.put("company_name",job.getCompany().getName());result.put("description",job.getDescription());result.put("category",job.getCategory());result.put("employment_type",job.getEmploymentType());result.put("location",job.getLocation());result.put("workplace_type",job.getWorkplaceType());result.put("status",job.getStatus().name());result.put("expires_at",job.getExpiresAt());result.put("application_mode",job.getApplicationMode());result.put("external_apply_url",job.getExternalApplyUrl());result.put("matchPercentage",match);result.put("match_percentage",match);result.put("matchReasons",reasons);return result;
  }
  private String json(Object value) { if(value==null) return null; try { return json.writeValueAsString(value); } catch(JsonProcessingException error) { throw new ApiException(HttpStatus.BAD_REQUEST,"Resume snapshot is invalid"); } }
  private static String text(Object value,int maximum) { if(value==null) return null; String result=String.valueOf(value).trim(); return result.isBlank()?null:result.substring(0,Math.min(result.length(),maximum)); }
}
