package com.ptvgroup.handlers;

/**
 * Represents a request to add a new service with a name and URL.
 */
public class ServiceAdditionRequest {

    public final String name;
    public final String url;

    public ServiceAdditionRequest(String name, String url) {
        this.name = name;
        this.url = url;
    }

    public ServiceAdditionRequest() {
        this.name = "";
        this.url = "";
    }
}
