# Applet Development

## Creating New Applets

```bash
npm run create:applet
```

## Applet Structure

```
applets/your-applet/
├── api/           # TypeSpec schema definition
├── api-client/    # Generated TypeScript client + mocks
├── mui/           # React UI components
└── django/        # Backend implementation
```

## API Definition

Define your API schema using TypeSpec:

```typescript
// api/main.tsp
import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

model User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

model CreateUserRequest {
  name: string;
  email: string;
  role: "admin" | "user";
}

@route("/users")
interface Users {
  @get list(): User[];
  @post create(@body user: CreateUserRequest): User;
  @get read(@path id: string): User;
  @patch update(@path id: string, @body user: Partial<User>): User;
  @delete remove(@path id: string): void;
}
```

## Client Generation

Generate TypeScript client and mocks:

```bash
cd applets/your-applet/api-client
npm run generate:api
```

This creates:

- `src/generated/types.ts` - TypeScript types
- `src/mocks/index.ts` - MSW mock handlers
- `src/client.ts` - API client configuration

## UI Components

Build React components using the generated client:

```typescript
// mui/src/components/UserList.tsx
import { useUserClient } from '../hooks/useUserClient'

export function UserList() {
  const client = useUserClient()
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => client.users.list()
  })

  return (
    <DataGrid
      rows={users}
      columns={[
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'role', headerName: 'Role' }
      ]}
    />
  )
}
```

## Applet Configuration

Export your applet configuration:

```typescript
// mui/src/index.ts
import { UserList } from "./components/UserList";

export default {
  id: "user-management",
  label: "User Management",
  routes: [
    {
      path: "/users",
      component: UserList,
      permissions: ["VIEW_USERS"],
    },
  ],
  permissions: [
    { id: "VIEW_USERS", label: "View Users" },
    { id: "EDIT_USERS", label: "Edit Users" },
  ],
};
```

## Permission System

Define permissions for your applet:

```typescript
// mui/src/permissions.ts
export const permissions = [
  {
    id: "VIEW_USERS",
    label: "View Users",
    description: "Can view user list and details",
  },
  {
    id: "EDIT_USERS",
    label: "Edit Users",
    description: "Can create, update, and delete users",
  },
];
```

## Mock Development

Use MSW for backend-independent development:

```typescript
// api-client/src/mocks/custom.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "John Doe", email: "john@example.com", role: "admin" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", role: "user" },
    ]);
  }),

  http.post("/api/users", async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json({
      id: Math.random().toString(),
      ...newUser,
    });
  }),
];
```
