import { getApiClient } from "@smbc/applet-core";
import type { paths } from "@smbc/usage-stats-api";

interface UsageStatsResponse {
  component_map: Record<string, string>;
  records: any[];
  total?: number;
}

export const createUserUsageApiConfig = () => ({
  endpoint: "/usage-stats/users-usage/" as const,
  client: getApiClient<paths>("usage-stats"),
  responseRow: (response: UsageStatsResponse) => response?.records || [],
  responseRowCount: (response: UsageStatsResponse) => response?.total || response?.records?.length || 0,
  formatCacheUpdate: (originalResponse: UsageStatsResponse, newRows: any[]) => ({
    ...originalResponse,
    records: newRows,
  }),
  apiParams: {},
});

export const createUIUsageApiConfig = () => ({
  endpoint: "/usage-stats/ui-usage/" as const,
  client: getApiClient<paths>("usage-stats"),
  responseRow: (response: UsageStatsResponse) => response?.records || [],
  responseRowCount: (response: UsageStatsResponse) => response?.total || response?.records?.length || 0,
  formatCacheUpdate: (originalResponse: UsageStatsResponse, newRows: any[]) => ({
    ...originalResponse,
    records: newRows,
  }),
  apiParams: {},
});

export const createExceptionsApiConfig = () => ({
  endpoint: "/usage-stats/exceptions/" as const,
  client: getApiClient<paths>("usage-stats"),
  responseRow: (response: UsageStatsResponse) => response?.records || [],
  responseRowCount: (response: UsageStatsResponse) => response?.total || response?.records?.length || 0,
  formatCacheUpdate: (originalResponse: UsageStatsResponse, newRows: any[]) => ({
    ...originalResponse,
    records: newRows,
  }),
  apiParams: {},
});