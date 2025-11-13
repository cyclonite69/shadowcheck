# Screenshots Directory

Add screenshots here to enhance the main README and documentation.

## Required Screenshots

### 1. Dashboard Overview
**Filename:** `dashboard-overview.png`
**Shows:** Main analytics dashboard with metrics, charts, and recent observations
**Size:** 1920x1080px or 2560x1440px
**Format:** PNG (optimized, <500KB)

### 2. Interactive Geospatial Map
**Filename:** `geospatial-map.png`
**Shows:** Mapbox visualization with network clustering, signal ranges, and tooltips
**Size:** 1920x1080px or 2560x1440px
**Format:** PNG (optimized, <500KB)

### 3. Surveillance Detection
**Filename:** `surveillance-detection.png`
**Shows:** Surveillance threat detection panel with alerts and pattern analysis
**Size:** 1920x1080px
**Format:** PNG (optimized, <500KB)

### 4. Admin Panel
**Filename:** `admin-panel.png`
**Shows:** Admin dashboard with API testing, system monitoring, and database status
**Size:** 1920x1080px
**Format:** PNG (optimized, <500KB)

### 5. Data Pipeline
**Filename:** `data-pipeline.png`
**Shows:** Data import interface with KML/CSV import and enrichment queue
**Size:** 1920x1080px
**Format:** PNG (optimized, <500KB)

## Optional Screenshots

### 6. Network Detail View
**Filename:** `network-detail.png`
**Shows:** Detailed view of a single access point with timeline and observations

### 7. Security Analysis
**Filename:** `security-analysis.png`
**Shows:** Security breakdown pie charts and vulnerability analysis

### 8. Monitoring Dashboard (Grafana)
**Filename:** `monitoring-grafana.png`
**Shows:** Grafana dashboard with system metrics

## Screenshot Guidelines

### Capture Tips:
1. **Use Full HD or higher resolution** (1920x1080 minimum)
2. **Dark theme preferred** (matches the application aesthetic)
3. **Remove sensitive data** (BSSIDs, SSIDs, coordinates)
4. **Use demo data** if needed for privacy
5. **Capture clean UI state** (no loading spinners, errors)
6. **Include meaningful data** (not empty states)

### Optimization:
```bash
# Install imagemagick for optimization
apt-get install imagemagick

# Optimize PNG (reduce size while maintaining quality)
convert input.png -strip -quality 85 output.png

# Or use online tools:
# - TinyPNG: https://tinypng.com/
# - Squoosh: https://squoosh.app/
```

### Tools for Screenshots:
- **Linux:** Flameshot, GNOME Screenshot
- **macOS:** Cmd+Shift+4, Cmd+Shift+5
- **Windows:** Snipping Tool, Win+Shift+S
- **Browser:** Built-in developer tools screenshot feature

### Adding to README:
Once screenshots are added, update the main README.md:

```markdown
## 📸 Screenshots

### Interactive Geospatial Map
![Interactive Map](docs/images/geospatial-map.png)
*Real-time network visualization with clustering and signal range indicators*

### Analytics Dashboard
![Dashboard](docs/images/dashboard-overview.png)
*Comprehensive metrics, security analysis, and temporal patterns*

### Surveillance Detection
![Surveillance](docs/images/surveillance-detection.png)
*Automated threat detection and behavioral analysis*
```

## Demo Video

Consider creating a video demo:

**Location:** `docs/demo/shadowcheck-demo.mp4` or YouTube link
**Length:** 2-5 minutes
**Content:**
1. Quick overview (15 seconds)
2. Data import (30 seconds)
3. Map visualization (1 minute)
4. Analytics dashboard (1 minute)
5. Surveillance detection (1 minute)
6. Call to action (15 seconds)

**Tools:**
- OBS Studio (free, open source)
- Loom (simple, cloud-based)
- Screencastify (Chrome extension)

---

## Social Preview Image

**Filename:** `social-preview.png`
**Dimensions:** 1280x640px
**Location:** Upload directly to GitHub repository settings
**Purpose:** Shows when sharing repository link on social media

### Design Requirements:
- ShadowCheck logo or icon
- Project name "ShadowCheck"
- Tagline: "SIGINT Forensics Platform"
- 3-4 key feature highlights
- Technology badges (React, PostgreSQL, Docker)
- Dark professional theme

### Creation Tools:
- [Canva](https://www.canva.com/) - Free templates
- [Figma](https://www.figma.com/) - Professional design
- [Photopea](https://www.photopea.com/) - Free Photoshop alternative

---

**Once you've added screenshots, this README can be removed or updated to reflect what's available.**
