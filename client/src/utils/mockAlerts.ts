import { SurveillanceAlert } from '../lib/api';

export const mockAlerts: SurveillanceAlert[] = [
  {
    alert_id: 1,
    anomaly_id: 100,
    alert_level: 'emergency',
    alert_type: 'Federal Surveillance Detection',
    requires_immediate_attention: true,
    alert_title: 'FBI Mobile Unit Detected - High Confidence',
    alert_status: 'pending',
    confidence_score: 0.95,
    record_created_at: '2024-01-20T10:30:00Z',
    description: 'High-confidence detection of FBI surveillance unit based on SSID pattern "FBI-VAN-007" with sophisticated encryption and proximity to known federal facilities.',
    evidence_summary: {
      ssid: 'FBI-VAN-007',
      bssid: '00:23:69:8A:BC:DE',
      encryption: 'WPA3-Enterprise',
      locations: [
        { lat: 37.7749, lon: -122.4194, timestamp: '2024-01-20T10:15:00Z' },
        { lat: 37.7751, lon: -122.4196, timestamp: '2024-01-20T10:25:00Z' }
      ],
      frequency: 5745,
      signal_strength: -45
    },
    assigned_to: 'Agent Johnson',
  },
  {
    alert_id: 2,
    anomaly_id: 101,
    alert_level: 'critical',
    alert_type: 'High Mobility Surveillance',
    requires_immediate_attention: true,
    alert_title: 'Device Tracked Across Multiple Cities',
    alert_status: 'investigating',
    confidence_score: 0.87,
    record_created_at: '2024-01-20T09:15:00Z',
    description: 'Mobile device with SSID "MOBILE-UNIT-23" detected across 5 different cities within 24 hours, indicating potential surveillance operation.',
    evidence_summary: {
      ssid: 'MOBILE-UNIT-23',
      bssid: '00:11:22:33:44:55',
      max_distance_km: 156.7,
      location_count: 8,
      cities: ['San Francisco', 'Oakland', 'San Jose', 'Sacramento', 'Fresno']
    },
    assigned_to: 'Detective Smith',
    updated_at: '2024-01-20T09:45:00Z'
  },
  {
    alert_id: 3,
    anomaly_id: 102,
    alert_level: 'warning',
    alert_type: 'Suspicious Network Pattern',
    requires_immediate_attention: false,
    alert_title: 'Potential Cover Operation Network',
    alert_status: 'pending',
    confidence_score: 0.72,
    record_created_at: '2024-01-20T08:00:00Z',
    description: 'Network with suspicious naming pattern "BARISTA_TRAINING" detected near sensitive locations with unusual security configuration.',
    evidence_summary: {
      ssid: 'BARISTA_TRAINING',
      bssid: 'AA:BB:CC:DD:EE:FF',
      security_anomalies: ['WPA3 on consumer device', 'Hidden SSID initially'],
      proximity_to_targets: true
    }
  },
  {
    alert_id: 4,
    anomaly_id: undefined,
    alert_level: 'critical',
    alert_type: 'Signal Pattern Anomaly',
    requires_immediate_attention: true,
    alert_title: 'Unusual Signal Clustering Detected',
    alert_status: 'pending',
    confidence_score: 0.91,
    record_created_at: '2024-01-20T07:30:00Z',
    description: 'Multiple devices with coordinated movement patterns and synchronized signal characteristics detected in surveillance formation.',
    evidence_summary: {
      device_count: 4,
      coordination_score: 0.94,
      formation_type: 'Box surveillance',
      duration_minutes: 45
    }
  },
  {
    alert_id: 5,
    anomaly_id: 103,
    alert_level: 'info',
    alert_type: 'Network Classification Update',
    requires_immediate_attention: false,
    alert_title: 'Previously Unknown Network Classified',
    alert_status: 'resolved',
    confidence_score: 0.68,
    record_created_at: '2024-01-19T16:22:00Z',
    description: 'Network "GUEST_WIFI_2024" has been classified as legitimate business network after investigation.',
    evidence_summary: {
      classification: 'LEGITIMATE_BUSINESS',
      business_name: 'Local Coffee Shop',
      verification_method: 'On-site investigation'
    },
    assigned_to: 'Officer Brown',
    updated_at: '2024-01-19T18:15:00Z'
  },
  {
    alert_id: 6,
    anomaly_id: 104,
    alert_level: 'warning',
    alert_type: 'Encryption Downgrade Attack',
    requires_immediate_attention: false,
    alert_title: 'Network Security Degradation Detected',
    alert_status: 'investigating',
    confidence_score: 0.79,
    record_created_at: '2024-01-19T14:45:00Z',
    description: 'Network "HOME_NETWORK_5G" shows evidence of forced encryption downgrade from WPA3 to WPA2, possible interception attempt.',
    evidence_summary: {
      original_encryption: 'WPA3-SAE',
      current_encryption: 'WPA2-PSK',
      downgrade_timestamp: '2024-01-19T14:30:00Z',
      suspicious_clients: 2
    },
    assigned_to: 'Specialist Davis'
  },
  {
    alert_id: 7,
    anomaly_id: 105,
    alert_level: 'emergency',
    alert_type: 'Active IMSI Catcher Detection',
    requires_immediate_attention: true,
    alert_title: 'StingRay Device Activity Confirmed',
    alert_status: 'pending',
    confidence_score: 0.98,
    record_created_at: '2024-01-19T12:18:00Z',
    description: 'High-confidence detection of IMSI catcher device based on cellular tower spoofing patterns and device behavior anomalies.',
    evidence_summary: {
      fake_tower_id: 'LAC:0x1A2B CID:0x3C4D',
      affected_devices: 23,
      location_accuracy: 'Within 50 meters',
      interception_evidence: true,
      law_enforcement_correlation: 'Likely federal operation'
    }
  },
  {
    alert_id: 8,
    anomaly_id: 106,
    alert_level: 'critical',
    alert_type: 'Surveillance Vehicle Tracking',
    requires_immediate_attention: true,
    alert_title: 'Vehicle-Based Surveillance Confirmed',
    alert_status: 'investigating',
    confidence_score: 0.89,
    record_created_at: '2024-01-19T11:30:00Z',
    description: 'Vehicle with mobile surveillance equipment detected following target route with 94% correlation.',
    evidence_summary: {
      vehicle_ssid: 'MOBILE_OPS_7',
      route_correlation: 0.94,
      following_duration_hours: 2.5,
      equipment_detected: ['WiFi', 'Cellular', 'Bluetooth scanners']
    },
    assigned_to: 'Team Alpha',
    updated_at: '2024-01-19T13:22:00Z'
  },
  {
    alert_id: 9,
    anomaly_id: undefined,
    alert_level: 'info',
    alert_type: 'Routine Security Scan',
    requires_immediate_attention: false,
    alert_title: 'Weekly Security Assessment Complete',
    alert_status: 'resolved',
    confidence_score: 0.45,
    record_created_at: '2024-01-19T10:00:00Z',
    description: 'Automated weekly security scan completed. No new threats detected in the surveillance perimeter.',
    evidence_summary: {
      scan_type: 'Perimeter security check',
      new_networks: 12,
      threat_networks: 0,
      scan_duration_minutes: 30
    },
    assigned_to: 'Automated System',
    updated_at: '2024-01-19T10:30:00Z'
  },
  {
    alert_id: 10,
    anomaly_id: 107,
    alert_level: 'warning',
    alert_type: 'Pattern Recognition Alert',
    requires_immediate_attention: false,
    alert_title: 'Recurring Surveillance Pattern Identified',
    alert_status: 'dismissed',
    confidence_score: 0.63,
    record_created_at: '2024-01-18T15:20:00Z',
    description: 'Regular pattern of devices appearing at consistent intervals dismissed as legitimate delivery service vehicles.',
    evidence_summary: {
      pattern_type: 'Time-based recurrence',
      interval_hours: 24,
      dismissal_reason: 'Verified as UPS delivery route',
      verification_source: 'Company confirmation'
    },
    assigned_to: 'Analyst Wilson',
    updated_at: '2024-01-18T16:45:00Z'
  }
];

export const getMockAlertsPage = (
  page: number = 1,
  limit: number = 20,
  filters: {
    alert_level?: 'emergency' | 'critical' | 'warning' | 'info';
    alert_status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    requires_immediate_attention?: boolean;
  } = {}
) => {
  let filteredAlerts = [...mockAlerts];

  // Apply filters
  if (filters.alert_level) {
    filteredAlerts = filteredAlerts.filter(alert => alert.alert_level === filters.alert_level);
  }

  if (filters.alert_status) {
    filteredAlerts = filteredAlerts.filter(alert => alert.alert_status === filters.alert_status);
  }

  if (filters.requires_immediate_attention !== undefined) {
    filteredAlerts = filteredAlerts.filter(
      alert => alert.requires_immediate_attention === filters.requires_immediate_attention
    );
  }

  // Sort by priority: emergency first, then immediate attention, then by creation date
  filteredAlerts.sort((a, b) => {
    // First sort by emergency level
    const levelPriority = { emergency: 0, critical: 1, warning: 2, info: 3 };
    const aLevel = levelPriority[a.alert_level];
    const bLevel = levelPriority[b.alert_level];

    if (aLevel !== bLevel) return aLevel - bLevel;

    // Then by immediate attention
    if (a.requires_immediate_attention !== b.requires_immediate_attention) {
      return a.requires_immediate_attention ? -1 : 1;
    }

    // Finally by creation date (newest first)
    return new Date(b.record_created_at).getTime() - new Date(a.record_created_at).getTime();
  });

  const total = filteredAlerts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);

  return {
    ok: true,
    data: paginatedAlerts,
    count: paginatedAlerts.length,
    total,
    page,
    limit,
    totalPages
  };
};