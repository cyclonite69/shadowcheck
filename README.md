<div align="center">

# 🛡️ ShadowCheck

### SIGINT Forensics Platform for Wireless Analysis

[![GitHub Stars](https://img.shields.io/github/stars/cyclonite69/shadowcheck?style=for-the-badge&logo=github&color=yellow)](https://github.com/cyclonite69/shadowcheck/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/cyclonite69/shadowcheck?style=for-the-badge&logo=github&color=blue)](https://github.com/cyclonite69/shadowcheck/network)
[![GitHub Issues](https://img.shields.io/github/issues/cyclonite69/shadowcheck?style=for-the-badge&logo=github&color=red)](https://github.com/cyclonite69/shadowcheck/issues)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**A professional-grade SIGINT forensics and analysis platform for wireless network data with advanced spatial correlation, real-time monitoring, and comprehensive surveillance detection.**

[🚀 Quick Start](#-quickstart-docker-compose) • [📖 Documentation](#-table-of-contents) • [🤝 Contributing](#-contributing) • [⭐ Star this repo](#)

</div>

---

## 🌟 Why ShadowCheck?

ShadowCheck transforms raw wireless capture data into actionable intelligence through powerful spatial analysis and intuitive visualizations. Built for security researchers, forensic analysts, and SIGINT professionals who need enterprise-grade tools for wireless network investigation.

### ✨ Key Features

<table>
<tr>
<td width="50%">

#### 🗺️ **Geospatial Intelligence**
- PostGIS-powered spatial indexing and queries
- Interactive Mapbox visualizations
- Radius search and geo-fencing
- Multi-radio tracking (WiFi, BLE, Cellular)

#### 🔍 **Advanced Analytics**
- Surveillance pattern detection
- Network behavior analysis
- Signal strength correlation
- Temporal tracking and timelines

</td>
<td width="50%">

#### 🎯 **Data Enrichment**
- WiGLE API integration
- MAC vendor lookup (300K+ OUIs)
- Automated geolocation tagging
- Multi-source data federation

#### 🛡️ **Enterprise Ready**
- Docker-based deployment
- Prometheus + Grafana monitoring
- Centralized logging (Loki)
- RESTful API architecture

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

### Interactive Geospatial Map
*Real-time network visualization with clustering and signal range indicators*

### Analytics Dashboard
*Comprehensive metrics, security analysis, and temporal patterns*

### Surveillance Detection
*Automated threat detection and behavioral analysis*

> **Note:** Add screenshots to `docs/images/` directory for maximum visual impact!

</div>

---

## 🚀 Quickstart (Docker Compose)

Get ShadowCheck running in **under 5 minutes**:

```bash
# 1. Clone the repository
git clone https://github.com/cyclonite69/shadowcheck.git
cd shadowcheck

# 2. Configure environment
cp .env.example .env
# Edit .env with your secure passwords

# 3. Start all services
docker compose up --build

# 4. Access the platform
# Frontend:  http://localhost:3001
# Grafana:   http://localhost:3000
# API:       http://localhost:5000
```

**⚡ That's it!** Your SIGINT platform is now running with:
- PostgreSQL 18 + PostGIS spatial database
- Real-time monitoring (Prometheus + Grafana)
- Centralized logging (Loki + Promtail)
- Full-featured React frontend

---

## 📋 Table of Contents

- [Why ShadowCheck?](#-why-shadowcheck)
- [Architecture](#-architecture)
- [Installation](#-installation)
  - [Docker Deployment](#docker-deployment-recommended)
  - [Manual Setup](#manual-local-setup)
- [Configuration](#-configuration)
- [Usage & API](#-usage--api)
- [Data Pipelines](#-data-pipelines)
- [Security](#-security--privacy)
- [Monitoring](#-monitoring--observability)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ShadowCheck Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   React UI   │─────▶│  Express API │─────▶│ PostgreSQL│ │
│  │   (Vite)     │      │  TypeScript  │      │  + PostGIS│ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │        │
│         │              ┌───────▼─────────┐          │        │
│         │              │  Data Pipelines │          │        │
│         │              ├─────────────────┤          │        │
│         │              │ • KML Import    │          │        │
│         │              │ • Kismet CSV    │          │        │
│         │              │ • WiGLE API     │          │        │
│         │              └─────────────────┘          │        │
│         │                                            │        │
│  ┌──────▼─────────────────────────────────────────▼──────┐ │
│  │          Monitoring & Observability Stack              │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Prometheus │ Grafana │ Loki │ AlertManager           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React + TypeScript + Vite | Modern, responsive UI |
| **Backend** | Node.js + Express | RESTful API server |
| **Database** | PostgreSQL 18 + PostGIS | Spatial data storage |
| **Mapping** | Mapbox GL JS | Interactive visualizations |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |
| **Logging** | Loki + Promtail | Centralized log aggregation |
| **Container** | Docker + Docker Compose | Deployment orchestration |

---

## 💻 Installation

### Docker Deployment (Recommended)

**Requirements:**
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 10GB+ disk space

**Step-by-step:**

1. **Clone and configure:**
```bash
git clone https://github.com/cyclonite69/shadowcheck.git
cd shadowcheck
cp .env.example .env
```

2. **Set secure passwords in `.env`:**
```bash
POSTGRES_PASSWORD=your_secure_postgres_password_here
GRAFANA_PASSWORD=your_secure_grafana_password_here
PGADMIN_PASSWORD=your_secure_pgadmin_password_here  # Optional
```

3. **Launch services:**
```bash
# Core services
docker compose up -d

# With pgAdmin (database management UI)
docker compose --profile admin up -d
```

4. **Verify deployment:**
```bash
docker compose ps
docker compose logs -f backend
```

5. **Access interfaces:**
- **Frontend:** http://localhost:3001
- **API Docs:** http://localhost:5000/api/v1/health
- **Grafana:** http://localhost:3000 (admin / your_grafana_password)
- **Prometheus:** http://localhost:9091
- **pgAdmin:** http://localhost:8080 (admin@shadowcheck.local / your_pgadmin_password)

### Manual Local Setup

<details>
<summary>Click to expand manual installation guide</summary>

**Prerequisites:**
- Node.js 18+
- PostgreSQL 14+ with PostGIS
- npm/pnpm/yarn

**Backend Setup:**
```bash
cd server
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npm run dev
```

**Frontend Setup:**
```bash
cd client
npm install
cp .env.example .env
# Configure VITE_API_URL in .env
npm run dev
```

**Database Setup:**
```sql
-- Create user and database
CREATE USER shadowcheck_user WITH PASSWORD 'secure_password';
CREATE DATABASE shadowcheck OWNER shadowcheck_user;

-- Connect and enable PostGIS
\c shadowcheck
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Apply schema
\i schema/migration.sql
```

</details>

---

## ⚙️ Configuration

### Environment Variables

All configuration is managed through environment files. **Never commit `.env` to version control.**

**Required Variables:**
```bash
# Database
POSTGRES_PASSWORD=strong_unique_password_32_chars_min
DATABASE_URL=postgresql://shadowcheck_user:${POSTGRES_PASSWORD}@localhost:5432/shadowcheck

# Monitoring
GRAFANA_PASSWORD=strong_unique_password_for_grafana

# Optional: Database Admin UI
PGADMIN_PASSWORD=strong_unique_password_for_pgadmin

# Optional: Mapbox (for enhanced mapping)
MAPBOX_TOKEN=your_mapbox_public_token_here
```

### Security Best Practices

- ✅ Use **32+ character passwords** with mixed case, numbers, and symbols
- ✅ Different passwords for each service
- ✅ Use secrets manager in production (AWS Secrets, Vault, etc.)
- ✅ Enable TLS/HTTPS for all external connections
- ✅ Restrict database access to localhost or VPN
- ✅ Regular security updates and dependency scanning

---

## 🔧 Usage & API

### REST API Endpoints

ShadowCheck exposes a comprehensive RESTful API:

#### **System Health**
```bash
GET /api/v1/health          # Health check
GET /api/v1/status          # Detailed system status
GET /api/v1/version         # API version info
GET /api/v1/metrics         # System metrics
```

#### **Network Observations**
```bash
GET /api/v1/networks        # List all networks (paginated)
GET /api/v1/within          # Spatial radius search
GET /api/v1/visualize       # GeoJSON for mapping
```

#### **Analytics**
```bash
GET /api/v1/analytics          # Comprehensive overview
GET /api/v1/security-analysis  # Security breakdown
GET /api/v1/signal-strength    # Signal distribution
GET /api/v1/radio-stats        # Multi-radio statistics
GET /api/v1/timeline           # Temporal patterns
```

#### **Surveillance Detection**
```bash
GET /api/v1/surveillance/stats              # Detection statistics
GET /api/v1/surveillance/wifi/threats       # WiFi threat analysis
GET /api/v1/surveillance/location-visits    # Location patterns
GET /api/v1/surveillance/home-following     # Following detection
```

#### **Access Points**
```bash
GET /api/v1/access-points              # Detailed AP list
GET /api/v1/access-points/:mac         # Single AP details
GET /api/v1/access-points/:mac/observations  # AP timeline
```

#### **WiGLE Enrichment**
```bash
GET /api/v1/wigle/stats            # Enrichment statistics
GET /api/v1/wigle/queue            # Pending enrichments
POST /api/v1/wigle/tag             # Tag networks for enrichment
POST /api/v1/wigle/enrich          # Trigger enrichment
```

### Example Usage

```bash
# Spatial query: networks within 500m radius
curl "http://localhost:5000/api/v1/within?lat=43.0234&lon=-83.6968&radius=500"

# Security analysis with filters
curl "http://localhost:5000/api/v1/networks?radio_types=W&min_signal=-70&security_types=Open"

# Surveillance threat detection
curl "http://localhost:5000/api/v1/surveillance/wifi/threats"
```

---

## 🔄 Data Pipelines

ShadowCheck supports multiple ingestion formats:

### 1. **KML Import** (Google Earth/Maps)
```bash
# Place KML files in pipelines/kml/
# Import via admin UI or API
curl -X POST http://localhost:5000/api/v1/pipelines/kml/import \
  -H "Content-Type: application/json" \
  -d '{"filename": "my_networks.kml"}'
```

### 2. **Kismet CSV** (Wireless IDS)
```bash
# Place Kismet CSV exports in pipelines/kismet/
# Automatic detection and import
```

### 3. **WiGLE CSV** (Wardriving data)
```bash
# Place WiGLE CSV files in pipelines/wigle/
# Import with geolocation enrichment
```

### 4. **Live Streaming** (Planned)
- Kismet remote capture
- Real-time MQTT ingestion
- Kafka stream processing

---

## 🔒 Security & Privacy

ShadowCheck handles sensitive SIGINT data. Security is paramount:

### Access Control
- Role-based access control (RBAC) on all API endpoints
- JWT authentication with refresh tokens
- Rate limiting and request throttling
- IP whitelisting for admin functions

### Data Protection
- Encrypted connections (TLS 1.3+)
- Encrypted database backups
- PII scrubbing and anonymization options
- Audit logging for all data access

### Compliance
- GDPR-compliant data retention policies
- Configurable data retention periods
- Export and deletion capabilities
- Comprehensive audit trails

### Best Practices
1. Always use HTTPS in production
2. Enable database encryption at rest
3. Regular security audits and penetration testing
4. Keep dependencies updated
5. Monitor for suspicious activity

---

## 📊 Monitoring & Observability

ShadowCheck includes enterprise-grade monitoring:

### Grafana Dashboards
- **System Overview:** Resource usage, uptime, API performance
- **Database Metrics:** Connection pool, query performance, storage
- **Application Metrics:** Request rates, error rates, latency
- **Security Dashboard:** Failed auth, suspicious patterns

### Prometheus Metrics
- Custom application metrics
- Database connection pool monitoring
- API endpoint performance tracking
- Real-time alerting

### Loki Log Aggregation
- Centralized logging from all containers
- Log correlation and search
- Alert triggers on log patterns
- Long-term log retention

**Access monitoring:**
- Grafana: http://localhost:3000 (username: admin)
- Prometheus: http://localhost:9091
- View logs: `docker compose logs -f [service]`

---

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### Ways to Contribute
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🧪 Add tests and improve coverage
- 🔧 Submit bug fixes
- ✨ Implement new features

### Development Workflow
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/shadowcheck.git`
3. **Create** a feature branch: `git checkout -b feat/amazing-feature`
4. **Make** your changes with tests
5. **Commit** with clear messages: `git commit -m "feat: Add amazing feature"`
6. **Push** to your fork: `git push origin feat/amazing-feature`
7. **Open** a Pull Request with detailed description

### Code Style
- Follow existing code formatting
- Use TypeScript for type safety
- Write meaningful commit messages (conventional commits)
- Add tests for new features
- Update documentation as needed

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🗺️ Roadmap

### ✅ Current Release (v1.0)
- ✅ PostgreSQL + PostGIS spatial database
- ✅ Interactive Mapbox visualizations
- ✅ Multi-source data ingestion (KML, CSV)
- ✅ WiGLE API enrichment
- ✅ Surveillance pattern detection
- ✅ Comprehensive monitoring stack

### 🚧 In Progress
- 🔄 Real-time streaming ingestion (Kafka)
- 🔄 Advanced ML-based threat detection
- 🔄 Multi-tenancy support
- 🔄 Mobile app (React Native)

### 📅 Planned
- 📋 Vector tile support for massive datasets
- 📋 3D visualization with Cesium
- 📋 MISP integration for threat intelligence
- 📋 Automated PDF report generation
- 📋 OAuth2/SAML authentication
- 📋 Elasticsearch integration
- 📋 Graph database correlation (Neo4j)
- 📋 AI-powered anomaly detection

### 💭 Under Consideration
- Signal triangulation algorithms
- RF spectrum analysis integration
- Hardware device integration (SDR)
- Blockchain-based evidence chain

**Have ideas?** [Open an issue](https://github.com/cyclonite69/shadowcheck/issues/new) or start a [Discussion](https://github.com/cyclonite69/shadowcheck/discussions)!

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What This Means:
- ✅ Use for personal and commercial projects
- ✅ Modify and distribute
- ✅ Private use
- ❌ No liability or warranty

---

## 🙏 Acknowledgements

ShadowCheck is built on the shoulders of giants:

### Core Technologies
- [PostgreSQL](https://www.postgresql.org/) - World's most advanced open source database
- [PostGIS](https://postgis.net/) - Spatial database extender for PostgreSQL
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Mapbox GL JS](https://www.mapbox.com/) - Interactive maps library
- [Express](https://expressjs.com/) - Fast, unopinionated web framework
- [Docker](https://www.docker.com/) - Containerization platform

### Monitoring Stack
- [Prometheus](https://prometheus.io/) - Systems monitoring and alerting
- [Grafana](https://grafana.com/) - Analytics and monitoring platform
- [Loki](https://grafana.com/oss/loki/) - Log aggregation system

### Special Thanks
- WiGLE.net for wireless network database API
- Kismet project for wireless IDS inspiration
- The open-source security research community

---

## 📞 Support & Contact

### Get Help
- 📖 [Documentation](docs/)
- 💬 [Discussions](https://github.com/cyclonite69/shadowcheck/discussions)
- 🐛 [Issue Tracker](https://github.com/cyclonite69/shadowcheck/issues)
- 📧 Contact: [@cyclonite69](https://github.com/cyclonite69)

### Stay Connected
- ⭐ [Star this repo](https://github.com/cyclonite69/shadowcheck) to show support
- 👁️ [Watch](https://github.com/cyclonite69/shadowcheck/subscription) for updates
- 🍴 [Fork](https://github.com/cyclonite69/shadowcheck/fork) to contribute

---

<div align="center">

### ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cyclonite69/shadowcheck&type=Date)](https://star-history.com/#cyclonite69/shadowcheck&Date)

### Made with ❤️ by [@cyclonite69](https://github.com/cyclonite69)

**If you find ShadowCheck useful, please consider giving it a ⭐!**

[Report Bug](https://github.com/cyclonite69/shadowcheck/issues) • [Request Feature](https://github.com/cyclonite69/shadowcheck/issues) • [Contribute](CONTRIBUTING.md)

</div>

---

<div align="center">
<sub>Built for security researchers, by security researchers.</sub>
</div>
