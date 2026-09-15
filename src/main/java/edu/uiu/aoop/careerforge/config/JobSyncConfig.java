package edu.uiu.aoop.careerforge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class JobSyncConfig {
    @Bean(name = "jobSyncExecutor", destroyMethod = "shutdown")
    ExecutorService jobSyncExecutor() {
        AtomicInteger number = new AtomicInteger();
        ThreadFactory factory = task -> {
            Thread thread = new Thread(task, "job-sync-worker-" + number.incrementAndGet());
            thread.setDaemon(true);
            return thread;
        };
        return Executors.newFixedThreadPool(4, factory);
    }

    @Bean(name = "embeddingExecutor", destroyMethod = "shutdown")
    ExecutorService embeddingExecutor() {
        AtomicInteger number = new AtomicInteger();
        ThreadFactory factory = task -> {
            Thread thread = new Thread(task, "embedding-worker-" + number.incrementAndGet());
            thread.setDaemon(true);
            return thread;
        };
        return Executors.newFixedThreadPool(2, factory);
    }
}
