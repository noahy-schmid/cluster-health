package com.ptvgroup;

import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpConnectTimeoutException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

public class HealthStatusCollectorService {

    private final Logger logger;

    public HealthStatusCollectorService() {
        this.logger = LoggerFactory.getLogger(HealthStatusCollectorService.class);
    }

    /**
     * Checks the health of a list of endpoints.
     * Each endpoint is checked for liveness and readiness, and a {@link HealthStatus} object is created for each.
     * The {@link HealthStatus} objects can be matched to the original endpoint data by the service name.
     *
     * @param endpointData the list of endpoints to check
     * @return a list of HealthStatus objects
     */
    public List<HealthStatus> checkHealthEndpoints(@NotNull List<HealthEndpointData> endpointData) {
        logger.info("Checking health endpoints");
        var statuses = endpointData.parallelStream().map(this::checkHealthEndpoint).toList();
        var countFunctioning = statuses.stream()
                                       .filter(status -> status.isHealthy() && status.isReady())
                                       .count();
        logger.info("Health check finished, {} services are fully functioning", countFunctioning);
        return statuses;
    }

    @NotNull
    private HealthStatus checkHealthEndpoint(@NotNull HealthEndpointData endpointData) {
        var livenessProbe = endpointData.getLivenessProbe();
        var readinessProbe = endpointData.getReadinessProbe();
        var livenessStatus = checkEndpoint(livenessProbe);
        var readinessStatus = checkEndpoint(readinessProbe);
        return new HealthStatus(endpointData.getServiceName(),
                                livenessStatus,
                                readinessStatus,
                                LocalDateTime.now());
    }

    /**
     * Check if a given url endpoint is reachable and returns a 200 status code.
     * @param url the url to check
     * @return true if the endpoint is reachable, false otherwise
     */
    private boolean checkEndpoint(String url) {
        logger.info("Checking endpoint: {}", url);
        var client = HttpClient.newHttpClient();
        var request = HttpRequest.newBuilder()
                                 .uri(URI.create(url))
                                 .timeout(Duration.ofSeconds(3))
                                 .build();
        try {
            var response = client.send(request, HttpResponse.BodyHandlers.ofString());
            logger.info("Response code of endpoint {}: {}", url, response.statusCode());
            return response.statusCode() == 200;
        }catch (HttpConnectTimeoutException e) {
            logger.error("Timeout checking endpoint: {}", url);
            return false;
        } catch (Exception e) {
            logger.error("Error checking endpoint: {}", url, e);
            return false;
        }
    }

}
