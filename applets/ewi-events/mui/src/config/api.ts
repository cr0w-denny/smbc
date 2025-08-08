/**
 * API configuration for EWI Events
 */
import { useApiClient } from "@smbc/applet-core";
import { useMemo } from "react";
import type { paths } from "@smbc/ewi-events-api/types";

interface ApiResponse {
  events?: any[];
  total?: number;
  [key: string]: unknown;
}

export const useApiConfig = () => {
  const client = useApiClient<paths>("ewi-events");
  
  return useMemo(() => ({
    endpoint: "/api/events" as const,
    client,
    responseRow: (response: ApiResponse) => response?.events || [],
    responseRowCount: (response: ApiResponse) => response?.total || 0,
    formatCacheUpdate: (originalResponse: ApiResponse, newRows: any[]) => ({
      ...originalResponse,
      events: newRows,
      total: originalResponse?.total || 0,
    }),
    apiParams: {},
  }), [client]);
};