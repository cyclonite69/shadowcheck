/**
 * WiGLE Network Type Mapping
 *
 * Maps single-letter type codes from WiGLE data to human-readable radio types
 * Based on WiGLE CSV format documentation: https://api.wigle.net/csvFormat.html
 */

export type RadioType = 'WiFi' | 'BT' | 'BLE' | 'GSM' | 'LTE' | 'NR' | 'CDMA' | 'WCDMA' | 'Unknown';

/**
 * Map WiGLE single-letter type codes to readable radio types
 *
 * WiGLE Type Codes:
 * - W = WiFi (802.11 wireless)
 * - B = BT (Bluetooth Classic)
 * - E = BLE (Bluetooth Low Energy)
 * - G = GSM (2G cellular)
 * - C = CDMA (2G/3G cellular)
 * - D = WCDMA (3G cellular)
 * - L = LTE (4G cellular)
 * - N = NR (5G New Radio)
 *
 * @param typeCode - Single-letter WiGLE type code
 * @returns Human-readable radio type
 */
export function wigleTypeToRadioType(typeCode: string | null | undefined): RadioType {
  if (!typeCode) return 'Unknown';

  const code = typeCode.trim().toUpperCase();

  switch (code) {
    case 'W':
      return 'WiFi';
    case 'B':
      return 'BT';
    case 'E':
      return 'BLE';
    case 'G':
      return 'GSM';
    case 'C':
      return 'CDMA';
    case 'D':
      return 'WCDMA';
    case 'L':
      return 'LTE';
    case 'N':
      return 'NR';
    default:
      return 'Unknown';
  }
}

/**
 * Map radio type back to WiGLE type code (for filtering)
 *
 * @param radioType - Human-readable radio type
 * @returns Single-letter WiGLE type code
 */
export function radioTypeToWigleCode(radioType: string): string {
  const type = radioType.toUpperCase();

  switch (type) {
    case 'WIFI':
      return 'W';
    case 'BT':
    case 'BLUETOOTH':
      return 'B';
    case 'BLE':
      return 'E';
    case 'GSM':
      return 'G';
    case 'CDMA':
      return 'C';
    case 'WCDMA':
      return 'D';
    case 'LTE':
      return 'L';
    case 'NR':
    case '5G':
      return 'N';
    default:
      return '';
  }
}

/**
 * Get all valid radio types
 */
export function getAllRadioTypes(): RadioType[] {
  return ['WiFi', 'BT', 'BLE', 'GSM', 'CDMA', 'WCDMA', 'LTE', 'NR'];
}

/**
 * Check if a type code represents cellular network
 */
export function isCellularType(typeCode: string | null | undefined): boolean {
  if (!typeCode) return false;
  const code = typeCode.trim().toUpperCase();
  return ['G', 'C', 'D', 'L', 'N'].includes(code);
}

/**
 * Check if a type code represents WiFi
 */
export function isWiFiType(typeCode: string | null | undefined): boolean {
  if (!typeCode) return false;
  return typeCode.trim().toUpperCase() === 'W';
}

/**
 * Check if a type code represents Bluetooth
 */
export function isBluetoothType(typeCode: string | null | undefined): boolean {
  if (!typeCode) return false;
  const code = typeCode.trim().toUpperCase();
  return ['B', 'E'].includes(code);
}
