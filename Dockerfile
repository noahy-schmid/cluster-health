# Multi-stage build for React application
# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Build argument for PUBLIC_URL
ARG PUBLIC_URL="/"
ENV PUBLIC_URL=$PUBLIC_URL

# Copy package files
COPY package*.json ./

# Install dependencies with npm config to handle certificates
RUN npm config set strict-ssl false
RUN npm install

# Copy source code
COPY . .

# Build the application with the specified PUBLIC_URL
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create a startup script to handle PUBLIC_URL configuration
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]