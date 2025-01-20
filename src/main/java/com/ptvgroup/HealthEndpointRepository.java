package com.ptvgroup;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.LongHistogram;
import io.opentelemetry.api.metrics.Meter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * Repository that holds all health endpoints.
 * It allows to discover services and add services manually.
 */
public class HealthEndpointRepository {

    private final Logger logger;
    private final KubernetesClient kubernetesClient;
    private final Meter meter;
    private final LongHistogram endpointHistogram;

    private final List<HealthEndpointData> discoveredHealthEndpoints;
    private final List<HealthEndpointData> addedHealthEndpoints;

    public HealthEndpointRepository() {
        this.logger = LoggerFactory.getLogger(HealthEndpointRepository.class);
        this.kubernetesClient = new KubernetesClientBuilder().build();
        this.meter = GlobalOpenTelemetry.getMeter("health-repository");
        this.endpointHistogram = meter.histogramBuilder("health-endpoints").ofLongs().build();
        this.discoveredHealthEndpoints = new ArrayList<>();
        this.addedHealthEndpoints = new ArrayList<>();
    }

    /**
     * Discovers all services in the Kubernetes cluster and their health endpoints.
     * The health endpoints are stored in the repository, and old endpoints are replaced.
     */
    void discoverServices() {
        logger.info("Discovering services");
        discoveredHealthEndpoints.clear();
        List<Service> services;
        try {
            services = kubernetesClient.services().list().getItems();
        } catch (Exception e) {
            logger.error("Error discovering services", e);
            return;
        }
        if (services == null || services.isEmpty()) {
            logger.warn("No services found");
        } else {
            logger.info("Found services");
            for (var service : services) {
                logger.info("Service: {}", service.getMetadata().getName());
                for (var pod : getServicePods(service)) {
                    var ip = pod.getStatus().getPodIP();
                    if (ip == null) {
                        logger.warn("No IP found for pod {}", pod.getMetadata().getName());
                        continue;
                    }
                    for (var container : pod.getSpec().getContainers()) {
                        var healthEndpointData = getHealthEndpointFromContainer(ip, container);
                        logger.info("Container: {}", healthEndpointData.getServiceName());
                        logger.info("Liveness probe: {}", healthEndpointData.getLivenessProbe());
                        logger.info("Readiness probe: {}", healthEndpointData.getReadinessProbe());
                        discoveredHealthEndpoints.add(healthEndpointData);
                    }
                }
            }
            endpointHistogram.record(discoveredHealthEndpoints.size());
        }
        logger.info("End discovering services");

    }

    /**
     * Manually adds a service to the repository.
     * The service is identified by the URL to the readiness and liveness probe and the service name.
     * <p>
     * Note: For manually added services, the readiness and liveness probe are the same.
     * If the service already exists, the service name is made unique by appending a uuid.
     *
     * @param url         The URL to the readiness and liveness probe
     * @param serviceName Unique name of the service
     * @return the unique service name
     */
    public String addService(String url, String serviceName) {
        logger.info("Adding service manually: {}", url);
        String changedServiceName = serviceName;
        if (getHealthEndpoints().stream()
                                .map(HealthEndpointData::getServiceName)
                                .anyMatch(name -> name.equals(serviceName))) {
            logger.warn("Service {} already exists, making unique... ", serviceName);
            changedServiceName = serviceName + "-" + UUID.randomUUID().toString();
        }
        var healthEndpointData = new HealthEndpointData(changedServiceName, url, url);
        addedHealthEndpoints.add(healthEndpointData);
        endpointHistogram.record(addedHealthEndpoints.size());
        return changedServiceName;
    }

    /**
     * Get all health endpoints in the repository.
     * This includes discovered and manually added services.
     * @return the list of health endpoints
     */
    public List<HealthEndpointData> getHealthEndpoints() {
        return Stream.concat(discoveredHealthEndpoints.stream(), addedHealthEndpoints.stream())
                     .toList();
    }


    private List<Pod> getServicePods(Service service) {
        try {
            return kubernetesClient.pods()
                                   .inNamespace(service.getMetadata().getNamespace())
                                   .withLabel("app", service.getMetadata().getName())
                                   .list()
                                   .getItems();
        } catch (Exception e) {
            logger.error("Error getting pods for service {}", service.getMetadata().getName(), e);
            return List.of();
        }
    }

    /**
     * Converts a container to a health endpoint.
     * The liveness and readiness probe are extracted from the container, if available.
     * If not available, the standard endpoints are used.
     *
     * @param ip The IP of the pod in which the container runs
     * @param container The container to convert
     * @return the health endpoint to discover the health of the container
     */
    private HealthEndpointData getHealthEndpointFromContainer(String ip, Container container) {
        var livenessProbe = container.getLivenessProbe();
        var livenessUrl = "http://" + ip + ":" + "8080" + "/healthz";
        if (livenessProbe != null) {
            if (livenessProbe.getHttpGet() != null) {
                livenessUrl = "http://" + ip + ":" + livenessProbe.getHttpGet()
                                                                  .getPort() + livenessProbe.getHttpGet()
                                                                                            .getPath();
            } else {
                logger.warn(
                        "No httpGet defined for liveness probe for container {}. Using standard endpoint",
                        container.getName());
            }
        } else {
            logger.warn("No liveness probe defined for container {}. Using standard endpoint",
                    container.getName());
        }
        var readinessProbe = container.getReadinessProbe();
        var readinessUrl = "http://" + ip + ":" + "8080" + "/ready";
        if (readinessProbe != null) {
            if (readinessProbe.getHttpGet() != null) {
                readinessUrl = "http://" + ip + ":" + readinessProbe.getHttpGet()
                                                                    .getPort() + readinessProbe.getHttpGet()
                                                                                               .getPath();
            } else {
                logger.warn(
                        "No httpGet defined for readiness probe for container {}. Using standard endpoint",
                        container.getName());
            }
        } else {
            logger.warn("No readiness probe defined for container {}. Using standard endpoint",
                    container.getName());
        }

        return new HealthEndpointData(container.getName(), livenessUrl, readinessUrl);
    }


}
