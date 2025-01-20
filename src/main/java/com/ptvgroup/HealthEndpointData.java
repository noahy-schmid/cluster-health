package com.ptvgroup;

/**
 * Represents the data to access a health endpoint.
 */
public class HealthEndpointData {

    private final String serviceName;
    private final String livenessProbe;
    private final String readinessProbe;

    public HealthEndpointData(String serviceName, String livenessProbe, String readinessProbe) {
        this.serviceName = serviceName;
        this.livenessProbe = livenessProbe;
        this.readinessProbe = readinessProbe;
    }

    public String getServiceName() {
        return serviceName;
    }

    /**
     * Get the simplified liveness probe which is a url to the liveness endpoint
     * @return the liveness probe
     */
    public String getLivenessProbe() {
        return livenessProbe;
    }

    /**
     * Get the simplified readiness probe which is a url to the readiness endpoint
     * @return the readiness probe
     */
    public String getReadinessProbe() {
        return readinessProbe;
    }
}
