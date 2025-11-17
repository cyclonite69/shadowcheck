/**
 * NetworkSecurityPill - Translucent pill badge for network security types
 * Displays icon + abbreviation in a themed translucent container
 */

import { SECURITY_TYPE_MAP } from '@/lib/securityDecoder';

interface NetworkSecurityPillProps {
  type: string;
  radioType?: string;
}

/**
 * Convert hex color to rgba with specified opacity
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function NetworkSecurityPill({ type, radioType }: NetworkSecurityPillProps) {
  // Handle non-WiFi radio types
  let securityType = type;
  if (radioType === 'E') securityType = 'BLE';
  else if (radioType === 'B') securityType = 'BT';
  else if (radioType === 'G') securityType = 'GSM';
  else if (radioType === 'L') securityType = 'LTE';

  const info = SECURITY_TYPE_MAP[securityType] || SECURITY_TYPE_MAP['Open'];

  // Truncate abbreviation if too long
  const displayAbbr = info.abbr.length > 12 ? `${info.abbr.slice(0, 12)}...` : info.abbr;

  // Generate rgba colors for pill
  const pillBg = hexToRgba(info.hex, 0.15);
  const pillBorder = hexToRgba(info.hex, 0.3);
  const pillHoverBg = hexToRgba(info.hex, 0.25);
  const badgeBorder = hexToRgba(info.hex, 0.5);
  const badgeGlow = hexToRgba(info.hex, 0.3);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all duration-150 cursor-default"
      style={{
        backgroundColor: pillBg,
        border: `1px solid ${pillBorder}`,
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = pillHoverBg}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = pillBg}
      title={`${info.description} (${securityType})`}
      role="status"
      aria-label={`Security: ${info.abbr} - ${info.description}`}
    >
      {/* Icon */}
      <span className="text-sm leading-none">{info.icon}</span>

      {/* Abbreviation text */}
      <span
        className="text-xs font-semibold leading-none"
        style={{ color: info.hex }}
      >
        {displayAbbr}
      </span>
    </div>
  );
}

/**
 * Compact variant for smaller displays
 */
export function NetworkSecurityPillCompact({ type, radioType }: NetworkSecurityPillProps) {
  let securityType = type;
  if (radioType === 'E') securityType = 'BLE';
  else if (radioType === 'B') securityType = 'BT';
  else if (radioType === 'G') securityType = 'GSM';
  else if (radioType === 'L') securityType = 'LTE';

  const info = SECURITY_TYPE_MAP[securityType] || SECURITY_TYPE_MAP['Open'];
  const displayAbbr = info.abbr.length > 12 ? `${info.abbr.slice(0, 12)}...` : info.abbr;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full"
      style={{
        backgroundColor: hexToRgba(info.hex, 0.15),
        border: `1px solid ${hexToRgba(info.hex, 0.3)}`,
      }}
      title={`${info.description} (${securityType})`}
    >
      <span className="text-sm">{info.icon}</span>
      <span
        className="text-[11px] font-semibold"
        style={{ color: info.hex }}
      >
        {displayAbbr}
      </span>
    </div>
  );
}
