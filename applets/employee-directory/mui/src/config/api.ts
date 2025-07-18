/**
 * API configuration for Employee Directory
 */
import { useApiClient } from "@smbc/applet-core";
import { useMemo } from "react";
import type { components, paths } from "@smbc/employee-directory-api/types";

type Employee = components["schemas"]["Employee"];

interface ApiResponse {
  employees?: Employee[];
  total?: number;
  [key: string]: unknown;
}

export const useApiConfig = () => {
  const client = useApiClient<paths>("employee-directory");
  
  return useMemo(() => ({
    endpoint: "/employees" as const,
    client,
    responseRow: (response: ApiResponse) => response?.employees || [],
    responseRowCount: (response: ApiResponse) => response?.total || 0,
    formatCacheUpdate: (originalResponse: ApiResponse, newRows: Employee[]) => ({
      ...originalResponse,
      employees: newRows,
      total: originalResponse?.total || 0,
    }),
    apiParams: {},
  }), [client]);
};