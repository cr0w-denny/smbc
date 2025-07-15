// Centralized mock reset functionality
import { resetMocks as resetUserManagementMocks } from './user-management';
import { resetMocks as resetProductCatalogMocks } from './product-catalog';
import { resetMocks as resetEmployeeDirectoryMocks } from './employee-directory';
import { resetMocks as resetUsageStatsMocks } from './usage-stats';

// Array of all mock reset functions
const mockResetFunctions = [
  resetUserManagementMocks,
  resetProductCatalogMocks,
  resetEmployeeDirectoryMocks,
  resetUsageStatsMocks,
];

/**
 * Reset all mock data stores across all APIs
 */
export function resetAllMocks() {
  console.log('Resetting all mock data stores...');
  
  mockResetFunctions.forEach((resetFn) => {
    try {
      resetFn();
    } catch (error) {
      console.error('Error resetting mock:', error);
    }
  });
  
  console.log('All mock data stores reset successfully');
}