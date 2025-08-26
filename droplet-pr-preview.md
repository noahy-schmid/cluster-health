# DigitalOcean Droplet PR Preview Setup

This document explains how to set up automated PR preview deployments for the React app on a DigitalOcean Droplet.

## Overview

The PR preview system automatically:
- Builds the React app for each pull request
- Deploys it to a unique subdirectory on the droplet (e.g., `/var/www/pr-123`)
- Configures NGINX to serve the preview at a subpath (e.g., `http://your-droplet-ip/pr-123`)
- Cleans up the deployment when the PR is closed

## Prerequisites

### DigitalOcean Droplet Requirements
- Ubuntu 20.04 or later
- NGINX installed and configured
- A user with sudo privileges for the deployment scripts
- SSH access configured

### GitHub Repository Requirements
- GitHub Actions enabled
- Access to repository secrets for storing droplet credentials

## Droplet Setup

### 1. Install NGINX

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configure Base NGINX Setup

Create or update `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    # Main application (if any)
    location / {
        try_files $uri $uri/ =404;
    }

    # PR previews will be automatically added here by the deployment scripts
}
```

### 3. Create Required Directories

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
```

### 4. Deployment Scripts (Automatically Uploaded)

The deployment scripts are automatically uploaded to your droplet by the GitHub Actions workflow if they don't exist. However, if you want to manually upload them:

```bash
# Copy scripts to your home directory (optional - workflow handles this)
scp scripts/configure-nginx-pr.sh user@your-droplet-ip:~/
scp scripts/cleanup-pr.sh user@your-droplet-ip:~/

# Make them executable (optional - workflow handles this)
chmod +x ~/configure-nginx-pr.sh
chmod +x ~/cleanup-pr.sh
```

**Note:** The workflow automatically checks if these scripts exist and uploads them if needed, so manual upload is not required.

### 5. Set Up Password Authentication

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
- Build the React app with the correct subpath configuration
- Upload deployment scripts to the droplet if they don't exist
- Deploy to the droplet using password-based SSH/SCP authentication
- Configure NGINX for the new preview
- Comment on the PR with the preview URL and deployment details
- Clean up when the PR is closed

## How It Works

### Deployment Process

1. **PR Opened/Updated**: 
   - GitHub Actions builds the React app with `PUBLIC_URL=/pr-{number}`
   - Files are deployed to `/var/www/pr-{number}` on the droplet
   - NGINX is configured to serve the preview at `/pr-{number}`
   - A comment is added to the PR with the preview URL

2. **PR Closed**:
   - The preview directory is removed from the droplet
   - NGINX configuration is cleaned up
   - A cleanup confirmation comment is added to the PR

### Directory Structure on Droplet

```
/var/www/
├── html/                 # Main website (if any)
├── pr-123/              # PR #123 preview
│   ├── index.html
│   ├── static/
│   └── ...
├── pr-456/              # PR #456 preview
│   ├── index.html
│   ├── static/
│   └── ...
└── ...
```

### NGINX Configuration

Each PR preview gets its own location block in the NGINX configuration:

```nginx
# PR Preview #123
location /pr-123 {
    alias /var/www/pr-123;
    try_files $uri $uri/ /pr-123/index.html;
    expires 1d;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify `DROPLET_HOST` and `DROPLET_USER` secrets
   - Ensure the SSH key is correctly formatted in `DROPLET_SSH_KEY`
   - Check that the public key is in `~/.ssh/authorized_keys` on the droplet

2. **NGINX Configuration Errors**
   - Check NGINX syntax: `sudo nginx -t`
   - View logs: `sudo journalctl -u nginx`
   - Restore backup: `sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default`

3. **Permission Issues**
   - Ensure the deployment user has sudo privileges
   - Check directory permissions: `ls -la /var/www/`

4. **Build Failures**
   - Check the GitHub Actions logs
   - Verify Node.js version compatibility
   - Ensure all dependencies are properly locked in `package-lock.json`

### Manual Cleanup

If automatic cleanup fails, you can manually remove a PR preview:

```bash
# Remove files
sudo rm -rf /var/www/pr-{number}

# Clean NGINX config
sudo ./cleanup-pr.sh {number}
```

### Monitoring

- Check active PR previews: `ls /var/www/pr-*`
- View NGINX status: `sudo systemctl status nginx`
- Check disk usage: `df -h /var/www`

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
   - Consider implementing automatic cleanup of old PR previews
   - Set up monitoring alerts for resource usage

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
- Automatic cleanup of previews older than X days
- Compression for static assets
- CDN integration for better performance