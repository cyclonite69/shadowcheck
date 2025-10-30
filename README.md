```markdown
# ShadowCheck

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Repository](https://img.shields.io/badge/repo-shadowcheck-blue.svg)](https://github.com/cyclonite69/shadowcheck)
[![Language: TypeScript](https://img.shields.io/github/languages/top/cyclonite69/shadowcheck)](https://github.com/cyclonite69/shadowcheck)

SIGINT forensics platform for wireless analysis optimized for mapping and spatial correlation using PostGIS — built with TypeScript, React (Vite), and modern tooling.

Overview
--------
ShadowCheck stores, correlates, and visualizes wireless observations with geospatial analysis (PostGIS). It’s designed for investigators and researchers who need spatially-aware pipelines for wireless capture data.

Quick highlights
- Postgres + PostGIS-backed spatial database
- React + Vite frontend with interactive maps (Mapbox)
- Ingest pipeline for PCAP-derived metadata
- Docker Compose for reproducible local environments

Quickstart (Docker Compose)
---------------------------
1. Copy example env:
```bash
cp .env.example .env
```

2. Start services:
```bash
docker compose up --build
```

3. Run migrations:
```bash
docker compose exec backend npm run migrate
```

Development (local)
-------------------
Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:
```bash
cd client
cp .env.example .env
npm install
npm run dev
# Vite default: http://localhost:5173
```

License
-------
This project is licensed under the MIT License — see the LICENSE file for details.

Contributing
------------
See CONTRIBUTING.md for how to contribute, coding conventions, and the PR process.

Security & Ethics
-----------------
This project deals with potentially sensitive signal data. Do not use ShadowCheck to violate privacy or laws. Follow institutional policies and applicable legislation. For security issues, contact the maintainer at cyclonite01@gmail.com.
```
