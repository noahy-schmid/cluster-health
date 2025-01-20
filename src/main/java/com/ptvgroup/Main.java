package com.ptvgroup;

import com.ptvgroup.handlers.ReportHandler;
import com.ptvgroup.handlers.ServiceAdditionHandler;
import io.javalin.Javalin;
import org.slf4j.LoggerFactory;


public class Main {
    public static void main(String[] args) {
        var logger = LoggerFactory.getLogger(Main.class);
        logger.info("Starting application");
        OpenTelemetryInitializer.initialize();

        var healthEndpointRepository = new HealthEndpointRepository();
        var healthStatusCollector = new HealthStatusCollectorService();
        var healthStatusRepository = new HealthStatusRepository();

        var collectorJob = new HealthStatusCollectorJob(healthEndpointRepository,
                                                        healthStatusCollector,
                                                        healthStatusRepository);
        collectorJob.start();
        var javalin = Javalin.create(config -> {
            config.requestLogger.http(
                    (ctx, timeMs) -> logger.info("{} {} {} {}ms",
                                                 ctx.method(),
                                                 ctx.path(),
                                                 ctx.status(),
                                                 timeMs)
            );
        });
        javalin.get("/healthz", ctx -> ctx.result("OK"));
        javalin.get("/ready", ctx -> ctx.result("OK"));
        javalin.get("/report", new ReportHandler(healthStatusRepository));
        javalin.post("/add-service", new ServiceAdditionHandler(healthEndpointRepository));

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("Shutting down application");
            collectorJob.stop();
            javalin.stop();
        }));

        javalin.start(8080);
    }
}