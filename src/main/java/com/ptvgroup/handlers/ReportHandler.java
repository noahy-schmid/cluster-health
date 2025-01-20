package com.ptvgroup.handlers;

import com.ptvgroup.HealthStatus;
import com.ptvgroup.HealthStatusRepository;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import org.jetbrains.annotations.NotNull;

import java.util.Map;

/**
 * Get Request Handler for generating a report of the health statuses.
 */
public class ReportHandler implements Handler {

    private final HealthStatusRepository healthStatusRepository;

    public ReportHandler(HealthStatusRepository healthStatusRepository) {
        this.healthStatusRepository = healthStatusRepository;
    }


    @Override
    public void handle(@NotNull Context context) throws Exception {
        Map<String, Object> report = Map.of(
                "count", healthStatusRepository.statusCount(),
                "fully-functioning", healthStatusRepository.getHealthStatuses().stream()
                        .filter(status -> status.isHealthy() && status.isReady())
                        .count(),
                "only-healthy", healthStatusRepository.getHealthStatuses().stream()
                        .filter(status -> status.isHealthy() && !status.isReady())
                        .count(),
                "only-ready", healthStatusRepository.getHealthStatuses().stream()
                        .filter(status -> !status.isHealthy() && status.isReady())
                        .count(),
                "detailed-statuses", healthStatusRepository.getHealthStatuses().stream()
                        .map(HealthStatus::toMap)
                        .toList()
        );
        context.json(report);
    }
}
