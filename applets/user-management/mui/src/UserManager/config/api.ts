/**
 * API Configuration
 *
 * This file configures how the MuiDataViewApplet component communicates with the backend API.
 * It's part of a modular configuration system where each aspect (API, schema, columns, etc.)
 * is defined in its own file for better organization and maintainability.
 *
 * Usage Flow:
 * 1. This createApiConfig function is called by createUserManagerConfig in config/index.ts
 * 2. The config is passed to the UserManager component
 * 3. UserManager passes it to MuiDataViewApplet
 * 4. MuiDataViewApplet uses it in the useDataView hook for:
 *    - Fetching data (list queries)
 *    - Creating, updating, and deleting records (mutations)
 *    - Handling optimistic updates and transactions
 *
 * The configuration tells the DataView:
 * - Which API endpoint to use ("/users")
 * - Which HTTP client to use (apiClient from generated code)
 * - How to extract data from responses (responseRow, responseRowCount)
 * - How to handle cache updates (formatCacheUpdate)
 * - What query parameters to always include (apiParams)
 */

import { useApiClient } from "@smbc/applet-core";
import type { components } from "@smbc/user-management-api/types";
import type { paths } from "@smbc/user-management-api/types";

type User = components["schemas"]["User"];

/**
 * API response interface
 *
 * This custom interface is used instead of the generated UserList type because:
 * 1. The data view applet receives the unwrapped response data directly (not the openapi-fetch wrapper)
 * 2. Optional properties handle edge cases where responses might be incomplete
 * 3. The index signature provides flexibility for additional response properties
 * 4. Decouples UI code from strict generated types, making it resilient to API changes
 *
 * The generated UserList type has: { users: User[], total: number, page: number, pageSize: number }
 * but we only need users and total for the data view configuration.
 */
interface ApiResponse {
  users?: User[];
  total?: number;
  [key: string]: unknown;
}

/**
 * Creates API configuration for the UserManager component
 *
 * NOTE: This applet serves as an example of handling non-standard API response formats.
 * While the recommended pattern is to use PaginatedResponse<T> with an "items" field,
 * this API returns a "users" field instead. The custom responseRow/responseRowCount
 * functions below demonstrate how to adapt any response format to work with DataView.
 *
 * For new APIs, prefer the standard PaginatedResponse<T> format to avoid needing
 * custom response adapters.
 *
 * @param userType - Type of users to fetch ("all", "admins", or "non-admins")
 * @returns API configuration object for the data view applet
 */
export const useApiConfig = (userType: "all" | "admins" | "non-admins") => {
  const client = useApiClient<paths>("user-management");
  
  return {
    endpoint: "/users" as const,
    client,
    // CUSTOM RESPONSE ADAPTERS EXAMPLE:
    // Extracts the users array from the TypeSpec-defined UserList response structure
    // The API returns { users: User[], total: number, page: number, pageSize: number }
    // as defined in applets/user-management/api/main.tsp (UserList model)
    //
    // This demonstrates how to handle APIs that don't follow the standard 
    // PaginatedResponse<T> format (which expects "items" instead of "users").
    //
    // These functions are used by the DataView component to:
    // 1. Transform API responses into table rows
    // 2. Handle optimistic updates during mutations (create/update/delete)
    // 3. Manage transaction states and rollbacks
    // 4. Extract data from cached query responses
    responseRow: (response: ApiResponse) => response?.users || [],
    responseRowCount: (response: ApiResponse) => response?.total || 0,
    formatCacheUpdate: (originalResponse: ApiResponse, newRows: User[]) => ({
      ...originalResponse,
      users: newRows,
      total: newRows.length,
    }),
    // Optional additional API parameters based on user type
    // These parameters are automatically added to all GET list requests (not mutations)
    // Used to filter the user list: admins only, non-admins only, or all users
    // Applied in useDataView when fetching data: GET /users?isAdmin=true (for admins view)
    apiParams: {
      ...(userType === "admins" && { isAdmin: "true" }),
      ...(userType === "non-admins" && { isAdmin: "false" }),
    },
  };
};
