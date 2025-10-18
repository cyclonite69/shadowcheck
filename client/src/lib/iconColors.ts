/**
 * Semantic Icon Color Design System
 *
 * Establishes consistent color hierarchy for icons across the application.
 * All colors meet WCAG 2.1 AA contrast requirements against dark backgrounds.
 */

export const iconColors = {
  // Primary Actions - Blue (#3B82F6)
  primary: {
    text: "text-blue-400",
    bg: "bg-blue-500",
    border: "border-blue-500",
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/30",
    hex: "#3B82F6"
  },

  // Success/Active - Green (#10B981)
  success: {
    text: "text-green-400",
    bg: "bg-green-500",
    border: "border-green-500",
    gradient: "from-green-500 to-emerald-600",
    glow: "shadow-green-500/30",
    hex: "#10B981"
  },

  // Warning - Amber (#F59E0B)
  warning: {
    text: "text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500",
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
    hex: "#F59E0B"
  },

  // Danger/Error - Red (#EF4444)
  danger: {
    text: "text-red-400",
    bg: "bg-red-500",
    border: "border-red-500",
    gradient: "from-red-500 to-red-600",
    glow: "shadow-red-500/30",
    hex: "#EF4444"
  },

  // Neutral - Gray (#6B7280)
  neutral: {
    text: "text-slate-400",
    bg: "bg-slate-500",
    border: "border-slate-500",
    gradient: "from-slate-500 to-slate-600",
    glow: "shadow-slate-500/30",
    hex: "#6B7280"
  },

  // Info - Cyan (#06B6D4)
  info: {
    text: "text-cyan-400",
    bg: "bg-cyan-500",
    border: "border-cyan-500",
    gradient: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/30",
    hex: "#06B6D4"
  },

  // Secondary - Purple (#A855F7)
  secondary: {
    text: "text-purple-400",
    bg: "bg-purple-500",
    border: "border-purple-500",
    gradient: "from-purple-500 to-purple-600",
    glow: "shadow-purple-500/30",
    hex: "#A855F7"
  },

  // Special - Orange (#F97316)
  special: {
    text: "text-orange-400",
    bg: "bg-orange-500",
    border: "border-orange-500",
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/30",
    hex: "#F97316"
  }
} as const;

/**
 * Get icon color classes for a specific semantic meaning
 */
export function getIconColor(type: keyof typeof iconColors) {
  return iconColors[type];
}

/**
 * Get icon container gradient classes for consistent icon backgrounds
 */
export function getIconContainerClasses(type: keyof typeof iconColors) {
  const color = iconColors[type];
  return `icon-container w-10 h-10 bg-gradient-to-br ${color.gradient} shadow-lg ${color.glow}`;
}

/**
 * Semantic icon type mapping for common UI elements
 */
export const semanticIcons = {
  // Actions
  add: 'primary',
  edit: 'primary',
  save: 'success',
  delete: 'danger',
  cancel: 'neutral',
  refresh: 'primary',
  export: 'info',
  import: 'info',

  // Status
  active: 'success',
  inactive: 'neutral',
  error: 'danger',
  warning: 'warning',
  pending: 'warning',

  // Security
  secure: 'success',
  insecure: 'danger',
  encrypted: 'success',
  open: 'danger',

  // Network
  wifi: 'primary',
  cellular: 'success',
  bluetooth: 'secondary',
  ble: 'warning',

  // System
  database: 'info',
  server: 'info',
  monitoring: 'special',
  analytics: 'purple',
} as const;

/**
 * Get semantic icon color based on context
 */
export function getSemanticIconColor(semantic: keyof typeof semanticIcons): keyof typeof iconColors {
  return semanticIcons[semantic] as keyof typeof iconColors;
}
