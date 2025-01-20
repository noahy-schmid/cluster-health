package com.ptvgroup;

import java.time.LocalDateTime;
import java.util.Map;

public class HealthStatus {

    private final String serviceName;
    private final boolean isHealthy;
    private final boolean isReady;
    private final LocalDateTime lastChecked;

    public HealthStatus(String serviceName, boolean isHealthy, boolean isReady, LocalDateTime lastChecked) {
        this.serviceName = serviceName;
        this.isHealthy = isHealthy;
        this.isReady = isReady;
        this.lastChecked = lastChecked;
    }

    public String getServiceName() {
        return serviceName;
    }

    public boolean isHealthy() {
        return isHealthy;
    }

    public boolean isReady() {
        return isReady;
    }

    public LocalDateTime getLastChecked() {
        return lastChecked;
    }

    public Map<String, Object> toMap() {
        return Map.of(
                "name", serviceName,
                "healthy", isHealthy,
                "ready", isReady,
                "timestamp", lastChecked
        );
    }

}
