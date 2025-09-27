# ShadowCheck - SIGINT Forensics Platform

ShadowCheck is a comprehensive Signals Intelligence (SIGINT) forensics platform designed for wireless network analysis, real-time monitoring, and spatial intelligence operations. It provides a suite of tools for professionals and enthusiasts to detect, analyze, and visualize wireless network traffic, with a focus on counter-surveillance and security analysis.

_This README has been updated to provide a more comprehensive overview of the project, including a detailed API endpoint reference._

## Features

- **Real-time Network Monitoring**: Track WiFi, Bluetooth, and cellular signals in real-time.
- **Interactive GIS Visualization**: A Mapbox-powered interface for advanced spatial analysis of network data.
- **Forensics Dashboard**: A comprehensive dashboard for security analysis, signal strength monitoring, and data exploration.
- **Advanced Spatial Queries**: Utilizes PostGIS for powerful geographic data operations, including proximity searches and route analysis.
- **Data Import & Integration**: Supports data import from various sources, including WiGLE (Android app backup and web API) and Kismet.
- **Temporal Network Tracking**: Detects and analyzes network changes over time, including SSID changes and BSSID walking.
- **Security Analysis**: Automated detection of potential security threats, such as MAC spoofing and colocation patterns (stalking detection).
- **Chain of Custody**: Forensic-grade audit trails for data integrity and provenance.

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with PostGIS extension
- **Mapping**: Mapbox GL JS, Kepler.gl
- **UI Components**: Shadcn/ui, Radix UI

## Architecture

The ShadowCheck platform is built on a modern, full-stack TypeScript architecture, designed for performance, scalability, and real-time data analysis.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server  │◄──►│  PostgreSQL+    │
│   (Frontend)    │    │   (Backend)      │    │  PostGIS        │
│                 │    │                  │    │  (Database)     │
│ • Mapbox/Kepler │    │ • REST API       │    │ • Spatial Data  │
│ • Tailwind UI   │    │ • Type Safety    │    │ • Time Series   │
│ • Real-time     │    │ • Authentication │    │ • Views         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌──────────────────┐              │
         └──────────────►│  Shared Types    │◄─────────────┘
                        │  (TypeScript)    │
                        └──────────────────┘
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or higher)
- `npm`

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd shadowcheck
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following:

    ```env
    DATABASE_URL=postgresql://shadowcheck:your_secure_password_here@localhost:5432/shadowcheck
    MAPBOX_ACCESS_TOKEN=<your_mapbox_token>
    ```

    **Note:** The `DATABASE_URL` should match the credentials in the `docker-compose.yml` file.

4.  **Start the services:**

    ```bash
    docker-compose up -d
    ```

    This will start the PostgreSQL database with the PostGIS extension.

5.  **Run the database schema deployment:**

    ```bash
    ./deploy.sh
    ```

6.  **Start the application:**

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

## API Endpoints

The backend provides a RESTful API for programmatic access to the data.

### General

| Method | Endpoint                | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| `GET`  | `/api/v1/health`        | Service health check                      |
| `GET`  | `/api/v1/version`       | Get application version information       |
| `GET`  | `/api/v1/config`        | Get frontend configuration                |
| `GET`  | `/api/v1/status`        | Detailed status of the service and database |

### Network Data

| Method | Endpoint                | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| `GET`  | `/api/v1/networks`      | Get network observations data             |
| `GET`  | `/api/v1/networks_v2`   | Get enriched network observations data    |
| `GET`  | `/api/v1/within`        | Perform spatial proximity queries         |
| `GET`  | `/api/v1/visualize`     | Get GeoJSON data for mapping              |

### Analytics & Statistics

| Method | Endpoint                  | Description                               |
| ------ | ------------------------- | ----------------------------------------- |
| `GET`  | `/api/v1/analytics`       | Get network analytics data                |
| `GET`  | `/api/v1/signal-strength` | Get signal strength distribution analysis |
| `GET`  | `/api/v1/security-analysis`| Get security analysis of detected networks|
| `GET`  | `/api/v1/radio-stats`     | Get statistics on radio types             |
| `GET`  | `/api/v1/metrics`         | Get consolidated dashboard data           |

### Surveillance

| Method  | Endpoint                         | Description                                       |
| ------- | -------------------------------- | ------------------------------------------------- |
| `GET`   | `/api/v1/surveillance/federal`   | Get federal surveillance detection analysis       |
| `GET`   | `/api/v1/surveillance/mobility`  | Get high mobility devices analysis              |
| `POST`  | `/api/v1/surveillance/tag`       | Tag a network with a classification             |
| `GET`   | `/api/v1/surveillance/tags`      | Get all network tags or tags for a specific BSSID |
| `GET`   | `/api/v1/surveillance/stats`     | Get surveillance summary statistics             |
| `GET`   | `/api/v1/surveillance/alerts`    | Get surveillance alerts                         |
| `GET`   | `/api/v1/surveillance/alerts/:id`| Get a specific surveillance alert by ID         |
| `PATCH` | `/api/v1/surveillance/alerts/:id`| Update a specific surveillance alert            |

For more details on the API, please refer to the source code in `server/index.ts` and the `server/routes/` directory.

## Database

The database is the core of the ShadowCheck platform. It uses PostgreSQL with the PostGIS extension for efficient storage and querying of spatial data.

### Schema

The database schema is designed to be highly normalized and performant. The key tables include:

-   `app.wireless_access_points`: Stores information about wireless access points.
-   `app.signal_measurements`: Stores individual signal readings.
-   `app.position_measurements`: Stores GPS observations.
-   `app.network_identity_history`: Tracks changes to network identities over time.
-   `app.data_sources`: Stores information about the sources of the data.

For a complete overview of the schema, please refer to the files in the `db/scripts/` directory.

### Data Import

The platform supports importing data from various sources. The import process is handled by a set of scripts and SQL functions.

-   **WiGLE App Backup**: Import data from a WiGLE Android app backup (SQLite).
-   **WiGLE API**: Import data from the WiGLE web API.
-   **Kismet**: Import data from Kismet capture files.

## Security

-   **Data Integrity**: The platform is designed to never mutate source data, preserving all precision for forensic analysis.
-   **Access Control**: The database uses a role-based access control system to ensure that users only have access to the data they are authorized to see.
-   **Secure by Default**: The `docker-compose.yml` is configured to bind services to localhost by default, and the backend uses `helmet` for security-related HTTP headers.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Security Notice**: This tool is intended for legitimate security research and personal privacy protection. Users are responsible for complying with all applicable laws and regulations regarding wireless monitoring and data collection.