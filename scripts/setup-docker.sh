#!/bin/bash

# ShadowCheck Docker Setup Script
# This script creates all necessary Docker files and configuration

set -e

echo "🔧 Setting up ShadowCheck Docker environment..."

# Create Backend Dockerfile
echo "📦 Creating Backend Dockerfile..."
cat > Dockerfile.backend << 'EOF'
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install tsx globally for running TypeScript
RUN npm install -g tsx

# Copy server source code
COPY server ./server
COPY tsconfig.json ./

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the backend server
CMD ["tsx", "server/index.ts"]
EOF

# Create Frontend Dockerfile
echo "🎨 Creating Frontend Dockerfile..."
cat > Dockerfile.frontend << 'EOF'
FROM node:22-alpine as build

WORKDIR /app

# Copy package files
COPY client/package*.json ./client/
COPY package*.json ./

# Install dependencies
RUN cd client && npm ci

# Copy client source code
COPY client ./client

# Build the frontend
RUN cd client && npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/client/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx config
echo "🌐 Creating nginx configuration..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to backend
        location /api {
            proxy_pass http://backend:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF

# Create complete docker-compose.yml
echo "🐳 Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database with PostGIS
  postgres:
    image: postgis/postgis:17-3.5
    container_name: shadowcheck_postgres
    environment:
      POSTGRES_DB: shadowcheck
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db:/docker-entrypoint-initdb.d
    networks:
      - shadowcheck_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d shadowcheck"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API Server
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: shadowcheck_backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:admin@postgres:5432/shadowcheck
      - PGHOST=postgres
      - PGPORT=5432
      - PGDATABASE=shadowcheck
      - PGUSER=postgres
      - PGPASSWORD=admin
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - shadowcheck_network
    restart: unless-stopped

  # Frontend React App
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: shadowcheck_frontend
    environment:
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - shadowcheck_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  shadowcheck_network:
    driver: bridge
EOF

# Fix the Express routing issue in vite.ts
echo "🔧 Fixing Express routing in server/vite.ts..."
cat > server/vite.ts << 'EOF'
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: express.Application, isProduction: boolean) {
  if (!isProduction) {
    // Development mode with Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '../client'),
      configFile: path.resolve(__dirname, '../client/vite.config.ts'),
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    // Handle SPA routing - only catch non-API routes
    app.get(/^\/(?!api).*/, async (req, res, next) => {
      const url = req.originalUrl;

      try {
        // Always serve the index.html for SPA routes
        const template = await vite.transformIndexHtml(url, `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ShadowCheck</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
        `);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        if (e instanceof Error) {
          vite?.ssrFixStacktrace(e);
          console.error(e.stack);
          res.status(500).end(e.message);
        }
      }
    });
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, '../client/dist');
    
    app.use(express.static(distPath));

    // Handle SPA routing in production - only catch non-API routes
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }
}
EOF

# Update package.json scripts
echo "📋 Updating package.json scripts..."
# Create a temporary script to update package.json
cat > update_package.js << 'EOF'
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
  "dev:server": "tsx watch server/index.ts",
  "dev:client": "cd client && npm run dev",
  "build": "npm run build:client",
  "build:client": "cd client && npm run build",
  "start": "npm run start:server",
  "start:server": "tsx server/index.ts",
  "docker:build": "docker-compose build",
  "docker:up": "docker-compose up -d",
  "docker:down": "docker-compose down",
  "docker:logs": "docker-compose logs -f",
  "docker:restart": "docker-compose restart",
  "docker:reset": "docker-compose down -v && docker-compose up -d"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
EOF

node update_package.js
rm update_package.js

# Create .dockerignore
echo "🚫 Creating .dockerignore..."
cat > .dockerignore << 'EOF'
node_modules
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.log
client/dist
client/node_modules
.vscode
.claude
EOF

# Make script executable
chmod +x "$0"

echo ""
echo "✅ Docker setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Build and start all containers:"
echo "   docker-compose up --build -d"
echo ""
echo "2. Check container status:"
echo "   docker-compose ps"
echo ""
echo "3. View logs:"
echo "   docker-compose logs -f"
echo ""
echo "4. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Database: localhost:5432"
echo ""
echo "5. Stop containers:"
echo "   docker-compose down"
echo ""
echo "🛠️  Development commands:"
echo "   npm run dev          # Run both frontend and backend locally"
echo "   npm run docker:up    # Start Docker containers"
echo "   npm run docker:logs  # View container logs"
echo "   npm run docker:down  # Stop containers"
echo ""
