/**
 * Security capability parsing and flag generation for SIGINT forensics
 */

export interface SecurityInfo {
  short: string;      // Short display name (WPA2, WPA3, WEP, etc.)
  full: string;       // Full description for tooltips
  level: 'high' | 'medium' | 'low' | 'none' | 'unknown';
  cipher?: string;    // Encryption cipher
  auth?: string;      // Authentication method
  flags: string[];    // Individual flags for detailed analysis
}

/**
 * Parse WiFi security capabilities into structured security info
 */
export function parseWiFiSecurity(capabilities?: string | null): SecurityInfo {
  if (!capabilities) {
    return {
      short: 'Open',
      full: 'Open Network',
      level: 'none',
      flags: ['OPEN']
    };
  }

  const caps = capabilities.toUpperCase();
  const flags: string[] = [];
  
  // WPA3 Detection
  if (caps.includes('SAE') || caps.includes('WPA3')) {
    if (caps.includes('EAP')) {
      flags.push('WPA3-ENT');
      return {
        short: 'WPA3',
        full: 'WPA3 Enterprise (802.1X authentication)',
        level: 'high',
        auth: 'EAP',
        cipher: extractCipher(caps),
        flags: [...flags, ...extractFlags(caps)]
      };
    } else {
      flags.push('WPA3-PSK');
      return {
        short: 'WPA3',
        full: 'WPA3 Personal (Pre-shared key)',
        level: 'high',
        auth: 'PSK',
        cipher: extractCipher(caps),
        flags: [...flags, ...extractFlags(caps)]
      };
    }
  }
  
  // WPA2 Detection
  if (caps.includes('WPA2') || caps.includes('RSN')) {
    if (caps.includes('EAP')) {
      flags.push('WPA2-ENT');
      return {
        short: 'WPA2',
        full: 'WPA2 Enterprise (802.1X authentication)',
        level: 'high',
        auth: 'EAP',
        cipher: extractCipher(caps),
        flags: [...flags, ...extractFlags(caps)]
      };
    } else if (caps.includes('PSK')) {
      flags.push('WPA2-PSK');
      return {
        short: 'WPA2',
        full: 'WPA2 Personal (Pre-shared key)',
        level: 'high',
        auth: 'PSK',
        cipher: extractCipher(caps),
        flags: [...flags, ...extractFlags(caps)]
      };
    }
  }
  
  // WPA (original) Detection
  if (caps.includes('WPA-') && caps.includes('PSK')) {
    flags.push('WPA-PSK');
    return {
      short: 'WPA',
      full: 'WPA Personal (Deprecated - upgrade recommended)',
      level: 'medium',
      auth: 'PSK',
      cipher: extractCipher(caps),
      flags: [...flags, ...extractFlags(caps)]
    };
  }
  
  // OWE (Opportunistic Wireless Encryption)
  if (caps.includes('OWE')) {
    flags.push('OWE');
    return {
      short: 'OWE',
      full: 'Opportunistic Wireless Encryption',
      level: 'medium',
      flags: [...flags, ...extractFlags(caps)]
    };
  }
  
  // WEP Detection
  if (caps.includes('WEP')) {
    flags.push('WEP');
    return {
      short: 'WEP',
      full: 'WEP (Broken encryption - easily cracked)',
      level: 'low',
      cipher: 'WEP',
      flags: [...flags, ...extractFlags(caps)]
    };
  }
  
  // Open Network Detection
  if (caps.includes('[ESS]') && 
      !caps.includes('RSN') && 
      !caps.includes('WPA') && 
      !caps.includes('OWE') && 
      !caps.includes('WEP')) {
    flags.push('OPEN');
    return {
      short: 'Open',
      full: 'Open Network',
      level: 'none',
      flags: [...flags, ...extractFlags(caps)]
    };
  }
  
  // Unknown/Other
  return {
    short: 'Unknown',
    full: `Unknown Security: ${capabilities}`,
    level: 'unknown',
    flags: [...flags, ...extractFlags(caps)]
  };
}

/**
 * Parse non-WiFi security (BLE, Cellular, etc.)
 */
export function parseNonWiFiSecurity(capabilities?: string | null, radioType?: string): SecurityInfo {
  if (!capabilities) {
    return {
      short: '—',
      full: 'Not Applicable',
      level: 'unknown',
      flags: []
    };
  }
  
  const caps = capabilities.toLowerCase();
  
  // Cellular LTE
  if (caps.includes('lte')) {
    return {
      short: 'LTE',
      full: 'LTE Encrypted',
      level: 'high',
      cipher: 'AES',
      flags: ['LTE', 'CELLULAR']
    };
  }
  
  // Cellular GSM
  if (caps.includes('gsm')) {
    return {
      short: 'GSM',
      full: 'GSM Encrypted',
      level: 'medium',
      cipher: 'A5',
      flags: ['GSM', 'CELLULAR']
    };
  }
  
  // BLE/Bluetooth types
  if (caps === 'misc' || caps.includes('uncategorized')) {
    const typeFlag = radioType?.toUpperCase() || 'BLE';
    return {
      short: typeFlag,
      full: `${typeFlag} Device`,
      level: 'medium',
      flags: [typeFlag, 'PAIRING']
    };
  }
  
  // Device types with IDs
  if (caps.includes(';')) {
    const [type, id] = caps.split(';');
    const typeUpper = type.replace(/\b\w/g, l => l.toUpperCase());
    return {
      short: typeUpper,
      full: `${typeUpper} Device (ID: ${id})`,
      level: 'medium',
      flags: [typeUpper, 'DEVICE_ID']
    };
  }
  
  return {
    short: 'Other',
    full: capabilities,
    level: 'unknown',
    flags: ['OTHER']
  };
}

/**
 * Extract cipher information from capabilities
 */
function extractCipher(caps: string): string {
  if (caps.includes('CCMP') && caps.includes('TKIP')) return 'CCMP+TKIP';
  if (caps.includes('CCMP')) return 'CCMP';
  if (caps.includes('TKIP')) return 'TKIP';
  return 'Unknown';
}

/**
 * Extract additional flags from capabilities
 */
function extractFlags(caps: string): string[] {
  const flags: string[] = [];
  
  if (caps.includes('WPS')) flags.push('WPS');
  if (caps.includes('FT')) flags.push('FAST_TRANSITION');
  if (caps.includes('PSK-SHA256')) flags.push('SHA256');
  if (caps.includes('MFPC')) flags.push('MGMT_FRAME_PROTECTION');
  if (caps.includes('ESS')) flags.push('INFRASTRUCTURE');
  if (caps.includes('IBSS')) flags.push('AD_HOC');
  
  return flags;
}

/**
 * Get security level color for UI
 */
export function getSecurityLevelColor(level: SecurityInfo['level']): string {
  switch (level) {
    case 'high': return 'text-green-600';     // Conservative green
    case 'medium': return 'text-amber-600';   // Conservative amber/yellow
    case 'low': return 'text-orange-600';     // Conservative orange
    case 'none': return 'text-red-600';       // Conservative red
    default: return 'text-gray-500';          // Conservative gray
  }
}

/**
 * Get security level icon
 */
export function getSecurityLevelIcon(level: SecurityInfo['level']): string {
  switch (level) {
    case 'high': return 'fas fa-shield-alt';
    case 'medium': return 'fas fa-shield-check';
    case 'low': return 'fas fa-shield-virus';
    case 'none': return 'fas fa-shield-slash';
    default: return 'fas fa-question-circle';
  }
}