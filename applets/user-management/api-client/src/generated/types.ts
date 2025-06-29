/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get all users with pagination */
        get: operations["Users_list"];
        put?: never;
        /** @description Create a new user */
        post: operations["Users_create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get a user by ID */
        get: operations["Users_get"];
        put?: never;
        post?: never;
        /** @description Delete a user */
        delete: operations["Users_delete"];
        options?: never;
        head?: never;
        /** @description Update a user */
        patch: operations["Users_update"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description User creation request */
        CreateUserRequest: {
            email: string;
            firstName: string;
            lastName: string;
        };
        /** @description Error response */
        ErrorResponse: {
            code: string;
            message: string;
            details?: string;
        };
        /** @description User update request */
        UpdateUserRequest: {
            firstName?: string;
            lastName?: string;
            isActive?: boolean;
        };
        /** @description A user in the system */
        User: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            isActive: boolean;
            isAdmin: boolean;
        };
        /** @description Detailed view of a user with computed fields */
        UserDetailed: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            isActive: boolean;
            isAdmin: boolean;
            fullName: string;
            memberSince: string;
        };
        /** @description Paginated list of users */
        UserList: {
            users: components["schemas"]["User"][];
            /** Format: int32 */
            total: number;
            /** Format: int32 */
            page: number;
            /** Format: int32 */
            pageSize: number;
        };
        /** @description Summary view of a user */
        UserSummary: {
            id: string;
            name: string;
            email: string;
            /** @enum {string} */
            status: "active" | "inactive";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    Users_list: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                sortBy?: string;
                sortOrder?: "asc" | "desc";
                search?: string;
                isAdmin?: string;
                email?: string;
                status?: "active" | "inactive";
                format?: "summary" | "detailed";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The request has succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserList"];
                };
            };
            /** @description An unexpected error response. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    Users_create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateUserRequest"];
            };
        };
        responses: {
            /** @description The request has succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description An unexpected error response. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    Users_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The request has succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description An unexpected error response. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    Users_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description There is no content to send for this request, but the headers may be useful.  */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description An unexpected error response. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    Users_update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserRequest"];
            };
        };
        responses: {
            /** @description The request has succeeded. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            /** @description An unexpected error response. */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
