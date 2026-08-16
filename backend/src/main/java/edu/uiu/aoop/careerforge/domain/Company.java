package edu.uiu.aoop.careerforge.domain;
import jakarta.persistence.*;
@Entity @Table(name = "companies") public class Company {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; private String website;
 protected Company(){} public Company(String name){this.name=name;} public Long getId(){return id;} public String getName(){return name;} public void update(String name,String website){this.name=name;this.website=website;}
}
