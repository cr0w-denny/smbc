export * from "./msw-integration";
export type { ApiConfig } from "./msw-integration";

// Re-export mocks
export { handlers as userManagementHandlers } from "./mocks/user-management";
export { handlers as productCatalogHandlers } from "./mocks/product-catalog";
export { handlers as employeeDirectoryHandlers } from "./mocks/employee-directory";

// Re-export mock reset functionality
export { resetAllMocks } from "./mocks/reset";

