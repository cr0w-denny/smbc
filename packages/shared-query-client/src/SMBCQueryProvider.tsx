import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QueryClientManager from "./QueryClientManager";

export interface SMBCQueryContextValue {
  queryClient: QueryClient;
  isReady: boolean;
  mswEnabled: boolean;
}

const SMBCQueryContext = createContext<SMBCQueryContextValue | null>(null);

/**
 * Helper function to detect if we're in development mode.
 * Works across different bundlers (Vite, webpack, etc.)
 */
function isDevelopmentMode(): boolean {
  // Check for explicit MSW disable flag
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_DISABLE_MSW) {
    return false;
  }

  // Check for Vite
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    const env = (import.meta as any).env;
    return env.DEV || env.MODE === "development";
  }

  // Check for webpack/Node.js
  if (typeof globalThis !== "undefined" && (globalThis as any).process?.env) {
    return (globalThis as any).process.env.NODE_ENV === "development";
  }

  // Fallback - assume development if no clear production indicators
  return true;
}

export interface SMBCQueryProviderProps {
  children: ReactNode;
  /**
   * External QueryClient to use. If provided, this will be used instead of creating a new one.
   * This allows integration with existing apps that already have a QueryClient.
   */
  queryClient?: QueryClient;
  /**
   * Whether to enable MSW mocks. Defaults to true in development mode.
   * Set to false to disable mocks even in development.
   */
  enableMocks?: boolean;
  /**
   * Custom loading component shown while MSW is initializing
   */
  loadingComponent?: ReactNode;
  /**
   * Custom error component shown if MSW fails to initialize
   */
  errorComponent?: (error: string) => ReactNode;
  /**
   * Global API configuration that will be applied to all SMBC packages
   */
  apiConfig?: {
    baseUrl?: string;
    headers?: Record<string, string>;
  };
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
export function SMBCQueryProvider({
  children,
  queryClient: externalQueryClient,
  enableMocks = isDevelopmentMode(),
  loadingComponent,
  errorComponent,
  apiConfig,
}: SMBCQueryProviderProps) {
  const [mswStatus, setMswStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [mswError, setMswError] = useState<string | null>(null);
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
          const { stopMswWorker } = await import("./msw-integration.js");
          await stopMswWorker();
        } catch (error) {
          console.warn("Failed to stop MSW worker:", error);
        }
        setMswStatus("ready");
        setIsReady(true);
        return;
      }

      // Start MSW
      try {
        // Dynamically import MSW setup to avoid bundling in production
        // This will fail gracefully if @smbc/msw-utils is not available
        const { setupMswForSharedProvider } = await import(
          "./msw-integration.js"
        );
        await setupMswForSharedProvider(apiConfig);
        setMswStatus("ready");
        setIsReady(true);
      } catch (error) {
        console.warn(
          "MSW initialization failed, continuing without mocks:",
          error,
        );
        setMswError(
          error instanceof Error ? error.message : "Unknown MSW error",
        );
        setMswStatus("error");
        setIsReady(true); // Continue without mocks
      }
    }

    handleMswToggle();
  }, [enableMocks, apiConfig]);

  // Show loading state
  if (!isReady) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ color: "#666", fontSize: "14px" }}>
          {enableMocks
            ? "Initializing development mocks..."
            : "Setting up API client..."}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error if MSW failed (but continue)
  const errorElement =
    mswStatus === "error" && mswError ? (
      errorComponent ? (
        errorComponent(mswError)
      ) : (
        <div
          style={{
            margin: "16px",
            padding: "12px 16px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            color: "#856404",
          }}
        >
          <div style={{ fontSize: "14px", marginBottom: "4px" }}>
            ⚠️ Mock API initialization failed: {mswError}
          </div>
          <div style={{ fontSize: "12px" }}>
            Components will work, but API calls may fail without a real backend.
          </div>
        </div>
      )
    ) : null;

  const contextValue: SMBCQueryContextValue = {
    queryClient,
    isReady,
    mswEnabled: enableMocks && mswStatus === "ready",
  };

  // If we're using an external QueryClient, don't wrap with QueryClientProvider
  if (externalQueryClient) {
    return (
      <SMBCQueryContext.Provider value={contextValue}>
        {errorElement}
        {children}
      </SMBCQueryContext.Provider>
    );
  }

  // Otherwise, provide our own QueryClientProvider
  return (
    <QueryClientProvider client={queryClient}>
      <SMBCQueryContext.Provider value={contextValue}>
        {errorElement}
        {children}
      </SMBCQueryContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Hook to access the shared SMBC QueryClient and related state
 */
export function useSMBCQuery(): SMBCQueryContextValue {
  const context = useContext(SMBCQueryContext);

  if (!context) {
    throw new Error("useSMBCQuery must be used within an SMBCQueryProvider");
  }

  return context;
}
