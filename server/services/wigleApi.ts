/**
 * WiGLE API Integration Service
 *
 * Fetches network data from WiGLE API and populates staging tables
 * Keeps data separate from legacy tables for data provenance
 */

import { getPool } from '../db/connection.js';

interface WiGLEConfig {
  apiKey: string;
  encodedApiKey: string; // base64 encoded API key
  baseUrl: string;
}

interface WiGLENetwork {
  netid: string; // BSSID
  ssid: string;
  qos: number;
  channel: number;
  encryption: string;
  type: string; // WiFi, BT, etc
  lasttime: string; // ISO timestamp
  lastupdt: string;
  trilat: number;
  trilong: number;
  country: string;
  region: string;
  city: string;
}

interface WiGLEQueryResult {
  success: boolean;
  totalResults: number;
  search_after?: number;
  results: WiGLENetwork[];
}

export class WiGLEAPIService {
  private config: WiGLEConfig;

  constructor(apiKey?: string) {
    // Get API key from environment or parameter
    const key = apiKey || process.env.WIGLE_API_KEY || '';

    if (!key) {
      console.warn('[WiGLE] No API key configured. Set WIGLE_API_KEY environment variable.');
    }

    this.config = {
      apiKey: key,
      encodedApiKey: Buffer.from(`${key}:`).toString('base64'),
      baseUrl: 'https://api.wigle.net/api/v2'
    };
  }

  /**
   * Search WiGLE for a specific BSSID
   */
  async searchByBSSID(bssid: string): Promise<WiGLEQueryResult> {
    if (!this.config.apiKey) {
      throw new Error('WiGLE API key not configured');
    }

    const url = `${this.config.baseUrl}/network/search`;
    const params = new URLSearchParams({
      netid: bssid.toUpperCase().replace(/:/g, ''),
      freenet: 'false',
      paynet: 'false'
    });

    try {
      const startTime = Date.now();

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.config.encodedApiKey}`,
          'Accept': 'application/json'
        }
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WiGLE API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as {
        success?: boolean;
        totalResults?: number;
        search_after?: number;
        results?: WiGLENetwork[];
      };

      return {
        success: data.success || false,
        totalResults: data.totalResults || 0,
        search_after: data.search_after,
        results: data.results || []
      };

    } catch (error) {
      console.error(`[WiGLE] Failed to search for ${bssid}:`, error);
      throw error;
    }
  }

  /**
   * Enrich a BSSID by fetching from WiGLE and storing in staging tables
   */
  async enrichBSSID(tagId: number, bssid: string): Promise<{
    success: boolean;
    networksAdded: number;
    locationsAdded: number;
    error?: string;
  }> {
    const pool = getPool();
    const startTime = Date.now();

    try {
      // Query WiGLE API
      const result = await this.searchByBSSID(bssid);
      const duration = Date.now() - startTime;

      if (!result.success || result.totalResults === 0) {
        // Mark as completed with no results
        await pool.query(`
          UPDATE app.bssid_enrichment_queue
          SET status = 'completed',
              processed_at = NOW(),
              wigle_records_found = 0,
              wigle_locations_found = 0
          WHERE tag_id = $1
        `, [tagId]);

        await pool.query(`
          INSERT INTO app.bssid_enrichment_history
          (tag_id, bssid, wigle_response_summary, records_added, query_duration_ms)
          VALUES ($1, $2, $3, 0, $4)
        `, [tagId, bssid, JSON.stringify({ totalResults: 0 }), duration]);

        return {
          success: true,
          networksAdded: 0,
          locationsAdded: 0
        };
      }

      // Insert into wigle_api_networks_staging
      let networksAdded = 0;
      let locationsAdded = 0;

      for (const network of result.results) {
        try {
          // Insert network
          await pool.query(`
            INSERT INTO app.wigle_api_networks_staging
            (bssid, ssid, frequency, capabilities, type, lasttime,
             lastlat, lastlon, trilat, trilong, channel, qos,
             country, region, city, query_params)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (bssid, query_timestamp) DO NOTHING
          `, [
            network.netid,
            network.ssid || '',
            null, // frequency not in WiGLE response
            network.encryption || '',
            network.type || 'W',
            network.lasttime,
            network.trilat,
            network.trilong,
            network.trilat,
            network.trilong,
            network.channel,
            network.qos,
            network.country,
            network.region,
            network.city,
            JSON.stringify({ search_bssid: bssid })
          ]);
          networksAdded++;

          // Insert location (WiGLE provides one location per network)
          await pool.query(`
            INSERT INTO app.wigle_api_locations_staging
            (bssid, lat, lon, time, signal_level, query_params)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            network.netid,
            network.trilat,
            network.trilong,
            network.lasttime,
            network.qos,
            JSON.stringify({ search_bssid: bssid })
          ]);
          locationsAdded++;

        } catch (err) {
          console.error(`[WiGLE] Error inserting network ${network.netid}:`, err);
        }
      }

      // Update enrichment queue
      await pool.query(`
        UPDATE app.bssid_enrichment_queue
        SET status = 'completed',
            processed_at = NOW(),
            wigle_records_found = $2,
            wigle_locations_found = $3
        WHERE tag_id = $1
      `, [tagId, networksAdded, locationsAdded]);

      // Log history
      await pool.query(`
        INSERT INTO app.bssid_enrichment_history
        (tag_id, bssid, wigle_response_summary, records_added, query_duration_ms)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        tagId,
        bssid,
        JSON.stringify({
          totalResults: result.totalResults,
          networksAdded,
          locationsAdded
        }),
        networksAdded,
        duration
      ]);

      return {
        success: true,
        networksAdded,
        locationsAdded
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Mark as failed
      await pool.query(`
        UPDATE app.bssid_enrichment_queue
        SET status = 'failed',
            processed_at = NOW(),
            error_message = $2
        WHERE tag_id = $1
      `, [tagId, errorMessage]);

      // Log history
      await pool.query(`
        INSERT INTO app.bssid_enrichment_history
        (tag_id, bssid, wigle_response_summary, records_added, query_duration_ms)
        VALUES ($1, $2, $3, 0, $4)
      `, [
        tagId,
        bssid,
        JSON.stringify({ error: errorMessage }),
        duration
      ]);

      return {
        success: false,
        networksAdded: 0,
        locationsAdded: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Process pending enrichment queue
   */
  async processPendingQueue(limit: number = 10): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    const pool = getPool();

    // Get pending items
    const result = await pool.query(`
      SELECT tag_id, bssid
      FROM app.bssid_enrichment_queue
      WHERE status = 'pending'
      ORDER BY priority DESC, tagged_at ASC
      LIMIT $1
    `, [limit]);

    let succeeded = 0;
    let failed = 0;

    for (const item of result.rows) {
      const enrichResult = await this.enrichBSSID(item.tag_id, item.bssid);
      if (enrichResult.success) {
        succeeded++;
      } else {
        failed++;
      }

      // Rate limiting: wait 1 second between requests to be nice to WiGLE
      if (result.rows.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      processed: result.rows.length,
      succeeded,
      failed
    };
  }
}

// Export singleton instance
export const wigleService = new WiGLEAPIService();
