/**
 * MSW integration for the applet query provider.
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
 * Sets up MSW for the applet provider with optional API configuration.
 * This function is designed to be dynamically imported to avoid bundling MSW in production.
 */
export async function setupMswForAppletProvider(apiConfig) {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
        return;
    }
    try {
        // Try to import MSW browser setup
        const { setupWorker } = await import("msw/browser");
        // Use registered handlers instead of importing applet packages
        const allHandlers = getRegisteredHandlers();
        if (allHandlers.length === 0) {
            console.warn("No MSW handlers registered. Add handlers using registerMswHandlers()");
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
            console.log(`🎭 MSW started with ${allHandlers.length} handlers`);
            // Apply any custom API configuration if provided
            if (apiConfig?.baseUrl) {
                console.log(`🌐 MSW using base URL: ${apiConfig.baseUrl}`);
            }
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
export async function stopMswForAppletProvider() {
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
    await stopMswForAppletProvider();
    await setupMswForAppletProvider();
}
/**
 * Stops the MSW worker (alias for stopMswForAppletProvider for convenience).
 */
export async function stopMswWorker() {
    return stopMswForAppletProvider();
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
