import { apiClient, type components } from "@smbc/user-management-client";

type User = components["schemas"]["User"];

/**
 * API response interface
 */
interface ApiResponse {
  users?: User[];
  total?: number;
  [key: string]: unknown;
}

/**
 * Creates API configuration for the UserManager component
 *
 * @param userType - Type of users to fetch ("all", "admins", or "non-admins")
 * @returns API configuration object for the data view applet
 */
export const createApiConfig = (userType: "all" | "admins" | "non-admins") => ({
  endpoint: "/users" as const,
  client: apiClient,
  responseRow: (response: ApiResponse) => response?.users || [],
  responseRowCount: (response: ApiResponse) => response?.total || 0,
  optimisticResponse: (originalResponse: ApiResponse, newRows: User[]) => ({
    ...originalResponse,
    users: newRows,
    total: newRows.length,
  }),
  // Additional API parameters based on user type
  apiParams: {
    ...(userType === "admins" && { isAdmin: "true" }),
    ...(userType === "non-admins" && { isAdmin: "false" }),
  },
});
