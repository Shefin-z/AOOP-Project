package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "companies")
public class Company {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String website;
    private String location;

    protected Company() { }
    public Company(String name, String website, String location) { this.name = name; this.website = website; this.location = location; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getWebsite() { return website; }
    public String getLocation() { return location; }
    public void update(String website, String location) { this.website = website; this.location = location; }
}
