/**
 * Mock handlers for all API packages
 * 
 * This file exports all the generated mock handlers that can be used
 * with MSW to mock API responses in development/testing environments.
 */

import { handlers as userManagementHandlers } from './user-management';
import { handlers as productCatalogHandlers } from './product-catalog';
import { handlers as employeeDirectoryHandlers } from './employee-directory';
import { handlers as usageStatsHandlers } from './usage-stats';

// Export all handlers
export const allHandlers = [
  ...userManagementHandlers,
  ...productCatalogHandlers,
  ...employeeDirectoryHandlers,
  ...usageStatsHandlers,
];

// Export individual handler groups
export {
  userManagementHandlers,
  productCatalogHandlers,
  employeeDirectoryHandlers,
  usageStatsHandlers,
};