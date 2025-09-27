import type { Express } from 'express';
import pg from 'pg';

const { Pool } = pg;

// Get pool instance - assume it's available from process.env
const getPool = () => {
  return new Pool({ connectionString: process.env.DATABASE_URL });
};

export function registerSurveillanceRoutes(app: Express) {
  // Federal surveillance detection endpoint
  app.get('/api/v1/surveillance/federal', async (req, res) => {
    try {
      const { limit = 50, threat_level } = req.query;

      let whereClause = 'WHERE threat_classification NOT LIKE \'FALSE_POSITIVE_%\'';
      if (threat_level) {
        const levels: Record<string, string> = {
          confirmed: 'final_threat_score >= 80',
          high: 'final_threat_score >= 50 AND final_threat_score < 80',
          investigate: 'final_threat_score >= 30 AND final_threat_score < 50',
          humint: 'threat_classification LIKE \'HUMINT_%\'',
        };

        if (levels[threat_level as string]) {
          whereClause += ` AND ${levels[threat_level as string]}`;
        }
      }

      const federalQuery = `
        WITH federal_network_analysis AS (
          SELECT
            n.bssid,
            n.ssid,
            COUNT(*) as sightings,
            MIN(TO_TIMESTAMP(l.time/1000)) as first_seen,
            MAX(TO_TIMESTAMP(l.time/1000)) as last_seen,
            AVG(ST_Distance(
              ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
              (SELECT location_point FROM app.location_markers WHERE marker_type = 'home')::geography
            ) / 1000.0) as avg_distance_km,
            COALESCE(rm.organization_name, 'Unknown') as manufacturer,

            -- Precise categorization based on SSID patterns
            CASE
              -- HIGH CONFIDENCE FEDERAL (Explicit operational naming - user validated)
              WHEN n.ssid ~* '^FBI.?(Van|Mobile|Unit|Surveillance|Base|Station|Vehicle|Ops)' THEN 'CONFIRMED_FBI_OPERATION'
              WHEN n.ssid ~* 'FBI.?Van' THEN 'CONFIRMED_FBI_VAN'
              WHEN n.ssid ~* 'DEA.?(earpiece|Van|Mobile|Unit|Operations|Base|Station|Vehicle|Ops)' THEN 'CONFIRMED_DEA_OPERATION'
              WHEN n.ssid ~* '^CIA.?(Van|Mobile|Unit|Black|Operations|Base|Station)' THEN 'CONFIRMED_CIA_OPERATION'
              WHEN n.ssid ~* '^(FBI|CIA|DEA|DOJ|DOD|NSA|ATF|USSS).?(Task.?Force|Joint.?Team)' THEN 'CONFIRMED_TASK_FORCE'

              -- FALSE POSITIVE PATTERNS
              WHEN n.ssid ~* '(definitely.?NOT.?an?.?FBI.?van|not.?fbi|fake.?fbi)' THEN 'FALSE_POSITIVE_DECEPTION'

              -- MEDIUM CONFIDENCE
              WHEN n.ssid ~* '^[A-Z]{3,4}-[A-Z0-9]{2,8}$' AND n.ssid ~* '(FBI|CIA|DEA|DOJ|DOD|NSA|ATF)' THEN 'LIKELY_FEDERAL_CALLSIGN'
              WHEN n.ssid ~* '(FEDERAL|FED).?(MOBILE|VAN|UNIT|BASE)' THEN 'LIKELY_FEDERAL_MOBILE'

              -- BSSID CORRELATION CANDIDATES
              WHEN n.ssid ~* '(FBI|CIA|DEA)' AND n.bssid ~ '^([0-9A-F]{2}:){5}[0-9A-F]{2}$' THEN 'BSSID_CORRELATION_CANDIDATE'

              -- INVESTIGATE
              WHEN n.ssid ~* '^[A-Z]{2,4}[0-9]{1,4}$' AND LENGTH(n.ssid) BETWEEN 3 AND 8 THEN 'INVESTIGATE_CALLSIGN'
              WHEN n.ssid ILIKE '%surveillance%' OR n.ssid ILIKE '%intel%' OR n.ssid ILIKE '%recon%' THEN 'INVESTIGATE_SURVEILLANCE_TERMS'

              -- HUMINT COVER
              WHEN n.ssid ~* 'gilroy' THEN 'HUMINT_POTENTIAL_COVER_BUSINESS'
              WHEN n.ssid ~* '(barista|checkout|cashier|clerk|handyman|maintenance)' THEN 'HUMINT_POTENTIAL_OPERATIVE_ROLE'

              ELSE 'UNCLASSIFIED_FEDERAL_MENTION'
            END as threat_classification,

            -- Security level
            MAX(CASE
              WHEN n.capabilities ILIKE '%WPA3%' OR n.capabilities ILIKE '%SAE%' THEN 'HIGH_SECURITY'
              WHEN n.capabilities ILIKE '%WPA2%' THEN 'STANDARD_SECURITY'
              WHEN n.capabilities ILIKE '%WPA%' THEN 'BASIC_SECURITY'
              WHEN n.capabilities ILIKE '%WEP%' THEN 'WEAK_SECURITY'
              ELSE 'OPEN_OR_UNKNOWN'
            END) as security_level

          FROM app.networks_legacy n
          INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
          LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
          WHERE n.ssid ~* '(fbi|cia|dea|doj|dod|nsa|atf|usss|ice|cbp)'
          AND n.ssid IS NOT NULL
          AND l.lat IS NOT NULL AND l.lon IS NOT NULL
          AND l.lat <> 0 AND l.lon <> 0
          GROUP BY n.bssid, n.ssid, rm.organization_name, n.capabilities
        ),

        threat_scoring AS (
          SELECT *,
            CASE threat_classification
              WHEN 'CONFIRMED_FBI_OPERATION' THEN 95
              WHEN 'CONFIRMED_FBI_VAN' THEN 95
              WHEN 'CONFIRMED_CIA_OPERATION' THEN 95
              WHEN 'CONFIRMED_DEA_OPERATION' THEN 95
              WHEN 'CONFIRMED_TASK_FORCE' THEN 90
              WHEN 'BSSID_CORRELATION_CANDIDATE' THEN 75
              WHEN 'LIKELY_FEDERAL_CALLSIGN' THEN 70
              WHEN 'LIKELY_FEDERAL_MOBILE' THEN 65
              WHEN 'INVESTIGATE_CALLSIGN' THEN 40
              WHEN 'INVESTIGATE_SURVEILLANCE_TERMS' THEN 45
              WHEN 'HUMINT_POTENTIAL_COVER_BUSINESS' THEN 30
              WHEN 'HUMINT_POTENTIAL_OPERATIVE_ROLE' THEN 25
              WHEN 'UNCLASSIFIED_FEDERAL_MENTION' THEN 20
              WHEN 'FALSE_POSITIVE_DECEPTION' THEN 5
              ELSE 5
            END as base_threat_score,

            -- Proximity modifier
            CASE
              WHEN avg_distance_km <= 1.0 THEN 20
              WHEN avg_distance_km <= 5.0 THEN 10
              WHEN avg_distance_km > 50.0 THEN -10
              ELSE 0
            END as proximity_modifier,

            -- Security modifier
            CASE security_level
              WHEN 'HIGH_SECURITY' THEN 15
              WHEN 'STANDARD_SECURITY' THEN 5
              WHEN 'WEAK_SECURITY' THEN -5
              WHEN 'OPEN_OR_UNKNOWN' THEN -10
              ELSE 0
            END as security_modifier

          FROM federal_network_analysis
        )

        SELECT
          bssid,
          ssid,
          threat_classification,
          (base_threat_score + proximity_modifier + security_modifier) as final_threat_score,
          sightings,
          ROUND(avg_distance_km::numeric, 2) as avg_distance_km,
          security_level,
          manufacturer,
          first_seen::date as first_observed,
          last_seen::date as last_observed,

          -- Final assessment
          CASE
            WHEN (base_threat_score + proximity_modifier + security_modifier) >= 80 THEN 'CONFIRMED_THREAT'
            WHEN (base_threat_score + proximity_modifier + security_modifier) >= 50 THEN 'HIGH_SUSPICION'
            WHEN (base_threat_score + proximity_modifier + security_modifier) >= 30 THEN 'INVESTIGATE'
            WHEN threat_classification LIKE 'HUMINT_%' THEN 'POTENTIAL_HUMINT_COVER'
            ELSE 'LIKELY_FALSE_POSITIVE'
          END as final_assessment,

          -- Recommended action
          CASE
            WHEN threat_classification LIKE 'CONFIRMED_%' THEN 'WiGLE intelligence gathering recommended'
            WHEN threat_classification LIKE 'LIKELY_%' THEN 'Manual verification and WiGLE lookup'
            WHEN threat_classification LIKE 'INVESTIGATE_%' THEN 'Further surveillance pattern analysis'
            WHEN threat_classification LIKE 'HUMINT_%' THEN 'Behavioral observation recommended'
            ELSE 'Exclude from surveillance monitoring'
          END as recommended_action

        FROM threat_scoring
        ${whereClause}
        ORDER BY final_threat_score DESC, threat_classification
        LIMIT $1
      `;

      const pool = getPool();
      const result = await pool.query(federalQuery, [parseInt(limit as string)]);

      res.json({
        ok: true,
        data: result.rows,
        count: result.rows.length,
        filters: { threat_level, limit },
      });
    } catch (error) {
      console.error('Error fetching federal surveillance data:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch federal surveillance analysis',
      });
    }
  });

  // High mobility devices (multi-location surveillance)
  app.get('/api/v1/surveillance/mobility', async (req, res) => {
    try {
      const { limit = 25, min_distance = 10 } = req.query;

      const mobilityQuery = `
        WITH network_distances AS (
          SELECT
            n.bssid,
            n.ssid,
            n.unified_id,
            COALESCE(rm.organization_name, 'Unknown') as manufacturer,
            COUNT(DISTINCT l.id) as location_count,
            MIN(TO_TIMESTAMP(l.time/1000)) as first_seen,
            MAX(TO_TIMESTAMP(l.time/1000)) as last_seen
          FROM app.networks_legacy n
          INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
          LEFT JOIN app.radio_manufacturers rm ON UPPER(LEFT(n.bssid, 8)) = rm.oui_assignment_hex
          WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
          AND l.lat <> 0 AND l.lon <> 0
          AND n.ssid IS NOT NULL
          GROUP BY n.bssid, n.ssid, n.unified_id, rm.organization_name
        ),
        network_max_distances AS (
          SELECT
            nd.*,
            COALESCE(
              (SELECT MAX(ST_Distance(
                ST_SetSRID(ST_MakePoint(l1.lon, l1.lat), 4326)::geography,
                ST_SetSRID(ST_MakePoint(l2.lon, l2.lat), 4326)::geography
              )) / 1000.0
              FROM app.locations_legacy l1, app.locations_legacy l2
              WHERE l1.unified_id = nd.unified_id AND l2.unified_id = nd.unified_id
              AND l1.id < l2.id), 0
            ) as max_distance_km
          FROM network_distances nd
        )
        SELECT
          nmd.*,
          CASE
            WHEN nmd.max_distance_km > 50 THEN 'EXTREME_MOBILITY_THREAT'
            WHEN nmd.location_count >= 5 THEN 'HIGH_MOBILITY_SURVEILLANCE'
            WHEN nmd.location_count >= 3 THEN 'MODERATE_MOBILITY'
            ELSE 'LIMITED_MOBILITY'
          END as mobility_classification
        FROM network_max_distances nmd
        WHERE nmd.max_distance_km >= $2
        ORDER BY nmd.max_distance_km DESC, nmd.location_count DESC
        LIMIT $1
      `;

      const pool = getPool();
      const result = await pool.query(mobilityQuery, [
        parseInt(limit as string),
        parseFloat(min_distance as string),
      ]);

      res.json({
        ok: true,
        data: result.rows,
        count: result.rows.length,
        filters: { limit, min_distance },
      });
    } catch (error) {
      console.error('Error fetching mobility surveillance data:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch mobility surveillance analysis',
      });
    }
  });

  // Network tagging endpoints
  app.post('/api/v1/surveillance/tag', async (req, res) => {
    try {
      const { bssid, ssid, tag_type, confidence = 50, notes } = req.body;

      if (
        !bssid ||
        !tag_type ||
        !['LEGIT', 'THREAT', 'INVESTIGATE', 'FALSE_POSITIVE'].includes(tag_type)
      ) {
        return res.status(400).json({
          ok: false,
          error:
            'Missing required fields: bssid, tag_type (LEGIT/THREAT/INVESTIGATE/FALSE_POSITIVE)',
        });
      }

      const pool = getPool();
      await pool.query('SELECT app.tag_network($1, $2, $3, $4, $5)', [
        bssid,
        ssid || null,
        tag_type,
        parseInt(confidence.toString()),
        notes || null,
      ]);

      res.json({ ok: true, message: 'Network tagged successfully' });
    } catch (error) {
      console.error('Error tagging network:', error);
      res.status(500).json({ ok: false, error: 'Failed to tag network' });
    }
  });

  // Get network tags
  app.get('/api/v1/surveillance/tags', async (req, res) => {
    try {
      const { bssid } = req.query;

      const pool = getPool();
      if (bssid) {
        // Get tags for specific network
        const result = await pool.query('SELECT * FROM app.get_network_tag($1)', [bssid as string]);
        res.json({ ok: true, data: result.rows });
      } else {
        // Get all tags
        const result = await pool.query(`
          SELECT
            bssid,
            ssid,
            tag_type,
            confidence,
            notes,
            tagged_at::date as tagged_date,
            tagged_by
          FROM app.network_tags
          ORDER BY tagged_at DESC
        `);
        res.json({ ok: true, data: result.rows, count: result.rows.length });
      }
    } catch (error) {
      console.error('Error fetching network tags:', error);
      res.status(500).json({ ok: false, error: 'Failed to fetch network tags' });
    }
  });

  // Surveillance summary statistics
  app.get('/api/v1/surveillance/stats', async (req, res) => {
    try {
      const statsQuery = `
        SELECT
          'Federal Networks' as category,
          COUNT(*) as count,
          MAX(TO_TIMESTAMP(l.time/1000)) as last_activity
        FROM app.networks_legacy n
        INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
        WHERE n.ssid ~* '(fbi|cia|dea|doj|dod|nsa|atf|usss|ice|cbp)'
        AND n.ssid IS NOT NULL

        UNION ALL

        SELECT
          'High Mobility (>50km)' as category,
          COUNT(DISTINCT n.bssid) as count,
          MAX(TO_TIMESTAMP(l.time/1000)) as last_activity
        FROM app.networks_legacy n
        INNER JOIN app.locations_legacy l ON n.unified_id = l.unified_id
        WHERE l.lat IS NOT NULL AND l.lon IS NOT NULL
        AND l.lat <> 0 AND l.lon <> 0
        GROUP BY n.bssid, n.ssid
        HAVING MAX(ST_Distance(
          ST_SetSRID(ST_MakePoint(l.lon, l.lat), 4326)::geography,
          (SELECT location_point FROM app.location_markers WHERE marker_type = 'home')::geography
        ) / 1000.0) > 50

        UNION ALL

        SELECT
          'Tagged Networks' as category,
          COUNT(*) as count,
          MAX(tagged_at) as last_activity
        FROM app.network_tags
      `;

      const pool = getPool();
      const result = await pool.query(statsQuery);

      res.json({
        ok: true,
        data: result.rows,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching surveillance stats:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch surveillance statistics',
      });
    }
  });

  // Surveillance alerts endpoints
  app.get('/api/v1/surveillance/alerts', async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        alert_level,
        alert_status,
        requires_immediate_attention,
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const whereConditions: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (alert_level) {
        whereConditions.push(`alert_level = $${paramIndex}`);
        queryParams.push(alert_level);
        paramIndex++;
      }

      if (alert_status) {
        whereConditions.push(`alert_status = $${paramIndex}`);
        queryParams.push(alert_status);
        paramIndex++;
      }

      if (requires_immediate_attention !== undefined) {
        whereConditions.push(`requires_immediate_attention = $${paramIndex}`);
        queryParams.push(requires_immediate_attention === 'true');
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countQuery = `
        SELECT COUNT(*) as total
        FROM surveillance_alerts
        ${whereClause}
      `;

      const dataQuery = `
        SELECT
          alert_id,
          anomaly_id,
          alert_level,
          alert_type,
          requires_immediate_attention,
          alert_title,
          alert_status,
          confidence_score,
          record_created_at,
          description,
          evidence_summary,
          assigned_to,
          updated_at
        FROM surveillance_alerts
        ${whereClause}
        ORDER BY
          CASE
            WHEN requires_immediate_attention THEN 0
            ELSE 1
          END,
          CASE alert_level
            WHEN 'emergency' THEN 0
            WHEN 'critical' THEN 1
            WHEN 'warning' THEN 2
            WHEN 'info' THEN 3
          END,
          record_created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const pool = getPool();
      const [countResult, dataResult] = await Promise.all([
        pool.query(countQuery, queryParams),
        pool.query(dataQuery, [...queryParams, parseInt(limit as string), offset]),
      ]);

      const total = parseInt(countResult.rows[0].total);

      res.json({
        ok: true,
        data: dataResult.rows,
        count: dataResult.rows.length,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      });
    } catch (error) {
      console.error('Error fetching surveillance alerts:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch surveillance alerts',
      });
    }
  });

  app.get('/api/v1/surveillance/alerts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const pool = getPool();

      const result = await pool.query(
        `
        SELECT
          alert_id,
          anomaly_id,
          alert_level,
          alert_type,
          requires_immediate_attention,
          alert_title,
          alert_status,
          confidence_score,
          record_created_at,
          description,
          evidence_summary,
          assigned_to,
          updated_at
        FROM surveillance_alerts
        WHERE alert_id = $1
      `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Alert not found',
        });
      }

      res.json({
        ok: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error fetching surveillance alert:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to fetch surveillance alert',
      });
    }
  });

  app.patch('/api/v1/surveillance/alerts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { alert_status, assigned_to } = req.body;

      if (
        !alert_status ||
        !['pending', 'investigating', 'resolved', 'dismissed'].includes(alert_status)
      ) {
        return res.status(400).json({
          ok: false,
          error:
            'Invalid alert_status. Must be one of: pending, investigating, resolved, dismissed',
        });
      }

      const pool = getPool();

      const result = await pool.query(
        `
        UPDATE surveillance_alerts
        SET
          alert_status = $1,
          assigned_to = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE alert_id = $3
        RETURNING
          alert_id,
          anomaly_id,
          alert_level,
          alert_type,
          requires_immediate_attention,
          alert_title,
          alert_status,
          confidence_score,
          record_created_at,
          description,
          evidence_summary,
          assigned_to,
          updated_at
      `,
        [alert_status, assigned_to || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Alert not found',
        });
      }

      res.json({
        ok: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error('Error updating surveillance alert:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to update surveillance alert',
      });
    }
  });
}
