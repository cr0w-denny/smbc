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
@service(#{
  title: "User Management API",
})
@server("https://api.smbc.com/api/v1", "Production server")
@server("http://localhost:3000/api/v1", "Development server")
namespace UserManagementAPI;

/**
 * A user in the system
 */
model User {
  @extension("x-mock-data", #{ faker: "string.uuid" })
  id: string;
  
  @extension("x-mock-data", #{ faker: "internet.email", unique: true })
  email: string;
  
  @extension("x-mock-data", #{ faker: "person.firstName" })
  firstName: string;
  
  @extension("x-mock-data", #{ faker: "person.lastName" })
  lastName: string;
  
  @extension("x-mock-data", #{ relative: "-30d to now" })
  createdAt: utcDateTime;
  
  @extension("x-mock-data", #{ relative: "-7d to now" })
  updatedAt: utcDateTime;
  
  @extension("x-mock-data", #{ faker: "datatype.boolean", weight: 0.9 })
  isActive: boolean;
  
  @extension("x-mock-data", #{ faker: "datatype.boolean", weight: 0.1 })
  isAdmin: boolean; 
}

/**
 * Summary view of a user
 */
model UserSummary {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
}

/**
 * Detailed view of a user with computed fields
 */
model UserDetailed {
  ...User;
  fullName: string;
  memberSince: string;
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
  @query @extension("x-mock-filter", #{ field: "isAdmin", strategy: "exact" }) isAdmin?: string;
  @query @extension("x-mock-filter", #{ field: "email", strategy: "partial-match" }) email?: string;
  @query @extension("x-mock-filter", #{ field: "isActive", strategy: "boolean-inverse" }) status?: "active" | "inactive";
  @query format?: "summary" | "detailed";
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
  @extension("x-mock-response", #{
    case: "format",
    when: #{
      summary: "UserSummary",
      detailed: "UserDetailed"
    },
    default: "User"
  })
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
  @patch(#{ implicitOptionality: true })
  @route("/{id}")
  update(@path id: string, @body user: UpdateUserRequest): User | ErrorResponse;

  /**
   * Delete a user
   */
  @delete
  @route("/{id}")
  delete(@path id: string): void | ErrorResponse;
}
