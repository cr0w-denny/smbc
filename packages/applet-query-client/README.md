# @smbc/applet-query-client

Shared TanStack Query provider for SMBC applets.

## Usage

### Basic Setup

```typescript
import { AppletQueryProvider } from '@smbc/applet-query-client';

function App() {
  return (
    <AppletQueryProvider>
      <UserManagement />
      <ProductCatalog />
    </AppletQueryProvider>
  );
}
```

### With External QueryClient

```typescript
import { AppletQueryProvider } from '@smbc/applet-query-client';
import { QueryClient } from '@tanstack/react-query';

const existingQueryClient = new QueryClient();

function App() {
  return (
    <AppletQueryProvider queryClient={existingQueryClient}>
      <YourApplets />
    </AppletQueryProvider>
  );
}
```

### Development with Mocks

```typescript
<AppletQueryProvider
  enableMocks={true}
  apiConfig={{
    baseUrl: 'http://localhost:8080',
    headers: { 'Authorization': 'Bearer dev-token' }
  }}
>
  <YourApp />
</AppletQueryProvider>
```

## Configuration

### Custom Loading States

```typescript
<AppletQueryProvider
  loadingComponent={<CustomLoadingSpinner />}
  errorComponent={(error) => <CustomErrorDisplay error={error} />}
>
  <YourApp />
</AppletQueryProvider>
```

### Environment Configuration

```typescript
<AppletQueryProvider
  enableMocks={import.meta.env.DEV}
  apiConfig={{
    baseUrl: import.meta.env.VITE_API_URL,
    headers: {
      'X-Environment': import.meta.env.MODE,
    }
  }}
>
  <YourApp />
</AppletQueryProvider>
```

## Cross-Applet Data Sharing

### Shared Cache

```typescript
// In User Management applet
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});

// In Product Catalog applet - same data is cached
const { data: cachedUser } = useQuery({
  queryKey: ["user", userId], // Same key = shared cache
  queryFn: () => fetchUser(userId),
});
```

### Cache Invalidation

```typescript
const updateUser = useMutation({
  mutationFn: updateUserApi,
  onSuccess: () => {
    // Invalidates cache for all applets using this user
    queryClient.invalidateQueries(["user", userId]);
  },
});
```

## Mock Integration

The provider automatically:

1. Aggregates mock handlers from all applets
2. Starts MSW worker in development
3. Disables mocks in production builds
4. Provides loading states during MSW initialization

### Mock Development

```typescript
// applets/user-management/api-client/src/mocks/index.ts
export const userManagementHandlers = [
  rest.get("/api/users", (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),
];

// Automatically aggregated by AppletQueryProvider
```

## API Reference

### AppletQueryProvider Props

```typescript
interface AppletQueryProviderProps {
  children: ReactNode;
  queryClient?: QueryClient;
  enableMocks?: boolean;
  loadingComponent?: ReactNode;
  errorComponent?: (error: string) => ReactNode;
  apiConfig?: {
    baseUrl?: string;
    headers?: Record<string, string>;
  };
}
```

### useAppletQuery Hook

```typescript
const { queryClient, isReady, mswEnabled } = useAppletQuery();

// queryClient: The shared QueryClient instance
// isReady: Whether the provider is fully initialized
// mswEnabled: Whether MSW mocks are currently active
```