-- For analytics.ts: Update queries to use new schema

-- Count queries should now be:
-- (SELECT COUNT(*) FROM app.locations) AS location_rows,
-- (SELECT COUNT(*) FROM app.networks)  AS network_rows

-- The view queries will work automatically with the updated location_details_enriched
