# ShadowCheck - SIGINT Forensics API

## Overview

ShadowCheck is a full-stack web application designed for SIGINT (Signal Intelligence) forensics analysis, specifically focused on wireless network observations and cellular data collection. The application provides a comprehensive dashboard for monitoring, analyzing, and visualizing wireless network detections with spatial query capabilities powered by PostGIS.

The system serves as a forensics tool for analyzing wireless infrastructure, offering real-time monitoring of WiFi networks and cellular towers with geospatial analysis capabilities. It's built as a modern web application with a React frontend and Express.js backend, designed for security professionals and researchers working with wireless signal intelligence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with a custom dark theme optimized for forensics applications
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development Setup**: Hot reload with Vite integration for full-stack development

### Data Storage Solutions
- **Primary Database**: PostgreSQL with PostGIS extension for spatial data operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **Connection Pooling**: Neon serverless connection pooling with WebSocket support

### Core Data Models
- **Networks Table**: Stores WiFi network observations with SSID, BSSID, signal strength, encryption, and geospatial coordinates
- **Cells Table**: Tracks cellular tower information including cell ID, LAC, MNC, MCC, and location data  
- **Users Table**: Basic user management with username/password authentication
- **Spatial Indexing**: PostGIS GIST indexes on geometry columns for efficient spatial queries

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security Middleware**: Helmet.js for security headers and CORS configuration
- **Database Security**: Environment-based database connection strings with validation

### API Endpoints Structure
- **Health Monitoring**: `/api/v1/health` and `/api/v1/status` for system health checks
- **Network Operations**: `/api/v1/networks` for retrieving wireless network observations
- **Spatial Queries**: `/api/v1/within` for geospatial radius-based network searches
- **Version Information**: `/api/v1/version` for API version and service metadata

### Development and Build System
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Development Tools**: Replit integration with runtime error overlays and cartographer plugin
- **Path Aliases**: Configured path mapping for clean imports across client, server, and shared code

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with built-in connection pooling
- **PostGIS**: Spatial database extension for geographic information systems
- **WebSocket Support**: For real-time database connections via `ws` package
- **Security**: SCRAM-SHA-256 password encryption with SSL/TLS certificate validation
- **Authentication**: Session-based with PostgreSQL session store for production security

### UI and Component Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives including dialogs, dropdowns, navigation
- **Lucide React**: Modern icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Class Variance Authority**: Type-safe variant API for component styling

### Development and Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Type-safe JavaScript with strict configuration
- **ESBuild**: Fast JavaScript bundler for backend compilation
- **TSX**: TypeScript execution for development server

### Data Management
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: TypeScript-first schema validation
- **Date-fns**: Modern date utility library for time-based operations

### Security and Networking
- **Helmet**: Security middleware for Express.js applications
- **CORS**: Cross-Origin Resource Sharing configuration
- **Express Session**: Session middleware with PostgreSQL backing store