import type { DataViewConfig, DataViewResult } from "./types";
import type { TransactionConfig } from "./transaction/types";
export interface UseDataViewOptions {
    /** Custom hook for managing filter state (e.g., URL-synced filters) */
    useFilterState?: (defaultFilters: any) => [any, (filters: any) => void];
    /** Custom hook for managing pagination state (e.g., URL-synced pagination) */
    usePaginationState?: (defaultPagination: any) => [any, (pagination: any) => void];
    /** Transform filter values for query keys and API requests */
    transformFilters?: (filters: any) => any;
    /** Function to determine which columns to show based on current filters */
    getActiveColumns?: (columns: any[], filters: any) => any[];
    /** Optional notification handlers for user feedback */
    onSuccess?: (action: "create" | "edit" | "delete", item?: any) => void;
    onError?: (action: "create" | "edit" | "delete", error: any, item?: any) => void;
    /** Transaction configuration for batch operations */
    transaction?: TransactionConfig;
    /** Enable URL hash synchronization for filters and pagination (default: true) */
    hashParams?: boolean;
    /** Namespace for hash params to avoid conflicts when multiple applets on same page */
    hashNamespace?: string;
}
export declare function useDataView<T extends Record<string, any>>(config: DataViewConfig<T>, options?: UseDataViewOptions): DataViewResult<T>;
//# sourceMappingURL=useDataView.d.ts.map