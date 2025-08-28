# Cluster Health - React App with Docker Deployment

A React application with automated Docker-based PR preview deployments to DigitalOcean droplets.

## Overview

This project provides a complete CI/CD pipeline that:
- Builds React applications as Docker containers
- Deploys PR previews as isolated Docker containers
- Uses NGINX reverse proxy for routing
- Automatically cleans up resources when PRs are closed

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Docker Development

```bash
# Build Docker image
docker build -t cluster-health .

# Run container
docker run -p 8080:80 cluster-health

# With custom PUBLIC_URL
docker build --build-arg PUBLIC_URL=/my-app -t cluster-health-custom .
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## Available Scripts

### `npm start`

Runs the app in the development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.  
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Docker Architecture

### Multi-stage Build
- **Stage 1**: Build React app with Node.js
- **Stage 2**: Serve with optimized Nginx container

### Container Features
- Optimized Nginx configuration with gzip compression
- Health check endpoint at `/health`
- Support for React Router with fallback routing
- Configurable via environment variables

### Environment Variables
- `PUBLIC_URL`: Base path for the application (default: `/`)
- `NODE_ENV`: Node environment (set to `production` in container)

## PR Preview System

The automated PR preview system creates isolated Docker containers for each pull request:

1. **On PR Open/Update:**
   - Builds Docker image with PR-specific routing
   - Deploys container to DigitalOcean droplet
   - Configures NGINX reverse proxy
   - Comments with preview URL

2. **On PR Close:**
   - Stops and removes Docker container
   - Cleans up NGINX configuration
   - Removes Docker images and resources

### Preview URLs
- Format: `http://your-droplet-ip/pr-{number}`
- Example: `http://203.0.113.1/pr-123`

## Deployment Setup

See [droplet-pr-preview.md](./droplet-pr-preview.md) for complete setup instructions.

### Prerequisites
- DigitalOcean droplet with Ubuntu 20.04+
- Docker and Docker Compose installed
- NGINX for reverse proxy
- GitHub Container Registry access

### Required Secrets
Add these to your GitHub repository secrets:
- `DROPLET_HOST`: Droplet IP address
- `DROPLET_USER`: SSH username
- `DROPLET_PASSWORD`: SSH password

## Files Structure

\`\`\`
├── Dockerfile                      # Multi-stage Docker build
├── docker-compose.yml             # Main compose configuration
├── docker-compose.pr-template.yml # Template for PR deployments
├── nginx.conf                     # Container Nginx config
├── nginx-proxy.conf               # Droplet reverse proxy config
├── docker-entrypoint.sh           # Container startup script
├── .dockerignore                  # Docker build ignore rules
├── scripts/
│   ├── deploy-docker-pr.sh        # PR deployment script
│   └── cleanup-docker-pr.sh       # PR cleanup script
└── .github/workflows/
    └── pr-preview.yml              # CI/CD pipeline
\`\`\`

## Benefits of Docker Approach

### vs. File-based Deployment
- **Isolation**: Each PR runs in its own container
- **Consistency**: Same environment for all deployments
- **Resource Management**: Better control over CPU/memory usage
- **Security**: Isolated execution environments
- **Scalability**: Easier to manage multiple deployments
- **Cleanup**: Complete environment removal

### Performance
- Optimized multi-stage builds reduce image size
- Nginx serving with compression and caching
- Container restart policies for reliability
- Health checks for monitoring

## Troubleshooting

### Common Issues
1. **Build Failures**: Check GitHub Actions logs
2. **Container Won't Start**: Check \`docker logs container-name\`
3. **Routing Issues**: Verify NGINX proxy configuration
4. **Resource Issues**: Monitor with \`docker system df\`

### Useful Commands
\`\`\`bash
# Check running containers
docker ps

# View container logs
docker logs cluster-health-pr-123

# Inspect container
docker inspect cluster-health-pr-123

# Check network connectivity
docker network inspect cluster-health

# Clean up resources
docker system prune -f
\`\`\`

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

For Docker deployment details, see [droplet-pr-preview.md](./droplet-pr-preview.md).
