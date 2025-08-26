# Cluster Health Monitor

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

Cluster Health Monitor is a Java application that monitors the health of services in a Kubernetes cluster. It automatically discovers Kubernetes services and monitors their health endpoints (liveness and readiness probes), and provides a REST API for viewing health reports and manually adding services.

## Working Effectively

### Initial Setup and Build
- **NEVER CANCEL**: First build takes ~25 seconds including Gradle daemon startup. Set timeout to 60+ minutes for safety.
- `./gradlew build` -- builds the application. Takes ~18 seconds on subsequent builds. NEVER CANCEL.
- `./gradlew test` -- runs tests. Takes <1 second (no actual tests exist currently).
- `./gradlew clean build` -- clean build. Takes ~25 seconds. NEVER CANCEL.

### Running the Application
- **Local Development**: `./gradlew run` -- starts the application in development mode. Starts in ~1 second.
- **Production JAR**: `java -jar build/libs/cluster-health-1.0-all.jar` -- runs the fat JAR. Starts in ~1 second.
- **Application runs on port 8080** and will start successfully even without Kubernetes access.

### Docker Build
- **DOES NOT WORK**: `docker build -t cluster-health .` -- fails due to certificate issues in container environment downloading Gradle. 
- Use the fat JAR approach instead for deployment.

## Application Architecture

### Key Components
- **Main Class**: `com.ptvgroup.Main` - Entry point, sets up web server and background services
- **Health Discovery**: `HealthEndpointRepository` - Discovers Kubernetes services automatically every 60 seconds, with OpenTelemetry metrics
- **Health Checking**: `HealthStatusCollectorService` - Checks health endpoints every 15 seconds with separate liveness and readiness probes
- **Data Storage**: `HealthStatusRepository` - In-memory storage of health status data with rich categorization
- **Data Model**: `HealthEndpointData` and `HealthStatus` classes for structured health information
- **REST API**: Javalin web framework providing HTTP endpoints with request logging

### REST Endpoints
All endpoints are available at `http://localhost:8080`:
- `GET /healthz` - Returns "OK" for application health check
- `GET /ready` - Returns "OK" for application readiness check  
- `GET /report` - Returns detailed JSON report with health status categorization:
  ```json
  {
    "count": 1,
    "fully-functioning": 0,
    "only-healthy": 0, 
    "only-ready": 0,
    "detailed-statuses": [
      {
        "name": "service-name",
        "healthy": false,
        "ready": false,
        "timestamp": [2025, 8, 26, 17, 19, 17, 465389066]
      }
    ]
  }
  ```
- `POST /add-service` - Manually add a service to monitor (JSON: `{"name":"service-name","url":"http://example.com/health"}`)
  - Returns HTTP 201 with "Service added" on success
  - Automatically handles duplicate service names by appending UUID

## Validation

### Always Test After Changes
1. **Build Validation**: `./gradlew build` -- must complete successfully
2. **Application Startup**: `./gradlew run` -- application must start within 2 seconds
3. **Endpoint Testing**: Run these curl commands while application is running:
   ```bash
   curl -s http://localhost:8080/healthz    # Should return "OK"
   curl -s http://localhost:8080/ready     # Should return "OK"
   curl -s http://localhost:8080/report    # Should return JSON with health status
   ```
4. **Service Addition**: Test manual service addition:
   ```bash
   curl -s -X POST -H "Content-Type: application/json" \
     -d '{"name":"test-service","url":"http://httpbin.org/status/200"}' \
     http://localhost:8080/add-service
   # Should return "Service added" with HTTP 201 status
   
   # Wait 20 seconds, then check the report shows the service
   curl -s http://localhost:8080/report | jq .
   # Should show detailed health status with proper categorization
   ```

### Expected Behavior
- **Without Kubernetes**: Application starts normally but logs errors about Kubernetes discovery (this is expected and normal)
- **Health Checking**: Background job runs every 15 seconds to check both liveness and readiness probes separately
- **Service Discovery**: Background job runs every 60 seconds to discover Kubernetes services with proper pod and container analysis
- **API Responses**: All endpoints respond immediately with appropriate data
- **Duplicate Handling**: Service names are automatically made unique if duplicates are added
- **Metrics Collection**: OpenTelemetry metrics are collected for health endpoint counts

### Manual Testing Scenarios
- **Basic Functionality**: Start application with `./gradlew run`, test all 4 REST endpoints
- **Service Management**: Add a test service via API, verify it appears in `/report` endpoint
- **Long Running**: Let application run for 2+ minutes to verify background jobs work correctly

## Common Tasks

### Development Workflow
1. Make code changes
2. Run `./gradlew build` -- NEVER CANCEL, wait up to 60+ minutes if needed
3. Test with `./gradlew run`
4. Validate endpoints with curl commands above
5. Stop application with Ctrl+C

### Kubernetes Deployment
The application is designed to run in Kubernetes with proper RBAC permissions:
- Apply `cluster-role.yaml` and `cluster-role-binding.yaml` for service discovery permissions
- Use `test-server-deployment.yaml` as example deployment
- Application requires access to Kubernetes API to discover services

### Key Project Files
```
src/main/java/com/ptvgroup/
├── Main.java                          # Application entry point
├── HealthEndpointData.java            # Data model for health endpoint information
├── HealthEndpointRepository.java      # Kubernetes service discovery with metrics
├── HealthStatus.java                  # Health status data model with categorization
├── HealthStatusCollectorService.java  # Health checking logic with separate probe handling
├── HealthStatusRepository.java        # Data storage with rich categorization
├── HealthStatusCollectorJob.java      # Background job scheduler
├── OpenTelemetryInitializer.java      # Metrics initialization
└── handlers/
    ├── ReportHandler.java             # GET /report endpoint with detailed categorization
    ├── ServiceAdditionHandler.java    # POST /add-service endpoint with duplicate handling
    └── ServiceAdditionRequest.java    # Request model for service addition
```

### Build Configuration
- **Gradle Version**: 8.10 with Java 17+
- **Main Dependencies**: Javalin web framework, Kubernetes client, OpenTelemetry metrics, Jackson for JSON
- **Build Output**: `build/libs/cluster-health-1.0-all.jar` (fat JAR ~23MB)
- **Shadow Plugin**: Used for creating fat JARs with merged service files
- **No Tests**: Test framework is configured but no test files exist currently

## Known Issues and Limitations

### Build Issues
- **Docker Build Fails**: Certificate issues prevent downloading Gradle in container environment
- **Gradle Warnings**: Deprecation warnings about Gradle 9.0 compatibility (can be ignored)

### Runtime Behavior  
- **Kubernetes Discovery Errors**: Expected when running outside Kubernetes cluster
- **Network Timeouts**: Health check requests timeout after 3 seconds (normal behavior)
- **Memory Storage**: Health status data is stored in memory only (lost on restart)
- **Service Discovery**: Automatically discovers services with liveness and readiness probes
- **Probe Handling**: Falls back to standard endpoints (/healthz, /ready) if probes not defined

### Workarounds
- **For Deployment**: Use fat JAR instead of Docker build: `java -jar build/libs/cluster-health-1.0-all.jar`
- **For Development**: Use `./gradlew run` for fastest development cycle
- **For Testing**: Mock external services since health checks attempt real HTTP requests

Remember: NEVER CANCEL long-running builds. They may take 25+ seconds but will complete successfully.