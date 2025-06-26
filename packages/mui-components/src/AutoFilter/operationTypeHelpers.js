/**
 * Helper utilities for creating runtime operation schemas
 * Since TypeScript operation types don't exist at runtime, we need to create
 * runtime equivalents that AutoFilter can use to extract field information
 */
/**
 * Create a runtime operation schema that matches the TypeScript operation type
 */
export function createOperationSchema(queryParams) {
    return {
        parameters: {
            query: queryParams
        }
    };
}
/**
 * Common operation schemas for typical API patterns
 */
export const commonOperationSchemas = {
    /**
     * Standard list operation with pagination, search, and optional filters
     */
    listWithFilters: (additionalFilters = {}) => createOperationSchema({
        page: {
            type: 'integer',
            default: 1,
            description: 'Page number for pagination'
        },
        pageSize: {
            type: 'integer',
            default: 10,
            description: 'Number of items per page'
        },
        search: {
            type: 'string',
            description: 'Search query'
        },
        ...additionalFilters
    }),
    /**
     * Basic list operation with just pagination
     */
    listWithPagination: () => createOperationSchema({
        page: {
            type: 'integer',
            default: 1
        },
        pageSize: {
            type: 'integer',
            default: 10
        }
    }),
    /**
     * Search-only operation
     */
    searchOnly: () => createOperationSchema({
        search: {
            type: 'string',
            description: 'Search query'
        }
    }),
};
/**
 * Extract fields from actual OpenAPI operation spec
 * Use this when you have access to the real OpenAPI spec
 */
export function extractFieldsFromOpenAPIOperation(operation) {
    const queryParams = {};
    if (operation?.parameters) {
        operation.parameters
            .filter((param) => param.in === 'query')
            .forEach((param) => {
            queryParams[param.name] = param.schema || param;
        });
    }
    return createOperationSchema(queryParams);
}
/**
 * Specific schemas for the SMBC applets
 */
export const smbcOperationSchemas = {
    /**
     * User Management API - Users list operation
     */
    usersList: () => commonOperationSchemas.listWithFilters(),
    /**
     * Product Catalog API - Products list operation
     */
    productsList: () => commonOperationSchemas.listWithFilters({
        category: {
            type: 'string',
            description: 'Product category filter'
        }
    }),
};
