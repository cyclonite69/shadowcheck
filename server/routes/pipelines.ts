import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';

const execAsync = promisify(exec);
const router = Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/v1/pipelines/kml/files
 * List all KML files available for import
 */
router.get('/kml/files', async (_req, res) => {
  try {
    const kmlDir = path.join(process.cwd(), 'pipelines', 'kml');
    const files = await fs.readdir(kmlDir);
    const kmlFiles = files
      .filter(f => f.endsWith('.kml'))
      .map(f => ({
        filename: f,
        path: path.join(kmlDir, f)
      }));

    // Get import status for each file
    const result = await pool.query(`
      SELECT DISTINCT kml_filename, COUNT(*) as observation_count
      FROM app.kml_locations_staging
      GROUP BY kml_filename
    `);

    const importedFiles = new Map(
      result.rows.map(row => [row.kml_filename, parseInt(row.observation_count)])
    );

    const filesWithStatus = kmlFiles.map(f => ({
      filename: f.filename,
      imported: importedFiles.has(f.filename),
      observations: importedFiles.get(f.filename) || 0
    }));

    res.json({
      ok: true,
      files: filesWithStatus
    });
  } catch (err) {
    console.error('[GET /api/v1/pipelines/kml/files] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * POST /api/v1/pipelines/kml/import
 * Import a specific KML file
 * Body: { filename: string }
 */
router.post('/kml/import', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ ok: false, error: 'filename is required' });
    }

    const kmlPath = path.join(process.cwd(), 'pipelines', 'kml', filename);

    // Check if file exists
    try {
      await fs.access(kmlPath);
    } catch {
      return res.status(404).json({ ok: false, error: 'KML file not found' });
    }

    // Run the Python parser
    const parserPath = path.join(process.cwd(), 'pipelines', 'kml', 'kml_parser.py');
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      DB_HOST: '127.0.0.1',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    console.log(`[KML Import] Starting import of ${filename}...`);
    const { stdout, stderr } = await execAsync(
      `python3 "${parserPath}" "${kmlPath}"`,
      { env, timeout: 60000 }
    );

    if (stderr && !stderr.includes('✓')) {
      console.error(`[KML Import] stderr:`, stderr);
    }

    console.log(`[KML Import] stdout:`, stdout);

    // Parse the JSON output from the parser
    const lines = stdout.trim().split('\n');
    const jsonLine = lines[lines.length - 1];
    let result;
    try {
      result = JSON.parse(jsonLine);
    } catch {
      result = {
        ok: true,
        file: filename,
        stats: { networks: 0, locations: 0 },
        output: stdout
      };
    }

    res.json(result);
  } catch (err: any) {
    console.error('[POST /api/v1/pipelines/kml/import] error:', err);
    res.status(500).json({
      ok: false,
      error: String(err),
      details: err.stderr || err.message
    });
  }
});

/**
 * POST /api/v1/pipelines/kml/import-all
 * Import all KML files
 */
router.post('/kml/import-all', async (_req, res) => {
  try {
    const kmlDir = path.join(process.cwd(), 'pipelines', 'kml');
    const files = await fs.readdir(kmlDir);
    const kmlFiles = files.filter(f => f.endsWith('.kml'));

    const results = [];
    let totalNetworks = 0;
    let totalLocations = 0;
    let errors = 0;

    const parserPath = path.join(process.cwd(), 'pipelines', 'kml', 'kml_parser.py');
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      DB_HOST: '127.0.0.1',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    for (const filename of kmlFiles) {
      try {
        const kmlPath = path.join(kmlDir, filename);
        const { stdout } = await execAsync(
          `python3 "${parserPath}" "${kmlPath}"`,
          { env, timeout: 60000 }
        );

        const lines = stdout.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const result = JSON.parse(jsonLine);

        if (result.ok) {
          totalNetworks += result.stats.networks || 0;
          totalLocations += result.stats.locations || 0;
          results.push({ filename, success: true, ...result.stats });
        } else {
          errors++;
          results.push({ filename, success: false, error: result.error });
        }
      } catch (err: any) {
        errors++;
        results.push({ filename, success: false, error: String(err) });
        console.error(`Error importing ${filename}:`, err);
      }
    }

    res.json({
      ok: true,
      summary: {
        total_files: kmlFiles.length,
        successful: kmlFiles.length - errors,
        failed: errors,
        total_networks: totalNetworks,
        total_locations: totalLocations
      },
      results
    });
  } catch (err) {
    console.error('[POST /api/v1/pipelines/kml/import-all] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * GET /api/v1/pipelines/kml/stats
 * Get statistics about KML staging data
 */
router.get('/kml/stats', async (_req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM app.kml_networks_staging) as networks_count,
        (SELECT COUNT(*) FROM app.kml_locations_staging) as locations_count,
        (SELECT COUNT(DISTINCT kml_filename) FROM app.kml_locations_staging) as files_imported,
        (SELECT MIN(kml_import_dt) FROM app.kml_locations_staging) as first_import,
        (SELECT MAX(kml_import_dt) FROM app.kml_locations_staging) as last_import
    `);

    res.json({
      ok: true,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error('[GET /api/v1/pipelines/kml/stats] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * DELETE /api/v1/pipelines/kml/clear
 * Clear all KML staging data
 */
router.delete('/kml/clear', async (_req, res) => {
  try {
    await pool.query('DELETE FROM app.kml_locations_staging');
    await pool.query('DELETE FROM app.kml_networks_staging');

    res.json({
      ok: true,
      message: 'KML staging tables cleared'
    });
  } catch (err) {
    console.error('[DELETE /api/v1/pipelines/kml/clear] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * POST /api/v1/pipelines/kml/merge
 * Merge KML staging data into production tables
 */
router.post('/kml/merge', async (_req, res) => {
  try {
    // Merge networks
    const networksResult = await pool.query(`
      INSERT INTO app.networks_legacy (bssid, ssid, frequency, capabilities, type, lasttime)
      SELECT
        kn.bssid,
        kn.ssid,
        kn.frequency,
        kn.capabilities,
        CASE
          WHEN kn.network_type = 'BT' THEN 'B'
          WHEN kn.network_type = 'BLE' THEN 'E'
          ELSE 'W'
        END,
        kn.last_seen
      FROM app.kml_networks_staging kn
      ON CONFLICT (bssid) DO UPDATE SET
        ssid = COALESCE(EXCLUDED.ssid, app.networks_legacy.ssid),
        frequency = COALESCE(EXCLUDED.frequency, app.networks_legacy.frequency),
        lasttime = GREATEST(EXCLUDED.lasttime, app.networks_legacy.lasttime)
      RETURNING bssid
    `);

    // Merge locations
    const locationsResult = await pool.query(`
      INSERT INTO app.locations_legacy (bssid, level, lat, lon, altitude, accuracy, time)
      SELECT
        kl.bssid,
        kl.level,
        kl.lat,
        kl.lon,
        kl.altitude,
        kl.accuracy,
        kl.time
      FROM app.kml_locations_staging kl
      WHERE kl.lat IS NOT NULL
        AND kl.lon IS NOT NULL
        AND kl.lat BETWEEN -90 AND 90
        AND kl.lon BETWEEN -180 AND 180
        AND NOT (kl.lat = 0 AND kl.lon = 0)
      RETURNING bssid
    `);

    res.json({
      ok: true,
      merged: {
        networks: networksResult.rowCount,
        locations: locationsResult.rowCount
      },
      message: 'KML data merged into production tables'
    });
  } catch (err) {
    console.error('[POST /api/v1/pipelines/kml/merge] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * GET /api/v1/pipelines/wigle/files
 * List all WiGLE SQLite database files available for import
 */
router.get('/wigle/files', async (_req, res) => {
  try {
    const wigleDir = path.join(process.cwd(), 'pipelines', 'wigle');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(wigleDir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }

    const files = await fs.readdir(wigleDir);
    const wigleFiles = files
      .filter(f => f.endsWith('.zip') || f.endsWith('.sqlite') || f.endsWith('.db'))
      .map(f => ({
        filename: f,
        path: path.join(wigleDir, f),
        type: f.endsWith('.zip') ? 'zip' : 'sqlite'
      }));

    res.json({
      ok: true,
      files: wigleFiles
    });
  } catch (err) {
    console.error('[GET /api/v1/pipelines/wigle/files] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * POST /api/v1/pipelines/wigle/import
 * Import WiGLE SQLite database (supports .zip or .sqlite files)
 * Body: { filename: string }
 */
router.post('/wigle/import', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ ok: false, error: 'filename is required' });
    }

    const wiglePath = path.join(process.cwd(), 'pipelines', 'wigle', filename);

    // Check if file exists
    try {
      await fs.access(wiglePath);
    } catch {
      return res.status(404).json({ ok: false, error: 'WiGLE database file not found' });
    }

    // Run the Python parser
    const parserPath = path.join(process.cwd(), 'pipelines', 'wigle', 'wigle_sqlite_parser.py');
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      DB_HOST: '127.0.0.1',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    console.log(`[WiGLE Import] Starting import of ${filename}...`);
    const { stdout, stderr } = await execAsync(
      `python3 "${parserPath}" "${wiglePath}"`,
      { env, timeout: 600000 } // 10 minute timeout for large databases
    );

    if (stderr) {
      console.log(`[WiGLE Import] Progress:`, stderr);
    }

    console.log(`[WiGLE Import] Output:`, stdout);

    // Parse the JSON output from the parser
    const lines = stdout.trim().split('\n');
    const jsonLine = lines[lines.length - 1];
    let result;
    try {
      result = JSON.parse(jsonLine);
    } catch {
      result = {
        ok: true,
        file: filename,
        stats: { networks: 0, locations: 0 },
        output: stdout
      };
    }

    res.json(result);
  } catch (err: any) {
    console.error('[POST /api/v1/pipelines/wigle/import] error:', err);
    res.status(500).json({
      ok: false,
      error: String(err),
      details: err.stderr || err.message
    });
  }
});

/**
 * GET /api/v1/pipelines/kismet/files
 * List all Kismet database files available for import
 */
router.get('/kismet/files', async (_req, res) => {
  try {
    const kismetDir = path.join(process.cwd(), 'pipelines', 'kismet');

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(kismetDir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }

    const files = await fs.readdir(kismetDir);
    const kismetFiles = files
      .filter(f => f.endsWith('.kismet'))
      .map(async (f) => {
        const filePath = path.join(kismetDir, f);
        const stats = await fs.stat(filePath);
        return {
          filename: f,
          path: filePath,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size)
        };
      });

    const resolvedFiles = await Promise.all(kismetFiles);

    // Get import status
    const result = await pool.query(`
      SELECT DISTINCT kismet_filename, COUNT(*) as device_count
      FROM app.kismet_devices_staging
      GROUP BY kismet_filename
    `);

    const importedFiles = new Map(
      result.rows.map(row => [row.kismet_filename, parseInt(row.device_count)])
    );

    const filesWithStatus = resolvedFiles.map(f => ({
      ...f,
      imported: importedFiles.has(f.filename),
      devices: importedFiles.get(f.filename) || 0
    }));

    res.json({
      ok: true,
      files: filesWithStatus
    });
  } catch (err) {
    console.error('[GET /api/v1/pipelines/kismet/files] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * POST /api/v1/pipelines/kismet/import
 * Import Kismet database file
 * Body: { filename: string, includePackets?: boolean }
 */
router.post('/kismet/import', async (req, res) => {
  try {
    const { filename, includePackets = false } = req.body;

    if (!filename) {
      return res.status(400).json({ ok: false, error: 'filename is required' });
    }

    const kismetPath = path.join(process.cwd(), 'pipelines', 'kismet', filename);

    // Check if file exists
    try {
      await fs.access(kismetPath);
    } catch {
      return res.status(404).json({ ok: false, error: 'Kismet database file not found' });
    }

    // Run the Python parser
    const parserPath = path.join(process.cwd(), 'pipelines', 'kismet', 'kismet_parser.py');
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      DB_HOST: '127.0.0.1',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    const args = includePackets ? '--include-packets' : '';

    console.log(`[Kismet Import] Starting import of ${filename}... (include packets: ${includePackets})`);
    const { stdout, stderr } = await execAsync(
      `python3 "${parserPath}" "${kismetPath}" ${args}`,
      { env, timeout: 600000 } // 10 minute timeout
    );

    if (stderr) {
      console.log(`[Kismet Import] Progress:`, stderr);
    }

    console.log(`[Kismet Import] Output:`, stdout);

    // Parse the JSON output from the parser
    const lines = stdout.trim().split('\n');
    const jsonLine = lines[lines.length - 1];
    let result;
    try {
      result = JSON.parse(jsonLine);
    } catch {
      result = {
        ok: true,
        file: filename,
        stats: { devices: 0, datasources: 0, packets: 0, alerts: 0, snapshots: 0 },
        output: stdout
      };
    }

    res.json(result);
  } catch (err: any) {
    console.error('[POST /api/v1/pipelines/kismet/import] error:', err);
    res.status(500).json({
      ok: false,
      error: String(err),
      details: err.stderr || err.message
    });
  }
});

/**
 * GET /api/v1/pipelines/kismet/stats
 * Get statistics about Kismet staging data
 */
router.get('/kismet/stats', async (_req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM app.kismet_devices_staging) as devices_count,
        (SELECT COUNT(*) FROM app.kismet_datasources_staging) as datasources_count,
        (SELECT COUNT(*) FROM app.kismet_packets_staging) as packets_count,
        (SELECT COUNT(*) FROM app.kismet_alerts_staging) as alerts_count,
        (SELECT COUNT(*) FROM app.kismet_snapshots_staging) as snapshots_count,
        (SELECT COUNT(DISTINCT kismet_filename) FROM app.kismet_devices_staging) as files_imported,
        (SELECT MIN(kismet_import_dt) FROM app.kismet_devices_staging) as first_import,
        (SELECT MAX(kismet_import_dt) FROM app.kismet_devices_staging) as last_import
    `);

    res.json({
      ok: true,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error('[GET /api/v1/pipelines/kismet/stats] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * DELETE /api/v1/pipelines/kismet/clear
 * Clear all Kismet staging data
 */
router.delete('/kismet/clear', async (_req, res) => {
  try {
    await pool.query('DELETE FROM app.kismet_packets_staging');
    await pool.query('DELETE FROM app.kismet_alerts_staging');
    await pool.query('DELETE FROM app.kismet_snapshots_staging');
    await pool.query('DELETE FROM app.kismet_datasources_staging');
    await pool.query('DELETE FROM app.kismet_devices_staging');

    res.json({
      ok: true,
      message: 'Kismet staging tables cleared'
    });
  } catch (err) {
    console.error('[DELETE /api/v1/pipelines/kismet/clear] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * POST /api/v1/pipelines/wigle-api/query
 * Query WiGLE API and import results to staging tables (NEVER production)
 * Body: {
 *   ssid?: string,
 *   bssid?: string,
 *   latrange1?: number,
 *   latrange2?: number,
 *   longrange1?: number,
 *   longrange2?: number
 * }
 */
router.post('/wigle-api/query', async (req, res) => {
  try {
    const { ssid, bssid, latrange1, latrange2, longrange1, longrange2 } = req.body;

    // Get WiGLE API credentials from environment
    const wigleApiName = process.env.WIGLE_API_NAME;
    const wigleApiToken = process.env.WIGLE_API_TOKEN;

    if (!wigleApiName || !wigleApiToken) {
      return res.status(400).json({
        ok: false,
        error: 'WiGLE API credentials not configured. Set WIGLE_API_NAME and WIGLE_API_TOKEN in .env'
      });
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (ssid) params.append('ssid', ssid);
    if (bssid) params.append('netid', bssid);
    if (latrange1 !== undefined) params.append('latrange1', String(latrange1));
    if (latrange2 !== undefined) params.append('latrange2', String(latrange2));
    if (longrange1 !== undefined) params.append('longrange1', String(longrange1));
    if (longrange2 !== undefined) params.append('longrange2', String(longrange2));

    console.log(`[WiGLE API] Querying: ${params.toString()}`);

    // Query WiGLE API
    const wigleUrl = `https://api.wigle.net/api/v2/network/search?${params.toString()}`;
    const response = await fetch(wigleUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${wigleApiName}:${wigleApiToken}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WiGLE API error: ${response.statusText}`);
    }

    const data = await response.json() as any;

    if (!data.success) {
      throw new Error(`WiGLE API returned error: ${data.message || 'Unknown error'}`);
    }

    // Import results to STAGING tables only
    let networksImported = 0;
    let locationsImported = 0;
    const results = data.results || [];
    const queryParams = JSON.stringify({ ssid, bssid, latrange1, latrange2, longrange1, longrange2 });

    for (const network of results) {
      try {
        // Insert network into staging
        await pool.query(`
          INSERT INTO app.wigle_api_networks_staging
          (bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon,
           trilat, trilong, channel, qos, transid, firsttime, country, region, city, query_params)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb)
          ON CONFLICT (bssid, query_timestamp) DO UPDATE SET
            ssid = COALESCE(EXCLUDED.ssid, app.wigle_api_networks_staging.ssid),
            lasttime = GREATEST(EXCLUDED.lasttime, app.wigle_api_networks_staging.lasttime)
        `, [
          network.netid,
          network.ssid || null,
          network.channel ? (network.channel * 5 + (network.channel <= 14 ? 2407 : 5000)) : null,
          network.encryption || null,
          network.type || 'W',
          network.lasttime ? new Date(network.lasttime) : null,
          network.lastlat || null,
          network.lastlon || null,
          network.trilat || null,
          network.trilong || null,
          network.channel || null,
          network.qos || null,
          network.transid || null,
          network.firsttime ? new Date(network.firsttime) : null,
          network.country || null,
          network.region || null,
          network.city || null,
          queryParams
        ]);
        networksImported++;

        // Insert location observation if coordinates exist
        if (network.trilat && network.trilong) {
          await pool.query(`
            INSERT INTO app.wigle_api_locations_staging
            (bssid, lat, lon, altitude, accuracy, time, signal_level, query_params)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
          `, [
            network.netid,
            network.trilat,
            network.trilong,
            null,
            null,
            network.lasttime ? new Date(network.lasttime) : null,
            network.rcois || null,
            queryParams
          ]);
          locationsImported++;
        }
      } catch (err) {
        console.error(`Error importing network ${network.netid}:`, err);
      }
    }

    res.json({
      ok: true,
      stats: {
        networks: networksImported,
        locations: locationsImported,
        total_results: data.resultCount || 0,
        search_after: data.searchAfter || null
      },
      message: `Imported ${networksImported} networks and ${locationsImported} locations to staging`
    });

  } catch (err: any) {
    console.error('[POST /api/v1/pipelines/wigle-api/query] error:', err);
    res.status(500).json({
      ok: false,
      error: String(err),
      details: err.message
    });
  }
});

/**
 * POST /api/v1/pipelines/wigle-api/detail
 * Fetch detailed network information from WiGLE API including full observation history
 * Body: { bssid: string }
 */
router.post('/wigle-api/detail', async (req, res) => {
  try {
    const { bssid } = req.body;

    if (!bssid) {
      return res.status(400).json({ ok: false, error: 'bssid is required' });
    }

    // Get WiGLE API credentials from environment
    const wigleApiName = process.env.WIGLE_API_NAME;
    const wigleApiToken = process.env.WIGLE_API_TOKEN;

    if (!wigleApiName || !wigleApiToken) {
      return res.status(400).json({
        ok: false,
        error: 'WiGLE API credentials not configured. Set WIGLE_API_NAME and WIGLE_API_TOKEN in .env'
      });
    }

    console.log(`[WiGLE API Detail] Fetching full observation history for: ${bssid}`);

    // Query WiGLE API detail endpoint
    const wigleUrl = `https://api.wigle.net/api/v2/network/detail?netid=${encodeURIComponent(bssid)}`;
    const response = await fetch(wigleUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${wigleApiName}:${wigleApiToken}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`WiGLE API error: ${response.statusText}`);
    }

    const data = await response.json() as any;

    if (!data.success) {
      throw new Error(`WiGLE API returned error: ${data.message || 'Unknown error'}`);
    }

    // Extract network details
    const results = data.results || [];
    if (results.length === 0) {
      return res.json({
        ok: false,
        error: 'No network found with that BSSID'
      });
    }

    const network = results[0];
    const queryParams = JSON.stringify({ bssid, endpoint: 'detail' });

    // Import network metadata
    await pool.query(`
      INSERT INTO app.wigle_api_networks_staging
      (bssid, ssid, frequency, capabilities, type, lasttime, lastlat, lastlon,
       trilat, trilong, channel, qos, transid, firsttime, country, region, city, query_params)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb)
      ON CONFLICT (bssid, query_timestamp) DO UPDATE SET
        ssid = COALESCE(EXCLUDED.ssid, app.wigle_api_networks_staging.ssid),
        lasttime = GREATEST(EXCLUDED.lasttime, app.wigle_api_networks_staging.lasttime)
    `, [
      network.netid,
      network.ssid || null,
      network.channel ? (network.channel * 5 + (network.channel <= 14 ? 2407 : 5000)) : null,
      network.encryption || null,
      network.type || 'W',
      network.lasttime ? new Date(network.lasttime) : null,
      network.lastlat || null,
      network.lastlon || null,
      network.trilat || null,
      network.trilong || null,
      network.channel || null,
      network.qos || null,
      network.transid || null,
      network.firsttime ? new Date(network.firsttime) : null,
      network.country || null,
      network.region || null,
      network.city || null,
      queryParams
    ]);

    // Import ALL location observations from locationData array
    let locationsImported = 0;
    const locationData = network.locationData || [];

    for (const location of locationData) {
      try {
        // Skip invalid coordinates
        if (!location.latitude || !location.longitude) continue;
        if (location.latitude === 0 && location.longitude === 0) continue;
        if (location.latitude < -90 || location.latitude > 90) continue;
        if (location.longitude < -180 || location.longitude > 180) continue;

        await pool.query(`
          INSERT INTO app.wigle_api_locations_staging
          (bssid, lat, lon, altitude, accuracy, time, signal_level, query_params)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        `, [
          network.netid,
          location.latitude,
          location.longitude,
          location.alt || null,
          location.accuracy || null,
          location.time ? new Date(location.time) : null,
          location.signal || null,
          queryParams
        ]);
        locationsImported++;
      } catch (err) {
        console.error(`Error importing location for ${network.netid}:`, err);
      }
    }

    console.log(`[WiGLE API Detail] Imported ${locationsImported} observations for ${bssid}`);

    res.json({
      ok: true,
      bssid: network.netid,
      ssid: network.ssid,
      stats: {
        network_imported: true,
        total_observations: locationData.length,
        observations_imported: locationsImported,
        skipped: locationData.length - locationsImported
      },
      message: `Imported detailed data: ${locationsImported} observations for ${network.ssid || network.netid}`
    });

  } catch (err: any) {
    console.error('[POST /api/v1/pipelines/wigle-api/detail] error:', err);
    res.status(500).json({
      ok: false,
      error: String(err),
      details: err.message
    });
  }
});

/**
 * GET /api/v1/pipelines/wigle-api/stats
 * Get WiGLE API staging table statistics
 */
router.get('/wigle-api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM app.wigle_api_networks_staging) as networks,
        (SELECT COUNT(*) FROM app.wigle_api_locations_staging) as locations,
        (SELECT COUNT(DISTINCT query_timestamp) FROM app.wigle_api_networks_staging) as unique_queries,
        (SELECT MAX(query_timestamp) FROM app.wigle_api_networks_staging) as last_import
    `);

    res.json({
      ok: true,
      stats: result.rows[0]
    });
  } catch (err: any) {
    console.error('[GET /api/v1/pipelines/wigle-api/stats] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * DELETE /api/v1/pipelines/wigle-api/clear
 * Clear all WiGLE API staging data
 */
router.delete('/wigle-api/clear', async (req, res) => {
  try {
    await pool.query('DELETE FROM app.wigle_api_locations_staging');
    await pool.query('DELETE FROM app.wigle_api_networks_staging');

    res.json({
      ok: true,
      message: 'WiGLE API staging data cleared'
    });
  } catch (err: any) {
    console.error('[DELETE /api/v1/pipelines/wigle-api/clear] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default router;
