import { useQuery } from '@tanstack/react-query';
import {
  fetchHealth,
  fetchConfig,
  fetchStatus,
  fetchNetworks,
  fetchVisualize,
  fetchWithin,
  fetchAnalytics,
  fetchSignalStrength,
  fetchSecurityAnalysis,
  fetchLocations,
  fetchLocationsByBssid,
} from '../api';

// System queries
export const useHealthQuery = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30000, // 30 seconds
  });
};

export const useConfigQuery = () => {
  return useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStatusQuery = () => {
  return useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    staleTime: 60000, // 1 minute
  });
};

// Network queries
export const useNetworksQuery = (limit = 50) => {
  return useQuery({
    queryKey: ['networks', limit],
    queryFn: () => fetchNetworks(limit),
    staleTime: 60000, // 1 minute
  });
};

export const useVisualizeQuery = () => {
  return useQuery({
    queryKey: ['visualize'],
    queryFn: fetchVisualize,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWithinQuery = (lat: number, lon: number, radius: number, limit = 50, enabled = true) => {
  return useQuery({
    queryKey: ['within', lat, lon, radius, limit],
    queryFn: () => fetchWithin(lat, lon, radius, limit),
    enabled,
    staleTime: 30000, // 30 seconds
  });
};

// Analytics queries
export const useAnalyticsQuery = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSignalStrengthQuery = () => {
  return useQuery({
    queryKey: ['signal-strength'],
    queryFn: fetchSignalStrength,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSecurityAnalysisQuery = () => {
  return useQuery({
    queryKey: ['security-analysis'],
    queryFn: fetchSecurityAnalysis,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Location queries
export const useLocationsQuery = (limit = 50) => {
  return useQuery({
    queryKey: ['locations', limit],
    queryFn: () => fetchLocations(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLocationsByBssidQuery = (bssid: string, enabled = !!bssid) => {
  return useQuery({
    queryKey: ['locations', 'bssid', bssid],
    queryFn: () => fetchLocationsByBssid(bssid),
    enabled,
    staleTime: 60000, // 1 minute
  });
};