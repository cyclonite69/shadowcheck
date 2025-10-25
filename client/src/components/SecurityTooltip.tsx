/**
 * SecurityTooltip Component
 * Displays detailed security analysis for WiFi capability strings
 */

import { parseCapabilities, extractTerms, SECURITY_TERMS, getSecurityBadgeClass } from '@/lib/securityDecoder';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Info } from 'lucide-react';

interface SecurityTooltipProps {
  capabilities: string | null | undefined;
  children?: React.ReactNode;
  compact?: boolean;
}

export function SecurityTooltip({ capabilities, children, compact = false }: SecurityTooltipProps) {
  const analysis = parseCapabilities(capabilities);
  const terms = extractTerms(capabilities);

  if (!children && compact) {
    // Render inline badge with tooltip
    return (
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Badge
              className={`${getSecurityBadgeClass(analysis.strength)} cursor-help border px-2 py-1 text-xs`}
            >
              {analysis.icon} {analysis.protocol}
            </Badge>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="w-80 bg-slate-800 border-slate-700 p-4"
          >
            <SecurityTooltipContent analysis={analysis} terms={terms} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children || (
            <button className="text-slate-400 hover:text-slate-200 transition-colors">
              <Info className="h-4 w-4" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="w-80 bg-slate-800 border-slate-700 p-4"
        >
          <SecurityTooltipContent analysis={analysis} terms={terms} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SecurityTooltipContentProps {
  analysis: ReturnType<typeof parseCapabilities>;
  terms: string[];
}

function SecurityTooltipContent({ analysis, terms }: SecurityTooltipContentProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="text-2xl">{analysis.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-200">{analysis.protocol}</span>
            <Badge
              className={`${getSecurityBadgeClass(analysis.strength)} text-xs border`}
            >
              {analysis.strength}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">{analysis.description}</p>
        </div>
      </div>

      {/* Security Score */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Security Score</span>
          <span className="font-mono font-semibold" style={{ color: analysis.color }}>
            {analysis.score}/100
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${analysis.score}%`,
              backgroundColor: analysis.color
            }}
          />
        </div>
      </div>

      {/* Encryption Methods */}
      {analysis.encryption.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Shield className="h-3 w-3 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Encryption</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {analysis.encryption.map((enc, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/20"
              >
                {enc}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Key Management */}
      {analysis.keyManagement.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Shield className="h-3 w-3 text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">Authentication</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {analysis.keyManagement.map((km, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20"
              >
                {km}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Security Issues */}
      {analysis.issues.length > 0 && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {analysis.issues.map((issue, i) => (
                <p key={i} className="text-xs text-red-300">{issue}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Details */}
      {terms.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-2">Technical Details</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {terms.slice(0, 6).map((term, i) => {
              const info = SECURITY_TERMS[term];
              if (!info) return null;

              return (
                <div key={i} className="text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                      {info.category}
                    </Badge>
                    <span className="font-mono text-slate-300">{info.name}</span>
                  </div>
                  <p className="text-slate-400 mt-1 ml-1">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Raw Capabilities */}
      {analysis.capabilities && (
        <div className="pt-2 border-t border-slate-700">
          <div className="text-xs font-semibold text-slate-400 mb-1">Raw Capabilities</div>
          <code className="text-xs text-slate-500 font-mono break-all block">
            {analysis.capabilities}
          </code>
        </div>
      )}
    </div>
  );
}

/**
 * Inline security badge with tooltip
 */
export function SecurityBadge({ capabilities }: { capabilities: string | null | undefined }) {
  return <SecurityTooltip capabilities={capabilities} compact />;
}
