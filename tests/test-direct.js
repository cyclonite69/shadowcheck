import 'dotenv/config';
// Direct test of networks endpoint without server issues
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'shadowcheck',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  ssl: false
});

async function testQuery() {
  try {
    const result = await pool.query(`
      SELECT
        unified_id as id,
        bssid,
        ssid,
        frequency,
        capabilities,
        lasttime,
        lastlat as latitude,
        lastlon as longitude,
        type,
        bestlevel,
        to_timestamp(lasttime/1000.0) as observed_at
      FROM app.networks_legacy
      WHERE type = 'W'
      ORDER BY lasttime DESC NULLS LAST
      LIMIT 3
    `);

    const data = result.rows.map(row => ({
      id: row.id?.toString() || '',
      bssid: row.bssid || '',
      ssid: row.ssid,
      frequency: row.frequency,
      signal_strength: row.bestlevel,
      encryption: row.capabilities,
      latitude: row.latitude?.toString(),
      longitude: row.longitude?.toString(),
      observed_at: row.observed_at?.toISOString(),
      radio_type: row.type
    }));

    console.log(JSON.stringify({
      ok: true,
      data: data,
      count: data.length
    }, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

testQuery();