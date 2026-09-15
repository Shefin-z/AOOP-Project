package edu.uiu.aoop.careerforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CareerForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerForgeApplication.class, args);
    }
}
