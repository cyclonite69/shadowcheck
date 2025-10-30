# ShadowCheck

[![Repository](https://img.shields.io/badge/repo-shadowcheck-blue.svg)](https://github.com/cyclonite69/shadowcheck)
[![License](https://img.shields.io/badge/license-ADD--LICENSE-lightgrey.svg)](LICENSE)
[![Language](https://img.shields.io/github/languages/top/cyclonite69/shadowcheck)](https://github.com/cyclonite69/shadowcheck)
[![Topics](https://img.shields.io/badge/topics-counter--surveillance--cyber--gis--wireless--react--postgres-blueviolet)]()

SIGINT forensics platform for wireless analysis optimized for mapping and spatial correlation using PostGIS — built with TypeScript, React (Vite), and modern tooling.

Table of contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Quickstart (Docker Compose)](#quickstart-docker-compose)
- [Manual Local Setup](#manual-local-setup)
- [Database (PostGIS) Setup](#database-postgis-setup)
- [Configuration](#configuration)
- [Usage & Examples](#usage--examples)
- [Security & Privacy](#security--privacy)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contacts](#contacts)

---

Overview
--------
ShadowCheck is a SIGINT-focused forensics and analysis platform for wireless network data that combines spatial analysis through PostGIS with a modern web frontend. It provides capabilities to ingest, visualize, correlate, and export wireless observations and derived artifacts for investigative workflows.

Key Features
------------
- Spatially-aware storage and indexing using PostgreSQL + PostGIS
- Interactive mapping and timeline visualizations (React + Vite)
- Ingest pipeline for wireless capture data (PCAP) and derived metadata
- Correlation and enrichment of observations with geospatial queries
- RESTful API backend implemented in TypeScript
- Docker-friendly for reproducible deployments
- Extensible data model for signals, sessions, devices, and annotations

Architecture
------------
Basic high-level architecture (recommended folder layout):

- /backend — TypeScript Node.js API server (Express, Nest, or Fastify)
- /frontend — React + Vite single-page application
- /db — database scripts, migrations, SQL helpers, GIS assets
- /docker — docker-compose configuration for dev/test
- /docs — additional diagrams, data model, and SOPs

Flow:
1. Ingest (PCAP → parser) → 2. Enrich (metadata, geolocation) → 3. Store (Postgres/PostGIS) → 4. Query & Visualize (API → frontend)

Requirements
------------
- Docker & Docker Compose (recommended for development)
- Node.js (18+) and npm / pnpm / yarn (if running locally)
- PostgreSQL 14+ with PostGIS extension (if not using Docker)
- Modern browser for UI (Chrome, Firefox)
- Optional: tools for PCAP parsing (tshark, scapy)

Quickstart (Docker Compose)
---------------------------
The fastest way to get ShadowCheck running for development/testing is with Docker.

1. Copy the example env:
```bash
cp .env.example .env
```

2. Start services:
```bash
docker compose up --build
```

3. Wait until Postgres + PostGIS are ready, then run migrations (if applicable):
```bash
# Example (replace with your migration tool)
docker compose exec backend npm run migrate
```

4. Open the frontend at:
- http://localhost:3000 (or the port configured in .env)

Manual Local Setup
------------------
Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# or
pnpm install && pnpm dev
```

Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# default Vite URL: http://localhost:5173
```

Database (PostGIS) Setup
------------------------
If you manage the database manually, create the database and enable PostGIS.

1. Create database and user:
```sql
CREATE USER shadow_user WITH PASSWORD 'strong_password';
CREATE DATABASE shadowcheck OWNER shadow_user;
```

2. Connect to the DB and enable PostGIS:
```sql
\c shadowcheck
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

3. Apply schema/migrations:
- If using migrations (TypeORM, Knex, Prisma): run the migration command provided in /backend.
- If using raw SQL: run files in /db/migrations/.

Configuration
-------------
Environment configuration should be stored in .env files and secrets handled with a secrets manager in production.

Typical variables (backend .env):
```
PORT=4000
DATABASE_URL=postgres://shadow_user:password@db:5432/shadowcheck
JWT_SECRET=replace_with_strong_secret
NODE_ENV=development
LOG_LEVEL=info
```

Typical variables (frontend .env):
```
VITE_API_URL=http://localhost:4000/api
```

Usage & Examples
----------------
API conventions (examples — confirm with your actual implementation):

- GET /api/health — health-check
- POST /api/ingest — submit parsed capture or metadata for ingestion
- GET /api/observations — query observations with spatial filters
- GET /api/devices/:id — get device/session details and history
- GET /api/map/tiles — geojson or vector tile endpoints for visualizations

Example: Query observations within a bounding box
```http
GET /api/observations?bbox=-122.5,37.7,-122.3,37.8
```

Importing PCAP-derived JSON
1. Convert PCAP to JSON metadata (e.g., using tshark/scapy custom scripts).
2. POST the JSON to /api/ingest or drop into an ingestion directory watched by your backend.

Security & Privacy
------------------
- This project deals with sensitive signal data. Ensure access controls, encrypted transport (TLS), and strong authentication (JWT/OAuth + MFA) in production.
- Keep personally-identifying information (PII) handling and retention policies compliant with applicable laws.
- Use role-based access control on API endpoints and GIS data layers.

Testing
-------
- Backend: unit tests and integration tests (Jest/Mocha)
- Frontend: UI tests and component tests (Vitest / React Testing Library)
- Run tests:
```bash
# backend
cd backend
npm test

# frontend
cd frontend
npm test
```

Deployment
----------
Suggested production steps:
1. Build frontend static assets and host behind CDN (or serve from backend).
2. Deploy backend as containerized service (Kubernetes, ECS, or plain Docker) behind HTTPS load balancer.
3. Use managed Postgres with PostGIS enabled or host in your infrastructure; ensure backups and point-in-time recovery.
4. Monitor: metrics (Prometheus), logs (ELK/LogDNA), and alerts for resource and security events.

Roadmap
-------
Planned improvements (example; adapt to your priorities):
- Enrichment services for device fingerprinting and signal triangulation
- Vector-tile support for large-scale mapping
- User/role management and audit trails
- Integrations: MISP, Elastic, kyber/tshark-based parsers
- Stream processing for near-real-time ingestion (Kafka)

Contributing
------------
We welcome contributions. Suggested workflow:
1. Fork the repo
2. Create a branch: git checkout -b feat/short-description
3. Add tests for new features
4. Open a PR against master describing changes and rationale

Please follow the project's coding style and add/adjust documentation where necessary.

License
-------
No license is currently selected for this repository. Add a LICENSE file (recommended: MIT, Apache-2.0) to make the project's license explicit.

Acknowledgements
----------------
- Built on open-source building blocks: PostgreSQL, PostGIS, Node.js, React, Vite
- Thanks to the maintainers of the libraries and tools used by ShadowCheck

Contacts
--------
Repository: https://github.com/cyclonite69/shadowcheck
Owner: @cyclonite69

---

Notes
-----
- This README is designed as a practical, developer-friendly starting point. Adjust commands and sections to reflect the exact toolchain and folder layout used in your repository.
- If you want, I can:
  - tailor the README to the repo's actual file structure after scanning the tree,
  - add a LICENSE file and open a PR,
  - or generate a docker-compose.yml and .env.example tuned to your code.
