import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "../../../packages/typespec-core/query.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

/**
 * User Management API
 * 
 * This API provides endpoints for managing users in the system.
 */
@service({
  title: "User Management API",
})
@server("https://api.smbc.com/api/v1", "Production server")
@server("http://localhost:3000/api/v1", "Development server")
namespace UserManagementAPI;

/**
 * A user in the system
 */
model User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
  isActive: boolean;
  isAdmin: boolean; 
}

/**
 * User creation request
 */
model CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * User update request
 */
model UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

/**
 * User-specific filter parameters for list endpoint
 */
alias UserFilterParams = {
  @query @extension("x-mock-filter", { field: "isAdmin", strategy: "exact" }) isAdmin?: string;
  @query @extension("x-mock-filter", { field: "email", strategy: "partial-match" }) email?: string;
  @query @extension("x-mock-filter", { field: "isActive", strategy: "boolean-inverse" }) status?: "active" | "inactive";
};

/**
 * Paginated list of users
 */
model UserList {
  users: User[];
  total: int32;
  page: int32;
  pageSize: int32;
}

/**
 * Error response
 */
@error
model ErrorResponse {
  code: string;
  message: string;
  details?: string;
}

@route("/users")
interface Users {
  /**
   * Get all users with pagination
   */
  @get
  list(...BaseListParams, ...UserFilterParams): UserList | ErrorResponse;

  /**
   * Create a new user
   */
  @post
  create(@body user: CreateUserRequest): User | ErrorResponse;

  /**
   * Get a user by ID
   */
  @get
  @route("/{id}")
  get(@path id: string): User | ErrorResponse;

  /**
   * Update a user
   */
  @patch
  @route("/{id}")
  update(@path id: string, @body user: UpdateUserRequest): User | ErrorResponse;

  /**
   * Delete a user
   */
  @delete
  @route("/{id}")
  delete(@path id: string): void | ErrorResponse;
}
