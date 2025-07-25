// Auto-generated mock handlers for all configured applets
// Generated by: npm run generate-mocks
// Do not edit this file manually

import React from 'react';
import { handlers as productCatalogHandlers } from './product-catalog';
import { handlers as employeeDirectoryHandlers } from './employee-directory';
import { handlers as usageStatsHandlers } from './usage-stats';
import { handlers as userManagementHandlers } from './user-management';

/**
 * All MSW handlers for configured applets
 */
export const allHandlers = [
  ...productCatalogHandlers,
  ...employeeDirectoryHandlers,
  ...usageStatsHandlers,
  ...userManagementHandlers,
];

// Also export as 'handlers' for compatibility
export const handlers = allHandlers;

/**
 * Hook for setting up MSW mocks in host applications
 * 
 * @example
 * ```tsx
 * import { useMockSetup } from './mocks';
 * 
 * function App() {
 *   const { isReady, error } = useMockSetup(mockEnabled);
 *   
 *   if (mockEnabled && !isReady) {
 *     return <div>Setting up mocks...</div>;
 *   }
 *   
 *   return <YourApp />;
 * }
 * ```
 */
export function useMockSetup(enabled: boolean = true) {
  const [isReady, setIsReady] = React.useState(!enabled);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!enabled) {
      setIsReady(true);
      setError(null);
      return;
    }

    async function setupMocks() {
      try {
        const { setupWorker } = await import('msw/browser');
        const worker = setupWorker(...handlers);
        
        await worker.start({
          onUnhandledRequest: 'warn',
          serviceWorker: {
            url: `${import.meta.env.BASE_URL || '/'}mockServiceWorker.js`,
          },
        });
        
        console.log('🎭 MSW worker started with handlers:', handlers.length);
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to setup MSW:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsReady(false);
      }
    }

    setupMocks();
  }, [enabled]);

  return { isReady, error };
}

// Export individual handler sets for advanced usage
export {
  productCatalogHandlers,
  employeeDirectoryHandlers,
  usageStatsHandlers,
  userManagementHandlers,
};

/**
 * Metadata about generated mocks
 */
export const mockMetadata = {
  generatedAt: '2025-07-23T00:18:10.349Z',
  applets: [
    {
      id: 'product-catalog',
      packageName: '@smbc/product-catalog-api',
      handlersCount: productCatalogHandlers.length,
    },
    {
      id: 'employee-directory',
      packageName: '@smbc/employee-directory-api',
      handlersCount: employeeDirectoryHandlers.length,
    },
    {
      id: 'usage-stats',
      packageName: '@smbc/usage-stats-api',
      handlersCount: usageStatsHandlers.length,
    },
    {
      id: 'user-management',
      packageName: '@smbc/user-management-api',
      handlersCount: userManagementHandlers.length,
    },
  ],
};
