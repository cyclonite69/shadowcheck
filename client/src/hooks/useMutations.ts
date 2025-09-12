import { useMutation, useQueryClient } from '@tanstack/react-query';

// API mutation functions
const postNetwork = async (networkData: {
  bssid: string;
  ssid?: string;
  signal_strength?: number;
  encryption?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const response = await fetch('/api/v1/networks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(networkData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create network: ${response.statusText}`);
  }

  return response.json();
};

const refreshAnalytics = async () => {
  const response = await fetch('/api/v1/analytics/refresh', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh analytics: ${response.statusText}`);
  }

  return response.json();
};

// Mutation hooks
export const useCreateNetworkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postNetwork,
    onSuccess: () => {
      // Invalidate and refetch network-related queries
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      queryClient.invalidateQueries({ queryKey: ['visualize'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (error) => {
      console.error('Error creating network:', error);
    },
  });
};

export const useRefreshAnalyticsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshAnalytics,
    onSuccess: () => {
      // Invalidate analytics-related queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['signal-strength'] });
      queryClient.invalidateQueries({ queryKey: ['security-analysis'] });
    },
    onError: (error) => {
      console.error('Error refreshing analytics:', error);
    },
  });
};

export const useRefreshNetworksMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // This is just a refresh trigger, no actual API call needed
      return Promise.resolve();
    },
    onSuccess: () => {
      // Invalidate all network-related queries
      queryClient.invalidateQueries({ queryKey: ['networks'] });
      queryClient.invalidateQueries({ queryKey: ['visualize'] });
      queryClient.invalidateQueries({ queryKey: ['within'] });
    },
  });
};
