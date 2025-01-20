package com.ptvgroup;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Job that collects health status of services.
 * It discovers services and collects health status periodically.
 * The health status is stored in a {@link HealthStatusRepository}.
 */
public class HealthStatusCollectorJob {

    private final HealthEndpointRepository healthEndpointRepository;
    private final HealthStatusCollectorService healthStatusCollector;
    private final HealthStatusRepository healthStatusRepository;

    private final ScheduledExecutorService scheduledExecutorService;

    private final Logger logger;
    private final Meter meter;
    private final LongCounter healthStatusCounter;

    public HealthStatusCollectorJob(HealthEndpointRepository healthEndpointRepository,
                                    HealthStatusCollectorService healthStatusCollector,
                                    HealthStatusRepository healthStatusRepository) {
        this.healthEndpointRepository = healthEndpointRepository;
        this.healthStatusCollector = healthStatusCollector;
        this.healthStatusRepository = healthStatusRepository;

        this.scheduledExecutorService = Executors.newScheduledThreadPool(1);

        this.logger = LoggerFactory.getLogger(HealthStatusCollectorJob.class);
        this.meter = GlobalOpenTelemetry.getMeter("health-status-collector");
        this.healthStatusCounter = meter.counterBuilder("health-status-checks")
                                        .setDescription("Number of health status checks")
                                        .build();
    }

    /**
     * Starts the health status collector job.
     * It will discover services every 60 seconds and collect health status every 15 seconds.
     */
    public void start() {
        logger.info("Starting health status collector job");
        scheduledExecutorService.scheduleAtFixedRate(() -> {
                    try {
                        logger.info("Scheduled discovery of services");
                        healthEndpointRepository.discoverServices();
                    } catch (Exception e) {
                        logger.error("Error discovering services", e);
                    }
                },
                0,
                60,
                TimeUnit.SECONDS);

        scheduledExecutorService.scheduleAtFixedRate(() -> {
            try {
                logger.info("Collecting health status");
                var healthStatus = healthStatusCollector.checkHealthEndpoints(
                        healthEndpointRepository.getHealthEndpoints());
                healthStatusRepository.saveHealthStatuses(healthStatus);
                healthStatusCounter.add(1);
            } catch (Exception e) {
                logger.error("Error collecting health status", e);
            }
        }, 10, 15, TimeUnit.SECONDS);
    }

    /**
     * Stops the health status collector job.
     */
    public void stop() {
        logger.info("Stopping health status collector job");
        scheduledExecutorService.shutdown();
    }


}
