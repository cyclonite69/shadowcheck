# ShadowCheck SIGINT Forensics Platform - Technical Analysis Report

## Executive Summary

ShadowCheck is a comprehensive Signals Intelligence (SIGINT) forensics platform built for wireless network analysis and spatial intelligence operations. The system features a modern React frontend with a TypeScript Express backend, utilizing PostgreSQL with PostGIS for advanced spatial queries.

---

## System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Mapbox GL JS
- **Backend**: Express.js + Node.js + TypeScript
- **Database**: PostgreSQL 15+ with PostGIS extension
- **ORM**: Drizzle ORM with type-safe operations
- **UI Framework**: Shadcn/ui + Radix UI components
- **Authentication**: Session-based with Helmet.js security

### Architecture Pattern
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server  │◄──►│  PostgreSQL+    │
│   (Frontend)    │    │   (Backend)      │    │  PostGIS        │
│                 │    │                  │    │  (Database)     │
│ • Mapbox Maps   │    │ • REST API       │    │ • Spatial Data  │
│ • Tailwind UI   │    │ • Type Safety    │    │ • Time Series   │
│ • Real-time     │    │ • Authentication │    │ • Views         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## Database Schema (PostgreSQL + PostGIS)

### Core Tables

#### `app.networks` - WiFi Network Registry
Normalized table storing unique WiFi networks with temporal tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigserial | PRIMARY KEY | Auto-incrementing unique identifier |
| bssid | text | NOT NULL, UNIQUE | WiFi MAC address (unique identifier) |
| first_seen_at | timestamptz | NOT NULL | First observation timestamp |
| last_seen_at | timestamptz | NOT NULL | Most recent observation |
| current_ssid | text | | Current network name (can change) |
| current_frequency | integer | | Current WiFi frequency |
| current_capabilities | text | | Security capabilities string |
| created_at | timestamptz | DEFAULT NOW() | Record creation time |
| updated_at | timestamptz | DEFAULT NOW() | Last modification time |

**Indexes**: 
- Primary key on `id`
- Unique constraint on `bssid`
- B-tree index on `bssid` for fast lookups
- B-tree index on `last_seen_at DESC` for temporal queries

#### `app.locations` - GPS Scan Locations
Normalized table storing GPS coordinates where scans occurred.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigserial | PRIMARY KEY | Auto-incrementing unique identifier |
| latitude | decimal(10,8) | NOT NULL | GPS latitude coordinate |
| longitude | decimal(11,8) | NOT NULL | GPS longitude coordinate |
| altitude | decimal(8,2) | | Elevation in meters |
| accuracy | decimal(6,2) | | GPS accuracy in meters |
| observed_at | timestamptz | NOT NULL | Observation timestamp |
| device_id | text | DEFAULT 'termux_import' | Scanner device identifier |
| created_at | timestamptz | DEFAULT NOW() | Record creation time |

**Constraints**:
- `UNIQUE(latitude, longitude, observed_at)` - Prevents duplicate location/time combinations

#### `app.network_observations` - Junction Table
Links networks to locations, maintaining referential integrity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigserial | PRIMARY KEY | Auto-incrementing unique identifier |
| network_id | bigint | NOT NULL, FK → networks(id) | References networks table |
| location_id | bigint | NOT NULL, FK → locations(id) | References locations table |
| signal_strength | integer | | Signal level in dBm |
| observed_at | timestamptz | NOT NULL | Observation timestamp |
| frequency_at_time | integer | | Frequency when observed |
| capabilities_at_time | text | | Security capabilities when observed |
| created_at | timestamptz | DEFAULT NOW() | Record creation time |

**Foreign Keys**:
- `network_observations_network_id_fkey`: CASCADE DELETE
- `network_observations_location_id_fkey`: CASCADE DELETE

#### `app.routes` - GPS Tracking Data
Independent GPS tracking with visibility counts.

| Column | Type | Description |
|--------|------|-------------|
| _id | bigint | Primary key identity column |
| run_id | integer | Tracking session identifier |
| wifi_visible | integer | WiFi networks visible count (default: 0) |
| cell_visible | integer | Cellular networks visible count (default: 0) |
| bt_visible | integer | Bluetooth devices visible count (default: 0) |
| lat | double precision | GPS latitude |
| lon | double precision | GPS longitude |
| altitude | double precision | Elevation |
| accuracy | double precision | GPS accuracy |
| time | bigint | Unix timestamp |

#### `app.ieee_ouis` - MAC Vendor Lookup
IEEE OUI registry for MAC address vendor identification.

| Column | Type | Description |
|--------|------|-------------|
| assignment | text | OUI assignment identifier (PRIMARY KEY) |
| organization_name | text | Vendor/organization name |
| organization_address | text | Vendor address |

### Relationships and Integrity

**Foreign Key Relationships**:
```
networks (1) ←→ (many) network_observations
locations (1) ←→ (many) network_observations
```

**Benefits**:
- Data consistency through referential integrity
- Cascade deletes prevent orphaned records
- Database-level validation of relationships
- Query optimization through proper indexing

---

## REST API Endpoints

### System Endpoints

#### `GET /api/v1/health`
**Purpose**: Service health check  
**Response**: Service status and timestamp  
**Auth**: None required  

#### `GET /api/v1/version`
**Purpose**: Service version information  
**Response**: Name, version, description  
**Auth**: None required  

#### `GET /api/v1/config`
**Purpose**: Frontend configuration  
**Response**: Mapbox token and client settings  
**Auth**: None required  

#### `GET /api/v1/status`
**Purpose**: Comprehensive system status  
**Response**: Database connection, memory usage, uptime  
**Auth**: None required  
**Details**: 
- Database connection status
- Active/max connections
- PostGIS availability
- Memory utilization
- Process uptime

### Data Endpoints

#### `GET /api/v1/networks`
**Purpose**: Retrieve network observation data  
**Parameters**: 
- `limit` (optional): Max results (1-100, default: 50)
**Response**: Array of network objects with metadata  
**Auth**: Database connection required  
**Error Handling**: 501 if database disconnected  

#### `GET /api/v1/visualize`
**Purpose**: GeoJSON data for mapping visualization  
**Response**: GeoJSON FeatureCollection with Point features  
**Features**: Filters out records without coordinates  
**Limit**: 1000 networks maximum  
**Auth**: Database connection required  

#### `GET /api/v1/within`
**Purpose**: Spatial proximity queries using PostGIS  
**Parameters**:
- `lat`: Latitude (-90 to 90)
- `lon`: Longitude (-180 to 180) 
- `radius`: Search radius in meters (1-50000)
- `limit`: Max results (1-100, default: 50)
**Response**: Networks within specified radius  
**Validation**: Comprehensive parameter validation  
**Requirements**: PostGIS extension  

#### `GET /api/v1/analytics`
**Purpose**: Network analytics and statistics  
**Response**: Aggregated network metrics  
**Auth**: Database connection required  

#### `GET /api/v1/signal-strength`
**Purpose**: Signal strength distribution analysis  
**Response**: Signal strength histogram data  
**Auth**: Database connection required  

#### `GET /api/v1/locations`
**Purpose**: GPS location data  
**Parameters**: 
- `limit` (optional): Max results (default: 50)
**Response**: Array of location objects  
**Auth**: Database connection required  

#### `GET /api/v1/locations/:bssid`
**Purpose**: Locations where specific BSSID was observed  
**Parameters**: 
- `bssid`: WiFi MAC address (path parameter)
**Response**: Array of location objects for specific network  
**Auth**: Database connection required  

#### `GET /api/v1/security-analysis`
**Purpose**: Security capability analysis  
**Response**: Security classification statistics  
**Auth**: Database connection required  

### Vector Tiles Endpoints

#### `GET /api/v1/tiles/:z/:x/:y.mvt`
**Purpose**: Serve vector tiles for high-performance mapping  
**Parameters**: 
- `z`: Zoom level
- `x`: Tile X coordinate  
- `y`: Tile Y coordinate
**Response**: PMTiles or redirect to static tiles  
**Fallback**: Returns 404 if tiles not generated  

#### `GET /api/v1/tiles-dynamic/:z/:x/:y.mvt`
**Purpose**: Generate tiles on-demand from database  
**Response**: GeoJSON (MVT conversion pending)  
**Limits**: 1000 features per tile  
**Bbox**: Calculated tile bounds for spatial filtering  

---

## Frontend Implementation

### Core Components

#### App.tsx - Main Application Shell
- **Layout**: 3-column responsive grid (nav/map/alerts)
- **Design**: Dark mode (#001A00) with teal accents (#00D9E1)
- **Effects**: Glassy backdrop-blur styling throughout
- **Map**: Mapbox Standard integration with native mapbox-gl
- **Responsive**: Mobile-first design with proper flex layouts

#### Components

##### Heatmap.tsx
- **Purpose**: ScatterChart visualization using recharts
- **Data**: Signal strength scatter plot
- **Styling**: Glassy container with teal accent colors

##### DraggableAlert.tsx  
- **Purpose**: Draggable alert cards using react-draggable
- **Icons**: Lucide-react AlertCircle icons
- **UX**: Interactive dragging with visual feedback

##### NetworkMap.tsx (Legacy)
- **Purpose**: Advanced Mapbox integration with vector tiles
- **Features**: Standard/vector tile toggle, GPS centering, radio filters
- **Performance**: PMTiles support for large datasets

### Styling System
- **Framework**: Tailwind CSS with custom glassy effects
- **Theme**: Dark SIGINT forensics aesthetic
- **Effects**: `backdrop-filter: blur(10px)` with rgba overlays
- **Icons**: Lucide-react (Wifi, AlertCircle, LayoutDashboard)
- **Responsive**: Mobile-responsive with proper breakpoints

---

## Security Features

### Backend Security
- **Helmet.js**: Security headers and XSS protection
- **CORS**: Configurable cross-origin resource sharing  
- **Validation**: Parameter validation and sanitization
- **Error Handling**: Graceful error responses without data leakage

### Database Security
- **Role-based Access**: Read-only and read-write roles
- **Connection Security**: SSL required for connections
- **Environment Variables**: Secure credential management
- **Foreign Keys**: Referential integrity enforcement

### Data Protection
- **No Hardcoded Secrets**: Environment variable configuration
- **Graceful Degradation**: Service continues without database
- **Input Validation**: Type-safe parameter checking
- **Error Boundaries**: Contained failure modes

---

## Performance Optimizations

### Database
- **Indexes**: Optimized for common query patterns
- **Foreign Keys**: Enable query planner optimizations  
- **Connection Pooling**: Efficient database connections
- **Spatial Indexes**: PostGIS GIST indexes for geometry queries

### Frontend
- **Code Splitting**: Lazy loading of components
- **Vector Tiles**: Efficient map rendering for large datasets
- **Caching**: Browser caching of static assets
- **TypeScript**: Compile-time optimizations

### API Design
- **Pagination**: Configurable result limits
- **Data Filtering**: Server-side filtering to reduce payload
- **Response Compression**: Automatic gzip compression
- **Error Caching**: Appropriate cache headers

---

## Data Provenance and Migration

### Source Data
- **Origin**: WiGLE Android app SQLite exports
- **Size**: ~200MB+ datasets (location: 85MB, network: 38MB)
- **Format**: SQLite → PostgreSQL migration
- **Tools**: Custom ETL scripts in `scripts/migration/`

### Migration Features
- **Two-phase Import**: SQLite to PostgreSQL conversion
- **Schema Normalization**: Flat to relational structure transformation
- **Security Classification**: WiFi security parsing (WPA3, WPA2, WEP, etc.)
- **Spatial Enhancement**: PostGIS geometry column addition
- **Audit Trails**: Complete migration logging

### Data Quality
- **Referential Integrity**: Foreign key constraints
- **Duplicate Prevention**: Unique constraints on location/time
- **Type Safety**: Strong typing throughout stack
- **Validation**: Multi-layer validation (DB, API, Frontend)

---

## Deployment Architecture

### Environment Configuration
```env
DATABASE_URL=postgresql://<USER>:<PASS>@<HOST>:5432/<DB>?sslmode=require
MAPBOX_ACCESS_TOKEN=<mapbox_token>
NODE_ENV=production
```

### Database Requirements
- **PostgreSQL**: Version 15+ required
- **PostGIS**: Spatial extension for geographic queries
- **Roles**: app_ro (read-only), app_rw (read-write)
- **SSL**: Required for secure connections

### Production Considerations
- **Database**: Neon/AWS RDS recommended for production
- **Static Assets**: CDN for frontend distribution
- **API Gateway**: Rate limiting and authentication
- **Monitoring**: Health checks and performance metrics

---

## Use Cases and Applications

### SIGINT Forensics
- **Network Tracking**: Monitor WiFi network movements
- **Signal Analysis**: Analyze signal strength patterns
- **Temporal Correlation**: Track network appearance over time
- **Spatial Intelligence**: Geographic distribution analysis

### Counter-Surveillance  
- **Device Tracking**: Identify repeated devices across locations
- **Rogue Access Points**: Detect network spoofing attempts
- **Pattern Analysis**: Unusual signal behavior detection
- **IMSI Catcher Detection**: Cell tower inconsistency analysis

### Security Research
- **WiFi Security Audit**: Network security classification
- **Vendor Analysis**: MAC address OUI lookups
- **Coverage Mapping**: Network density analysis
- **Vulnerability Assessment**: Open network identification

---

## Technical Debt and Future Enhancements

### Immediate Improvements
1. **Vector Tiles**: Complete MVT implementation for tiles-dynamic endpoint
2. **PostGIS Enhancement**: Add geometry columns to locations table
3. **Authentication**: Implement user authentication system
4. **Real-time Updates**: WebSocket integration for live data

### Performance Enhancements
1. **Database Partitioning**: Time-based partitioning for large datasets
2. **Caching Layer**: Redis for frequently accessed data
3. **API Rate Limiting**: Prevent abuse and ensure fair usage
4. **Background Processing**: Queue system for heavy operations

### Feature Additions
1. **Export Functionality**: Data export in multiple formats
2. **Alert System**: Automated anomaly detection
3. **Reporting**: PDF/dashboard report generation
4. **Machine Learning**: Pattern recognition and prediction

---

## Conclusion

ShadowCheck represents a sophisticated SIGINT forensics platform combining modern web technologies with advanced spatial database capabilities. The system provides a robust foundation for wireless network analysis, counter-surveillance operations, and security research.

The normalized database schema ensures data integrity while supporting complex spatial queries. The TypeScript-based full-stack architecture provides type safety and maintainability. The responsive frontend offers an intuitive interface for complex data visualization and analysis.

The platform successfully balances performance, security, and usability, making it suitable for both research and operational environments.

---

**Generated**: $(date)  
**Version**: 1.0.0  
**Platform**: ShadowCheck SIGINT Forensics  