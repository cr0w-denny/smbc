/**
 * API configuration for Employee Directory
 */
import { getApiClient } from "@smbc/applet-core";
import type { components, paths } from "@smbc/employee-directory-api/generated/types";

type Employee = components["schemas"]["Employee"];

interface ApiResponse {
  employees?: Employee[];
  total?: number;
  [key: string]: unknown;
}

export const createApiConfig = () => ({
  endpoint: "/employees" as const,
  client: getApiClient<paths>("employee-directory"),
  responseRow: (response: ApiResponse) => response?.employees || [],
  responseRowCount: (response: ApiResponse) => response?.total || 0,
  formatCacheUpdate: (originalResponse: ApiResponse, newRows: Employee[]) => ({
    ...originalResponse,
    employees: newRows,
    total: originalResponse?.total || 0,
  }),
  apiParams: {},
});