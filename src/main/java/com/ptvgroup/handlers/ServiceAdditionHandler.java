package com.ptvgroup.handlers;

import com.ptvgroup.HealthEndpointRepository;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import org.jetbrains.annotations.NotNull;

/**
 * Get Request Handler for adding a new service.
 */
public class ServiceAdditionHandler implements Handler {

    private final HealthEndpointRepository healthEndpointRepository;

    public ServiceAdditionHandler(HealthEndpointRepository healthEndpointRepository) {
        this.healthEndpointRepository = healthEndpointRepository;
    }

    @Override
    public void handle(@NotNull Context ctx) throws Exception {
        var body = ctx.bodyAsClass(ServiceAdditionRequest.class);
        healthEndpointRepository.addService(body.url, body.name);
        ctx.status(201);
        ctx.result("Service added");
    }
}
