/**
 * Map utilities extracted from shadowcheck-lite
 * Professional implementation without emojis
 */

// Cache for signal range calculations
const radiusCache = new Map<string, number>();

// Base hues for consistent MAC address coloring
const BASE_HUES = [0, 60, 120, 180, 240, 270, 300, 330];

/**
 * Convert string to hash number for consistent coloring
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate consistent color from MAC address
 * Uses OUI (first 6 chars) for hue, device part for saturation/lightness
 */
export function macToColor(mac: string): string {
  if (!mac || mac.length < 6) return '#999999';

  const cleanedMac = mac.replace(/[^0-9A-F]/gi, '');
  if (cleanedMac.length < 6) return '#999999';

  const oui = cleanedMac.substring(0, 6);
  const devicePart = cleanedMac.substring(6);

  const hue = BASE_HUES[stringToHash(oui) % BASE_HUES.length];
  const saturation = 50 + (stringToHash(devicePart) % 41);
  const lightness = 40 + (stringToHash(devicePart) % 31);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Calculate signal range radius in pixels
 * Uses simplified RF propagation model with frequency adjustment
 */
export function calculateSignalRange(
  signalDbm: number | null,
  frequencyMhz: number,
  zoom: number
): number {
  if (!signalDbm || signalDbm === null) return 50;

  // Create cache key
  const cacheKey = `${signalDbm}_${frequencyMhz}_${Math.round(zoom * 10)}`;
  if (radiusCache.has(cacheKey)) {
    return radiusCache.get(cacheKey)!;
  }

  // Convert frequency string to number if needed
  let freq = frequencyMhz;
  if (typeof freq === 'string') {
    freq = parseFloat((freq as any).replace(' GHz', '')) * 1000;
  }
  if (!freq || freq <= 0) freq = 2437; // Default to channel 6 (2.4GHz)

  // Simplified RF propagation calculation
  let distanceM: number;
  if (signalDbm >= -30) distanceM = 10;
  else if (signalDbm >= -50) distanceM = 50;
  else if (signalDbm >= -70) distanceM = 150;
  else if (signalDbm >= -80) distanceM = 300;
  else distanceM = 500;

  // Frequency adjustment (5GHz has shorter range)
  if (freq > 5000) distanceM *= 0.6;
  else distanceM *= 0.8;

  // Convert to pixels based on zoom
  const pixelsPerMeter = Math.pow(2, zoom - 12) * 0.1;
  let radiusPixels = distanceM * pixelsPerMeter;

  // Zoom scaling
  const zoomScale = Math.pow(1.15, zoom - 10);
  radiusPixels *= Math.min(zoomScale, 4);

  // Clamp radius
  radiusPixels = Math.max(3, Math.min(radiusPixels, 250));

  // Cache result
  radiusCache.set(cacheKey, radiusPixels);
  if (radiusCache.size > 1000) {
    radiusCache.clear(); // Prevent memory leaks
  }

  return radiusPixels;
}

/**
 * Normalize MAC address to standard format
 */
export function normalizeMac(mac: string): string {
  if (!mac) return '';
  return mac.toUpperCase().replace(/[^0-9A-F]/g, '').match(/.{1,2}/g)?.join(':') || mac;
}

/**
 * Convert frequency in MHz to GHz string
 */
export function toGHz(freqMhz: number): string {
  if (!freqMhz || freqMhz <= 0) return '';
  const ghz = freqMhz / 1000;
  return ghz.toFixed(3).replace(/\.000$/, '') + ' GHz';
}

/**
 * Get signal strength CSS class
 */
export function signalClass(signal: number): string {
  if (signal >= -50) return 'signal-strong';
  if (signal >= -70) return 'signal-medium';
  return 'signal-weak';
}

/**
 * Format coordinates to DMS (Degrees Minutes Seconds)
 */
export function toDMS(coord: number, isLat: boolean): string {
  const absCoord = Math.abs(coord);
  const deg = Math.floor(absCoord);
  const minFloat = (absCoord - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = ((minFloat - min) * 60).toFixed(2);
  const dir = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
  return `${deg}°${min}'${sec}" ${dir}`;
}

/**
 * Convert meters to feet
 */
export function toFeet(meters: number): string {
  const ft = meters * 3.28084;
  return ft.toFixed(2);
}

/**
 * Format display time from ISO string
 */
export function formatDisplayTime(isoString: string | null | undefined): string {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // Try custom format parsing
      const parts = isoString.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      if (parts) {
        const customDate = new Date(
          parseInt(parts[1]),
          parseInt(parts[2]) - 1,
          parseInt(parts[3]),
          parseInt(parts[4]),
          parseInt(parts[5]),
          parseInt(parts[6])
        );
        if (!isNaN(customDate.getTime())) {
          return customDate.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        }
      }
      return '';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    console.error("Error formatting date:", e, isoString);
    return '';
  }
}

/**
 * WiFi icon SVG
 */
export function wifiIcon(color: string): string {
  return `<svg class="protocol-icon" viewBox="0 0 24 24" fill="${color}" stroke="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>`;
}
