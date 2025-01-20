package com.ptvgroup;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.LongHistogram;
import io.opentelemetry.api.metrics.Meter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class HealthStatusRepository {

    private final Logger logger;
    private final Meter meter;
    private final LongHistogram statusHistogram;

    private final List<HealthStatus> healthStatuses;

    public HealthStatusRepository() {
        this.logger = LoggerFactory.getLogger(HealthStatusRepository.class);
        this.healthStatuses = new ArrayList<>();
        this.meter = GlobalOpenTelemetry.getMeter("health-repository");
        this.statusHistogram = meter.histogramBuilder("health-statuses").ofLongs().build();
    }


    /**
     * Saves the health statuses.
     * The saved statuses will replace the old statuses, but not updated statuses will be kept.
     *
     * @param healthStatuses the health statuses to save
     */
    public void saveHealthStatuses(List<HealthStatus> healthStatuses) {
        logger.info("Saving health statuses");
        var updatedStatusNames = healthStatuses.stream()
                                               .map(HealthStatus::getServiceName)
                                               .toList();

        var statusesToKeep = this.healthStatuses.stream()
                                                .filter(status -> !updatedStatusNames.contains(
                                                        status.getServiceName())).toList();
        if (!statusesToKeep.isEmpty()) {
            logger.info("{} service statuses did not update", statusesToKeep.size());
        }
        this.healthStatuses.clear();
        this.healthStatuses.addAll(statusesToKeep);
        this.healthStatuses.addAll(healthStatuses);
        statusHistogram.record(healthStatuses.size());
        logger.info("Health statuses saved: {}", healthStatuses.size());
    }

    public int statusCount() {
        return healthStatuses.size();
    }

    public List<HealthStatus> getHealthStatuses() {
        return List.copyOf(healthStatuses);
    }


}
