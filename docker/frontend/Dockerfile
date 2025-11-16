# ==============================================================================
# SHADOWCHECK FRONTEND - MULTI-STAGE PRODUCTION DOCKERFILE
# Vite + React + Tailwind + MapLibre GL for SIGINT Visualization
# ==============================================================================
#
# SECURITY & OPTIMIZATION FEATURES:
# - Multi-stage build to minimize final image size
# - Nginx alpine for production serving
# - Optimized layer caching
# - Security headers in nginx configuration
# - Gzip compression enabled
#
# ==============================================================================
ARG NODE_VERSION=22-alpine
# ==============================================================================
# STAGE 1: DEPENDENCIES
# Install all client dependencies
# ==============================================================================
FROM node:22-slim AS dependencies
WORKDIR /build
# Copy client dependency manifests first (cache optimization)
COPY client/package*.json ./client/
# Install ALL client dependencies
RUN npm ci --prefix client --timeout=120000
# ==============================================================================
# STAGE 2: BUILD
# Build the Vite application
# ==============================================================================
FROM node:22-slim AS builder
WORKDIR /build
# Copy dependencies from previous stage
COPY --from=dependencies /build/client/node_modules ./client/node_modules
# Copy source code
COPY . ./
# Build production bundle
ENV NODE_ENV=production
RUN npm run build --prefix client
# Verify build output exists
RUN ls -la /build/client/dist
# ==============================================================================
# STAGE 3: PRODUCTION RUNTIME
# Serve with nginx
# ==============================================================================
FROM nginx:stable AS production
# Install runtime dependencies
RUN apt update && apt install -y wget && \
    rm -rf /var/lib/apt/lists/*
# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Copy custom nginx configuration
COPY --from=builder /build/client/dist /usr/share/nginx/html
# Create custom nginx config
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
# ShadowCheck Frontend Configuration
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    # Cache control for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    # SPA routing - always serve index.html for non-file requests
    location / {
        try_files $uri $uri/ /index.html;
    }
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    # API proxy (optional - for development)
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
# Expose port
EXPOSE 80
# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
# ==============================================================================
# STAGE 4: DEVELOPMENT (Optional)
# For local development with hot reload
# ==============================================================================
FROM node:${NODE_VERSION} AS development
WORKDIR /app
# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci
# Copy source
COPY . ./
# Expose Vite dev server port
EXPOSE 5173
# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
