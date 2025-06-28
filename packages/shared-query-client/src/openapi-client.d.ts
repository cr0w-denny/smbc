export { default as createFetchClient } from "openapi-fetch";
export { default as createClient } from "openapi-react-query";
export declare function createApiClient<T extends Record<string, any> = Record<string, any>>(config: {
    baseUrl: string;
    headers?: Record<string, string>;
}): import("openapi-fetch").Client<T, `${string}/${string}`>;
export declare class ApiError extends Error {
    status?: number | undefined;
    response?: any | undefined;
    constructor(message: string, status?: number | undefined, response?: any | undefined);
}
export declare function handleApiError(error: any): ApiError;
//# sourceMappingURL=openapi-client.d.ts.map