/**
 * MSW integration for the applet query provider.
 * This module provides MSW setup that can be dynamically imported to avoid bundling MSW in production.
 */
export interface ApiConfig {
    baseUrl?: string;
    headers?: Record<string, string>;
}
/**
 * Register MSW handlers from applet packages.
 * This allows applets to register their handlers without creating circular dependencies.
 */
export declare function registerMswHandlers(handlers: any[]): void;
/**
 * Clear all registered handlers (useful for testing)
 */
export declare function clearRegisteredHandlers(): void;
/**
 * Get all registered handlers
 */
export declare function getRegisteredHandlers(): any[];
/**
 * Sets up MSW for the applet provider with optional API configuration.
 * This function is designed to be dynamically imported to avoid bundling MSW in production.
 */
export declare function setupMswForAppletProvider(apiConfig?: ApiConfig): Promise<void>;
/**
 * Stops the MSW worker if it's running.
 */
export declare function stopMswForAppletProvider(): Promise<void>;
/**
 * Resets the MSW worker with new handlers (useful for testing or dynamic handler updates).
 */
export declare function resetMswWorker(): Promise<void>;
/**
 * Stops the MSW worker (alias for stopMswForAppletProvider for convenience).
 */
export declare function stopMswWorker(): Promise<void>;
/**
 * Checks if MSW is available in the current environment.
 * Returns true if MSW can be imported and used, false otherwise.
 */
export declare function isMswAvailable(): Promise<boolean>;
//# sourceMappingURL=msw-integration.d.ts.map