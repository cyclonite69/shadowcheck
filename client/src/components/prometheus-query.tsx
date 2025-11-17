import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueryResult {
  metric: Record<string, string>;
  value?: [number, string];
  values?: [number, string][];
}

interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: QueryResult[];
  };
}

export function PrometheusQuery() {
  const [query, setQuery] = useState("up");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const commonQueries = [
    { label: "Service Status", query: "up" },
    { label: "Memory Usage", query: "shadowcheck_memory_heap_used_bytes / shadowcheck_memory_heap_total_bytes" },
    { label: "DB Pool Active", query: "shadowcheck_db_pool_total - shadowcheck_db_pool_idle" },
    { label: "Request Rate", query: "rate(shadowcheck_requests_total[5m])" },
    { label: "Error Rate", query: "rate(shadowcheck_errors_total[5m])" },
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a Prometheus query.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `http://localhost:9091/api/v1/query?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PrometheusResponse = await response.json();

      if (data.status === "success") {
        setResults(data.data.result);
        toast({
          title: "Query Executed",
          description: `Found ${data.data.result.length} result(s)`,
        });
      } else {
        throw new Error("Query failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to execute query";
      setError(errorMessage);
      toast({
        title: "Query Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (num > 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num > 1000) return `${(num / 1000).toFixed(2)}K`;
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-container w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Query Prometheus</h3>
            <p className="text-sm text-slate-400 mt-0.5">Execute PromQL queries against live metrics</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter PromQL query (e.g., up, rate(http_requests_total[5m]))"
              className="flex-1 bg-slate-800/50 border-slate-700 text-slate-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") executeQuery();
              }}
            />
            <Button
              onClick={executeQuery}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Running..." : "Execute"}
            </Button>
          </div>

          {/* Common Queries */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 mr-2 self-center">Quick queries:</span>
            {commonQueries.map((q, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => setQuery(q.query)}
              >
                {q.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-400">Query Error</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {results && results.length > 0 && (
        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-green-400" />
            <h4 className="text-md font-semibold text-slate-100">
              Query Results ({results.length})
            </h4>
          </div>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Metric Labels */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.metric).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs font-mono">
                          {key}=&quot;{value}&quot;
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {/* Value */}
                  <div className="text-right">
                    {result.value && (
                      <div>
                        <p className="text-2xl font-bold metric-value">
                          {formatValue(result.value[1])}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          @ {new Date(result.value[0] * 1000).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <Card className="p-6 bg-slate-800/30 border-slate-700/50">
          <p className="text-sm text-slate-400 text-center">No results found for this query.</p>
        </Card>
      )}
    </div>
  );
}
