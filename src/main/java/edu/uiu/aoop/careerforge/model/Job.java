package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "company_id", nullable = false)
    private Company company;
    @Column(name = "created_by") private Long createdBy;
    private String title;
    private String location;
    @Column(name = "employment_type") private String employmentType;
    @Column(name = "work_mode") private String workMode;
    @Column(name = "salary_text") private String salaryText;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "expiry_date") private LocalDate expiryDate;
    private String status;
    @Column(name = "created_at", insertable = false, updatable = false) private LocalDateTime createdAt;

    protected Job() { }
    public Job(Company company, Long createdBy) { this.company = company; this.createdBy = createdBy; }
    public Long getId() { return id; }
    public Company getCompany() { return company; }
    public Long getCreatedBy() { return createdBy; }
    public String getTitle() { return title; }
    public String getLocation() { return location; }
    public String getEmploymentType() { return employmentType; }
    public String getWorkMode() { return workMode; }
    public String getSalaryText() { return salaryText; }
    public String getDescription() { return description; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void update(String title, String location, String employmentType, String workMode, String salaryText, String description, LocalDate expiryDate, String status) {
        this.title = title; this.location = location; this.employmentType = employmentType; this.workMode = workMode;
        this.salaryText = salaryText; this.description = description; this.expiryDate = expiryDate; this.status = status;
    }
}
