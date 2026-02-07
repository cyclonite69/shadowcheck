# ==============================================================================
# SHADOWCHECK BACKEND - MULTI-STAGE PRODUCTION DOCKERFILE
# Node.js + Express + TypeScript + PostGIS
# ==============================================================================

# ==============================================================================
# STAGE 1: BUILDER
# Install all dependencies, including devDependencies, to build the project.
# ==============================================================================
FROM node:22-slim AS builder

WORKDIR /app

# Copy root package files and install all dependencies (including dev)
# This is a monorepo, so we install from the root.
COPY package.json package-lock.json* ./
RUN npm install --timeout=300000

# Copy the rest of the source code
# This is needed for the TypeScript compiler to find all files.
COPY . .

# Compile the TypeScript server code.
# The -p flag points to the server's tsconfig.json.
# We override the "noEmit" option to ensure JS files are generated.
RUN npx tsc -p server/tsconfig.json --noEmit false

# ==============================================================================
# STAGE 2: PRUNER
# Create a clean production node_modules directory.
# ==============================================================================
FROM node:22-slim AS pruner

WORKDIR /app

# Copy over the full node_modules and package files from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Prune devDependencies to get a clean production-only node_modules
RUN npm prune --production

# ==============================================================================
# STAGE 3: PRODUCTION
# Create the final, lean production image.
# ==============================================================================
FROM node:22-slim AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy production node_modules from the pruner stage
COPY --from=pruner /app/node_modules ./node_modules

# Copy the compiled server code from the builder stage
COPY --from=builder /app/server/dist ./server/dist

# Copy the root package.json (might be needed for runtime)
COPY package.json .

# Install runtime utilities like tini for process management
RUN apt-get update && apt-get install -y tini wget && rm -rf /var/lib/apt/lists/*

EXPOSE 5000

RUN chown -R 1000:1000 /app
USER 1000

# Use tini to properly handle signals and reap zombie processes
# Run the compiled JavaScript output
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server/dist/server/index.js"]
