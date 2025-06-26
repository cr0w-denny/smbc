/**
 * Helper utilities for creating runtime operation schemas
 * Since TypeScript operation types don't exist at runtime, we need to create
 * runtime equivalents that AutoFilter can use to extract field information
 */
/**
 * Create a runtime operation schema that matches the TypeScript operation type
 */
export declare function createOperationSchema(queryParams: Record<string, any>): {
    parameters: {
        query: Record<string, any>;
    };
};
/**
 * Common operation schemas for typical API patterns
 */
export declare const commonOperationSchemas: {
    /**
     * Standard list operation with pagination, search, and optional filters
     */
    listWithFilters: (additionalFilters?: Record<string, any>) => {
        parameters: {
            query: Record<string, any>;
        };
    };
    /**
     * Basic list operation with just pagination
     */
    listWithPagination: () => {
        parameters: {
            query: Record<string, any>;
        };
    };
    /**
     * Search-only operation
     */
    searchOnly: () => {
        parameters: {
            query: Record<string, any>;
        };
    };
};
/**
 * Extract fields from actual OpenAPI operation spec
 * Use this when you have access to the real OpenAPI spec
 */
export declare function extractFieldsFromOpenAPIOperation(operation: any): {
    parameters: {
        query: Record<string, any>;
    };
};
/**
 * Specific schemas for the SMBC applets
 */
export declare const smbcOperationSchemas: {
    /**
     * User Management API - Users list operation
     */
    usersList: () => {
        parameters: {
            query: Record<string, any>;
        };
    };
    /**
     * Product Catalog API - Products list operation
     */
    productsList: () => {
        parameters: {
            query: Record<string, any>;
        };
    };
};
