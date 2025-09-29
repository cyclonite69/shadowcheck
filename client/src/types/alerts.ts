// Alert types and interfaces for ShadowCheck surveillance dashboard
export type AlertLevel = 'emergency' | 'critical' | 'warning' | 'info';
export type AlertStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface SurveillanceAlert {
  alert_id: number;
  anomaly_id?: number;
  alert_level: AlertLevel;
  alert_type: string;
  requires_immediate_attention: boolean;
  alert_title: string;
  alert_status: AlertStatus;
  confidence_score: number; // 0-100
  record_created_at: string; // ISO string
  description?: string;
  evidence_summary?: any;
  assigned_to?: string;
  updated_at?: string;
}

export interface AlertFilters {
  level?: AlertLevel;
  status?: AlertStatus;
  requires_immediate_attention?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface AlertsResponse {
  ok: boolean;
  data: SurveillanceAlert[];
  count: number;
  total: number;
  page: number;
  limit: number;
  source?: 'database' | 'fallback';
}

export interface AlertUpdateRequest {
  alert_status: AlertStatus;
  assigned_to?: string;
}

// Alert severity configuration
export const ALERT_SEVERITY_CONFIG = {
  emergency: {
    color: 'red',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
    pulse: true,
    priority: 1,
  },
  critical: {
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
    pulse: false,
    priority: 2,
  },
  warning: {
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    pulse: false,
    priority: 3,
  },
  info: {
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    pulse: false,
    priority: 4,
  },
} as const;

// Status configuration
export const ALERT_STATUS_CONFIG = {
  pending: {
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-600',
    label: 'Pending Review',
  },
  investigating: {
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    label: 'Under Investigation',
  },
  resolved: {
    color: 'green',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-600',
    label: 'Resolved',
  },
  dismissed: {
    color: 'gray',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-600',
    label: 'Dismissed',
  },
} as const;