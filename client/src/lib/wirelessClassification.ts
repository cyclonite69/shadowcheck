/**
 * Wireless Classification Utilities
 *
 * Comprehensive taxonomy for wireless security, cellular networks,
 * device types, and threat assessment based on geospatial intelligence analysis.
 */

/**
 * ============================================================================
 * SECURITY CLASSIFICATION TAXONOMY
 * ============================================================================
 */

export type SecurityClassification = 'none' | 'wep' | 'wpa' | 'wpa2' | 'wpa3' | 'mixed' | 'unknown';
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'acceptable' | 'optimal';

export interface SecurityMetadata {
  label: string;
  risk: RiskLevel;
  description: string;
  prevalence: string;
  attackVectors: string[];
  technicalDetails: string;
}

export const SECURITY_CLASSIFICATION: Record<SecurityClassification, SecurityMetadata> = {
  none: {
    label: 'Open Network',
    risk: 'critical',
    description: 'No encryption. Data transmitted in cleartext.',
    prevalence: '25.1% of observed networks (highest volume threat)',
    attackVectors: [
      'Passive Eavesdropping',
      'Man-in-the-Middle Attacks',
      'Complete Data Exposure',
      'Session Hijacking',
      'DNS Spoofing'
    ],
    technicalDetails: 'No confidentiality or authentication protocol beyond basic association. Represents 251x higher prevalence than WEP networks.'
  },
  wep: {
    label: 'WEP (Deprecated)',
    risk: 'critical',
    description: 'Critically flawed RC4-based encryption. Trivially exploitable.',
    prevalence: '0.1% of observed networks (near extinction)',
    attackVectors: [
      'IV Collision Attack',
      'Key Recovery (Trivial - 40/104 bit)',
      'Shared Key Authentication (SKA) Challenge Exploit',
      'Fragmentation Attack',
      'ChopChop Attack'
    ],
    technicalDetails: 'RC4 stream cipher with IV reuse vulnerability. Shared Key Authentication exposes challenge plaintext. Cryptographically broken since 2001.'
  },
  wpa: {
    label: 'WPA-TKIP',
    risk: 'high',
    description: 'Legacy TKIP protocol. Vulnerable to KRACK and protocol-specific attacks.',
    prevalence: '0.08% of observed networks (outdated)',
    attackVectors: [
      'KRACK (Key Reinstallation Attack)',
      'Legacy Protocol Exploitation',
      'TKIP Michael MIC Attack',
      'Downgrade Attack Vector'
    ],
    technicalDetails: 'Temporal Key Integrity Protocol using RC4. Interim solution post-WEP. Deprecated in 802.11-2012 standard.'
  },
  wpa2: {
    label: 'WPA2-AES',
    risk: 'moderate',
    description: 'Industry standard AES-CCMP. Vulnerable to dictionary attacks if PSK is weak. Enterprise mode significantly more secure.',
    prevalence: '>50% of observed networks (majority deployment)',
    attackVectors: [
      'Dictionary Attack (PSK mode only)',
      'Weak Passphrase Exploitation (<8 chars)',
      'Four-Way Handshake Capture + Offline Cracking',
      'KRACK (Client-side vulnerability)',
      'PMKID Attack (Hashcat)'
    ],
    technicalDetails: 'IEEE 802.11i standard. AES-CCMP encryption. PSK uses Pre-Shared Key (vulnerable to offline dictionary). Enterprise uses 802.1X/RADIUS (exponentially more secure).'
  },
  wpa3: {
    label: 'WPA3-SAE',
    risk: 'optimal',
    description: 'Modern SAE handshake eliminates offline dictionary attacks. Current security standard.',
    prevalence: 'Emerging standard (optimal security posture)',
    attackVectors: [
      'Configuration Errors',
      'Downgrade Attack (if transition mode enabled)',
      'Implementation-Specific Side-Channel Attacks',
      'Dragonblood Vulnerabilities (patched in most implementations)'
    ],
    technicalDetails: 'Simultaneous Authentication of Equals (SAE) replaces PSK handshake. Uses AES-GCMP-256. Mandatory Management Frame Protection (MFP). Forward secrecy.'
  },
  mixed: {
    label: 'Mixed Mode',
    risk: 'moderate',
    description: 'Supports multiple standards (backwards compatibility). Introduces downgrade attack surface.',
    prevalence: 'Transitional deployment (common in enterprise)',
    attackVectors: [
      'Forced Downgrade to Weakest Protocol',
      'Client-Initiated Degradation',
      'Mixed Security Domain Exploitation',
      'Rogue AP Downgrade Attack'
    ],
    technicalDetails: 'Typically WPA2/WPA3 transition mode. While intended for compatibility, creates attack surface via protocol negotiation.'
  },
  unknown: {
    label: 'Unknown Security',
    risk: 'high',
    description: 'Security status could not be determined from available telemetry.',
    prevalence: 'Insufficient signal data or proprietary protocol',
    attackVectors: ['Undetermined - assume insecure'],
    technicalDetails: 'Lack of beacon frame data or non-standard security implementation.'
  }
};

/**
 * Parse encryption string to classification
 */
export function parseSecurityClassification(encryption?: string | null): SecurityClassification {
  if (!encryption) return 'unknown';

  const enc = encryption.toLowerCase().trim();

  if (enc === 'none' || enc === 'open' || enc === '' || enc === '?') return 'none';
  if (enc.includes('wep')) return 'wep';
  if (enc.includes('wpa3')) return 'wpa3';
  if (enc.includes('wpa2')) return 'wpa2';
  if (enc.includes('wpa')) return 'wpa';
  if (enc.includes('mixed')) return 'mixed';

  return 'unknown';
}

/**
 * ============================================================================
 * CELLULAR NETWORK CLASSIFICATION
 * ============================================================================
 */

export type CellularGeneration = 'G' | 'E' | '3G' | 'H' | 'H+' | 'L' | '4G+' | '5' | 'unknown';

export interface CellularMetadata {
  label: string;
  generation: string;
  speed: string;
  technology: string;
  capability: string;
  exfiltrationPotential: 'minimal' | 'limited' | 'moderate' | 'high' | 'critical';
}

export const CELLULAR_CLASSIFICATION: Record<CellularGeneration, CellularMetadata> = {
  'G': {
    label: 'GPRS',
    generation: '2G/2.5G',
    speed: '< 384 Kbps',
    technology: 'GSM/TDMA',
    capability: 'Legacy communications, severely limited data transfer',
    exfiltrationPotential: 'minimal'
  },
  'E': {
    label: 'EDGE',
    generation: '2.75G',
    speed: '< 384 Kbps',
    technology: 'GSM Enhanced Data rates',
    capability: 'Legacy communications, limited data capability',
    exfiltrationPotential: 'limited'
  },
  '3G': {
    label: '3G',
    generation: '3G',
    speed: '384 Kbps - 2 Mbps',
    technology: 'UMTS/WCDMA/CDMA',
    capability: 'Baseline mobile internet, moderate latency',
    exfiltrationPotential: 'limited'
  },
  'H': {
    label: 'HSPA',
    generation: '3.5G',
    speed: '7 - 21 Mbps',
    technology: 'High-Speed Packet Access',
    capability: 'Fast 3G, common congestion fallback',
    exfiltrationPotential: 'moderate'
  },
  'H+': {
    label: 'HSPA+',
    generation: '3.75G',
    speed: '21 - 42 Mbps',
    technology: 'HSPA Evolution',
    capability: 'Enhanced 3G, upper limit of 3G family',
    exfiltrationPotential: 'moderate'
  },
  'L': {
    label: 'LTE',
    generation: '4G',
    speed: '100 Mbps - 1 Gbps',
    technology: 'OFDMA (IP-based)',
    capability: 'High-speed data, reliable streaming, low latency',
    exfiltrationPotential: 'high'
  },
  '4G+': {
    label: 'LTE Advanced',
    generation: '4.5G',
    speed: '300 Mbps - 1 Gbps+',
    technology: 'Carrier Aggregation + MIMO',
    capability: 'Optimized density, advanced infrastructure deployment',
    exfiltrationPotential: 'high'
  },
  '5': {
    label: '5G NR',
    generation: '5G',
    speed: '1 - 10 Gbps',
    technology: 'Massive MIMO + Beamforming',
    capability: 'Ultra-low latency, critical infrastructure support',
    exfiltrationPotential: 'critical'
  },
  'unknown': {
    label: 'Unknown',
    generation: 'N/A',
    speed: 'N/A',
    technology: 'Unknown',
    capability: 'Undetermined',
    exfiltrationPotential: 'limited'
  }
};

/**
 * Parse cellular generation from radio technology or network type
 */
export function parseCellularGeneration(
  radioTech?: string | null,
  networkType?: string | null
): CellularGeneration | null {
  if (!radioTech && !networkType) return null;

  const tech = (radioTech || networkType || '').toUpperCase();

  // Check for cellular indicators
  if (!tech.includes('LTE') && !tech.includes('GSM') && !tech.includes('CDMA') &&
      !tech.includes('UMTS') && !tech.includes('WCDMA') && !tech.includes('5G') &&
      !tech.includes('4G') && !tech.includes('3G') && !tech.includes('HSPA') &&
      !tech.includes('EDGE') && !tech.includes('GPRS')) {
    return null; // Not cellular
  }

  if (tech.includes('5G')) return '5';
  if (tech.includes('LTE-A') || tech.includes('4G+')) return '4G+';
  if (tech.includes('LTE') || tech.includes('4G')) return 'L';
  if (tech.includes('H+') || tech.includes('HSPA+')) return 'H+';
  if (tech.includes('HSPA') || tech.includes('H')) return 'H';
  if (tech.includes('3G') || tech.includes('UMTS') || tech.includes('WCDMA')) return '3G';
  if (tech.includes('EDGE') || tech.includes('E')) return 'E';
  if (tech.includes('GPRS') || tech.includes('GSM') || tech.includes('CDMA')) return 'G';

  return 'unknown';
}

/**
 * Parse MCC-MNC (Mobile Country Code - Mobile Network Code) from cellular data
 * Format: LTE;310260 where 310260 is MCC-MNC
 */
export function parseMccMnc(cellularData?: string | null): { mcc: string; mnc: string; operator?: string } | null {
  if (!cellularData) return null;

  const match = cellularData.match(/LTE;(\d{5,6})/);
  if (!match) return null;

  const combined = match[1];
  const mcc = combined.substring(0, 3);
  const mnc = combined.substring(3);

  // Known US carriers (MCC 310/311/312/313/316)
  const operator = MCC_MNC_DATABASE[`${mcc}-${mnc}`] || MCC_DATABASE[mcc];

  return { mcc, mnc, operator };
}

/**
 * Major carrier database (partial - expandable)
 */
const MCC_MNC_DATABASE: Record<string, string> = {
  '310-260': 'T-Mobile USA',
  '310-026': 'T-Mobile USA',
  '310-160': 'T-Mobile USA',
  '310-200': 'T-Mobile USA',
  '310-210': 'T-Mobile USA',
  '310-220': 'T-Mobile USA',
  '310-230': 'T-Mobile USA',
  '310-240': 'T-Mobile USA',
  '310-250': 'T-Mobile USA',
  '310-310': 'T-Mobile USA',
  '311-660': 'T-Mobile USA (Metro)',
  '310-410': 'AT&T',
  '310-280': 'AT&T',
  '310-150': 'AT&T',
  '310-170': 'AT&T',
  '310-380': 'AT&T',
  '310-560': 'AT&T',
  '310-680': 'AT&T',
  '310-012': 'Verizon',
  '310-013': 'Verizon',
  '311-480': 'Verizon',
  '311-110': 'Verizon',
  '310-004': 'Verizon',
  '310-890': 'Verizon',
  '310-120': 'Sprint (T-Mobile)',
  '311-490': 'Sprint (T-Mobile)',
  '312-530': 'Sprint (T-Mobile)',
};

const MCC_DATABASE: Record<string, string> = {
  '310': 'USA',
  '311': 'USA',
  '312': 'USA',
  '313': 'USA',
  '316': 'USA',
  '302': 'Canada',
  '334': 'Mexico',
  '208': 'France',
  '234': 'United Kingdom',
  '262': 'Germany',
  '222': 'Italy',
  '214': 'Spain',
};

/**
 * ============================================================================
 * DEVICE TYPE CLASSIFICATION
 * ============================================================================
 */

export type DeviceType =
  | 'car-audio'
  | 'laptop'
  | 'smartphone'
  | 'tablet'
  | 'iot'
  | 'access-point'
  | 'router'
  | 'camera'
  | 'printer'
  | 'television'
  | 'gaming-console'
  | 'wearable'
  | 'bluetooth-beacon'
  | 'unknown';

export interface DeviceTypeMetadata {
  label: string;
  category: 'mobile' | 'stationary' | 'infrastructure' | 'iot';
  trackingValue: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export const DEVICE_TYPE_CLASSIFICATION: Record<DeviceType, DeviceTypeMetadata> = {
  'car-audio': {
    label: 'Car Audio System',
    category: 'mobile',
    trackingValue: 'critical',
    description: 'In-vehicle infotainment system. High tracking value for vehicle surveillance.'
  },
  'laptop': {
    label: 'Laptop Computer',
    category: 'mobile',
    trackingValue: 'high',
    description: 'Mobile computing device. High value target for asset tracking.'
  },
  'smartphone': {
    label: 'Smartphone',
    category: 'mobile',
    trackingValue: 'critical',
    description: 'Mobile phone with cellular and WiFi. Primary personal tracking target.'
  },
  'tablet': {
    label: 'Tablet',
    category: 'mobile',
    trackingValue: 'high',
    description: 'Tablet device. High mobility tracking value.'
  },
  'iot': {
    label: 'IoT Device',
    category: 'iot',
    trackingValue: 'medium',
    description: 'Internet of Things device. Variable tracking value.'
  },
  'access-point': {
    label: 'Wireless Access Point',
    category: 'infrastructure',
    trackingValue: 'low',
    description: 'Fixed wireless infrastructure. Low tracking value, high network intelligence value.'
  },
  'router': {
    label: 'Router',
    category: 'infrastructure',
    trackingValue: 'low',
    description: 'Network routing device. Infrastructure intelligence value.'
  },
  'camera': {
    label: 'Camera/Surveillance',
    category: 'iot',
    trackingValue: 'high',
    description: 'Surveillance camera. High intelligence value for physical security mapping.'
  },
  'printer': {
    label: 'Printer',
    category: 'stationary',
    trackingValue: 'medium',
    description: 'Network printer. Location-based asset intelligence.'
  },
  'television': {
    label: 'Smart TV',
    category: 'stationary',
    trackingValue: 'low',
    description: 'Smart television. Residential location indicator.'
  },
  'gaming-console': {
    label: 'Gaming Console',
    category: 'stationary',
    trackingValue: 'medium',
    description: 'Gaming device. User preference and location intelligence.'
  },
  'wearable': {
    label: 'Wearable Device',
    category: 'mobile',
    trackingValue: 'critical',
    description: 'Wearable technology. Critical personal tracking value.'
  },
  'bluetooth-beacon': {
    label: 'BLE Beacon',
    category: 'iot',
    trackingValue: 'high',
    description: 'Bluetooth beacon for proximity tracking. High tracking value.'
  },
  'unknown': {
    label: 'Unknown Device',
    category: 'mobile',
    trackingValue: 'medium',
    description: 'Device type could not be determined.'
  }
};

/**
 * Parse device type from manufacturer name, SSID, or other identifiers
 */
export function parseDeviceType(
  manufacturer?: string | null,
  ssid?: string | null,
  networkType?: string | null
): DeviceType {
  const mfg = (manufacturer || '').toLowerCase();
  const name = (ssid || '').toLowerCase();
  const type = (networkType || '').toLowerCase();

  // Car Audio
  if (mfg.includes('car audio') || name.includes('car') ||
      mfg.includes('pioneer') || mfg.includes('kenwood') ||
      mfg.includes('alpine') || mfg.includes('jvc')) {
    return 'car-audio';
  }

  // Laptop
  if (mfg.includes('laptop') || name.includes('laptop') ||
      name.includes('macbook') || name.includes('thinkpad') ||
      name.includes('dell') || name.includes('hp')) {
    return 'laptop';
  }

  // Smartphone
  if (mfg.includes('apple') && (name.includes('iphone') || type.includes('phone')) ||
      mfg.includes('samsung') && name.includes('galaxy') ||
      mfg.includes('google') && name.includes('pixel') ||
      name.includes('phone') || name.includes('android')) {
    return 'smartphone';
  }

  // Tablet
  if (name.includes('ipad') || name.includes('tablet')) {
    return 'tablet';
  }

  // Camera
  if (mfg.includes('camera') || mfg.includes('hikvision') ||
      mfg.includes('axis') || mfg.includes('dahua') ||
      name.includes('camera') || name.includes('cam')) {
    return 'camera';
  }

  // Access Point / Router
  if (mfg.includes('cisco') || mfg.includes('ubiquiti') ||
      mfg.includes('aruba') || mfg.includes('ruckus') ||
      name.includes('wifi') || name.includes('wireless') ||
      type.includes('iwlan')) {
    return 'access-point';
  }

  // Printer
  if (mfg.includes('printer') || mfg.includes('epson') ||
      mfg.includes('brother') || name.includes('print')) {
    return 'printer';
  }

  // TV
  if (mfg.includes('television') || mfg.includes('samsung') && name.includes('tv') ||
      mfg.includes('lg') && name.includes('tv') || name.includes('roku')) {
    return 'television';
  }

  // Gaming
  if (name.includes('playstation') || name.includes('xbox') ||
      name.includes('nintendo') || name.includes('ps4') || name.includes('ps5')) {
    return 'gaming-console';
  }

  // Wearable
  if (name.includes('watch') || name.includes('fitbit') ||
      name.includes('garmin') || mfg.includes('wearable')) {
    return 'wearable';
  }

  // BLE Beacon
  if (type.includes('bt') || type.includes('bluetooth') ||
      type.includes('ble') || name.includes('beacon')) {
    return 'bluetooth-beacon';
  }

  // IoT (catch-all for smart devices)
  if (name.includes('smart') || name.includes('iot') ||
      mfg.includes('amazon') || mfg.includes('google home')) {
    return 'iot';
  }

  return 'unknown';
}

/**
 * ============================================================================
 * COMPOSITE THREAT SCORING
 * ============================================================================
 */

export interface ThreatScore {
  overall: number; // 0-100
  components: {
    securityRisk: number;
    infrastructureCapability: number;
    trackingValue: number;
    exposurePrevalence: number;
  };
  classification: 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
  recommendation: string;
}

/**
 * Calculate composite threat score
 */
export function calculateThreatScore(
  securityClass: SecurityClassification,
  cellularGen: CellularGeneration | null,
  deviceType: DeviceType
): ThreatScore {
  const securityMeta = SECURITY_CLASSIFICATION[securityClass];
  const cellularMeta = cellularGen ? CELLULAR_CLASSIFICATION[cellularGen] : null;
  const deviceMeta = DEVICE_TYPE_CLASSIFICATION[deviceType];

  // Security risk (0-100)
  const securityRiskMap: Record<RiskLevel, number> = {
    critical: 100,
    high: 75,
    moderate: 50,
    acceptable: 25,
    optimal: 10
  };
  const securityRisk = securityRiskMap[securityMeta.risk];

  // Infrastructure capability (0-100)
  const capabilityMap: Record<string, number> = {
    critical: 100,
    high: 75,
    moderate: 50,
    limited: 25,
    minimal: 10
  };
  const infrastructureCapability = cellularMeta
    ? capabilityMap[cellularMeta.exfiltrationPotential]
    : 0;

  // Tracking value (0-100)
  const trackingMap: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  };
  const trackingValue = trackingMap[deviceMeta.trackingValue];

  // Exposure prevalence (based on statistical data)
  const exposurePrevalence = securityClass === 'none' ? 100 :
                             securityClass === 'wep' ? 90 :
                             securityClass === 'wpa' ? 70 : 50;

  // Weighted overall score
  const overall = Math.round(
    (securityRisk * 0.4) +
    (infrastructureCapability * 0.25) +
    (trackingValue * 0.20) +
    (exposurePrevalence * 0.15)
  );

  // Classification
  let classification: ThreatScore['classification'];
  if (overall >= 80) classification = 'critical';
  else if (overall >= 60) classification = 'high';
  else if (overall >= 40) classification = 'moderate';
  else if (overall >= 20) classification = 'low';
  else classification = 'minimal';

  // Recommendation
  let recommendation: string;
  if (securityClass === 'none' && cellularGen && ['L', '4G+', '5'].includes(cellularGen)) {
    recommendation = 'CRITICAL: Open network in high-speed zone. Immediate exploitation vector for rapid data exfiltration.';
  } else if (securityClass === 'none') {
    recommendation = 'HIGH PRIORITY: Open network represents most common vulnerability. Audit immediately.';
  } else if (securityClass === 'wep') {
    recommendation = 'CRITICAL: WEP is trivially exploitable. Replace immediately.';
  } else if (securityClass === 'wpa2' && deviceType === 'car-audio') {
    recommendation = 'MODERATE: WPA2-PSK on mobile device. Verify passphrase strength for vehicle tracking mitigation.';
  } else if (securityClass === 'wpa3') {
    recommendation = 'OPTIMAL: Modern security standard. Verify no downgrade attacks possible.';
  } else {
    recommendation = 'Standard security assessment required.';
  }

  return {
    overall,
    components: {
      securityRisk,
      infrastructureCapability,
      trackingValue,
      exposurePrevalence
    },
    classification,
    recommendation
  };
}
