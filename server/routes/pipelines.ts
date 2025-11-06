import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../db/connection';

const execAsync = promisify(exec);
const router = Router();

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
    const rows = await db.query(`
      SELECT DISTINCT kml_filename, COUNT(*) as observation_count
      FROM app.kml_locations_staging
      GROUP BY kml_filename
    `);

    const importedFiles = new Map(
      rows.map((row: any) => [row.kml_filename, parseInt(row.observation_count)])
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
    const parserPath = path.join(process.cwd(), 'server', 'pipelines', 'parsers', 'kml_parser.py');

    // Read password from secret file if it exists
    let dbPassword = 'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';
    try {
      if (process.env.DB_PASSWORD_FILE) {
        dbPassword = await fs.readFile(process.env.DB_PASSWORD_FILE, 'utf8').then(p => p.trim());
      }
    } catch (err) {
      console.warn('[KML Import] Could not read DB_PASSWORD_FILE, using default');
    }

    const env = {
      ...process.env,
      DB_HOST: process.env.DB_HOST || 'postgres',
      DB_PORT: process.env.DB_PORT || '5432',
      DB_NAME: process.env.DB_NAME || 'shadowcheck',
      DB_USER: process.env.DB_USER || 'shadowcheck_user',
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

    const parserPath = path.join(process.cwd(), 'server', 'pipelines', 'parsers', 'kml_parser.py');
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      DB_HOST: process.env.DB_HOST || 'postgres',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    for (const filename of kmlFiles) {
      try {
        const kmlPath = path.join(kmlDir, filename);
        console.log(`[KML Import-All] Processing ${filename}...`);
        const { stdout } = await execAsync(
          `python3 "${parserPath}" "${kmlPath}"`,
          { env, timeout: 300000 } // 5 minute timeout per file
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
    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM app.kml_networks_staging) as networks_count,
        (SELECT COUNT(*) FROM app.kml_locations_staging) as locations_count,
        (SELECT COUNT(DISTINCT kml_filename) FROM app.kml_locations_staging) as files_imported,
        (SELECT MIN(kml_import_dt) FROM app.kml_locations_staging) as first_import,
        (SELECT MAX(kml_import_dt) FROM app.kml_locations_staging) as last_import
    `);

    res.json({
      ok: true,
      stats: stats[0]
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
    await db.query('DELETE FROM app.kml_locations_staging');
    await db.query('DELETE FROM app.kml_networks_staging');

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
    const networksResult = await db.query(`
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
    const locationsResult = await db.query(`
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
      DB_HOST: process.env.DB_HOST || 'postgres',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    console.log(`[WiGLE Import] Starting import of ${filename}...`);
    const { stdout, stderr } = await execAsync(
      `python3 "${parserPath}" "${wiglePath}"`,
      {
        env,
        timeout: 600000, // 10 minute timeout for large databases
        maxBuffer: 100 * 1024 * 1024 // 100MB buffer for large database output
      }
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
    const result = await db.query(`
      SELECT DISTINCT kismet_filename, COUNT(*) as device_count
      FROM app.kismet_devices_staging
      GROUP BY kismet_filename
    `);

    const importedFiles = new Map(
      result.map((row: any) => [row.kismet_filename, parseInt(row.device_count)])
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
    const parserPath = path.join(process.cwd(), 'server', 'pipelines', 'parsers', 'kismet_parser.py');
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      DB_HOST: process.env.DB_HOST || 'postgres',
      DB_PORT: '5432',
      DB_NAME: 'shadowcheck',
      DB_USER: 'shadowcheck_user',
      DB_PASSWORD: dbPassword
    };

    const args = includePackets ? '--include-packets' : '';

    console.log(`[Kismet Import] Starting import of ${filename}... (include packets: ${includePackets})`);
    const { stdout, stderr } = await execAsync(
      `python3 "${parserPath}" "${kismetPath}" ${args}`,
      {
        env,
        timeout: 600000, // 10 minute timeout
        maxBuffer: 100 * 1024 * 1024 // 100MB buffer for large database output
      }
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
    const stats = await db.query(`
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
      stats: stats[0]
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
    await db.query('DELETE FROM app.kismet_packets_staging');
    await db.query('DELETE FROM app.kismet_alerts_staging');
    await db.query('DELETE FROM app.kismet_snapshots_staging');
    await db.query('DELETE FROM app.kismet_datasources_staging');
    await db.query('DELETE FROM app.kismet_devices_staging');

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
        await db.query(`
          INSERT INTO app.wigle_alpha_v3_networks
          (bssid, ssid, frequency, encryption, type, last_seen, first_seen,
           trilaterated_lat, trilaterated_lon, channel)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (bssid, query_timestamp) DO UPDATE SET
            ssid = COALESCE(EXCLUDED.ssid, app.wigle_alpha_v3_networks.ssid),
            last_seen = GREATEST(EXCLUDED.last_seen, app.wigle_alpha_v3_networks.last_seen)
        `, [
          network.netid,
          network.ssid || null,
          network.channel ? (network.channel * 5 + (network.channel <= 14 ? 2407 : 5000)) : null,
          network.encryption || null,
          network.type || 'W',
          network.lasttime ? new Date(network.lasttime) : null,
          network.firsttime ? new Date(network.firsttime) : null,
          network.trilat || null,
          network.trilong || null,
          network.channel || null
        ]);
        networksImported++;

        // Insert location observation if coordinates exist
        if (network.trilat && network.trilong) {
          await db.query(`
            INSERT INTO app.wigle_alpha_v3_observations
            (bssid, lat, lon, altitude, accuracy, observation_time, last_update, signal_dbm)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            network.netid,
            network.trilat,
            network.trilong,
            null,
            null,
            network.lasttime ? new Date(network.lasttime) : null,
            network.lasttime ? new Date(network.lasttime) : null,
            network.rcois || null
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

    // Call the Python Alpha v3 importer which handles the correct v3 endpoint and format
    const alphaV3ParserPath = path.join(process.cwd(), 'server', 'pipelines', 'enrichment', 'wigle_api_alpha_v3.py');

    // Set up environment with API credentials and DB config
    const dbPassword = process.env.DATABASE_URL?.match(/password=([^&\s]+)/)?.[1] ||
                       'DJvHRxGZ2e+rDgkO4LWXZG1np80rU4daQNQpQ3PwvZ8=';

    const env = {
      ...process.env,
      WIGLE_API_KEY: Buffer.from(`${wigleApiName}:${wigleApiToken}`).toString('base64'),
      PGHOST: process.env.PGHOST || 'postgres',
      PGPORT: '5432',
      PGDATABASE: 'shadowcheck',
      PGUSER: 'shadowcheck_user',
      PGPASSWORD: dbPassword
    };

    console.log(`[WiGLE API Detail] Calling Alpha v3 importer for ${bssid}...`);

    try {
      // FIRST: Tag this BSSID for enrichment (add to queue)
      await db.query(`
        INSERT INTO app.bssid_enrichment_queue (bssid, priority, status)
        VALUES ($1, 100, 'pending')
        ON CONFLICT (bssid) DO UPDATE SET
          priority = 100,
          status = 'pending',
          tagged_at = NOW()
      `, [bssid.toUpperCase()]);

      console.log(`[WiGLE API Detail] Added ${bssid} to enrichment queue`);

      // SECOND: Process the queue (fetch from WiGLE API v3 and import)
      // The Python script uses the correct v3 endpoint: /api/v3/detail/wifi/{bssid}
      const { stdout: processStdout, stderr: processStderr } = await execAsync(
        `python3 "${alphaV3ParserPath}" --process-queue --limit 1`,
        {
          env,
          timeout: 120000, // 2 minute timeout for API call + import
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        }
      );

      if (processStderr) {
        console.log(`[WiGLE API Detail] Python output:`, processStderr);
      }

      // Check if import was successful
      const result = await db.query(`
        SELECT COUNT(*) as obs_count
        FROM app.wigle_alpha_v3_observations
        WHERE bssid = $1
      `, [bssid.toUpperCase()]);

      const obsCount = parseInt(result[0]?.obs_count || '0');

      console.log(`[WiGLE API Detail] Imported ${obsCount} observations for ${bssid}`);

      res.json({
        ok: true,
        bssid: bssid.toUpperCase(),
        stats: {
          network_imported: true,
          observations_imported: obsCount
        },
        message: `Imported ${obsCount} observations for ${bssid} via Alpha v3 API`
      });

    } catch (pythonError: any) {
      console.error('[WiGLE API Detail] Python import failed:', pythonError);
      throw new Error(`Failed to import via Alpha v3: ${pythonError.message}`);
    }

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
    const result = await db.query(`
      SELECT
        -- Alpha v3 tables (new simplified schema)
        (SELECT COUNT(*) FROM app.wigle_alpha_v3_networks) as networks_alpha_v3,
        (SELECT COUNT(*) FROM app.wigle_alpha_v3_observations) as observations_alpha_v3,
        (SELECT COUNT(DISTINCT bssid) FROM app.wigle_alpha_v3_observations) as unique_bssids_alpha_v3,
        (SELECT COUNT(DISTINCT ssid) FROM app.wigle_alpha_v3_observations WHERE ssid IS NOT NULL) as unique_ssids_alpha_v3,
        (SELECT MAX(query_timestamp) FROM app.wigle_alpha_v3_networks) as last_import_alpha_v3,

        -- Dynamic SSID cluster stats (query-time aggregation)
        (SELECT COUNT(*) FROM app.wigle_alpha_v3_ssid_clusters) as ssid_clusters_detected,
        (SELECT COUNT(*) FROM app.wigle_alpha_v3_ssid_clusters WHERE threat_level IN ('EXTREME', 'CRITICAL')) as high_threat_clusters
    `);

    res.json({
      ok: true,
      stats: result[0]
    });
  } catch (err: any) {
    console.error('[GET /api/v1/pipelines/wigle-api/stats] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * GET /api/v1/pipelines/wigle-api/staging-data
 * Get all WiGLE API staging data with locations for map display
 * Now includes both legacy and Alpha v3 data
 */
router.get('/wigle-api/staging-data', async (req, res) => {
  try {
    // Get Alpha v3 observations with SSID cluster info
    const alphaV3Result = await db.query(`
      SELECT
        o.bssid,
        o.ssid,
        o.lat,
        o.lon,
        o.altitude,
        o.accuracy,
        o.observation_time as time,
        o.signal_dbm as signal_level,
        o.frequency,
        o.channel,
        o.encryption_value,
        n.trilaterated_lat,
        n.trilaterated_lon,
        n.street_address,
        n.type,
        c.observation_count,
        c.mobility_pattern,
        c.threat_level,
        c.max_distance_from_home_km::NUMERIC(10,2) as distance_from_home_km
      FROM app.wigle_alpha_v3_observations o
      JOIN app.wigle_alpha_v3_networks n ON o.bssid = n.bssid
      LEFT JOIN app.wigle_alpha_v3_ssid_clusters c ON o.bssid = c.bssid AND o.ssid = c.ssid
      WHERE o.lat IS NOT NULL
        AND o.lon IS NOT NULL
        AND o.lat BETWEEN -90 AND 90
        AND o.lon BETWEEN -180 AND 180
        AND NOT (o.lat = 0 AND o.lon = 0)
      ORDER BY o.observation_time DESC
    `);

    res.json({
      ok: true,
      count: alphaV3Result.length,
      source: 'alpha_v3',
      observations: alphaV3Result
    });
  } catch (err: any) {
    console.error('[GET /api/v1/pipelines/wigle-api/staging-data] error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/**
 * DELETE /api/v1/pipelines/wigle-api/clear
 * Clear all WiGLE API staging data
 */
router.delete('/wigle-api/clear', async (req, res) => {
  try {
    await db.query('DELETE FROM app.wigle_alpha_v3_observations');
    await db.query('DELETE FROM app.wigle_alpha_v3_networks');

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
