import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';

export function HealthTest() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">API Test Dashboard</h1>

      {/* Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Live Data from Backend</h2>
        <StatsCard />
      </div>

      {/* Health Check */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Health Check</h2>

        {isLoading && <p>Loading...</p>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        )}

        {data && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold">Backend Response:</h3>
            <pre className="mt-2 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}