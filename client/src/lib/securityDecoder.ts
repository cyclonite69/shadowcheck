/**
 * WiFi Security Capability Decoder
 * Client-side utilities for parsing and explaining security strings
 */

export enum SecurityStrength {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  MODERATE = 'MODERATE',
  WEAK = 'WEAK',
  VULNERABLE = 'VULNERABLE',
  OPEN = 'OPEN'
}

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

/**
 * Parse WiFi capability string
 */
export function parseCapabilities(capabilities: string | null | undefined): SecurityAnalysis {
  if (!capabilities || capabilities.trim() === '') {
    return {
      strength: SecurityStrength.OPEN,
      protocol: 'Open',
      encryption: [],
      keyManagement: [],
      issues: ['No encryption - all traffic is visible'],
      score: 0,
      description: 'Open network with no security',
      color: '#ef4444',
      icon: '🔓',
      capabilities: ''
    };
  }

  const caps = capabilities.toUpperCase();
  const analysis: SecurityAnalysis = {
    strength: SecurityStrength.MODERATE,
    protocol: 'Unknown',
    encryption: [],
    keyManagement: [],
    issues: [],
    score: 50,
    description: '',
    color: '#f59e0b',
    icon: '🔐',
    capabilities
  };

  // Detect protocol version
  if (caps.includes('WPA3')) {
    analysis.protocol = 'WPA3';
    analysis.score = 95;
    analysis.icon = '🛡️';
  } else if (caps.includes('WPA2') || caps.includes('RSN')) {
    analysis.protocol = 'WPA2';
    analysis.score = 75;
    analysis.icon = '🔒';
  } else if (caps.includes('WPA')) {
    analysis.protocol = 'WPA';
    analysis.score = 50;
    analysis.issues.push('WPA1 is deprecated and vulnerable');
    analysis.icon = '⚠️';
  } else if (caps.includes('WEP')) {
    analysis.protocol = 'WEP';
    analysis.score = 10;
    analysis.issues.push('WEP is broken and easily cracked');
    analysis.icon = '❌';
  }

  // Detect encryption methods
  if (caps.includes('GCMP-256')) {
    analysis.encryption.push('GCMP-256');
    analysis.score += 5;
  } else if (caps.includes('GCMP')) {
    analysis.encryption.push('GCMP');
    analysis.score += 3;
  }

  if (caps.includes('CCMP-256')) {
    analysis.encryption.push('CCMP-256');
    analysis.score += 3;
  } else if (caps.includes('CCMP')) {
    analysis.encryption.push('CCMP (AES)');
    analysis.score += 2;
  }

  if (caps.includes('TKIP')) {
    analysis.encryption.push('TKIP');
    analysis.score -= 15;
    analysis.issues.push('TKIP is deprecated and vulnerable to attacks');
  }

  // Detect key management
  if (caps.includes('SAE')) {
    analysis.keyManagement.push('SAE (WPA3)');
    analysis.score += 10;
  }

  if (caps.includes('PSK')) {
    analysis.keyManagement.push('PSK (Pre-Shared Key)');
  }

  if (caps.includes('EAP')) {
    analysis.keyManagement.push('EAP (Enterprise)');
    analysis.score += 5;
  }

  if (caps.includes('OWE')) {
    analysis.keyManagement.push('OWE (Enhanced Open)');
    analysis.score += 5;
  }

  // Check for vulnerabilities
  if (caps.includes('WPS')) {
    analysis.issues.push('WPS enabled - vulnerable to brute force');
    analysis.score -= 10;
  }

  // Determine overall strength
  analysis.score = Math.max(0, Math.min(100, analysis.score));

  if (analysis.score >= 90) {
    analysis.strength = SecurityStrength.EXCELLENT;
    analysis.color = '#10b981';
    analysis.description = 'Excellent security with modern encryption';
  } else if (analysis.score >= 70) {
    analysis.strength = SecurityStrength.GOOD;
    analysis.color = '#3b82f6';
    analysis.description = 'Good security with strong encryption';
  } else if (analysis.score >= 50) {
    analysis.strength = SecurityStrength.MODERATE;
    analysis.color = '#f59e0b';
    analysis.description = 'Moderate security - consider upgrading';
  } else if (analysis.score >= 20) {
    analysis.strength = SecurityStrength.WEAK;
    analysis.color = '#f97316';
    analysis.description = 'Weak security - vulnerable to attacks';
  } else {
    analysis.strength = SecurityStrength.VULNERABLE;
    analysis.color = '#ef4444';
    analysis.description = 'Highly vulnerable - immediate upgrade needed';
  }

  return analysis;
}

/**
 * Get human-readable explanation of security terms
 */
export const SECURITY_TERMS: Record<string, { name: string; description: string; category: string }> = {
  'WPA3': {
    name: 'WPA3',
    description: 'Latest WiFi security standard with improved encryption and protection against offline dictionary attacks',
    category: 'Protocol'
  },
  'WPA2': {
    name: 'WPA2',
    description: 'Strong WiFi security standard, industry standard since 2004. Still secure when properly configured',
    category: 'Protocol'
  },
  'WPA': {
    name: 'WPA',
    description: 'Original WiFi Protected Access - deprecated and vulnerable to various attacks',
    category: 'Protocol'
  },
  'WEP': {
    name: 'WEP',
    description: 'Wired Equivalent Privacy - completely broken encryption that can be cracked in minutes',
    category: 'Protocol'
  },
  'CCMP': {
    name: 'CCMP (AES)',
    description: 'Counter Mode with CBC-MAC Protocol - secure AES-128 encryption, recommended for WPA2',
    category: 'Encryption'
  },
  'CCMP-256': {
    name: 'CCMP-256',
    description: 'AES-256 encryption with CCMP - highest security level for WPA2/WPA3',
    category: 'Encryption'
  },
  'GCMP': {
    name: 'GCMP',
    description: 'Galois/Counter Mode Protocol - WPA3 encryption method with AES-128',
    category: 'Encryption'
  },
  'GCMP-256': {
    name: 'GCMP-256',
    description: 'AES-256 with GCMP - highest WPA3 security level, extremely secure',
    category: 'Encryption'
  },
  'TKIP': {
    name: 'TKIP',
    description: 'Temporal Key Integrity Protocol - deprecated and vulnerable to key recovery attacks',
    category: 'Encryption'
  },
  'PSK': {
    name: 'PSK',
    description: 'Pre-Shared Key - password-based authentication for personal/home networks',
    category: 'Authentication'
  },
  'SAE': {
    name: 'SAE',
    description: 'Simultaneous Authentication of Equals - WPA3 password method resistant to offline attacks',
    category: 'Authentication'
  },
  'EAP': {
    name: 'EAP',
    description: 'Extensible Authentication Protocol - enterprise authentication requiring RADIUS server',
    category: 'Authentication'
  },
  'OWE': {
    name: 'OWE',
    description: 'Opportunistic Wireless Encryption - enhanced open network security without passwords',
    category: 'Authentication'
  },
  'WPS': {
    name: 'WPS',
    description: 'WiFi Protected Setup - convenience feature with known security vulnerabilities',
    category: 'Feature'
  },
  'RSN': {
    name: 'RSN',
    description: 'Robust Security Network - technical term for WPA2 security framework',
    category: 'Protocol'
  },
  'ESS': {
    name: 'ESS',
    description: 'Extended Service Set - standard infrastructure mode with access point',
    category: 'Mode'
  },
  'IBSS': {
    name: 'IBSS',
    description: 'Independent Basic Service Set - ad-hoc/peer-to-peer mode without access point',
    category: 'Mode'
  }
};

/**
 * Extract terms from capability string
 */
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
 * Get badge color class based on security strength
 */
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

/**
 * Security type categories for network classification
 */
export enum SecurityType {
  ENTERPRISE = 'Enterprise',
  PERSONAL_WPA3 = 'Personal (WPA3)',
  PERSONAL_WPA2 = 'Personal (WPA2)',
  LEGACY = 'Legacy (WPA/WEP)',
  OPEN = 'Open'
}

/**
 * Categorize a network by its security type based on capabilities
 */
export function categorizeSecurityType(capabilities: string | null | undefined): SecurityType {
  if (!capabilities || capabilities.trim() === '') {
    return SecurityType.OPEN;
  }

  const caps = capabilities.toUpperCase();

  // Check for Enterprise (EAP authentication)
  if (caps.includes('EAP')) {
    return SecurityType.ENTERPRISE;
  }

  // Check for WPA3 with SAE (Personal WPA3)
  if (caps.includes('SAE') || caps.includes('WPA3')) {
    return SecurityType.PERSONAL_WPA3;
  }

  // Check for WPA2/RSN with PSK (Personal WPA2)
  if ((caps.includes('WPA2') || caps.includes('RSN')) && caps.includes('PSK')) {
    return SecurityType.PERSONAL_WPA2;
  }

  // Legacy protocols (WPA1, WEP)
  if (caps.includes('WPA') || caps.includes('WEP')) {
    return SecurityType.LEGACY;
  }

  // Default to open if we can't determine
  return SecurityType.OPEN;
}

/**
 * Get color and styling for security type
 */
export function getSecurityTypeStyle(type: SecurityType) {
  switch (type) {
    case SecurityType.ENTERPRISE:
      return {
        color: '#10b981', // green
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-300'
      };
    case SecurityType.PERSONAL_WPA3:
      return {
        color: '#3b82f6', // blue
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-300'
      };
    case SecurityType.PERSONAL_WPA2:
      return {
        color: '#f59e0b', // yellow/amber
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-300'
      };
    case SecurityType.LEGACY:
      return {
        color: '#f97316', // orange
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-300'
      };
    case SecurityType.OPEN:
      return {
        color: '#ef4444', // red
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-300'
      };
  }
}

/**
 * Categorize networks from security analysis data by type
 * @param securityData - Security analysis data from API
 * @param useObservations - If true, use total observations instead of distinct networks
 */
export function categorizeNetworksByType(securityData: any, useObservations: boolean = false): Record<SecurityType, number> {
  const categories: Record<SecurityType, number> = {
    [SecurityType.ENTERPRISE]: 0,
    [SecurityType.PERSONAL_WPA3]: 0,
    [SecurityType.PERSONAL_WPA2]: 0,
    [SecurityType.LEGACY]: 0,
    [SecurityType.OPEN]: 0
  };

  // Use the actual security_types data from backend if available
  if (useObservations && securityData?.security_type_observations) {
    return {
      [SecurityType.ENTERPRISE]: securityData.security_type_observations.enterprise || 0,
      [SecurityType.PERSONAL_WPA3]: securityData.security_type_observations.personal_wpa3 || 0,
      [SecurityType.PERSONAL_WPA2]: securityData.security_type_observations.personal_wpa2 || 0,
      [SecurityType.LEGACY]: securityData.security_type_observations.legacy || 0,
      [SecurityType.OPEN]: securityData.security_type_observations.open || 0
    };
  }

  if (!useObservations && securityData?.security_types) {
    return {
      [SecurityType.ENTERPRISE]: securityData.security_types.enterprise || 0,
      [SecurityType.PERSONAL_WPA3]: securityData.security_types.personal_wpa3 || 0,
      [SecurityType.PERSONAL_WPA2]: securityData.security_types.personal_wpa2 || 0,
      [SecurityType.LEGACY]: securityData.security_types.legacy || 0,
      [SecurityType.OPEN]: securityData.security_types.open || 0
    };
  }

  // Fallback: if backend doesn't provide security_types, return empty
  console.warn('Security type data not available from backend');
  return categories;
}
