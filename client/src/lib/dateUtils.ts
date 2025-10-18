/**
 * Precise UTC date handling with locale conversion for SIGINT forensics
 */

export interface DateFormatOptions {
  includeTime?: boolean;
  includeSeconds?: boolean;
  includeMilliseconds?: boolean;
  timeZone?: string;
  locale?: string;
}

/**
 * Parse UTC timestamp with maximum precision and convert to user locale
 */
export function parseUTCWithPrecision(utcString?: string | null, options: DateFormatOptions = {}): string {
  if (!utcString) return "Unknown";
  
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const {
    includeTime = true,
    includeSeconds = true,
    includeMilliseconds = false,
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale = navigator.language
  } = options;
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    formatOptions.hour12 = false; // 24-hour format for forensics
    
    if (includeSeconds) {
      formatOptions.second = '2-digit';
    }
  }
  
  let formatted = date.toLocaleString(locale, formatOptions);
  
  // Add milliseconds if requested (manual append since Intl doesn't support it well)
  if (includeTime && includeMilliseconds) {
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    formatted += `.${ms}`;
  }
  
  return formatted;
}

/**
 * Format timestamp for forensics display with timezone info
 */
export function formatForensicsTime(utcString?: string | null): string {
  if (!utcString) return "Unknown";
  
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatted = parseUTCWithPrecision(utcString, { 
    includeSeconds: true, 
    includeMilliseconds: false 
  });
  
  // Add timezone abbreviation
  const tzName = date.toLocaleTimeString('en-US', { 
    timeZone, 
    timeZoneName: 'short' 
  }).split(' ').pop();
  
  return `${formatted} ${tzName}`;
}

/**
 * Relative time for recent observations
 */
export function formatRelativeTime(utcString?: string | null): string {
  if (!utcString) return "Unknown";
  
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  
  return parseUTCWithPrecision(utcString, { includeTime: false });
}