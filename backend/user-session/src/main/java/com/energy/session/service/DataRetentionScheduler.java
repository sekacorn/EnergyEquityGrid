package com.energy.session.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * GDPR Article 5(1)(e) — Storage limitation.
 * Runs daily to purge expired sessions and execute pending deletion requests.
 */
@Component
public class DataRetentionScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DataRetentionScheduler.class);

    @Autowired
    private AuthenticationService authenticationService;

    // Run every day at 02:00 UTC
    @Scheduled(cron = "0 0 2 * * *")
    public void runRetentionCleanup() {
        logger.info("Starting GDPR data retention cleanup");
        try {
            Map<String, Object> result = authenticationService.runRetentionCleanup();
            logger.info("Retention cleanup complete: {}", result);
        } catch (Exception e) {
            logger.error("Retention cleanup failed: {}", e.getMessage());
        }
    }
}
