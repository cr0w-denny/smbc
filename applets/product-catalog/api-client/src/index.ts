// Export the new openapi-react-query client
export * from "./client.js";

// Export generated types
export type * from "./generated/types.js";

// For backward compatibility and convenience
export { apiClient as default } from "./client.js";
