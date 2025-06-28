/**
 * MSW integration for the shared query provider.
 * This module provides MSW setup that can be dynamically imported to avoid bundling MSW in production.
 */
// Global MSW worker reference for proper start/stop management
let globalMswWorker = null;
// Registry for handlers from different packages
const handlerRegistry = [];
/**
 * Register MSW handlers from applet packages.
 * This allows applets to register their handlers without creating circular dependencies.
 */
export function registerMswHandlers(handlers) {
    if (Array.isArray(handlers)) {
        console.log(`🎯 Registered ${handlers.length} MSW handlers`);
        handlerRegistry.push(...handlers);
    }
}
/**
 * Clear all registered handlers (useful for testing)
 */
export function clearRegisteredHandlers() {
    handlerRegistry.length = 0;
}
/**
 * Get all registered handlers
 */
export function getRegisteredHandlers() {
    return [...handlerRegistry];
}
/**
 * Sets up MSW for the shared provider with optional API configuration.
 * This function is designed to be dynamically imported to avoid bundling MSW in production.
 */
export async function setupMswForSharedProvider(apiConfig) {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
        console.warn("MSW setup called in non-browser environment, skipping");
        return;
    }
    try {
        // Try to import MSW browser setup
        const { setupWorker } = await import("msw/browser");
        // Use registered handlers instead of importing applet packages
        const allHandlers = getRegisteredHandlers();
        if (allHandlers.length === 0) {
            console.warn("⚠️ No MSW handlers registered. Make sure applets call registerMswHandlers() before setupMswForSharedProvider()");
        }
        else {
            console.log(`🎯 Setting up MSW with ${allHandlers.length} registered handlers`);
        }
        // Setup the MSW worker
        if (!globalMswWorker) {
            globalMswWorker = setupWorker(...allHandlers);
            // Start the worker
            await globalMswWorker.start({
                onUnhandledRequest: "bypass",
                serviceWorker: {
                    url: "/mockServiceWorker.js",
                },
            });
            console.log("🎭 MSW (Mock Service Worker) started for development");
            // Apply any custom API configuration if provided
            if (apiConfig?.baseUrl) {
                console.log(`🔧 MSW configured with base URL: ${apiConfig.baseUrl}`);
            }
        }
        else {
            console.log("🎭 MSW worker already running");
        }
    }
    catch (error) {
        console.error("❌ Failed to setup MSW:", error);
        throw error;
    }
}
/**
 * Stops the MSW worker if it's running.
 */
export async function stopMswForSharedProvider() {
    if (globalMswWorker) {
        try {
            await globalMswWorker.stop();
            globalMswWorker = null;
            console.log("🛑 MSW worker stopped");
        }
        catch (error) {
            console.error("❌ Failed to stop MSW worker:", error);
        }
    }
}
/**
 * Resets the MSW worker with new handlers (useful for testing or dynamic handler updates).
 */
export async function resetMswWorker() {
    await stopMswForSharedProvider();
    await setupMswForSharedProvider();
}
/**
 * Stops the MSW worker (alias for stopMswForSharedProvider for convenience).
 */
export async function stopMswWorker() {
    return stopMswForSharedProvider();
}
/**
 * Checks if MSW is available in the current environment.
 * Returns true if MSW can be imported and used, false otherwise.
 */
export async function isMswAvailable() {
    if (typeof window === "undefined") {
        return false;
    }
    try {
        await import("msw/browser");
        return true;
    }
    catch {
        return false;
    }
}
