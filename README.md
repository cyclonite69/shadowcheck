# ShadowCheck - SIGINT Forensics Platform

A comprehensive Signals Intelligence (SIGINT) forensics platform designed for wireless network analysis and spatial intelligence operations.

## Features

- **Real-time Network Monitoring** – Track WiFi networks and cellular signals  
- **Interactive GIS Visualization** – Mapbox-powered spatial analysis  
- **Forensics Dashboard** – Security analysis and signal strength monitoring  
- **PostGIS Spatial Queries** – Advanced geographic data operations  
- **Dark Cyber Theme** – Professional forensics interface design  

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS  
- **Backend**: Express.js + Node.js  
- **Database**: PostgreSQL with PostGIS extension  
- **Mapping**: Mapbox GL JS  
- **UI Components**: Shadcn/ui + Radix UI  

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```env
   DATABASE_URL=postgresql://<USER>:<PASS>@<HOST>:5432/<DB>?sslmode=require
   MAPBOX_ACCESS_TOKEN=<your_mapbox_token>
   ```

3. **Push database schema:**
   ```bash
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/health` | Service health check |
| `GET /api/v1/networks` | Network observations data |
| `GET /api/v1/visualize` | GeoJSON data for mapping |
| `GET /api/v1/within` | Spatial proximity queries |
| `GET /api/v1/analytics` | Network analytics data |

## Development

The project uses a modern full-stack TypeScript setup with:

- Hot module replacement for rapid development
- Type-safe database operations with Drizzle ORM
- Shared types between frontend and backend
- PostGIS for advanced spatial operations

## Security

- Helmet.js security headers
- CORS configuration
- Session-based authentication
- Environment variable protection

## Data Provenance

ShadowCheck's seed dataset was exported from the **WiGLE** Android app (SQLite) and migrated to PostgreSQL for analysis.

- **Source**: WiGLE app export (SQLite database)
- **Migration**: Custom SQL/ETL scripts converted tables and normalized fields
- **Schema**: Primary tables include `location` (~85MB), `network` (~38MB), and enriched views
- **Notes**: Please review WiGLE's Terms of Use before redistributing derived datasets

## Data Migration

ShadowCheck supports importing data from WiGLE Android app exports. The complete migration toolkit is available in [`scripts/migration/`](scripts/migration/).

**Quick migration workflow:**
```bash
# Setup database
scripts/migration/01-setup-postgresql.sh

# Import WiGLE export  
scripts/migration/03-import-sqlite.sh your_wigle_export.sqlite

# Build unified schema
scripts/migration/04-build-unified-schema.sh

# Create enhanced views
scripts/migration/05-create-enhanced-views.sh
```

**Migration Features:**
- Two-phase SQLite import with automatic schema mapping
- Dynamic unified schema builder supporting multiple exports
- WiFi security classification (WPA3, WPA2, OWE, etc.)
- PostGIS spatial analysis integration
- Comprehensive error handling and audit trails

**Complete guide**: See [scripts/migration/README.md](scripts/migration/README.md) for detailed migration instructions, WiGLE export methods, and troubleshooting.

## Database (PostgreSQL / Neon)

**Target**: PostgreSQL 15+ with PostGIS • **Primary schema**: `app`

### Roles (Recommended)
- `app_ro` – read-only access for API queries
- `app_rw` – read/write access for administrative tasks

### Environment Setup
Create `.env` from `.env.example` and configure your database:

```env
DATABASE_URL=postgresql://<USER>:<PASS>@<HOST>:5432/<DB>?sslmode=require
MAPBOX_ACCESS_TOKEN=<your_mapbox_token>
```

### Authentication
Credentials should be managed using `~/.pgpass` or environment variables.  
**Never hardcode passwords into source code or configs.**

Example `~/.pgpass` (development only):
```bash
chmod 600 ~/.pgpass
# Add line: your-db-host:5432:your-db:app_rw:<password>
```

### Quick Database Checks
```bash
# Read-only check
psql "sslmode=require" -U app_ro -c "SELECT COUNT(*) FROM app.location;"

# Read-write check  
psql "sslmode=require" -U app_rw -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'app';"
```

### Schema Documentation
**Complete schema reference**: See [docs/SCHEMA.md](docs/SCHEMA.md) for detailed table structures, relationships, and sample queries.

### Migrations & Setup
All tables, indices, and views are defined in `/server/sql/` (or Drizzle migrations). Apply with:

```bash
npm run db:push     # or your migration command
# OR with psql:
psql "$DATABASE_URL" -f server/sql/001_init.sql
psql "$DATABASE_URL" -f server/sql/010_views.sql
```

### Notes
- This repo uses a Neon-hosted Postgres instance for **development only**
- In production, you can point to any Postgres 15+ server with PostGIS enabled
- Replace role/user names and passwords with your own — the above are examples only
- Do not commit `.pgpass` or `.pg_service.conf` files

## Surveillance Awareness

ShadowCheck is not just a network analytics tool — it can aid in personal counter-surveillance. By monitoring unusual WiFi, Bluetooth, or cellular patterns, users can spot anomalies such as:

- **Repeated devices** appearing in different locations (possible tracking)
- **Unrecognized SSIDs** mimicking known networks (rogue APs)
- **Suspicious Bluetooth beacons** following movement patterns
- **Cell tower inconsistencies** suggesting IMSI catchers
- **Signal strength anomalies** indicating nearby surveillance equipment

> **Note**: While not a replacement for professional counter-surveillance, ShadowCheck provides data-driven indicators that can help users identify whether they may be under observation. Results are indicative, not definitive.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server  │◄──►│  PostgreSQL+    │
│   (Frontend)    │    │   (Backend)      │    │  PostGIS        │
│                 │    │                  │    │  (Database)     │
│ • Mapbox Maps   │    │ • REST API       │    │ • Spatial Data  │
│ • Tailwind UI   │    │ • Type Safety    │    │ • Time Series   │
│ • Real-time     │    │ • Authentication │    │ • Views         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌──────────────────┐              │
         └──────────────►│  Shared Types    │◄─────────────┘
                        │  (TypeScript)    │
                        └──────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

---

**Security Notice**: This tool is intended for legitimate security research and personal privacy protection. Users are responsible for complying with all applicable laws and regulations regarding wireless monitoring and data collection.