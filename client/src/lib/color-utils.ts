// Generate consistent colors from BSSID using deterministic hash
export function generateColorFromBSSID(bssid: string): { hex: string; rgb: string; hsl: string } {
  // Create a hash from the BSSID
  let hash = 0;
  for (let i = 0; i < bssid.length; i++) {
    hash = bssid.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL values for good color distribution
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 30); // 60-90% saturation
  const lightness = 45 + (Math.abs(hash) % 20); // 45-65% lightness

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return { r, g, b };
  };

  const { r, g, b } = hslToRgb(hue, saturation, lightness);
  
  return {
    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`
  };
}

// Get signal strength category for styling
export function getSignalStrengthCategory(signal: number): { 
  category: string; 
  color: string; 
  label: string;
} {
  if (signal >= -30) {
    return { category: 'excellent', color: '#22c55e', label: 'Excellent' };
  } else if (signal >= -50) {
    return { category: 'good', color: '#3b82f6', label: 'Good' };
  } else if (signal >= -60) {
    return { category: 'fair', color: '#f59e0b', label: 'Fair' };
  } else if (signal >= -70) {
    return { category: 'weak', color: '#ef4444', label: 'Weak' };
  } else {
    return { category: 'very-weak', color: '#991b1b', label: 'Very Weak' };
  }
}

// Get security level styling
export function getSecurityStyling(capabilities: string): {
  level: string;
  color: string;
  icon: string;
} {
  const caps = capabilities.toLowerCase();
  
  if (caps.includes('wpa3') || caps.includes('sae')) {
    return { level: 'WPA3', color: '#22c55e', icon: 'fas fa-shield-alt' };
  } else if (caps.includes('wpa2') || caps.includes('psk')) {
    return { level: 'WPA2', color: '#3b82f6', icon: 'fas fa-shield' };
  } else if (caps.includes('wpa')) {
    return { level: 'WPA', color: '#f59e0b', icon: 'fas fa-shield-halved' };
  } else if (caps.includes('wep')) {
    return { level: 'WEP', color: '#ef4444', icon: 'fas fa-unlock' };
  } else {
    return { level: 'Open', color: '#991b1b', icon: 'fas fa-unlock-alt' };
  }
}