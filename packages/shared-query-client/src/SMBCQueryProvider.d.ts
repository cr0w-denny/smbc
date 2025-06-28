import { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
export interface SMBCQueryContextValue {
    queryClient: QueryClient;
    isReady: boolean;
    mswEnabled: boolean;
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
export declare function SMBCQueryProvider({ children, queryClient: externalQueryClient, enableMocks, loadingComponent, errorComponent, apiConfig, }: SMBCQueryProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access the shared SMBC QueryClient and related state
 */
export declare function useSMBCQuery(): SMBCQueryContextValue;
//# sourceMappingURL=SMBCQueryProvider.d.ts.map