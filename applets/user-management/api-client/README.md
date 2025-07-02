# User Management API Client

Type-safe React Query client for the User Management API, built with `openapi-react-query` and `openapi-fetch`.

## Features

- Type-safe API endpoints, parameters, and responses
- Automatically generated types from OpenAPI schema
- React Query integration with hooks for queries and mutations
- Auto-generated MSW mock handlers for development and testing

## Installation

```bash
npm install @smbc/user-management-client
```

## Usage

```tsx
import React from "react";
import { apiClient } from "@smbc/user-management-client";

function UsersList() {
  const { data, error, isPending } = apiClient.useQuery("get", "/users", {});

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.users.map((user) => (
        <li key={user.id}>
          {user.firstName} {user.lastName} - {user.email}
        </li>
      ))}
    </ul>
  );
}
```

## API Reference

### Default Client

```tsx
import { apiClient } from "@smbc/user-management-client";

// Available methods
apiClient.useQuery(method, path, options);
apiClient.useMutation(method, path);
apiClient.useInfiniteQuery(method, path, options);
apiClient.useSuspenseQuery(method, path, options);
```

### Custom Client

```tsx
import { createApiClient } from "@smbc/user-management-client";

const customClient = createApiClient({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: "Bearer " + token,
  },
});
```

### Available Endpoints

- `GET /users` - List users with pagination
- `POST /users` - Create a new user
- `GET /users/{id}` - Get user by ID
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

## Examples

### Fetching Users

```tsx
function UsersList() {
  const { data, error, isPending } = apiClient.useQuery("get", "/users", {
    params: {
      query: {
        page: 1,
        pageSize: 20,
        search: "john@example.com",
      },
    },
  });

  // data is typed as { users: User[], total: number, page: number, pageSize: number }
}
```

### Creating a User

```tsx
function CreateUser() {
  const { mutate: createUser, isPending } = apiClient.useMutation(
    "post",
    "/users",
  );

  const handleSubmit = (userData) => {
    createUser({
      body: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      },
    });
  };
}
```

### Getting a Specific User

```tsx
function UserDetail({ userId }: { userId: string }) {
  const { data: user } = apiClient.useQuery("get", "/users/{id}", {
    params: {
      path: { id: userId },
    },
  });

  // user is typed as User | undefined
}
```

### Updating a User

```tsx
function UpdateUser({ userId }: { userId: string }) {
  const { mutate: updateUser } = apiClient.useMutation("patch", "/users/{id}");

  const handleUpdate = (updates) => {
    updateUser({
      params: {
        path: { id: userId },
      },
      body: {
        firstName: updates.firstName,
        isActive: updates.isActive,
      },
    });
  };
}
```

## Testing with MSW

```tsx
import { handlers } from "@smbc/user-management-client";
import { setupServer } from "msw/node";

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Type Definitions

```tsx
import type { paths, components } from "@smbc/user-management-client";

type User = components["schemas"]["User"];
type CreateUserRequest = components["schemas"]["CreateUserRequest"];
type UserList = components["schemas"]["UserList"];
```

## Development

```bash
# Generate types and mocks from OpenAPI schema
npm run generate

# Build the package
npm run build

# Watch mode
npm run dev
```

## Configuration

### Custom Headers

```tsx
const client = createApiClient({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: `Bearer ${token}`,
    "X-Custom-Header": "value",
  },
});
```