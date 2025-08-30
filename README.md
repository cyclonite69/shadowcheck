# ShadowCheck - SIGINT Forensics Platform

A comprehensive Signal Intelligence (SIGINT) forensics platform designed for wireless network analysis and spatial intelligence operations.

## Features

- **Real-time Network Monitoring** - Track WiFi networks and cellular signals
- **Interactive GIS Visualization** - Mapbox-powered spatial analysis
- **Forensics Dashboard** - Security analysis and signal strength monitoring  
- **PostGIS Spatial Queries** - Advanced geographic data operations
- **Dark Cyber Theme** - Professional forensics interface design

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with PostGIS extension
- **Mapping**: Mapbox GL JS
- **UI Components**: Shadcn/ui + Radix UI

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
DATABASE_URL=your_postgresql_connection_string
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

3. Push database schema:
```bash
npm run db:push
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## API Endpoints

- `GET /api/v1/health` - Service health check
- `GET /api/v1/networks` - Network observations data
- `GET /api/v1/visualize` - GeoJSON data for mapping
- `GET /api/v1/within` - Spatial proximity queries
- `GET /api/v1/analytics` - Network analytics data

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

## License

MIT License