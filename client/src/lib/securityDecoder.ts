/**
 * WiFi Security Capability Parser
 * Factual parsing of security capabilities - no opinions or ratings
 * Based on WiGLE.net capability string format
 */

export interface SecurityTypeInfo {
  icon: string;
  hex: string;
  description: string;
  abbr: string;
}

/**
 * Complete mapping of security types to their display properties
 * Directly from capability string patterns observed in WiGLE data
 */
export const SECURITY_TYPE_MAP: Record<string, SecurityTypeInfo> = {
  // Open networks
  'Open': {
    icon: '🔓',
    hex: '#FF0000',
    description: 'No Encryption',
    abbr: 'Open'
  },

  // WEP
  'WEP': {
    icon: '⚠️',
    hex: '#FF4500',
    description: 'RC4 Stream Cipher',
    abbr: 'WEP'
  },

  // WPA variants
  'WPA-EAP': {
    icon: '🔑',
    hex: '#FFD700',
    description: '802.1X TKIP/CCMP',
    abbr: 'WPA-EAP'
  },
  'WPA-PSK': {
    icon: '🔒',
    hex: '#FFD700',
    description: 'PSK TKIP/CCMP',
    abbr: 'WPA-PSK'
  },

  // WPA2 variants
  'WPA2-EAP': {
    icon: '🔑',
    hex: '#32CD32',
    description: '802.1X RSN CCMP',
    abbr: 'WPA2-EAP'
  },
  'WPA2-PSK': {
    icon: '🔒',
    hex: '#32CD32',
    description: 'PSK RSN CCMP',
    abbr: 'WPA2-PSK'
  },

  // WPA2-OWE
  'WPA2-OWE': {
    icon: '🔒',
    hex: '#008080',
    description: 'Opportunistic Wireless Enc.',
    abbr: 'OWE'
  },

  // WPA3
  'WPA2-SAE': {
    icon: '🛡️',
    hex: '#0000FF',
    description: 'Simultaneous Auth. Equals',
    abbr: 'WPA3-SAE'
  },
  'WPA3-SAE': {
    icon: '🛡️',
    hex: '#0000FF',
    description: 'Simultaneous Auth. Equals',
    abbr: 'WPA3-SAE'
  },

  // Transition/Hybrid modes
  'WPA-EAP,WPA2-EAP': {
    icon: '🔑',
    hex: '#32CD32',
    description: '802.1X Trans TKIP/CCMP',
    abbr: 'WPA Hybrid'
  },
  'WPA2-EAP,WPA-EAP': {
    icon: '🔑',
    hex: '#32CD32',
    description: '802.1X RSN Trans',
    abbr: 'WPA2 Trans'
  },
  'WPA-PSK,WPA2-PSK': {
    icon: '🔒',
    hex: '#32CD32',
    description: 'PSK Trans TKIP/CCMP',
    abbr: 'WPA2 Hybrid'
  },
  'WPA2-PSK,WPA-PSK': {
    icon: '🔒',
    hex: '#32CD32',
    description: 'PSK RSN Trans',
    abbr: 'WPA2 Trans'
  },

  // Non-WiFi radio types
  'BT': {
    icon: '📡',
    hex: '#9370DB',
    description: 'Bluetooth Classic (v1.0-5.0)',
    abbr: 'BT Classic'
  },
  'BLE': {
    icon: '🔵',
    hex: '#4B0082',
    description: 'Bluetooth Low Energy (v4.0+)',
    abbr: 'BLE'
  },
  'GSM': {
    icon: '📶',
    hex: '#808080',
    description: 'Global System for Mobile (2G)',
    abbr: 'GSM'
  },
  'LTE': {
    icon: '📡',
    hex: '#00FFFF',
    description: 'Long Term Evolution (4G)',
    abbr: 'LTE'
  }
};

/**
 * Parse WiGLE capability string to determine security type
 * Returns the matched type key from SECURITY_TYPE_MAP
 *
 * Format examples from WiGLE:
 * - [WPA2-PSK-CCMP][RSN-PSK-CCMP][ESS]
 * - [WPA2-EAP/SHA1-CCMP][RSN-EAP/SHA1-CCMP][ESS]
 * - [RSN-SAE-CCMP][ESS]
 * - [RSN-OWE-CCMP][ESS]
 * - [WEP][ESS]
 * - GSM;310260
 * - LTE;310260
 * - Headphones;10 (Bluetooth)
 */
export function categorizeSecurityType(capabilities: string | null | undefined, radioType?: string): string {
  if (!capabilities || capabilities.trim() === '') {
    return 'Open';
  }

  const caps = capabilities.toUpperCase();

  // Handle cellular network types (GSM, LTE, NR)
  if (caps.startsWith('GSM;') || caps.startsWith('GSM')) return 'GSM';
  if (caps.startsWith('LTE;') || caps.startsWith('LTE')) return 'LTE';
  if (caps.startsWith('NR;')) return 'LTE'; // 5G NR - map to LTE for now
  if (caps.startsWith('IWLAN;') || caps.startsWith('UNKNOWN;')) return 'GSM';

  // Handle Bluetooth device types
  const btTypes = ['HEADPHONES', 'SPEAKER', 'WATCH', 'HEALTH', 'PHONE', 'KEYBOARD',
                   'POINTER', 'COMPUTER', 'LAPTOP', 'SETTOP', 'DISPLAY', 'AUDIO',
                   'CAR AUDIO', 'PORTABLE', 'HANDSFREE', 'PULSE', 'MISC', 'UNCATEGORIZED'];
  if (btTypes.some(type => caps.startsWith(type))) {
    return 'BLE'; // Treat all BT device types as BLE
  }

  // Handle radio type override
  if (radioType) {
    if (radioType === 'E') return 'BLE';
    if (radioType === 'B') return 'BT';
    if (radioType === 'G') return 'GSM';
    if (radioType === 'L') return 'LTE';
  }

  // WiFi security parsing - looking for patterns in square brackets
  // WPA3/SAE detection (RSN-SAE or WPA3)
  if (caps.includes('RSN-SAE') || caps.includes('WPA3')) {
    return 'WPA3-SAE';
  }

  // OWE detection (RSN-OWE)
  if (caps.includes('RSN-OWE') || caps.includes('-OWE-')) {
    return 'WPA2-OWE';
  }

  // WEP detection
  if (caps.includes('[WEP]')) {
    return 'WEP';
  }

  // Check for WPA and WPA2 combinations
  const hasWPA = caps.includes('[WPA-');
  const hasWPA2 = caps.includes('[WPA2-') || caps.includes('[RSN-');
  const hasEAP = caps.includes('-EAP');
  const hasPSK = caps.includes('-PSK');

  // Transition mode - both WPA and WPA2
  if (hasWPA && hasWPA2) {
    if (hasEAP) {
      return 'WPA-EAP,WPA2-EAP';
    }
    if (hasPSK) {
      return 'WPA-PSK,WPA2-PSK';
    }
  }

  // WPA2 only
  if (hasWPA2) {
    if (hasEAP) {
      return 'WPA2-EAP';
    }
    if (hasPSK) {
      return 'WPA2-PSK';
    }
    // Default WPA2 to PSK if unclear
    return 'WPA2-PSK';
  }

  // WPA only (legacy)
  if (hasWPA) {
    if (hasEAP) {
      return 'WPA-EAP';
    }
    if (hasPSK) {
      return 'WPA-PSK';
    }
    return 'WPA-PSK';
  }

  // Open network - just [ESS] or [IBSS] or empty
  if (caps === '[ESS]' || caps === '[IBSS]' || caps.includes('[ESS]') && !hasWPA && !hasWPA2) {
    return 'Open';
  }

  // Unknown/fallback
  return 'Open';
}

/**
 * Get display information for a security type
 */
export function getSecurityTypeStyle(typeKey: string) {
  const info = SECURITY_TYPE_MAP[typeKey] || SECURITY_TYPE_MAP['Open'];

  // Convert hex to Tailwind-compatible classes
  const hexToTailwind = (hex: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
      '#FF0000': { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-300' },
      '#FF4500': { bg: 'bg-orange-600/10', border: 'border-orange-600/20', text: 'text-orange-400' },
      '#FFD700': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-300' },
      '#32CD32': { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-300' },
      '#008080': { bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-300' },
      '#0000FF': { bg: 'bg-blue-600/10', border: 'border-blue-600/20', text: 'text-blue-300' },
      '#9370DB': { bg: 'bg-purple-400/10', border: 'border-purple-400/20', text: 'text-purple-300' },
      '#4B0082': { bg: 'bg-indigo-700/10', border: 'border-indigo-700/20', text: 'text-indigo-300' },
      '#808080': { bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400' },
      '#00FFFF': { bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', text: 'text-cyan-300' }
    };

    return colorMap[hex] || colorMap['#808080'];
  };

  const tailwind = hexToTailwind(info.hex);

  return {
    color: info.hex,
    icon: info.icon,
    abbr: info.abbr,
    description: info.description,
    ...tailwind
  };
}

/**
 * Legacy compatibility exports for dashboard and SecurityTooltip
 * @deprecated - these components still use old enum-based API
 */

export interface SecurityAnalysis {
  strength: SecurityStrength;
  protocol: string;
  encryption: string[];
  keyManagement: string[];
  issues: string[];
  score: number;
  description: string;
  color: string;
  icon: string;
  capabilities: string;
}

export const SECURITY_TERMS: Record<string, { name: string; description: string; category: string }> = {
  'WPA3': { name: 'WPA3', description: 'Latest WiFi security standard', category: 'Protocol' },
  'WPA2': { name: 'WPA2', description: 'WiFi security standard', category: 'Protocol' },
  'WPA': { name: 'WPA', description: 'WiFi Protected Access', category: 'Protocol' },
  'WEP': { name: 'WEP', description: 'Wired Equivalent Privacy', category: 'Protocol' },
  'PSK': { name: 'PSK', description: 'Pre-Shared Key', category: 'Authentication' },
  'SAE': { name: 'SAE', description: 'Simultaneous Authentication of Equals', category: 'Authentication' },
  'EAP': { name: 'EAP', description: 'Extensible Authentication Protocol', category: 'Authentication' },
  'OWE': { name: 'OWE', description: 'Opportunistic Wireless Encryption', category: 'Authentication' },
  'RSN': { name: 'RSN', description: 'Robust Security Network', category: 'Protocol' },
  'CCMP': { name: 'CCMP (AES)', description: 'AES-128 encryption', category: 'Encryption' },
  'TKIP': { name: 'TKIP', description: 'Temporal Key Integrity Protocol', category: 'Encryption' },
};

export function parseCapabilities(capabilities: string | null | undefined): SecurityAnalysis {
  if (!capabilities) {
    return {
      strength: SecurityStrength.OPEN,
      protocol: 'Open',
      encryption: [],
      keyManagement: [],
      issues: [],
      score: 0,
      description: 'Open network',
      color: '#ef4444',
      icon: '🔓',
      capabilities: ''
    };
  }

  const caps = capabilities.toUpperCase();
  return {
    strength: caps.includes('WPA3') ? SecurityStrength.EXCELLENT : caps.includes('WPA2') ? SecurityStrength.GOOD : SecurityStrength.MODERATE,
    protocol: caps.includes('WPA3') ? 'WPA3' : caps.includes('WPA2') ? 'WPA2' : caps.includes('WPA') ? 'WPA' : 'Unknown',
    encryption: caps.includes('CCMP') ? ['CCMP'] : caps.includes('TKIP') ? ['TKIP'] : [],
    keyManagement: caps.includes('PSK') ? ['PSK'] : caps.includes('EAP') ? ['EAP'] : [],
    issues: [],
    score: 50,
    description: 'WiFi network',
    color: '#3b82f6',
    icon: '🔒',
    capabilities
  };
}

export function extractTerms(capabilities: string | null | undefined): string[] {
  if (!capabilities) return [];
  const caps = capabilities.toUpperCase();
  const terms: string[] = [];
  Object.keys(SECURITY_TERMS).forEach(term => {
    if (caps.includes(term.toUpperCase())) {
      terms.push(term);
    }
  });
  return terms;
}

/**
 * Legacy compatibility exports for dashboard
 * @deprecated - dashboard still uses old enum-based API
 */
export enum SecurityType {
  WPA3_ENTERPRISE = 'WPA3-Enterprise',
  WPA3_PERSONAL = 'WPA3-Personal',
  WPA2_ENTERPRISE = 'WPA2-Enterprise',
  WPA2_PERSONAL = 'WPA2-Personal',
  WPA_ENTERPRISE = 'WPA-Enterprise',
  WPA_PERSONAL = 'WPA-Personal',
  WEP = 'WEP',
  OWE = 'OWE',
  OPEN = 'Open'
}

export enum SecurityStrength {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  MODERATE = 'MODERATE',
  WEAK = 'WEAK',
  VULNERABLE = 'VULNERABLE',
  OPEN = 'OPEN'
}

export function getSecurityBadgeClass(strength: SecurityStrength): string {
  const classes = {
    [SecurityStrength.EXCELLENT]: 'bg-green-500/10 text-green-300 border-green-500/20',
    [SecurityStrength.GOOD]: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    [SecurityStrength.MODERATE]: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    [SecurityStrength.WEAK]: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    [SecurityStrength.VULNERABLE]: 'bg-red-500/10 text-red-300 border-red-500/20',
    [SecurityStrength.OPEN]: 'bg-red-500/10 text-red-300 border-red-500/20'
  };
  return classes[strength];
}

export function categorizeNetworksByType(securityData: any, useObservations: boolean = false): Record<SecurityType, number> {
  const categories: Record<SecurityType, number> = {
    [SecurityType.WPA3_ENTERPRISE]: 0,
    [SecurityType.WPA3_PERSONAL]: 0,
    [SecurityType.WPA2_ENTERPRISE]: 0,
    [SecurityType.WPA2_PERSONAL]: 0,
    [SecurityType.WPA_ENTERPRISE]: 0,
    [SecurityType.WPA_PERSONAL]: 0,
    [SecurityType.WEP]: 0,
    [SecurityType.OWE]: 0,
    [SecurityType.OPEN]: 0
  };

  // Use the actual security_types data from backend if available
  if (useObservations && securityData?.security_type_observations) {
    return {
      [SecurityType.WPA3_ENTERPRISE]: securityData.security_type_observations.wpa3_enterprise || 0,
      [SecurityType.WPA3_PERSONAL]: securityData.security_type_observations.wpa3_personal || 0,
      [SecurityType.WPA2_ENTERPRISE]: securityData.security_type_observations.wpa2_enterprise || 0,
      [SecurityType.WPA2_PERSONAL]: securityData.security_type_observations.wpa2_personal || 0,
      [SecurityType.WPA_ENTERPRISE]: securityData.security_type_observations.wpa_enterprise || 0,
      [SecurityType.WPA_PERSONAL]: securityData.security_type_observations.wpa_personal || 0,
      [SecurityType.WEP]: securityData.security_type_observations.wep || 0,
      [SecurityType.OWE]: securityData.security_type_observations.owe || 0,
      [SecurityType.OPEN]: securityData.security_type_observations.open || 0
    };
  }

  if (!useObservations && securityData?.security_types) {
    return {
      [SecurityType.WPA3_ENTERPRISE]: securityData.security_types.wpa3_enterprise || 0,
      [SecurityType.WPA3_PERSONAL]: securityData.security_types.wpa3_personal || 0,
      [SecurityType.WPA2_ENTERPRISE]: securityData.security_types.wpa2_enterprise || 0,
      [SecurityType.WPA2_PERSONAL]: securityData.security_types.wpa2_personal || 0,
      [SecurityType.WPA_ENTERPRISE]: securityData.security_types.wpa_enterprise || 0,
      [SecurityType.WPA_PERSONAL]: securityData.security_types.wpa_personal || 0,
      [SecurityType.WEP]: securityData.security_types.wep || 0,
      [SecurityType.OWE]: securityData.security_types.owe || 0,
      [SecurityType.OPEN]: securityData.security_types.open || 0
    };
  }

  // Fallback: if backend doesn't provide security_types, return empty
  console.warn('Security type data not available from backend');
  return categories;
}
