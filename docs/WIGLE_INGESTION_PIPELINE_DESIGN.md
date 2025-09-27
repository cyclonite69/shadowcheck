# ShadowCheck WiGLE Intelligence Ingestion Pipeline

## Current Infrastructure Analysis

### Existing WiGLE Tables:

- **`app.wigle_observations`** (78 records) - Direct WiGLE API responses
- **`app.wigle_enrichments`** (1 record) - Legacy enrichment data
- **`app.wigle_api_enrichments`** - Full 26-field WiGLE API mapping (from schema)

### Surveillance Intelligence Assets:

- **496 Federal Networks** (FBI, CIA, DEA, DOJ, DOD, NSA, ATF, USSS, ICE, CBP)
- **9 Extreme Range Threats** (89km surveillance capability)
- **58+ High-Mobility HUMINT Assets**

---

## WiGLE Ingestion Pipeline Architecture

### **Pipeline Trigger Options:**

#### **Option A: Manual Intelligence Gathering (Recommended)**

```typescript
// Admin panel button for targeted investigation
<Button onClick={handleIntelligenceGathering}>
  🔍 Gather Intelligence on Flagged Networks
</Button>

// Triggered when:
// - New federal agency networks detected
// - Surveillance threats identified
// - Suspicious patterns flagged
```

#### **Option B: Automated Continuous Monitoring**

```typescript
// Scheduled background job
// - Every 6 hours for federal networks
// - Real-time for new extreme threats
// - Daily for HUMINT assets
```

#### **Option C: Hybrid Approach (Best Security)**

```typescript
// Automated flagging + manual approval
// 1. System flags suspicious networks
// 2. Admin reviews and approves WiGLE queries
// 3. Batch processing with rate limiting
```

---

## Pipeline Implementation Design

### **1. Suspect Network Detection & Flagging**

```sql
-- Identify networks requiring WiGLE intelligence
CREATE OR REPLACE FUNCTION app.identify_suspect_networks_for_wigle()
RETURNS TABLE(
    bssid TEXT,
    ssid TEXT,
    threat_level TEXT,
    reason TEXT,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH suspect_analysis AS (
        -- Federal agency networks (PRIORITY 1)
        SELECT
            n.bssid,
            COALESCE(n.ssid, '<hidden>') as ssid,
            'FEDERAL_SURVEILLANCE' as threat_level,
            'Federal agency network identifier detected' as reason,
            1 as priority
        FROM app.networks_legacy n
        WHERE n.ssid ~* '(fbi|cia|dea|doj|dod|nsa|atf|usss|ice|cbp)'

        UNION ALL

        -- Extreme range threats (PRIORITY 2)
        SELECT
            n.bssid,
            COALESCE(n.ssid, '<hidden>') as ssid,
            'EXTREME_RANGE_SURVEILLANCE' as threat_level,
            'Extreme mobility pattern - 89km range capability' as reason,
            2 as priority
        FROM app.networks_legacy n
        WHERE n.bssid IN (
            'a0:1d:48:75:64:78', 'a2:4f:b8:9d:48:3b', 'a2:16:9d:15:57:f2',
            'a2:16:9d:13:5e:6c', 'a2:ad:43:25:bd:98', 'a2:0f:6f:3e:fb:98',
            'a0:36:bc:b2:e9:ec', 'a0:55:1f:ed:36:77', 'a0:68:7e:97:50:03'
        )

        UNION ALL

        -- High-mobility surveillance (PRIORITY 3)
        SELECT DISTINCT
            n.bssid,
            COALESCE(n.ssid, '<hidden>') as ssid,
            'HIGH_MOBILITY_SURVEILLANCE' as threat_level,
            'Coordinated movement pattern detected' as reason,
            3 as priority
        FROM app.networks_legacy n
        INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
        GROUP BY n.bssid, n.ssid
        HAVING COUNT(DISTINCT l.lat || ',' || l.lon) >= 2
        AND MAX(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point FROM app.location_markers WHERE marker_type = 'home')::geography
        )) / 1000.0 > 10
        AND MIN(ST_Distance(
            ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
            (SELECT location_point FROM app.location_markers WHERE marker_type = 'home')::geography
        )) / 1000.0 < 2
    )
    SELECT * FROM suspect_analysis
    -- Exclude already enriched networks
    WHERE NOT EXISTS (
        SELECT 1 FROM app.wigle_enrichments we
        WHERE we.bssid = suspect_analysis.bssid
        AND we.queried_at > NOW() - INTERVAL '30 days'
    )
    ORDER BY priority, threat_level;
END;
$$ LANGUAGE plpgsql;
```

### **2. WiGLE API Client with Pagination**

```typescript
// server/services/wigleClient.ts
export class WiGLEIntelligenceClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.wigle.net';
  private rateLimitDelay = 1000; // 1 second between requests

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async gatherIntelligence(
    bssid: string,
    options: {
      maxResults?: number;
      paginate?: boolean;
      includeLocationData?: boolean;
    } = {}
  ): Promise<WiGLEIntelligenceResponse> {
    const { maxResults = 100, paginate = true, includeLocationData = true } = options;

    let allResults: WiGLENetworkResult[] = [];
    let page = 0;
    let hasMoreResults = true;

    while (hasMoreResults && allResults.length < maxResults) {
      const searchParams = new URLSearchParams({
        onlymine: 'false',
        freenet: 'false',
        paynet: 'false',
        netid: bssid,
        resultsPerPage: '25', // WiGLE max per page
        searchAfter: page.toString(),
        ...(includeLocationData && { locationData: 'true' }),
      });

      try {
        const response = await fetch(`${this.baseUrl}/api/v2/network/search?${searchParams}`, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`WiGLE API error: ${response.status} ${response.statusText}`);
        }

        const data: WiGLESearchResponse = await response.json();

        if (data.results && data.results.length > 0) {
          allResults = allResults.concat(data.results);
          hasMoreResults = paginate && data.results.length === 25; // Full page indicates more results
          page++;
        } else {
          hasMoreResults = false;
        }

        // Rate limiting
        if (hasMoreResults) {
          await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
        }
      } catch (error) {
        console.error(`WiGLE API request failed for BSSID ${bssid}:`, error);
        hasMoreResults = false;
      }
    }

    return {
      bssid,
      totalResults: allResults.length,
      results: allResults,
      paginationCompleted: !hasMoreResults || allResults.length >= maxResults,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### **3. Intelligence Processing Pipeline**

```typescript
// server/services/intelligencePipeline.ts
export class SurveillanceIntelligencePipeline {
  private wigleClient: WiGLEIntelligenceClient;
  private db: Pool;

  constructor(wigleClient: WiGLEIntelligenceClient, db: Pool) {
    this.wigleClient = wigleClient;
    this.db = db;
  }

  async processSuspectNetworks(
    triggerType: 'manual' | 'automated' | 'scheduled' = 'manual'
  ): Promise<IntelligenceGatheringResult> {
    // 1. Identify suspect networks
    const suspectNetworks = await this.db.query(`
      SELECT * FROM app.identify_suspect_networks_for_wigle()
      ORDER BY priority LIMIT 50  -- Batch size
    `);

    const results: NetworkIntelligenceResult[] = [];

    // 2. Process each network with rate limiting
    for (const network of suspectNetworks.rows) {
      try {
        // Gather WiGLE intelligence
        const intelligence = await this.wigleClient.gatherIntelligence(network.bssid, {
          maxResults: 100,
          paginate: true,
          includeLocationData: true,
        });

        // Store in wigle_enrichments table
        await this.storeIntelligence(network.bssid, intelligence, network);

        results.push({
          bssid: network.bssid,
          ssid: network.ssid,
          threatLevel: network.threat_level,
          intelligenceGathered: intelligence.totalResults > 0,
          wigleResults: intelligence.totalResults,
          processingStatus: 'SUCCESS',
        });

        // Rate limiting between networks
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        results.push({
          bssid: network.bssid,
          ssid: network.ssid,
          threatLevel: network.threat_level,
          intelligenceGathered: false,
          wigleResults: 0,
          processingStatus: 'ERROR',
          error: String(error),
        });
      }
    }

    return {
      triggerType,
      timestamp: new Date().toISOString(),
      networksProcessed: results.length,
      successfulGathering: results.filter(r => r.intelligenceGathered).length,
      results,
    };
  }

  private async storeIntelligence(
    bssid: string,
    intelligence: WiGLEIntelligenceResponse,
    suspectNetwork: any
  ): Promise<void> {
    const client = await this.db.connect();

    try {
      await client.query('BEGIN');

      // Store in wigle_enrichments table
      for (const result of intelligence.results) {
        await client.query(
          `
          INSERT INTO app.wigle_enrichments (
            bssid, filename, queried_at, api_response,
            trilat, trilong, ssid, qos, first_time, last_time,
            last_update, net_type, encryption, channel, frequency,
            country, region, road, city, housenumber, postalcode,
            total_results, search_position, success
          ) VALUES (
            $1, 'intelligence_gathering', NOW(), $2,
            $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, $19, $20, $21, true
          ) ON CONFLICT (bssid) DO UPDATE SET
            api_response = EXCLUDED.api_response,
            trilat = EXCLUDED.trilat,
            trilong = EXCLUDED.trilong,
            queried_at = EXCLUDED.queried_at,
            total_results = EXCLUDED.total_results,
            success = true
        `,
          [
            bssid,
            JSON.stringify(result),
            result.trilat || null,
            result.trilong || null,
            result.ssid || null,
            result.qos || null,
            result.firsttime || null,
            result.lasttime || null,
            result.lastupdt || null,
            result.type || null,
            result.encryption || null,
            result.channel || null,
            result.frequency || null,
            result.country || null,
            result.region || null,
            result.road || null,
            result.city || null,
            result.housenumber || null,
            result.postalcode || null,
            intelligence.totalResults,
            intelligence.results.indexOf(result),
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### **4. Backend API Endpoints**

```typescript
// server/routes/intelligence.ts
app.post('/api/v1/surveillance/gather-intelligence', async (req, res) => {
  try {
    const { triggerType = 'manual' } = req.body;

    const pipeline = new SurveillanceIntelligencePipeline(
      new WiGLEIntelligenceClient(process.env.WIGLE_API_KEY!, process.env.WIGLE_API_SECRET!),
      pool
    );

    const result = await pipeline.processSuspectNetworks(triggerType);

    res.json({
      success: true,
      message: `Intelligence gathering completed: ${result.successfulGathering}/${result.networksProcessed} networks enriched`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Intelligence gathering failed',
      detail: String(error),
    });
  }
});

app.get('/api/v1/surveillance/suspect-networks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM app.identify_suspect_networks_for_wigle()
      ORDER BY priority, threat_level
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to identify suspect networks',
      detail: String(error),
    });
  }
});
```

### **5. Frontend Intelligence Gathering UI**

```typescript
// client/src/components/IntelligenceGathering.tsx
export function IntelligenceGathering() {
  const [isGathering, setIsGathering] = useState(false);
  const [suspectNetworks, setSuspectNetworks] = useState([]);

  const handleGatherIntelligence = async () => {
    setIsGathering(true);

    try {
      const response = await fetch('/api/v1/surveillance/gather-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: 'manual' })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Intelligence gathered for ${result.data.successfulGathering} networks`);
        // Refresh data
        loadSuspectNetworks();
      } else {
        toast.error('Intelligence gathering failed');
      }
    } catch (error) {
      toast.error('Failed to gather intelligence');
    } finally {
      setIsGathering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Surveillance Intelligence Gathering</CardTitle>
        <CardDescription>
          WiGLE intelligence collection for suspected surveillance networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">496</div>
              <div className="text-sm text-muted-foreground">Federal Networks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">58+</div>
              <div className="text-sm text-muted-foreground">HUMINT Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-800">9</div>
              <div className="text-sm text-muted-foreground">Extreme Threats</div>
            </div>
          </div>

          <Button
            onClick={handleGatherIntelligence}
            disabled={isGathering}
            className="w-full"
            variant="destructive"
          >
            {isGathering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gathering Intelligence...
              </>
            ) : (
              <>
                🔍 Gather WiGLE Intelligence on Flagged Networks
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            ⚠️ This will query WiGLE API for suspected surveillance networks.
            Rate limited to prevent API quota exhaustion.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Mapbox Integration for Kepler Visualizations

### **Kepler.gl Configuration:**

```typescript
// client/src/components/Map/SurveillanceKeplerMap.tsx
export function SurveillanceKeplerMap() {
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  const keplerConfig = {
    mapState: {
      latitude: 43.02342188,  // Home location
      longitude: -83.6968461,
      zoom: 12
    },
    mapStyle: {
      styleType: 'satellite', // For surveillance operations
      topLayerGroups: {}
    }
  };

  const datasets = {
    federalNetworks: {
      info: { id: 'federal-surveillance', label: 'Federal Surveillance Networks' },
      data: {
        fields: [
          { name: 'bssid', type: 'string' },
          { name: 'ssid', type: 'string' },
          { name: 'agency', type: 'string' },
          { name: 'lat', type: 'real' },
          { name: 'lon', type: 'real' },
          { name: 'threat_level', type: 'string' }
        ],
        rows: federalNetworkData
      }
    }
  };

  return (
    <KeplerGl
      id="surveillance-map"
      width={window.innerWidth}
      height={600}
      mapboxApiAccessToken={mapboxToken}
      onSaveMap={onSaveMap}
    />
  );
}
```

---

## Recommended Implementation Approach

### **Phase 1: Manual Intelligence Gathering (Week 1-2)**

1. **Admin Panel Button** - "Gather Intelligence on Flagged Networks"
2. **Suspect Network Detection** - Identify 496+ federal + 58+ HUMINT + 9 extreme threats
3. **WiGLE API Integration** - Paginated queries with rate limiting
4. **Database Storage** - Store in `wigle_enrichments` table

### **Phase 2: Automated Background Monitoring (Week 3-4)**

1. **Scheduled Jobs** - Daily intelligence gathering for new threats
2. **Real-time Alerts** - Immediate WiGLE lookup for extreme threats
3. **Batch Processing** - Efficient pagination and rate limiting

### **Phase 3: Advanced Visualization (Week 5-6)**

1. **Kepler.gl Integration** - Surveillance-focused mapping
2. **Mapbox Satellite Layers** - High-resolution surveillance visualization
3. **Real-time Intelligence Dashboard** - Live WiGLE enrichment status

**🔐 Security Recommendation: Start with manual intelligence gathering to maintain control over WiGLE API usage and prevent automated surveillance detection by adversaries monitoring API activity.**

---

## Configuration Requirements

### **Environment Variables:**

```bash
WIGLE_API_KEY=your_wigle_api_key
WIGLE_API_SECRET=your_wigle_api_secret
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
```

### **Database Preparation:**

```sql
-- Ensure WiGLE enrichment functions are deployed
\i db/scripts/07_wigle_enrichment.sql
```

**⚠️ CLASSIFICATION: EYES ONLY - WIGLE INTELLIGENCE COLLECTION PIPELINE ⚠️**
