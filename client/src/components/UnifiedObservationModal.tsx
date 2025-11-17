/**
 * UnifiedObservationModal - Detailed modal for network observation intelligence
 *
 * Features:
 * - Security Classification as primary focus (Open/WEP/WPA/WPA2/WPA3)
 * - Risk scoring and threat assessment
 * - Cellular capability classification (2G/3G/4G/5G)
 * - BLE device fingerprinting
 * - WiGLE enrichment data display
 * - Column customization for limited display area
 */

import { useState } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX, ShieldQuestion,
  Signal, Wifi, Radio, MapPin, Clock, Hash, Database, Eye, EyeOff,
  AlertTriangle, Info, Server, Smartphone
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

/**
 * Security Classification Taxonomy (from analysis document)
 */
export type SecurityClassification = 'none' | 'wep' | 'wpa' | 'wpa2' | 'wpa3' | 'mixed' | 'unknown';

/**
 * Cellular Generation Classification
 */
export type CellularGeneration = 'G' | 'E' | '3G' | 'H' | 'H+' | 'L' | '4G+' | '5' | 'unknown';

/**
 * Security Risk Levels
 */
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'acceptable' | 'optimal';

/**
 * Main observation data structure
 */
export interface ObservationData {
  // Core identification
  bssid: string;
  ssid: string | null;
  access_point_id?: number;

  // Security classification (PRIMARY FOCUS)
  encryption: SecurityClassification;
  cipher?: string;
  auth_mode?: string;

  // Network properties
  radio_technology: string;
  frequency_hz?: number;
  channel?: number;

  // Cellular data
  cellular_generation?: CellularGeneration;
  network_type?: string; // WiFi, BT, LTE, GSM

  // BLE data
  ble_uuid_type?: '16bit' | '128bit';
  ble_services?: string[];

  // Signal & location
  signal_strength_dbm?: number;
  location?: { lat: number; lng: number };

  // Manufacturer
  manufacturer?: string;
  oui_prefix?: string;

  // Statistics
  total_observations?: number;
  unique_sources?: number;
  first_seen?: string;
  last_seen?: string;

  // WiGLE enrichment
  wigle_data?: {
    country?: string;
    region?: string;
    city?: string;
    last_updated?: string;
    qos?: number;
  };
}

interface UnifiedObservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: ObservationData | null;
}

/**
 * Security classification metadata
 * Based on comprehensive analysis from research document
 */
const SECURITY_METADATA: Record<SecurityClassification, {
  label: string;
  risk: RiskLevel;
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  prevalence: string;
  attackVectors: string[];
}> = {
  none: {
    label: 'Open Network',
    risk: 'critical',
    icon: ShieldX,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'No encryption. Data transmitted in cleartext.',
    prevalence: '25.1% of observed networks (highest risk)',
    attackVectors: ['Passive Eavesdropping', 'Man-in-the-Middle', 'Data Exposure']
  },
  wep: {
    label: 'WEP (Deprecated)',
    risk: 'critical',
    icon: ShieldAlert,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'Critically flawed RC4-based encryption. Trivially exploitable.',
    prevalence: '0.1% of observed networks (near extinction)',
    attackVectors: ['IV Collision Attack', 'Key Recovery (Trivial)', 'SKA Challenge Exploit']
  },
  wpa: {
    label: 'WPA-TKIP',
    risk: 'high',
    icon: ShieldAlert,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Legacy TKIP protocol. Vulnerable to KRACK attacks.',
    prevalence: '0.08% of observed networks (outdated)',
    attackVectors: ['KRACK Exploitation', 'Legacy Protocol Attacks', 'Downgrade Attacks']
  },
  wpa2: {
    label: 'WPA2-AES',
    risk: 'moderate',
    icon: ShieldCheck,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Industry standard AES-CCMP. Vulnerable to dictionary attacks if PSK is weak.',
    prevalence: '>50% of observed networks (majority)',
    attackVectors: ['Dictionary Attack (PSK)', 'Weak Passphrase Exploitation', 'KRACK (Client-side)']
  },
  wpa3: {
    label: 'WPA3-SAE',
    risk: 'optimal',
    icon: ShieldCheck,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    description: 'Modern SAE handshake. Eliminates offline dictionary attacks.',
    prevalence: 'Emerging standard (optimal security)',
    attackVectors: ['Configuration Flaws', 'Downgrade Attack (if misconfigured)']
  },
  mixed: {
    label: 'Mixed Mode',
    risk: 'moderate',
    icon: ShieldQuestion,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Supports multiple standards. Introduces downgrade attack risks.',
    prevalence: 'Transitional deployment (backwards compatibility)',
    attackVectors: ['Downgrade Attacks', 'Weakest Protocol Exploitation', 'Client-Forced Degradation']
  },
  unknown: {
    label: 'Unknown Security',
    risk: 'high',
    icon: ShieldQuestion,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    description: 'Security status could not be determined.',
    prevalence: 'Insufficient telemetry data',
    attackVectors: ['Undetermined']
  }
};

/**
 * Cellular generation metadata
 */
const CELLULAR_METADATA: Record<CellularGeneration, {
  label: string;
  generation: string;
  speed: string;
  technology: string;
  color: string;
  capability: string;
}> = {
  'G': {
    label: 'GPRS',
    generation: '2G/2.5G',
    speed: '< 384 Kbps',
    technology: 'GSM/TDMA',
    color: 'text-red-400',
    capability: 'Legacy - Limited Data'
  },
  'E': {
    label: 'EDGE',
    generation: '2.75G',
    speed: '< 384 Kbps',
    technology: 'GSM Enhanced',
    color: 'text-orange-400',
    capability: 'Legacy - Limited Data'
  },
  '3G': {
    label: '3G',
    generation: '3G',
    speed: '384 Kbps - 2 Mbps',
    technology: 'UMTS/WCDMA',
    color: 'text-yellow-400',
    capability: 'Baseline Mobile Internet'
  },
  'H': {
    label: 'HSPA',
    generation: '3.5G',
    speed: '7 - 21 Mbps',
    technology: 'HSPA',
    color: 'text-yellow-400',
    capability: 'Fast 3G'
  },
  'H+': {
    label: 'HSPA+',
    generation: '3.75G',
    speed: '21 - 42 Mbps',
    technology: 'HSPA Evolution',
    color: 'text-blue-400',
    capability: 'Enhanced 3G - Common Fallback'
  },
  'L': {
    label: 'LTE',
    generation: '4G',
    speed: '100 Mbps - 1 Gbps',
    technology: 'OFDMA (IP-based)',
    color: 'text-blue-400',
    capability: 'High-Speed Data'
  },
  '4G+': {
    label: 'LTE-A',
    generation: '4.5G',
    speed: '300 Mbps - 1 Gbps+',
    technology: 'Carrier Aggregation + MIMO',
    color: 'text-cyan-400',
    capability: 'Optimized Infrastructure'
  },
  '5': {
    label: '5G NR',
    generation: '5G',
    speed: '1 - 10 Gbps',
    technology: 'Massive MIMO + Beamforming',
    color: 'text-green-400',
    capability: 'Ultra-Low Latency Critical Infrastructure'
  },
  'unknown': {
    label: 'Unknown',
    generation: 'N/A',
    speed: 'N/A',
    technology: 'Unknown',
    color: 'text-slate-400',
    capability: 'Undetermined'
  }
};

/**
 * Parse encryption string to classification
 * EXPORTED for use in table views
 */
export function parseSecurityClassification(encryption?: string): SecurityClassification {
  if (!encryption) return 'unknown';

  const enc = encryption.toLowerCase().trim();

  if (enc === 'none' || enc === 'open' || enc === '' || enc === '[ess]') return 'none';
  if (enc.includes('wep')) return 'wep';
  if (enc.includes('wpa3') || enc.includes('sae')) return 'wpa3';
  if (enc.includes('wpa2') || enc.includes('rsn')) return 'wpa2';
  if (enc.includes('wpa')) return 'wpa';
  if (enc.includes('mixed') || enc.includes('sae')) return 'mixed';

  return 'unknown';
}

/**
 * Get security metadata - EXPORTED for use in table views
 */
export function getSecurityMetadata(classification: SecurityClassification) {
  return SECURITY_METADATA[classification];
}

/**
 * Parse cellular generation from radio technology
 */
function parseCellularGeneration(radioTech?: string, networkType?: string): CellularGeneration | null {
  if (!radioTech && !networkType) return null;

  const tech = (radioTech || networkType || '').toUpperCase();

  if (tech.includes('5G')) return '5';
  if (tech.includes('LTE-A') || tech.includes('4G+')) return '4G+';
  if (tech.includes('LTE') || tech.includes('4G')) return 'L';
  if (tech.includes('H+') || tech.includes('HSPA+')) return 'H+';
  if (tech.includes('HSPA') || tech.includes('H')) return 'H';
  if (tech.includes('3G') || tech.includes('UMTS') || tech.includes('WCDMA')) return '3G';
  if (tech.includes('EDGE') || tech.includes('E')) return 'E';
  if (tech.includes('GPRS') || tech.includes('GSM') || tech.includes('G')) return 'G';

  return null;
}

/**
 * Main Modal Component
 */
export function UnifiedObservationModal({ open, onOpenChange, observation }: UnifiedObservationModalProps) {
  const [showAllFields, setShowAllFields] = useState(false);

  if (!observation) return null;

  const securityClass = parseSecurityClassification(observation.encryption);
  const securityMeta = SECURITY_METADATA[securityClass];
  const cellularGen = parseCellularGeneration(observation.radio_technology, observation.network_type);
  const cellularMeta = cellularGen ? CELLULAR_METADATA[cellularGen] : null;

  const SecurityIcon = securityMeta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100 flex items-center gap-3">
            <Wifi className="h-5 w-5 text-blue-400" />
            <span className="font-mono">{observation.bssid}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {observation.ssid ? (
              <span className="font-medium text-slate-300">{observation.ssid}</span>
            ) : (
              <span className="italic">Hidden Network / No SSID</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* SECURITY CLASSIFICATION - PRIMARY FOCUS */}
        <div className={cn(
          "p-4 rounded-lg border-2 transition-all",
          securityMeta.bgColor,
          securityMeta.borderColor
        )}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <SecurityIcon className={cn("h-12 w-12", securityMeta.color)} />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className={cn("text-xl font-bold", securityMeta.color)}>
                  {securityMeta.label}
                </h3>
                <Badge className={cn(
                  "uppercase text-xs font-bold",
                  securityMeta.bgColor,
                  securityMeta.borderColor,
                  securityMeta.color
                )}>
                  Risk: {securityMeta.risk}
                </Badge>
              </div>

              <p className="text-sm text-slate-300">
                {securityMeta.description}
              </p>

              <div className="pt-2 space-y-1">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  Statistical Prevalence: <span className="font-mono text-slate-300">{securityMeta.prevalence}</span>
                </p>

                {securityMeta.attackVectors.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Known Attack Vectors ({securityMeta.attackVectors.length})</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <ul className="space-y-1 pl-5">
                        {securityMeta.attackVectors.map((vector, idx) => (
                          <li key={idx} className="text-xs text-slate-400 list-disc">
                            {vector}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Tabs */}
        <Tabs defaultValue="technical" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="bg-slate-800 border-b border-slate-700 w-full justify-start rounded-none">
            <TabsTrigger value="technical" className="gap-2">
              <Server className="h-4 w-4" />
              Technical
            </TabsTrigger>
            {cellularMeta && (
              <TabsTrigger value="cellular" className="gap-2">
                <Smartphone className="h-4 w-4" />
                Cellular
              </TabsTrigger>
            )}
            <TabsTrigger value="location" className="gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            {observation.wigle_data && (
              <TabsTrigger value="wigle" className="gap-2">
                <Database className="h-4 w-4" />
                WiGLE
              </TabsTrigger>
            )}
          </TabsList>

          {/* Technical Details Tab */}
          <TabsContent value="technical" className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="MAC Address" value={observation.bssid} mono />
              <InfoField label="Network Name" value={observation.ssid || 'Hidden'} />
              <InfoField label="Radio Technology" value={observation.radio_technology} />
              <InfoField
                label="Frequency"
                value={observation.frequency_hz ? formatFrequency(observation.frequency_hz) : '-'}
              />
              <InfoField label="Channel" value={observation.channel?.toString() || '-'} />
              <InfoField
                label="Signal Strength"
                value={observation.signal_strength_dbm ? `${observation.signal_strength_dbm} dBm` : '-'}
                color={getSignalColor(observation.signal_strength_dbm)}
              />
              <InfoField label="Manufacturer" value={observation.manufacturer || 'Unknown'} />
              <InfoField label="OUI Prefix" value={observation.oui_prefix || '-'} mono />
            </div>

            {showAllFields && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <InfoField label="Observations" value={observation.total_observations?.toString() || '0'} />
                <InfoField label="Unique Sources" value={observation.unique_sources?.toString() || '0'} />
                <InfoField label="First Seen" value={observation.first_seen ? formatTimestamp(observation.first_seen) : '-'} />
                <InfoField label="Last Seen" value={observation.last_seen ? formatTimestamp(observation.last_seen) : '-'} />
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllFields(!showAllFields)}
              className="w-full gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              {showAllFields ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAllFields ? 'Show Less' : 'Show More Fields'}
            </Button>

            {/* BLE Data if present */}
            {observation.ble_services && observation.ble_services.length > 0 && (
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Bluetooth Low Energy (BLE) Services
                </h4>
                <Badge className={cn(
                  observation.ble_uuid_type === '128bit'
                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                )}>
                  {observation.ble_uuid_type === '128bit'
                    ? '128-bit UUID (High Tracking Value - Proprietary)'
                    : '16-bit UUID (Standard Service - Low Intel Value)'
                  }
                </Badge>
                <div className="flex flex-wrap gap-2 pt-2">
                  {observation.ble_services.map((service, idx) => (
                    <code key={idx} className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300">
                      {service}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Cellular Capability Tab */}
          {cellularMeta && (
            <TabsContent value="cellular" className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className={cn(
                "p-4 rounded-lg border bg-slate-800/50",
                `border-${cellularMeta.color.replace('text-', '')}/30`
              )}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Smartphone className={cn("h-8 w-8", cellularMeta.color)} />
                    <div>
                      <h3 className={cn("text-lg font-bold", cellularMeta.color)}>
                        {cellularMeta.label} ({cellularMeta.generation})
                      </h3>
                      <p className="text-sm text-slate-400">{cellularMeta.technology}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Typical Speed</p>
                      <p className="text-sm font-mono text-slate-300">{cellularMeta.speed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Operational Capability</p>
                      <p className="text-sm text-slate-300">{cellularMeta.capability}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <Info className="h-3 w-3 inline mr-1 text-blue-400" />
                  <strong className="text-blue-400">Intelligence Note:</strong> Cellular codes correlate directly to
                  operational capability for data exfiltration and C2 communications. High-speed zones (4G+/5G)
                  paired with insecure WiFi (Open/WEP) represent immediate high-priority exploitation vectors.
                </p>
              </div>
            </TabsContent>
          )}

          {/* Location Tab */}
          <TabsContent value="location" className="flex-1 overflow-y-auto p-4 space-y-4">
            {observation.location ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Latitude" value={observation.location.lat.toFixed(6)} mono />
                  <InfoField label="Longitude" value={observation.location.lng.toFixed(6)} mono />
                </div>

                {observation.wigle_data && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                    <InfoField label="Country" value={observation.wigle_data.country || '-'} />
                    <InfoField label="Region" value={observation.wigle_data.region || '-'} />
                    <InfoField label="City" value={observation.wigle_data.city || '-'} />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No location data available</p>
            )}
          </TabsContent>

          {/* WiGLE Enrichment Tab */}
          {observation.wigle_data && (
            <TabsContent value="wigle" className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-400 font-semibold mb-2">WiGLE API Enrichment Data</p>
                <p className="text-xs text-slate-400">
                  Data sourced from the WiGLE (Wireless Geographic Logging Engine) database -
                  a crowd-sourced platform for geospatial intelligence derived from RF monitoring.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Country" value={observation.wigle_data.country || '-'} />
                <InfoField label="Region" value={observation.wigle_data.region || '-'} />
                <InfoField label="City" value={observation.wigle_data.city || '-'} />
                <InfoField label="QoS Score" value={observation.wigle_data.qos?.toString() || '-'} />
                <InfoField
                  label="Last Updated"
                  value={observation.wigle_data.last_updated ? formatTimestamp(observation.wigle_data.last_updated) : '-'}
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Helper Components
 */

interface InfoFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}

function InfoField({ label, value, mono = false, color }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn(
        "text-sm",
        mono ? "font-mono" : "font-medium",
        color || "text-slate-200"
      )}>
        {value}
      </p>
    </div>
  );
}

/**
 * Helper Functions
 */

function formatFrequency(hz: number): string {
  if (hz >= 1_000_000_000) {
    return `${(hz / 1_000_000_000).toFixed(3)} GHz`;
  }
  return `${(hz / 1_000_000).toFixed(0)} MHz`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function getSignalColor(dbm?: number | null): string {
  if (!dbm) return 'text-slate-500';
  if (dbm >= -50) return 'text-green-400';
  if (dbm >= -70) return 'text-yellow-400';
  if (dbm >= -85) return 'text-orange-400';
  return 'text-red-400';
}
