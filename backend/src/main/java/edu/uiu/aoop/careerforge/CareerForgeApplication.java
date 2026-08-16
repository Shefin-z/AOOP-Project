package edu.uiu.aoop.careerforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CareerForgeApplication {
  public static void main(String[] args) {
    SpringApplication.run(CareerForgeApplication.class, args);
  }
}
