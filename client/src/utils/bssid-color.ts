// BSSID Color-coding Algorithm for Forensic Analysis
// Generates similar colors for similar BSSIDs to aid in pattern recognition

export interface BSSIDColor {
  hex: string;
  hsl: { h: number; s: number; l: number };
}

/**
 * Converts BSSID to a deterministic color using fixed hue palette
 * Similar BSSIDs (same OUI) get similar colors for forensic analysis
 */
export function bssidToColor(bssid: string): BSSIDColor {
  // Fixed hue palette (primary/secondary wheel)
  const BASE_HUES = [0, 60, 120, 180, 240, 270, 300, 330];

  // Simple, stable string hash → non-negative int
  function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0; // force 32-bit
    }
    return Math.abs(hash);
  }

  // Normalize a BSSID/MAC to uppercase hex (no separators)
  function normalizeMac(mac: string): string {
    return (mac || "").toUpperCase().replace(/[^0-9A-F]/g, "");
  }

  const cleaned = normalizeMac(bssid);
  if (cleaned.length < 6) {
    return { hex: '#999999', hsl: { h: 0, s: 0, l: 60 } }; // too short → gray
  }

  const oui = cleaned.slice(0, 6);                   // vendor/OUI
  const devicePart = cleaned.slice(6);               // device portion (may be "")

  const hue = BASE_HUES[stringToHash(oui) % BASE_HUES.length];

  // Keep saturation and lightness consistent for good visibility
  const saturation = 70;
  const lightness = 65;

  const hsl = { h: hue, s: saturation, l: lightness };
  const hex = hslToHex(hue, saturation, lightness);

  return { hex, hsl };
}

/**
 * Converts G63 bestlevel to dBm signal strength
 * G63 stores signal as positive integers, convert to dBm
 */
export function bestlevelToDbm(bestlevel: number): number {
  // G63 bestlevel is typically 0-100, convert to realistic dBm range
  if (!bestlevel || bestlevel === 0) return -100;
  
  // Map 0-100 range to -100 to -30 dBm (typical WiFi range)
  return Math.round(-100 + (bestlevel * 0.7));
}

/**
 * Calculates color similarity between two BSSIDs (0-100, higher = more similar)
 */
export function calculateColorSimilarity(bssid1: string, bssid2: string): number {
  const color1 = bssidToColor(bssid1);
  const color2 = bssidToColor(bssid2);

  // Calculate Euclidean distance in HSL space
  const hueDiff = Math.min(
    Math.abs(color1.hsl.h - color2.hsl.h),
    360 - Math.abs(color1.hsl.h - color2.hsl.h)
  );
  const satDiff = Math.abs(color1.hsl.s - color2.hsl.s);
  const lightDiff = Math.abs(color1.hsl.l - color2.hsl.l);

  // Weighted distance (hue is most important for grouping)
  const distance = Math.sqrt(
    (hueDiff / 180) ** 2 * 0.6 +
    (satDiff / 100) ** 2 * 0.2 +
    (lightDiff / 100) ** 2 * 0.2
  );

  return Math.max(0, 100 - (distance * 100));
}

/**
 * Groups BSSIDs by color similarity for forensic analysis
 */
export function groupBSSIDsByColor(bssids: string[], threshold = 80): string[][] {
  const groups: string[][] = [];
  const processed = new Set<string>();

  for (const bssid of bssids) {
    if (processed.has(bssid)) continue;

    const group = [bssid];
    processed.add(bssid);

    for (const otherBssid of bssids) {
      if (processed.has(otherBssid)) continue;

      const similarity = calculateColorSimilarity(bssid, otherBssid);
      if (similarity >= threshold) {
        group.push(otherBssid);
        processed.add(otherBssid);
      }
    }

    groups.push(group);
  }

  return groups.sort((a, b) => b.length - a.length); // Largest groups first
}

/**
 * Extracts BSSID octets for sorting and grouping
 */
export function getBSSIDOctets(bssid: string): string[] {
  const clean = bssid.toLowerCase().replace(/[^a-f0-9]/g, '');
  if (clean.length !== 12) return [];
  
  return [
    clean.substring(0, 2),
    clean.substring(2, 4),
    clean.substring(4, 6),
    clean.substring(6, 8),
    clean.substring(8, 10),
    clean.substring(10, 12)
  ];
}

/**
 * Formats BSSID for display with consistent formatting
 */
export function formatBSSID(bssid: string): string {
  const octets = getBSSIDOctets(bssid);
  return octets.length === 6 ? octets.join(':') : bssid;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Helper function to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const lDecimal = l / 100;

  const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
  const x = c * (1 - Math.abs(((hDecimal * 6) % 2) - 1));
  const m = lDecimal - c / 2;

  let r: number, g: number, b: number;

  if (hDecimal * 6 < 1) {
    r = c; g = x; b = 0;
  } else if (hDecimal * 6 < 2) {
    r = x; g = c; b = 0;
  } else if (hDecimal * 6 < 3) {
    r = 0; g = c; b = x;
  } else if (hDecimal * 6 < 4) {
    r = 0; g = x; b = c;
  } else if (hDecimal * 6 < 5) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}