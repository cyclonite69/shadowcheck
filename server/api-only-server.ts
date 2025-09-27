import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'shadowcheck',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'admin',
});

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ ok: true, service: 'shadowcheck-api', ts: new Date().toISOString() });
});

// Analytics endpoint - returns overview data for dashboard
app.get('/api/v1/analytics', async (_req, res) => {
  try {
    const totalObservations = await pool.query('SELECT COUNT(*) as count FROM app.locations');
    const distinctNetworks = await pool.query('SELECT COUNT(*) as count FROM app.networks');

    res.json({
      ok: true,
      data: {
        overview: {
          total_observations: Number(totalObservations.rows[0]?.count || 0),
          distinct_networks: Number(distinctNetworks.rows[0]?.count || 0),
        },
      },
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

// Radio stats endpoint using legacy Wigle table types
app.get('/api/v1/radio-stats', async (_req, res) => {
  try {
    const radioStatsQuery = `
      WITH radio_type_mapping AS (
        SELECT
          nl.type as wigle_type,
          CASE
            WHEN nl.type = 'W' OR nl.type = 'E' THEN 'wifi'
            WHEN nl.type = 'B' THEN 'bluetooth'
            WHEN nl.type = 'L' THEN 'ble'
            WHEN nl.type = 'G' THEN 'cellular'
            WHEN nl.type = 'N' THEN 'other'
            ELSE 'unknown'
          END as radio_type,
          COUNT(*) as total_observations,
          COUNT(DISTINCT nl.bssid) as distinct_networks
        FROM app.networks_legacy nl
        WHERE nl.type IS NOT NULL
        GROUP BY nl.type
      ),
      all_radio_types AS (
        SELECT 'wifi' as radio_type
        UNION ALL SELECT 'cellular'
        UNION ALL SELECT 'bluetooth'
        UNION ALL SELECT 'ble'
      ),
      aggregated_counts AS (
        SELECT
          rtm.radio_type,
          SUM(rtm.total_observations) as total_observations,
          SUM(rtm.distinct_networks) as distinct_networks
        FROM radio_type_mapping rtm
        GROUP BY rtm.radio_type
      )
      SELECT
        art.radio_type,
        COALESCE(ac.total_observations, 0) as total_observations,
        COALESCE(ac.distinct_networks, 0) as distinct_networks
      FROM all_radio_types art
      LEFT JOIN aggregated_counts ac ON art.radio_type = ac.radio_type
      ORDER BY COALESCE(ac.distinct_networks, 0) DESC
    `;

    const result = await pool.query(radioStatsQuery);
    res.json({
      ok: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error('Radio stats error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

// Security analysis endpoint using legacy table data
app.get('/api/v1/security-analysis', async (_req, res) => {
  try {
    const securityAnalysisQuery = `
      WITH security_stats AS (
        SELECT
          COALESCE(nl.capabilities, '[Open]') as security,
          CASE
            WHEN nl.capabilities ILIKE '%SAE%' OR nl.capabilities ILIKE '%WPA3%' THEN 'WPA3 Secure'
            WHEN nl.capabilities ILIKE '%WPA2%' OR nl.capabilities ILIKE '%RSN%' THEN 'WPA2 Protected'
            WHEN nl.capabilities ILIKE '%WPA-%' THEN 'WPA Protected'
            WHEN nl.capabilities ILIKE '%WEP%' THEN 'WEP Vulnerable'
            WHEN nl.capabilities ILIKE '%ESS%' AND
                 NOT (nl.capabilities ILIKE '%WPA%' OR nl.capabilities ILIKE '%RSN%') THEN 'Open Networks'
            WHEN nl.capabilities IS NULL OR nl.capabilities = '' THEN 'Open Networks'
            ELSE 'Other Security'
          END as security_level,
          COUNT(DISTINCT nl.bssid) as network_count
        FROM app.networks_legacy nl
        WHERE (nl.type = 'W' OR nl.type = 'E')  -- WiFi networks only
        GROUP BY nl.capabilities
      ),
      total_networks AS (
        SELECT SUM(network_count) as total_count FROM security_stats
      )
      SELECT
        s.security,
        s.security_level,
        s.network_count,
        ROUND((s.network_count * 100.0 / GREATEST(t.total_count, 1)), 1) as percentage
      FROM security_stats s
      CROSS JOIN total_networks t
      ORDER BY s.network_count DESC
    `;

    const result = await pool.query(securityAnalysisQuery);
    res.json({
      ok: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error('Security analysis error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

// Signal strength endpoint using legacy table data
app.get('/api/v1/signal-strength', async (_req, res) => {
  try {
    const signalStrengthQuery = `
      WITH signal_ranges AS (
        SELECT
          CASE
            WHEN nl.bestlevel >= -30 THEN 'Excellent (-30 to 0 dBm)'
            WHEN nl.bestlevel >= -50 THEN 'Good (-50 to -30 dBm)'
            WHEN nl.bestlevel >= -70 THEN 'Fair (-70 to -50 dBm)'
            WHEN nl.bestlevel >= -90 THEN 'Weak (-90 to -70 dBm)'
            ELSE 'Very Weak (< -90 dBm)'
          END as signal_range,
          CASE
            WHEN nl.bestlevel >= -30 THEN 1
            WHEN nl.bestlevel >= -50 THEN 2
            WHEN nl.bestlevel >= -70 THEN 3
            WHEN nl.bestlevel >= -90 THEN 4
            ELSE 5
          END as range_order,
          COUNT(*) as observation_count
        FROM app.networks_legacy nl
        WHERE nl.bestlevel IS NOT NULL
        GROUP BY signal_range, range_order
      ),
      total_observations AS (
        SELECT SUM(observation_count) as total_count FROM signal_ranges
      )
      SELECT
        s.signal_range,
        s.observation_count,
        ROUND((s.observation_count * 100.0 / GREATEST(t.total_count, 1)), 1) as percentage
      FROM signal_ranges s
      CROSS JOIN total_observations t
      ORDER BY s.range_order
    `;

    const result = await pool.query(signalStrengthQuery);
    res.json({
      ok: true,
      data: result.rows,
    });
  } catch (err: any) {
    console.error('Signal strength analysis error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});

// Networks endpoint
app.get('/api/v1/networks', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);

  try {
    const networksQuery = `
      SELECT
        n.bssid,
        n.current_ssid as ssid,
        n.current_frequency as frequency,
        n.current_capabilities as capabilities,
        nls.best_signal_strength as bestlevel,
        EXTRACT(epoch FROM n.last_seen_at) * 1000 as lasttime
      FROM app.networks n
      LEFT JOIN app.networks_latest_state nls ON nls.id = n.id
      ORDER BY n.last_seen_at DESC NULLS LAST
      LIMIT $1
    `;

    const result = await pool.query(networksQuery, [limit]);
    res.json({
      ok: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err: any) {
    console.error('Networks error:', err);
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
});


app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
