import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, createContext, useContext, } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import QueryClientManager from "./QueryClientManager";
import { setupMswForSharedProvider, stopMswWorker } from "./msw-integration";
const SMBCQueryContext = createContext(null);
/**
 * Helper function to detect if we're in development mode.
 * Works across different bundlers (Vite, webpack, etc.)
 */
function isDevelopmentMode() {
    // Check for explicit MSW disable flag
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_DISABLE_MSW) {
        return false;
    }
    // Check for Vite
    if (typeof import.meta !== "undefined" && import.meta.env) {
        const env = import.meta.env;
        return env.DEV || env.MODE === "development";
    }
    // Check for webpack/Node.js
    if (typeof globalThis !== "undefined" && globalThis.process?.env) {
        return globalThis.process.env.NODE_ENV === "development";
    }
    // Fallback - assume development if no clear production indicators
    return true;
}
/**
 * Shared QueryClient provider for all SMBC UI packages.
 *
 * This provider:
 * 1. Creates or accepts a shared QueryClient instance
 * 2. Optionally enables MSW mocks for development
 * 3. Provides global API configuration
 * 4. Ensures all SMBC packages use the same QueryClient
 *
 * Usage patterns:
 *
 * 1. Standalone (creates own QueryClient):
 * ```tsx
 * <SMBCQueryProvider>
 *   <UserTableWithApi />
 *   <ProductCatalog />
 * </SMBCQueryProvider>
 * ```
 *
 * 2. Integration with existing QueryClient:
 * ```tsx
 * <SMBCQueryProvider queryClient={existingQueryClient}>
 *   <UserTableWithApi />
 * </SMBCQueryProvider>
 * ```
 *
 * 3. Development with mocks:
 * ```tsx
 * <SMBCQueryProvider enableMocks={true}>
 *   <UserTableWithApi />
 * </SMBCQueryProvider>
 * ```
 */
export function SMBCQueryProvider({ children, queryClient: externalQueryClient, enableMocks = isDevelopmentMode(), loadingComponent, errorComponent, apiConfig, }) {
    const [mswStatus, setMswStatus] = useState("loading");
    const [mswError, setMswError] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const manager = QueryClientManager.getInstance();
    // Set up QueryClient
    useEffect(() => {
        if (externalQueryClient) {
            manager.setQueryClient(externalQueryClient);
        }
    }, [externalQueryClient, manager]);
    const queryClient = manager.getQueryClient();
    // Initialize or stop MSW based on enableMocks
    useEffect(() => {
        async function handleMswToggle() {
            if (!enableMocks) {
                // Stop MSW if it's running
                try {
                    await stopMswWorker();
                }
                catch (error) {
                    console.warn("Failed to stop MSW worker:", error);
                }
                setMswStatus("ready");
                setIsReady(true);
                return;
            }
            // Start MSW
            try {
                await setupMswForSharedProvider(apiConfig);
                setMswStatus("ready");
                setIsReady(true);
            }
            catch (error) {
                console.warn("MSW initialization failed, continuing without mocks:", error);
                setMswError(error instanceof Error ? error.message : "Unknown MSW error");
                setMswStatus("error");
                setIsReady(true); // Continue without mocks
            }
        }
        handleMswToggle();
    }, [enableMocks, apiConfig]);
    // Show loading state
    if (!isReady) {
        if (loadingComponent) {
            return _jsx(_Fragment, { children: loadingComponent });
        }
        return (_jsxs("div", { style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                gap: "16px",
            }, children: [_jsx("div", { style: {
                        width: "32px",
                        height: "32px",
                        border: "3px solid #f3f3f3",
                        borderTop: "3px solid #3498db",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                    } }), _jsx("div", { style: { color: "#666", fontSize: "14px" }, children: enableMocks
                        ? "Initializing development mocks..."
                        : "Setting up API client..." }), _jsx("style", { children: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        ` })] }));
    }
    // Show error if MSW failed (but continue)
    const errorElement = mswStatus === "error" && mswError ? (errorComponent ? (errorComponent(mswError)) : (_jsxs("div", { style: {
            margin: "16px",
            padding: "12px 16px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            color: "#856404",
        }, children: [_jsxs("div", { style: { fontSize: "14px", marginBottom: "4px" }, children: ["\u26A0\uFE0F Mock API initialization failed: ", mswError] }), _jsx("div", { style: { fontSize: "12px" }, children: "Components will work, but API calls may fail without a real backend." })] }))) : null;
    const contextValue = {
        queryClient,
        isReady,
        mswEnabled: enableMocks && mswStatus === "ready",
    };
    // If we're using an external QueryClient, don't wrap with QueryClientProvider
    if (externalQueryClient) {
        return (_jsxs(SMBCQueryContext.Provider, { value: contextValue, children: [errorElement, children] }));
    }
    // Otherwise, provide our own QueryClientProvider
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(SMBCQueryContext.Provider, { value: contextValue, children: [errorElement, children] }) }));
}
/**
 * Hook to access the shared SMBC QueryClient and related state
 */
export function useSMBCQuery() {
    const context = useContext(SMBCQueryContext);
    if (!context) {
        throw new Error("useSMBCQuery must be used within an SMBCQueryProvider");
    }
    return context;
}
