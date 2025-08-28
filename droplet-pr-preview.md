# DigitalOcean Droplet PR Preview Setup with Docker

This document explains how to set up automated PR preview deployments for the React app using Docker containers on a DigitalOcean Droplet.

## Overview

The PR preview system automatically:
- Builds a Docker image of the React app for each pull request with the correct subpath configuration
- Deploys the Docker container to the droplet with a unique container name (e.g., `cluster-health-pr-123`)
- Configures NGINX to proxy requests to the container (e.g., `http://your-droplet-ip/pr-123`)
- Cleans up the deployment and removes the container when the PR is closed

### Key Benefits of Docker Approach
- **Consistent Environment**: Each PR runs in the same containerized environment
- **Better Resource Management**: Containers can be stopped/started independently
- **Easier Cleanup**: Complete environment cleanup when PR is closed
- **Scalability**: Easier to manage multiple PR deployments
- **Security**: Isolated execution environments

## Prerequisites

### DigitalOcean Droplet Requirements
- Ubuntu 20.04 or later
- **Docker and Docker Compose** installed and configured
- NGINX installed and configured (for reverse proxy)
- A user with sudo privileges for the deployment scripts
- SSH access configured

### GitHub Repository Requirements
- GitHub Actions enabled
- Access to repository secrets for storing droplet credentials
- GitHub Container Registry access for storing Docker images

## Droplet Setup

### 1. Install Docker and Docker Compose

```bash
# Install Docker
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker-compose --version
```

### 2. Install NGINX (Reverse Proxy)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configure Base NGINX Setup

Create or update `/etc/nginx/nginx.conf` with the proxy configuration:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;

    # Upstream for main application
    upstream main_app {
        server cluster-health-app:80;
    }

    server {
        listen 80 default_server;
        server_name _;

        # Main application
        location / {
            proxy_pass http://main_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # PR preview locations will be dynamically added here
        # Each PR will get its own location block like:
        # location /pr-123 {
        #     proxy_pass http://cluster-health-pr-123:80/;
        #     proxy_set_header Host $host;
        #     proxy_set_header X-Real-IP $remote_addr;
        #     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        #     proxy_set_header X-Forwarded-Proto $scheme;
        # }
    }
}
```

### 4. Create Docker Network

```bash
# Create a Docker network for the application
docker network create cluster-health
```

### 5. Deployment Scripts (Automatically Uploaded)

The deployment scripts are automatically uploaded to your droplet by the GitHub Actions workflow if they don't exist. The scripts now include Docker and Docker Compose installation and management:

**Enhanced Docker Support:**
- Automatically installs Docker and Docker Compose if not present
- Creates and manages Docker networks for container communication  
- Builds and deploys React app as Docker containers
- Configures NGINX reverse proxy to route to containers
- Handles container lifecycle management (start, stop, cleanup)

If you want to manually upload the scripts (optional):

```bash
# Copy scripts to your home directory (optional - workflow handles this)
scp scripts/deploy-docker-pr.sh user@your-droplet-ip:~/
scp scripts/cleanup-docker-pr.sh user@your-droplet-ip:~/

# Make them executable (optional - workflow handles this)
chmod +x ~/deploy-docker-pr.sh
chmod +x ~/cleanup-docker-pr.sh
```

**Note:** The workflow automatically checks if these scripts exist and uploads them if needed, so manual upload is not required. The new Docker-based scripts provide better resource management and isolation compared to the file-based approach.

### 6. Set Up Password Authentication

The workflow uses password-based SSH authentication instead of key-based authentication.

1. Ensure your droplet user has a password set:
   ```bash
   sudo passwd your-username
   ```

2. Make sure password authentication is enabled in SSH config:
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   
   Ensure these settings:
   ```
   PasswordAuthentication yes
   PubkeyAuthentication yes
   ```

3. Restart SSH service:
   ```bash
   sudo systemctl restart ssh
   ```

## GitHub Setup

### 1. Configure Repository Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DROPLET_HOST` | Your droplet's IP address or domain | `203.0.113.1` |
| `DROPLET_USER` | Username for SSH access | `deploy` |
| `DROPLET_PASSWORD` | Password for SSH authentication | `your-secure-password` |

### 2. Workflow Configuration

The workflow is automatically configured in `.github/workflows/pr-preview.yml`. It will:

- Trigger on PR events (opened, synchronized, reopened, closed)
- Build a Docker image of the React app with the correct subpath configuration
- Push the Docker image to GitHub Container Registry (GHCR)
- Upload deployment scripts to the droplet if they don't exist
- Deploy the Docker container to the droplet using password-based SSH authentication
- Configure NGINX reverse proxy for the new preview
- Comment on the PR with the preview URL and deployment details
- Clean up the container and NGINX configuration when the PR is closed

## How It Works

### Deployment Process

1. **PR Opened/Updated**: 
   - GitHub Actions builds a Docker image of the React app with `PUBLIC_URL=/pr-{number}`
   - The Docker image is pushed to GitHub Container Registry
   - A Docker container is deployed to the droplet with a unique name (e.g., `cluster-health-pr-123`)
   - NGINX is configured to reverse proxy requests to the container at `/pr-{number}`
   - A comment is added to the PR with the preview URL

2. **PR Closed**:
   - The Docker container is stopped and removed from the droplet
   - NGINX reverse proxy configuration is cleaned up
   - Docker images and networks are cleaned up as needed
   - A cleanup confirmation comment is added to the PR

### Directory Structure on Droplet

```
Docker Containers:
├── cluster-health-app              # Main application container (if deployed)
├── cluster-health-pr-123          # PR #123 preview container
├── cluster-health-pr-456          # PR #456 preview container
└── ...

Docker Images:
├── ghcr.io/owner/cluster-health:pr-123
├── ghcr.io/owner/cluster-health:pr-456
└── ...

Compose Files:
├── ~/docker-compose.pr-123.yml    # PR #123 compose configuration
├── ~/docker-compose.pr-456.yml    # PR #456 compose configuration
└── ...
```

### NGINX Configuration

Each PR preview gets its own reverse proxy location block in the NGINX configuration:

```nginx
# PR Preview #123
location /pr-123 {
    proxy_pass http://cluster-health-pr-123:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify `DROPLET_HOST` and `DROPLET_USER` secrets
   - Check that password authentication is enabled on the droplet

2. **Docker Issues**
   - Ensure Docker and Docker Compose are properly installed on the droplet
   - Check Docker service status: `sudo systemctl status docker`
   - Verify Docker network exists: `docker network ls | grep cluster-health`
   - Check container logs: `docker logs cluster-health-pr-123`

3. **NGINX Configuration Errors**
   - Check NGINX syntax: `sudo nginx -t`
   - View logs: `sudo journalctl -u nginx`
   - The deployment scripts now include intelligent NGINX configuration for Docker reverse proxy
   - Restore backup: `sudo cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf`

4. **Container Build/Deploy Failures**
   - Check GitHub Container Registry access
   - Verify GITHUB_TOKEN has package read/write permissions
   - Check GitHub Actions logs for Docker build errors
   - Ensure droplet has sufficient disk space for Docker images

5. **Network Issues**
   - Verify containers can communicate: `docker network inspect cluster-health`
   - Check if containers are running: `docker ps`
   - Test container connectivity: `docker exec -it cluster-health-pr-123 wget -qO- http://localhost`

### Manual Cleanup

If automatic cleanup fails, you can manually remove a PR preview:

```bash
# List all PR containers
docker ps -a --filter "label=pr.cleanup=true"

# Stop and remove a specific PR container
docker stop cluster-health-pr-{number}
docker rm cluster-health-pr-{number}

# Remove associated Docker images
docker rmi ghcr.io/owner/cluster-health:pr-{number}

# Remove compose file
rm ~/docker-compose.pr-{number}.yml

# Clean up Docker system (removes unused images, networks, etc.)
docker system prune -f

# Remove NGINX configuration manually (if needed)
sudo nano /etc/nginx/nginx.conf
# Remove the PR location block and reload: sudo systemctl reload nginx
```

### Monitoring

- Check active PR containers: `docker ps --filter "label=pr.cleanup=true"`
- Check Docker images: `docker images | grep cluster-health`
- View container logs: `docker logs cluster-health-pr-{number}`
- Check NGINX status: `sudo systemctl status nginx`
- Monitor disk usage: `df -h` and `docker system df`

## Security Considerations

1. **SSH Key Management**
   - Use a dedicated SSH key for GitHub Actions
   - Limit the key's access to only necessary operations
   - Regularly rotate SSH keys

2. **Firewall Configuration**
   - Consider restricting SSH access to specific IP ranges
   - Ensure only necessary ports are open (22 for SSH, 80/443 for HTTP/HTTPS)

3. **Resource Limits**
   - Monitor disk usage to prevent filling up the droplet
   - Consider implementing automatic cleanup of old Docker images and containers
   - Set up monitoring alerts for resource usage
   - Use `docker system prune` regularly to clean up unused resources

## Customization

### Custom Domain

To use a custom domain instead of IP address:

1. Point your domain to the droplet's IP
2. Update the NGINX configuration to use your domain
3. Update the workflow to use your domain in preview URLs

### HTTPS Support

To add SSL/TLS support:

1. Install Certbot: `sudo apt install certbot python3-certbot-nginx`
2. Obtain certificates: `sudo certbot --nginx -d your-domain.com`
3. Update the workflow to use HTTPS URLs

### Resource Optimization

Consider implementing:
- Automatic cleanup of Docker images older than X days: `docker image prune --filter "until=720h"`
- Regular container health checks and restart policies
- Resource limits for containers in docker-compose files
- CDN integration for better performance
- Log rotation for container logs