# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm cache clean --force && \
    npm install --production=false --ignore-scripts --prefer-offline --no-audit --no-optional || \
    npm install --production=false --ignore-scripts --prefer-offline --no-audit --no-optional

COPY . .
# RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache tini

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]  # Tweak to your entrypoint
