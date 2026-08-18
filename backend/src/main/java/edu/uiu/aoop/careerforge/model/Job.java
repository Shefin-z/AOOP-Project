package edu.uiu.aoop.careerforge.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="jobs") public class Job extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="company_id", nullable=false) private Company company;
 @Column(nullable=false) private String title; @Column(nullable=false, unique=true) private String slug; @Column(nullable=false,columnDefinition="LONGTEXT") private String description;
 private String category; @Column(name="employment_type") private String employmentType; private String location; @Column(name="workplace_type") private String workplaceType;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private JobStatus status=JobStatus.draft; @Column(name="expires_at") private Instant expiresAt;
 @Column(name="application_mode") private String applicationMode="careerforge"; @Column(name="external_apply_url") private String externalApplyUrl;
 protected Job(){} public Long getId(){return id;} public Company getCompany(){return company;} public String getTitle(){return title;} public String getDescription(){return description;} public String getCategory(){return category;} public String getEmploymentType(){return employmentType;} public String getLocation(){return location;} public String getWorkplaceType(){return workplaceType;} public JobStatus getStatus(){return status;} public Instant getExpiresAt(){return expiresAt;} public String getApplicationMode(){return applicationMode;} public String getExternalApplyUrl(){return externalApplyUrl;}
 public boolean visibleNow(){return status==JobStatus.live && (expiresAt==null || expiresAt.isAfter(Instant.now()));}
 public void update(Company company,String title,String slug,String description,String category,String employmentType,String location,String workplaceType,Instant expiresAt,String applicationMode,String externalApplyUrl){this.company=company;this.title=title;this.slug=slug;this.description=description;this.category=category;this.employmentType=employmentType;this.location=location;this.workplaceType=workplaceType;this.expiresAt=expiresAt;this.applicationMode=applicationMode;this.externalApplyUrl=externalApplyUrl;}
 public void setStatus(JobStatus value){status=value;}
}
