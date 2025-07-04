// MSW Setup Helper
// Use this file to easily integrate mock overrides with your application

import { registerHostMockOverrides } from '@smbc/mui-applet-devtools';
import { mockOverrides } from './index';

/**
 * Initialize host-specific mock overrides.
 * Call this function during your app initialization when mock mode is enabled.
 * 
 * Example usage in your App.tsx:
 * 
 * import { useFeatureFlag } from '@smbc/applet-core';
 * import { initializeMockOverrides } from './mocks/setup';
 * 
 * function App() {
 *   const mockEnabled = useFeatureFlag('mockData');
 *   
 *   React.useEffect(() => {
 *     if (mockEnabled) {
 *       initializeMockOverrides();
 *     }
 *   }, [mockEnabled]);
 *   
 *   // ... rest of your app
 * }
 */
export function initializeMockOverrides(): void {
  if (typeof window !== 'undefined') {
    registerHostMockOverrides(mockOverrides);
    console.log('🎭 Host mock overrides registered:', mockOverrides.length, 'handlers');
  }
}

/**
 * Alternative: Auto-initialize if mock mode is enabled
 * This version automatically checks for mock mode and initializes overrides
 */
export async function autoInitializeMockOverrides(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      // Try to get feature flag value (assumes applet-core is available)
      const { useFeatureFlag } = await import('@smbc/applet-core');
      const mockEnabled = useFeatureFlag('mockData');
      
      if (mockEnabled) {
        initializeMockOverrides();
      }
    } catch (error) {
      console.warn('Could not auto-detect mock mode, use initializeMockOverrides() manually');
    }
  }
}
