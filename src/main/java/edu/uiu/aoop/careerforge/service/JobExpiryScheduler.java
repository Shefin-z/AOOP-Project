package edu.uiu.aoop.careerforge.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

/**
 * Closes expired jobs independently of provider imports. A listing remains
 * usable throughout its stated deadline date, then moves to Closed overnight.
 */
@Service
public class JobExpiryScheduler {
    private final JobService jobs;
    private final int expiredRetentionDays;

    public JobExpiryScheduler(JobService jobs, @Value("${careerforge.jobs.expired-retention-days:15}") int expiredRetentionDays) {
        this.jobs = jobs;
        this.expiredRetentionDays = expiredRetentionDays;
    }

    @Scheduled(cron = "${careerforge.jobs.expiry-check-cron:0 5 0 * * *}", zone = "${careerforge.jobs.time-zone:Asia/Dhaka}")
    public void closeJobsPastTheirDeadline() {
        jobs.closeExpiredJobs();
        jobs.purgeExpiredJobsAfter(expiredRetentionDays);
    }
}
