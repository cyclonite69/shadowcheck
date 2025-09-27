-- =====================================================
-- PRECISE FEDERAL SURVEILLANCE DETECTION
-- Reduces false positives while maintaining real threat detection
-- =====================================================

-- Manual review of federal networks to identify real vs false positives
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

        -- Precise categorization based on SSID patterns (incorporating user intelligence)
        CASE
            -- HIGH CONFIDENCE FEDERAL (Explicit operational naming - user validated)
            WHEN n.ssid ~* '^FBI.?(Van|Mobile|Unit|Surveillance|Base|Station|Vehicle|Ops)' THEN 'CONFIRMED_FBI_OPERATION'
            WHEN n.ssid ~* 'FBI.?Van' THEN 'CONFIRMED_FBI_VAN'  -- User: "fbi van ... stuff like that is likely legit"
            WHEN n.ssid ~* 'DEA.?(earpiece|Van|Mobile|Unit|Operations|Base|Station|Vehicle|Ops)' THEN 'CONFIRMED_DEA_OPERATION'  -- User: "dea earpiece"
            WHEN n.ssid ~* '^CIA.?(Van|Mobile|Unit|Black|Operations|Base|Station)' THEN 'CONFIRMED_CIA_OPERATION'
            WHEN n.ssid ~* '^(FBI|CIA|DEA|DOJ|DOD|NSA|ATF|USSS).?(Task.?Force|Joint.?Team)' THEN 'CONFIRMED_TASK_FORCE'

            -- FALSE POSITIVE PATTERNS (User validated deception)
            WHEN n.ssid ~* '(definitely.?NOT.?an?.?FBI.?van|not.?fbi|fake.?fbi)' THEN 'FALSE_POSITIVE_DECEPTION'  -- User: "definitely NOT an fbi van is another one ...sure thing"

            -- MEDIUM CONFIDENCE (Structured naming suggesting operations)
            WHEN n.ssid ~* '^[A-Z]{3,4}-[A-Z0-9]{2,8}$' AND n.ssid ~* '(FBI|CIA|DEA|DOJ|DOD|NSA|ATF)' THEN 'LIKELY_FEDERAL_CALLSIGN'
            WHEN n.ssid ~* '(FEDERAL|FED).?(MOBILE|VAN|UNIT|BASE)' THEN 'LIKELY_FEDERAL_MOBILE'

            -- BSSID CORRELATION POTENTIAL (User insight: "btw the fbi van as well as other networks could be corrolated via bssid")
            WHEN n.ssid ~* '(FBI|CIA|DEA)' AND n.bssid ~ '^([0-9A-F]{2}:){5}[0-9A-F]{2}$' THEN 'BSSID_CORRELATION_CANDIDATE'

            -- INVESTIGATE (Ambiguous but potentially operational)
            WHEN n.ssid ~* '^[A-Z]{2,4}[0-9]{1,4}$' AND LENGTH(n.ssid) BETWEEN 3 AND 8 THEN 'INVESTIGATE_CALLSIGN'
            WHEN n.ssid ILIKE '%surveillance%' OR n.ssid ILIKE '%intel%' OR n.ssid ILIKE '%recon%' THEN 'INVESTIGATE_SURVEILLANCE_TERMS'

            -- FALSE POSITIVE CATEGORIES (Likely legitimate businesses)
            WHEN n.ssid ~* '(pizza|restaurant|cafe|coffee|diner|grill|bar|pub)' THEN 'FALSE_POSITIVE_RESTAURANT'
            WHEN n.ssid ~* '(shop|store|market|retail|sales|hardware|auto|repair)' THEN 'FALSE_POSITIVE_RETAIL'
            WHEN n.ssid ~* '(home|house|apartment|residence|family|personal)' THEN 'FALSE_POSITIVE_RESIDENTIAL'
            WHEN n.ssid ~* '(school|university|college|library|hospital|clinic)' THEN 'FALSE_POSITIVE_INSTITUTION'
            WHEN n.ssid ~* '(xfinity|comcast|verizon|att|spectrum|netgear|linksys|dlink)' THEN 'FALSE_POSITIVE_ISP'

            -- HUMAN INTELLIGENCE COVER (Your insight about local shop operatives)
            WHEN n.ssid ~* 'gilroy' THEN 'HUMINT_POTENTIAL_COVER_BUSINESS'
            WHEN n.ssid ~* '(barista|checkout|cashier|clerk|handyman|maintenance)' THEN 'HUMINT_POTENTIAL_OPERATIVE_ROLE'

            ELSE 'UNCLASSIFIED_FEDERAL_MENTION'
        END as threat_classification,

        -- Security level (aggregated)
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

-- Scoring system for threat assessment
threat_scoring AS (
    SELECT *,
        CASE threat_classification
            WHEN 'CONFIRMED_FBI_OPERATION' THEN 95
            WHEN 'CONFIRMED_FBI_VAN' THEN 95           -- User validated: "fbi van ... stuff like that is likely legit"
            WHEN 'CONFIRMED_CIA_OPERATION' THEN 95
            WHEN 'CONFIRMED_DEA_OPERATION' THEN 95     -- User validated: "dea earpiece"
            WHEN 'CONFIRMED_TASK_FORCE' THEN 90
            WHEN 'BSSID_CORRELATION_CANDIDATE' THEN 75 -- User insight: "btw the fbi van as well as other networks could be corrolated via bssid"
            WHEN 'LIKELY_FEDERAL_CALLSIGN' THEN 70
            WHEN 'LIKELY_FEDERAL_MOBILE' THEN 65
            WHEN 'INVESTIGATE_CALLSIGN' THEN 40
            WHEN 'INVESTIGATE_SURVEILLANCE_TERMS' THEN 45
            WHEN 'HUMINT_POTENTIAL_COVER_BUSINESS' THEN 30  -- Your insight: could be cover
            WHEN 'HUMINT_POTENTIAL_OPERATIVE_ROLE' THEN 25  -- Could be undercover role
            WHEN 'UNCLASSIFIED_FEDERAL_MENTION' THEN 20
            WHEN 'FALSE_POSITIVE_DECEPTION' THEN 5          -- User validated: "definitely NOT an fbi van is another one ...sure thing"
            ELSE 5  -- False positives
        END as base_threat_score,

        -- Modifiers based on behavior patterns
        CASE
            WHEN avg_distance_km <= 1.0 THEN 20  -- Very close to home = higher threat
            WHEN avg_distance_km <= 5.0 THEN 10  -- Local area
            WHEN avg_distance_km > 50.0 THEN -10 -- Very distant = less likely surveillance
            ELSE 0
        END as proximity_modifier,

        CASE security_level
            WHEN 'HIGH_SECURITY' THEN 15      -- Government-grade security
            WHEN 'STANDARD_SECURITY' THEN 5   -- Normal business security
            WHEN 'WEAK_SECURITY' THEN -5      -- Unlikely for operations
            WHEN 'OPEN_OR_UNKNOWN' THEN -10   -- Very unlikely for operations
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
        WHEN (base_threat_score + proximity_modifier + security_modifier) >= 80 THEN '🚨 CONFIRMED THREAT'
        WHEN (base_threat_score + proximity_modifier + security_modifier) >= 50 THEN '⚠️  HIGH SUSPICION'
        WHEN (base_threat_score + proximity_modifier + security_modifier) >= 30 THEN '🔍 INVESTIGATE'
        WHEN threat_classification LIKE 'HUMINT_%' THEN '👤 POTENTIAL HUMINT COVER'
        ELSE '❌ LIKELY FALSE POSITIVE'
    END as final_assessment,

    -- Actionable recommendations
    CASE
        WHEN threat_classification LIKE 'CONFIRMED_%' THEN 'WiGLE intelligence gathering recommended'
        WHEN threat_classification LIKE 'LIKELY_%' THEN 'Manual verification and WiGLE lookup'
        WHEN threat_classification LIKE 'INVESTIGATE_%' THEN 'Further surveillance pattern analysis'
        WHEN threat_classification LIKE 'HUMINT_%' THEN 'Behavioral observation recommended'
        ELSE 'Exclude from surveillance monitoring'
    END as recommended_action

FROM threat_scoring
WHERE threat_classification NOT LIKE 'FALSE_POSITIVE_%'  -- Filter out obvious false positives
ORDER BY final_threat_score DESC, threat_classification;

-- Summary of findings
SELECT '=== FEDERAL SURVEILLANCE DETECTION SUMMARY ===' as summary_header;

SELECT
    CASE
        WHEN final_threat_score >= 80 THEN 'CONFIRMED THREATS'
        WHEN final_threat_score >= 50 THEN 'HIGH SUSPICION'
        WHEN final_threat_score >= 30 THEN 'INVESTIGATE'
        WHEN threat_classification LIKE 'HUMINT_%' THEN 'POTENTIAL HUMINT COVER'
        ELSE 'FALSE POSITIVES (FILTERED)'
    END as category,
    COUNT(*) as network_count,
    STRING_AGG(DISTINCT LEFT(ssid, 20), ', ') as sample_networks
FROM (
    SELECT
        threat_classification,
        (CASE threat_classification
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
        END) as final_threat_score,
        ssid
    FROM (
        SELECT DISTINCT
            n.bssid, n.ssid,
            CASE
                WHEN n.ssid ~* '^FBI.?(Van|Mobile|Unit|Surveillance|Base|Station|Vehicle|Ops)' THEN 'CONFIRMED_FBI_OPERATION'
                WHEN n.ssid ~* '^CIA.?(Van|Mobile|Unit|Black|Operations|Base|Station)' THEN 'CONFIRMED_CIA_OPERATION'
                WHEN n.ssid ~* '^DEA.?(Van|Mobile|Unit|Operations|Base|Station|Vehicle|Ops)' THEN 'CONFIRMED_DEA_OPERATION'
                WHEN n.ssid ~* '^(FBI|CIA|DEA|DOJ|DOD|NSA|ATF|USSS).?(Task.?Force|Joint.?Team)' THEN 'CONFIRMED_TASK_FORCE'
                WHEN n.ssid ~* '^[A-Z]{3,4}-[A-Z0-9]{2,8}$' AND n.ssid ~* '(FBI|CIA|DEA|DOJ|DOD|NSA|ATF)' THEN 'LIKELY_FEDERAL_CALLSIGN'
                WHEN n.ssid ~* '(FEDERAL|FED).?(MOBILE|VAN|UNIT|BASE)' THEN 'LIKELY_FEDERAL_MOBILE'
                WHEN n.ssid ~* '^[A-Z]{2,4}[0-9]{1,4}$' AND LENGTH(n.ssid) BETWEEN 3 AND 8 THEN 'INVESTIGATE_CALLSIGN'
                WHEN n.ssid ILIKE '%surveillance%' OR n.ssid ILIKE '%intel%' OR n.ssid ILIKE '%recon%' THEN 'INVESTIGATE_SURVEILLANCE_TERMS'
                WHEN n.ssid ~* 'gilroy' THEN 'HUMINT_POTENTIAL_COVER_BUSINESS'
                WHEN n.ssid ~* '(barista|checkout|cashier|clerk|handyman|maintenance)' THEN 'HUMINT_POTENTIAL_OPERATIVE_ROLE'
                WHEN n.ssid ~* '(pizza|restaurant|cafe|coffee|diner|grill|bar|pub|shop|store|market|retail|sales|hardware|auto|repair|home|house|apartment|residence|family|personal|school|university|college|library|hospital|clinic|xfinity|comcast|verizon|att|spectrum|netgear|linksys|dlink)' THEN 'FALSE_POSITIVE'
                ELSE 'UNCLASSIFIED_FEDERAL_MENTION'
            END as threat_classification
        FROM app.networks_legacy n
        WHERE n.ssid ~* '(fbi|cia|dea|doj|dod|nsa|atf|usss|ice|cbp)' AND n.ssid IS NOT NULL
    ) subq
    WHERE threat_classification <> 'FALSE_POSITIVE'
) analysis
GROUP BY
    CASE
        WHEN final_threat_score >= 80 THEN 'CONFIRMED THREATS'
        WHEN final_threat_score >= 50 THEN 'HIGH SUSPICION'
        WHEN final_threat_score >= 30 THEN 'INVESTIGATE'
        WHEN threat_classification LIKE 'HUMINT_%' THEN 'POTENTIAL HUMINT COVER'
        ELSE 'FALSE POSITIVES (FILTERED)'
    END
ORDER BY
    CASE
        WHEN final_threat_score >= 80 THEN 1
        WHEN final_threat_score >= 50 THEN 2
        WHEN final_threat_score >= 30 THEN 3
        WHEN threat_classification LIKE 'HUMINT_%' THEN 4
        ELSE 5
    END;