# SHADOWCHECK SURVEILLANCE API DOCUMENTATION

**Version:** 1.0
**Base URL:** `http://localhost:5000/api/v1/surveillance`
**Date:** 2025-10-20

---

## Overview

The Surveillance API provides WiFi-specific threat detection with adaptive learning capabilities. It identifies networks that appear both at your home location and at distant locations, which may indicate surveillance devices.

**Key Features:**
- WiFi-specific detection optimized for 0.5km+ local tracking
- Full observation history for each detected threat
- Configurable detection thresholds per radio type
- User feedback system for adaptive learning
- Mobile hotspot detection

---

## Endpoints

### 1. GET `/wifi/threats`

Get WiFi surveillance threats with complete observation history.

**Query Parameters:**
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `min_distance_km` | float | 0.5 | 0-100 | Minimum distance from home to flag as threat |
| `home_radius_m` | float | 500 | 0-5000 | Home zone radius in meters |
| `min_home_sightings` | int | 1 | 1+ | Minimum sightings at home required |
| `limit` | int | 100 | 1-500 | Maximum threats to return |

**Response:**
```json
{
  "ok": true,
  "count": 124,
  "responseTime": "1738ms",
  "parameters": {
    "min_distance_km": 0.5,
    "home_radius_m": 500,
    "min_home_sightings": 1,
    "limit": 100
  },
  "data": [
    {
      "bssid": "AA:BB:CC:DD:EE:FF",
      "ssid": "NetworkName",
      "radio_band": "2.4GHz",
      "total_sightings": 15,
      "home_sightings": 8,
      "away_sightings": 7,
      "max_distance_km": 12.5,
      "threat_level": "CRITICAL",
      "threat_description": "WiFi seen at home and 10+ km away",
      "confidence_score": 0.85,
      "is_mobile_hotspot": false,
      "observations": [
        {
          "id": 12345,
          "latitude": 43.023456,
          "longitude": -83.696789,
          "altitude": 250,
          "accuracy": 10,
          "signal_strength": -65,
          "timestamp_ms": "1729468800000",
          "observed_at": "2024-10-20T14:00:00.000Z",
          "ssid": "NetworkName",
          "frequency": 2437,
          "capabilities": "[WPA2-PSK-CCMP][ESS]",
          "radio_type": "W",
          "distance_from_home_km": "0.15"
        }
      ]
    }
  ]
}
```

**Threat Levels:**
- `EXTREME`: 50+ km from home (possible long-distance stalking)
- `CRITICAL`: 10-50 km from home (cross-town surveillance)
- `HIGH`: 5-10 km from home (local tracking)
- `MEDIUM`: 2-5 km from home (nearby surveillance)
- `LOW`: 0.5-2 km from home (very local pattern)

**Example Usage:**
```bash
# Get top 10 critical threats (10km+ from home)
curl "http://localhost:5000/api/v1/surveillance/wifi/threats?min_distance_km=10&limit=10"

# Get all threats within 5km (more sensitive)
curl "http://localhost:5000/api/v1/surveillance/wifi/threats?min_distance_km=0.5&limit=500"

# Adjust home zone to 1km radius
curl "http://localhost:5000/api/v1/surveillance/wifi/threats?home_radius_m=1000"
```

---

### 2. GET `/wifi/summary`

Get WiFi surveillance summary statistics (fast overview).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `min_distance_km` | float | 0.5 | Minimum distance threshold |

**Response:**
```json
{
  "ok": true,
  "data": {
    "total_threats": 124,
    "by_level": {
      "extreme": 11,
      "critical": 0,
      "high": 36,
      "medium": 1,
      "low": 76
    },
    "mobile_hotspots": 48,
    "avg_confidence": "0.366",
    "max_distance_detected_km": "9497.63",
    "avg_threat_distance_km": "845.01",
    "detection_settings": {
      "min_distance_km": 0.5,
      "home_radius_m": 500,
      "min_home_sightings": 1
    }
  }
}
```

**Example Usage:**
```bash
# Get current threat summary
curl "http://localhost:5000/api/v1/surveillance/wifi/summary"

# Get summary with custom threshold
curl "http://localhost:5000/api/v1/surveillance/wifi/summary?min_distance_km=2"
```

---

### 3. GET `/settings`

Get current detection settings for all radio types.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "setting_id": 1,
      "radio_type": "wifi",
      "min_distance_km": 0.5,
      "max_distance_km": 100,
      "home_radius_m": 500,
      "min_home_sightings": 1,
      "min_away_sightings": 1,
      "confidence_threshold": 0.3,
      "threat_level_enabled": {
        "EXTREME": true,
        "CRITICAL": true,
        "HIGH": true,
        "MEDIUM": true,
        "LOW": true
      },
      "enabled": true,
      "description": "WiFi surveillance detection - optimized for local tracking (0.5-10km range)",
      "created_at": "2025-10-20T12:00:00.000Z",
      "updated_at": "2025-10-20T12:00:00.000Z"
    }
  ]
}
```

**Example Usage:**
```bash
# Get all detection settings
curl "http://localhost:5000/api/v1/surveillance/settings"
```

---

### 4. POST `/settings`

Update detection settings for a specific radio type.

**Request Body:**
```json
{
  "radio_type": "wifi",
  "min_distance_km": 1.0,
  "max_distance_km": 50,
  "home_radius_m": 750,
  "min_home_sightings": 2,
  "min_away_sightings": 1,
  "confidence_threshold": 0.4,
  "threat_level_enabled": {
    "EXTREME": true,
    "CRITICAL": true,
    "HIGH": true,
    "MEDIUM": false,
    "LOW": false
  }
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Detection settings updated successfully",
  "setting_id": 1
}
```

**Example Usage:**
```bash
# Increase WiFi detection threshold to 1km (less sensitive)
curl -X POST "http://localhost:5000/api/v1/surveillance/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "radio_type": "wifi",
    "min_distance_km": 1.0,
    "home_radius_m": 500
  }'

# Only show CRITICAL and EXTREME threats
curl -X POST "http://localhost:5000/api/v1/surveillance/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "radio_type": "wifi",
    "threat_level_enabled": {
      "EXTREME": true,
      "CRITICAL": true,
      "HIGH": false,
      "MEDIUM": false,
      "LOW": false
    }
  }'
```

---

### 5. POST `/feedback`

Record user feedback on a detected threat (for adaptive learning).

**Request Body:**
```json
{
  "bssid": "AA:BB:CC:DD:EE:FF",
  "ssid": "MyWorkNetwork",
  "threat_level": "HIGH",
  "detected_distance_km": 5.2,
  "user_rating": "false_positive",
  "user_notes": "This is my work network, not a threat",
  "whitelist_network": true
}
```

**Valid `user_rating` Values:**
- `false_positive` - Not a real threat (e.g., work network, family member's phone)
- `real_threat` - Confirmed surveillance device
- `uncertain` - Unsure, needs more investigation

**Response:**
```json
{
  "ok": true,
  "message": "Feedback recorded successfully",
  "feedback_id": 42,
  "whitelisted": true
}
```

**Example Usage:**
```bash
# Mark a network as false positive and whitelist it
curl -X POST "http://localhost:5000/api/v1/surveillance/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "bssid": "AA:BB:CC:DD:EE:FF",
    "ssid": "CoffeeShop_WiFi",
    "threat_level": "MEDIUM",
    "detected_distance_km": 3.5,
    "user_rating": "false_positive",
    "user_notes": "Regular coffee shop I visit",
    "whitelist_network": true
  }'

# Mark a network as real threat
curl -X POST "http://localhost:5000/api/v1/surveillance/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "bssid": "11:22:33:44:55:66",
    "ssid": "",
    "threat_level": "EXTREME",
    "detected_distance_km": 50.2,
    "user_rating": "real_threat",
    "user_notes": "Unknown device following me",
    "whitelist_network": false
  }'
```

---

### 6. POST `/learning/adjust`

Trigger adaptive learning to auto-adjust detection thresholds based on user feedback.

This analyzes the last 30 days of user feedback and:
- **Increases threshold** (less sensitive) if false positive rate > 50%
- **Decreases threshold** (more sensitive) if false positive rate < 20%

**Request:** No body required

**Response:**
```json
{
  "ok": true,
  "message": "Thresholds adjusted based on user feedback",
  "adjustments": [
    {
      "radio_type": "wifi",
      "old_threshold": 0.5,
      "new_threshold": 0.75,
      "adjustment_reason": "High false positive rate (65.2%) - increased threshold"
    }
  ]
}
```

**If no adjustment needed:**
```json
{
  "ok": true,
  "message": "No adjustments needed - insufficient feedback or thresholds are optimal",
  "adjustments": []
}
```

**Example Usage:**
```bash
# Manually trigger learning (usually done automatically)
curl -X POST "http://localhost:5000/api/v1/surveillance/learning/adjust"
```

---

### 7. GET `/feedback/stats`

Get feedback statistics for monitoring learning system health.

**Response:**
```json
{
  "ok": true,
  "data": {
    "total_feedback": 150,
    "false_positives": 45,
    "real_threats": 85,
    "uncertain": 20,
    "whitelisted_count": 38,
    "unique_networks_rated": 92,
    "avg_threat_distance_km": "8.45",
    "false_positive_rate": "30.0%",
    "real_threat_rate": "56.7%"
  }
}
```

**Interpreting Results:**
- **False Positive Rate < 20%**: System is too sensitive, consider manual threshold increase
- **False Positive Rate 20-50%**: Optimal balance
- **False Positive Rate > 50%**: System will auto-adjust to be less sensitive

**Example Usage:**
```bash
# Check current feedback stats
curl "http://localhost:5000/api/v1/surveillance/feedback/stats"
```

---

## Observation Data Structure

Each threat includes an `observations` array with complete GPS track history:

```json
{
  "id": 12345,
  "latitude": 43.023456,
  "longitude": -83.696789,
  "altitude": 250,
  "accuracy": 10,
  "signal_strength": -65,
  "timestamp_ms": "1729468800000",
  "observed_at": "2024-10-20T14:00:00.000Z",
  "ssid": "NetworkName",
  "frequency": 2437,
  "capabilities": "[WPA2-PSK-CCMP][ESS]",
  "radio_type": "W",
  "distance_from_home_km": "0.15"
}
```

**Field Descriptions:**
- `id`: Unique observation ID
- `latitude/longitude`: GPS coordinates
- `altitude`: Elevation in meters (may be 0 if unavailable)
- `accuracy`: GPS accuracy in meters
- `signal_strength`: WiFi signal strength in dBm (0 = unavailable)
- `timestamp_ms`: Unix timestamp in milliseconds
- `observed_at`: ISO 8601 timestamp (null if unavailable)
- `ssid`: Network name (empty string if hidden)
- `frequency`: WiFi frequency in MHz (0 = unavailable)
- `capabilities`: Security/encryption info
- `radio_type`: Radio type code (W=WiFi, B=Bluetooth, etc.)
- `distance_from_home_km`: Calculated distance from home marker

---

## Complete Workflow Example

### 1. Check Current Threat Landscape
```bash
# Get summary
curl "http://localhost:5000/api/v1/surveillance/wifi/summary"
# Result: 124 threats (11 EXTREME, 36 HIGH, etc.)
```

### 2. Investigate Top Threats
```bash
# Get top 10 most distant threats
curl "http://localhost:5000/api/v1/surveillance/wifi/threats?limit=10&min_distance_km=10"
# Result: Shows networks seen 10+ km from home with full observation history
```

### 3. Review Observations
For each threat, examine the `observations` array:
- Check GPS coordinates on a map
- Verify timestamps match your travel patterns
- Look for suspicious patterns (same network appearing at home + distant locations)

### 4. Provide Feedback
```bash
# Mark false positives
curl -X POST "http://localhost:5000/api/v1/surveillance/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "bssid": "AA:BB:CC:DD:EE:FF",
    "threat_level": "HIGH",
    "detected_distance_km": 5.2,
    "user_rating": "false_positive",
    "user_notes": "My work network",
    "whitelist_network": true
  }'

# Mark real threats
curl -X POST "http://localhost:5000/api/v1/surveillance/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "bssid": "11:22:33:44:55:66",
    "threat_level": "EXTREME",
    "detected_distance_km": 50,
    "user_rating": "real_threat",
    "user_notes": "Suspicious device"
  }'
```

### 5. Monitor Learning System
```bash
# Check feedback stats
curl "http://localhost:5000/api/v1/surveillance/feedback/stats"
# Result: false_positive_rate: "35%", real_threat_rate: "55%"
```

### 6. Trigger Auto-Adjustment (if needed)
```bash
# System auto-adjusts if FP rate > 50%
curl -X POST "http://localhost:5000/api/v1/surveillance/learning/adjust"
# Result: Threshold increased from 0.5km to 0.75km
```

### 7. Verify Improvement
```bash
# Check new threat count
curl "http://localhost:5000/api/v1/surveillance/wifi/summary"
# Result: Reduced to 85 threats (fewer false positives)
```

---

## Performance Notes

- **Summary endpoint**: ~50-200ms (very fast, aggregation only)
- **Threats endpoint**: ~1-3 seconds (depends on limit and observation count)
  - Each threat requires additional query to fetch observations
  - Use `limit` parameter to control response time
  - Requesting 100 threats with full observations: ~2-3 seconds

**Optimization Tips:**
1. Use `/wifi/summary` for dashboard overview (instant)
2. Use `/wifi/threats?limit=10` for initial investigation (fast)
3. Increase `limit` only when full export needed
4. Use `min_distance_km` to filter out low-priority threats

---

## Database Functions Used

These PostgreSQL functions power the API:

1. `app.get_wifi_surveillance_threats()` - WiFi-specific detection
2. `app.get_surveillance_threats_with_settings()` - Configurable detection
3. `app.update_detection_settings()` - Runtime configuration
4. `app.record_threat_feedback()` - User feedback recording
5. `app.adjust_thresholds_from_feedback()` - Adaptive learning

---

## Error Responses

**400 Bad Request:**
```json
{
  "ok": false,
  "error": "Invalid min_distance_km. Must be between 0 and 100."
}
```

**500 Internal Server Error:**
```json
{
  "ok": false,
  "error": "Failed to retrieve WiFi surveillance threats",
  "detail": "connection timeout"
}
```

---

## Future Enhancements

Planned features for next release:

1. **Bluetooth Detection**: Similar logic for BLE devices (10-30m range)
2. **Cellular Detection**: Cell tower tracking patterns
3. **Trip-Based Detection**: Analyze surveillance across specific trips
4. **Real-time Alerts**: WebSocket notifications for new threats
5. **Machine Learning**: Advanced threat scoring beyond rule-based detection

---

**Documentation Version:** 1.0
**Last Updated:** 2025-10-20
**API Status:** ✅ Production Ready
