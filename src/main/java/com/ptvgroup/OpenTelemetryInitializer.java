package com.ptvgroup;

import io.opentelemetry.exporter.prometheus.PrometheusHttpServer;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import org.slf4j.LoggerFactory;

public class OpenTelemetryInitializer {

    private static boolean initialized = false;

    public static void initialize() {
        if (initialized) {
            LoggerFactory.getLogger(OpenTelemetryInitializer.class)
                         .warn("OpenTelemetry already initialized");
            return;
        } else {
            LoggerFactory.getLogger(OpenTelemetryInitializer.class)
                         .info("Initializing OpenTelemetry");
        }
        initialized = true;
        var prometheusHttpServer = PrometheusHttpServer.builder().setPort(8081)
                                                   .build();
        var meterProvider = SdkMeterProvider.builder()
                .registerMetricReader(prometheusHttpServer)
                                            .build();

        OpenTelemetrySdk.builder()
                        .setMeterProvider(meterProvider)
                        .buildAndRegisterGlobal();
    }

}
