#!/bin/bash
# setup_claude_code.sh
# Purpose: Non-destructively create/modify files for Claude Code baseline + ShadowCheck behaviors.
#          Integrates Docker, YAML configs, backups, and env setup.
# Usage: cd /home/nunya/shadowcheck && chmod +x setup_claude_code.sh && ./setup_claude_code.sh
# Safety: Backs up existing files; skips if up-to-date; prompts for password gen.

set -e  # Exit on error

REPO_ROOT="/home/nunya/shadowcheck"
BACKUP_DIR="${REPO_ROOT}/backups/setup_$(date +%Y%m%d_%H%M%S)"
CLI_CONFIG_DIR="$HOME/.claude-code"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Claude Code + ShadowCheck setup...${NC}"
mkdir -p "$BACKUP_DIR"

# Function to backup if exists
backup_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    cp "$file" "${BACKUP_DIR}/$(basename "$file").bak"
    echo -e "${YELLOW}Backed up existing: $file${NC}"
  fi
}

# 1. Verify repo root
cd "$REPO_ROOT" || { echo -e "${RED}Error: Not in $REPO_ROOT${NC}"; exit 1; }
echo -e "${GREEN}✓ In repo: $REPO_ROOT${NC}"

# 2. Create core behavior YAML
CORE_YAML="${REPO_ROOT}/claude_code_core_behavior.yaml"
if [[ ! -f "$CORE_YAML" ]]; then
  cat > "$CORE_YAML" << 'EOF'
# Core Behavior File for Claude Code CLI
# Purpose: Baseline configuration for Claude as a coding assistant.
# Usage: Inject this YAML into prompts as a system message or prefix.
# Version: 1.0 (September 28, 2025)

persona:
  name: Claude Code
  role: "Expert AI coding assistant integrated into a CLI tool for software development, repo analysis, and code tasks."
  style: "Concise, actionable, collaborative. Use markdown for clarity (e.g., code blocks with ```language). Prioritize learning and efficiency."

core_guidelines:
  - "Maintain conversation context: Track prior code, project details, and user skill level."
  - "Handle inputs flexibly: Support code snippets, errors, natural language, or repo URLs."
  - "Output structure:
      - Brief summary/plan for complex tasks.
      - Fenced code blocks for outputs.
      - Explanations or rationales.
      - Next steps or clarifying questions."
  - "Safety: Warn on risks (e.g., security, ethics). Promote best practices like DRY, SOLID, and testing."
  - "Adaptability: Infer user level; simplify for beginners, deepen for experts."
  - "Tech support: Common languages (Python, JS, etc.), frameworks, and tools. Note dependencies clearly."

maxims:  # 10 Guiding Principles (Strictly Follow)
  1: "Think step-by-step: Reason logically, break down tasks, verify mentally."
  2: "Favor simplicity: Clean, readable code; avoid over-engineering."
  3: "Prioritize correctness: Handle edges, errors; suggest tests."
  4: "Explain reasoning: Brief rationale for changes/decisions."
  5: "Respect existing code: Minimal edits; preserve style."
  6: "Encourage best practices: Modularity, docs, version control."
  7: "Be adaptable: Tailor to context/skill."
  8: "Iterate collaboratively: Build on feedback; confirm understanding."
  9: "Optimize performance: Consider complexity where relevant."
  10: "Stay neutral/factual: Evidence-based; no unsubstantiated opinions."

special_modes:
  cli_mode:
    focus: "Efficiency for terminal: Short responses, quick value."
    example_response: |
      **Plan**: Sort array in Python.
      ```python
      def quicksort(arr): ...
      ```
      **Explanation**: O(n log n) avg. Handles edges.
  repo_analysis_mode:
    focus: "Systematic breakdown: Overview > Architecture > Quality > Risks > Improvements."
    sections:
      - overview: "Purpose, features, tech stack."
      - architecture: "Components (FE/BE/DB), workflows."
      - key_files: "Snippets from critical code."
      - code_quality: "Readability, bugs, adherence to maxims."
      - security_practices: "Vulns, privacy (e.g., data handling)."
      - improvements: "Actionable suggestions."
    ethical_note: "Highlight surveillance/privacy risks if applicable."

integration_notes:
  - "For ambiguous queries: Ask clarifying questions (e.g., 'Provide code snippet?')."
  - "Error handling: If invalid input, suggest fixes politely."
  - "Extensibility: Add custom maxims or modes via YAML overrides."
EOF
  echo -e "${GREEN}✓ Created $CORE_YAML${NC}"
else
  backup_if_exists "$CORE_YAML"
  echo -e "${YELLOW}Skipping $CORE_YAML (exists)${NC}"
fi

# 3. Create project-specific YAML
PROJECT_YAML="${REPO_ROOT}/shadowcheck_behavior.yaml"
if [[ ! -f "$PROJECT_YAML" ]]; then
  cat > "$PROJECT_YAML" << 'EOF'
# Project-Specific Behavior File for Claude Code: ShadowCheck
# Purpose: Extends core YAML for SIGINT forensics platform at /home/nunya/shadowcheck.
# Usage: Load alongside core YAML for repo-aware assistance (e.g., migrations, PostGIS queries).
# Local Access: Claude can read files directly from /home/nunya/shadowcheck (e.g., via fs.readFile).
# Version: 1.0 (September 28, 2025)

imports:
  core_file: "claude_code_core_behavior.yaml"  # Assumes core is available; override if needed.

project_context:
  repo_path: "/home/nunya/shadowcheck"
  description: "SIGINT forensics platform for wireless analysis: React frontend, Express/Node backend, PostgreSQL/PostGIS DB. Features GIS viz (Mapbox), WiGLE data migration, counter-surveillance dashboards."
  tech_stack:
    frontend: "React 18, TypeScript, Tailwind CSS, Mapbox GL JS, Shadcn/ui, Radix UI"
    backend: "Express.js, Node.js, Helmet.js, Drizzle ORM"
    database: "PostgreSQL with PostGIS; schema in server/sql/001_init.sql & docs/SCHEMA.md"
    scripts: "Migration tools in scripts/migration/ (e.g., 03-import-sqlite.sh for WiGLE exports)"
  key_files:
    - "server/server.js": "Main Express app; API endpoints for networks, queries."
    - "client/src/App.tsx": "React root; dashboard components."
    - "scripts/migration/README.md": "WiGLE import guide."
    - "docs/SCHEMA.md": "DB tables/views (e.g., networks, signals)."
  features:
    - "Real-time WiFi/cellular monitoring."
    - "Interactive Mapbox GIS for spatial queries."
    - "Forensics dashboard: Signal strength, rogue AP detection."
    - "Data migration: SQLite (WiGLE) to PostGIS."
  setup_notes:
    - "npm install; Set .env (DATABASE_URL, MAPBOX_TOKEN); npm run db:push; npm run dev."
    - "Local DB: Use app_ro/app_rw roles; ~/.pgpass for creds."
  ethics:
    - "Emphasize legal compliance: Wireless monitoring for personal/research use only."
    - "Privacy: Warn on PII in signals data; suggest anonymization."

guideline_overrides:
  - "Repo Mode Default: Always assume working in /home/nunya/shadowcheck; read files locally for analysis (e.g., 'cat server/sql/001_init.sql')."
  - "Task Focus: Prioritize forensics tasks (migrations, spatial queries, UI tweaks); infer from context."
  - "Output: Include local file paths in snippets; suggest running scripts with full paths (e.g., /home/nunya/shadowcheck/scripts/...)."
  - "Safety: Flag surveillance risks; e.g., 'This query exposes location data—ensure consent.'"

maxims_extensions:  # Builds on core's 10 maxims
  11: "Leverage PostGIS: Use spatial functions (ST_DWithin, ST_Intersects) in suggestions; reference docs/SCHEMA.md."
  12: "Handle Migrations Safely: Validate WiGLE exports; suggest backups before scripts/migration/ runs."
  13: "GIS Best Practices: Optimize Mapbox layers for performance; avoid heavy queries on large datasets."
  14: "Forensics Accuracy: Include edge cases like signal noise, geofencing errors in code/tests."
  15: "Optimize for Speed: Limit tool chains to 2-3 steps; use concise instructions to reduce latency."

special_modes:
  migration_mode:
    focus: "WiGLE data import/processing."
    steps: "1. Validate SQLite export. 2. Run 03-import-sqlite.sh. 3. Build schema/views. 4. Test queries."
    example_response: |
      **Plan**: Migrate WiGLE export to PostGIS.
      **Command**: cd /home/nunya/shadowcheck && scripts/migration/03-import-sqlite.sh your_export.sqlite
      **Snippet** (from 04-build-unified-schema.sh):
      ```bash
      psql "$DATABASE_URL" -f unified_schema.sql
      ```
      **Explanation**: Unions networks/signals tables. Backup DB first.
  query_mode:
    focus: "PostGIS spatial analysis."
    example_response: |
      **Plan**: Query networks within 1km radius.
      **SQL Snippet** (read from docs/SCHEMA.md context):
      ```sql
      SELECT * FROM networks WHERE ST_DWithin(geom, ST_MakePoint(lon, lat)::geography, 1000);
      ```
      **Explanation**: Uses geography type for accurate distance. Run via Drizzle or psql.

integration_notes:
  - "For Tasks: If query mentions 'migrate' or 'query', auto-engage relevant mode."
  - "Local Reads: Use tools like 'ls /home/nunya/shadowcheck/server/' or 'grep' in responses if needed."
  - "Conflicts: Core maxims take precedence; project ethics override for sensitive ops."
EOF
  echo -e "${GREEN}✓ Created $PROJECT_YAML${NC}"
else
  backup_if_exists "$PROJECT_YAML"
  echo -e "${YELLOW}Skipping $PROJECT_YAML (exists)${NC}"
fi

# 4. Create Dockerfiles if missing
for df in Dockerfile.backend Dockerfile.frontend; do
  if [[ ! -f "$df" ]]; then
    case "$df" in
      Dockerfile.backend)
        cat > "$df" << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force  # Use ci for consistency

# Copy source (but volumes will override in dev)
COPY server/ ./

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
EOF
        ;;
      Dockerfile.frontend)
        cat > "$df" << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY client/package*.json ./
RUN npm ci && npm cache clean --force

# Copy source (volumes override in dev)
COPY client/ ./

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
EOF
        ;;
    esac
    echo -e "${GREEN}✓ Created $df${NC}"
  else
    echo -e "${YELLOW}Skipping $df (exists)${NC}"
  fi
done

# 5. Create/update docker-compose.yml
COMPOSE_FILE="${REPO_ROOT}/docker-compose.yml"
backup_if_exists "$COMPOSE_FILE"
cat > "$COMPOSE_FILE" << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.4
    restart: unless-stopped
    environment:
      POSTGRES_DB: shadowcheck
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Loaded from .env (randomly generated)
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/sql:/docker-entrypoint-initdb.d:ro  # Runs 001_init.sql (uses generated roles)
      - backup_volume:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d shadowcheck"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Skip init if DB exists
    entrypoint: ["/bin/sh", "-c", "
      if [ ! -s /var/lib/postgresql/data/PG_VERSION ]; then
        docker-entrypoint.sh postgres;
      else
        echo 'DB exists; skipping init.' && postgres;
      fi
    "]
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G

  backend:
    build: ./Dockerfile.backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://shadowcheck_admin:${SHADOWCHECK_ADMIN_PASSWORD}@postgres:5432/shadowcheck?sslmode=disable  # Random admin pass from .env
      NODE_ENV: development
    ports:
      - "5000:5000"
    volumes:
      - ./server:/app/server
      - /app/server/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  frontend:
    build: ./Dockerfile.frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: http://localhost:5000/api/v1
      MAPBOX_ACCESS_TOKEN: ${MAPBOX_ACCESS_TOKEN}
    ports:
      - "3000:3000"
    volumes:
      - ./client:/app
      - /app/node_modules
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

volumes:
  postgres_data:
  backup_volume:
EOF
echo -e "${GREEN}✓ Updated $COMPOSE_FILE${NC}"

# 6. Create .env template if missing (passwords via existing script)
ENV_FILE="${REPO_ROOT}/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" << 'EOF'
# Generated/updated by ./scripts/migration/01-setup-postgresql.sh
# Do not edit manually—rerun script for changes.
POSTGRES_PASSWORD=
SHADOWCHECK_ADMIN_PASSWORD=
SHADOWCHECK_USER_PASSWORD=
MAPBOX_ACCESS_TOKEN=pk.your_token_here  # Add your Mapbox token
EOF
  echo -e "${GREEN}✓ Created template $ENV_FILE${NC}"
else
  echo -e "${YELLOW}Skipping $ENV_FILE (exists; run password script if needed)${NC}"
fi

# 7. Prompt for password generation (uses existing script)
if ! grep -q "POSTGRES_PASSWORD=" "$ENV_FILE" || [[ -z "$(grep POSTGRES_PASSWORD= "$ENV_FILE" | cut -d= -f2)" ]]; then
  read -p "Run ./scripts/migration/01-setup-postgresql.sh to generate random passwords? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    chmod +x scripts/migration/01-setup-postgresql.sh
    ./scripts/migration/01-setup-postgresql.sh
    echo -e "${GREEN}✓ Passwords generated/updated in $ENV_FILE${NC}"
  fi
fi

# 8. Create backup-db.sh if missing
BACKUP_SCRIPT="${REPO_ROOT}/backup-db.sh"
if [[ ! -f "$BACKUP_SCRIPT" ]]; then
  cat > "$BACKUP_SCRIPT" << 'EOF'
#!/bin/bash
set -e  # Exit on any error

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Dump schema + data (non-destructive)
docker compose exec -T postgres pg_dump -U postgres -d shadowcheck -Fc > "$BACKUP_DIR/shadowcheck_backup.dump"

echo "✅ Backup created: $BACKUP_DIR/shadowcheck_backup.dump"
echo "Restore later with: docker compose exec -T postgres pg_restore -U postgres -d shadowcheck --clean --if-exists your_backup.dump"
EOF
  chmod +x "$BACKUP_SCRIPT"
  echo -e "${GREEN}✓ Created $BACKUP_SCRIPT${NC}"
else
  echo -e "${YELLOW}Skipping $BACKUP_SCRIPT (exists)${NC}"
fi

# 9. Setup CLI config for timeouts/resources (global)
mkdir -p "$CLI_CONFIG_DIR"
CLI_CONFIG="${CLI_CONFIG_DIR}/config.json"
backup_if_exists "$CLI_CONFIG"
cat > "$CLI_CONFIG" << 'EOF'
{
  "api": {
    "timeout": 120,
    "max_retries": 3,
    "retry_delay": 5
  },
  "tools": {
    "execution_timeout": 300
  }
}
EOF
echo -e "${GREEN}✓ Updated CLI config: $CLI_CONFIG${NC}"

# 10. Final notes
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "  - Backup DB: ./backup-db.sh"
echo "  - Start Docker: docker compose up -d --build"
echo "  - Test: docker compose exec backend npm run db:push"
echo "  - Backups in: $BACKUP_DIR"
echo -e "${GREEN}All done—your env is now tool-ready and non-destructive!${NC}"