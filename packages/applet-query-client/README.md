# @smbc/applet-query-client

**Single QueryClient for All SMBC Applets**

A centralized TanStack Query provider that enables efficient data sharing, caching, and mock integration across multiple independent applets.

## Architecture

Single QueryClient shared across all SMBC applets:

```typescript
<AppletQueryProvider>
  <UserManagement />     // Shares the same QueryClient
  <ProductCatalog />     // Shares the same QueryClient
  {/* All applets */}    // All share the same instance
</AppletQueryProvider>
```

## Key Features

### 🚀 **Performance at Scale**

- **Single QueryClient Instance**: Shared across all applets
- **Cross-Applet Caching**: User data cached once, accessible everywhere
- **Memory Efficient**: Significant reduction in QueryClient memory usage
- **Automatic Deduplication**: Identical requests merged across applets

### 🎭 **Integrated Mocking System**

- **MSW Auto-Setup**: Automatically configures Mock Service Worker
- **Development Mode**: Mocks enabled automatically in dev
- **Production Mode**: Mocks disabled automatically in production
- **Mock Aggregation**: Combines handlers from all applets

### 🔌 **Simple Integration**

- **Drop-in Replacement**: Replace QueryClientProvider with AppletQueryProvider
- **Backward Compatible**: Existing TanStack Query code works unchanged
- **Zero Configuration**: Works out of the box with sensible defaults

## Quick Start

### Basic Usage

```typescript
import { AppletQueryProvider } from '@smbc/applet-query-client';
import { UserManagement } from '@smbc/user-management-mui';
import { ProductCatalog } from '@smbc/product-catalog-mui';

function App() {
  return (
    <AppletQueryProvider>
      <UserManagement />
      <ProductCatalog />
      {/* All applets automatically share the same QueryClient */}
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

## Advanced Configuration

### Custom Loading States

```typescript
<AppletQueryProvider
  loadingComponent={<CustomLoadingSpinner />}
  errorComponent={(error) => <CustomErrorDisplay error={error} />}
>
  <YourApp />
</AppletQueryProvider>
```

### Environment-Based Configuration

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

### Shared Cache Example

```typescript
// In User Management applet
const { data: user } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});

// In Product Catalog applet - same user data is cached!
const { data: cachedUser } = useQuery({
  queryKey: ["user", userId], // Same key = shared cache
  queryFn: () => fetchUser(userId),
});
```

### Cache Invalidation Across Applets

```typescript
// User Management updates user
const updateUser = useMutation({
  mutationFn: updateUserApi,
  onSuccess: () => {
    // Invalidates cache for ALL applets using this user
    queryClient.invalidateQueries(["user", userId]);
  },
});
```

## Mock Integration

### Automatic MSW Setup

The provider automatically:

1. **Aggregates mock handlers** from all applets
2. **Starts MSW worker** in development
3. **Disables mocks** in production builds
4. **Provides loading states** during MSW initialization

### Mock Development Flow

```typescript
// applets/user-management/api-client/src/mocks/index.ts
export const userManagementHandlers = [
  rest.get("/api/users", (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  }),
];

// Automatically aggregated by AppletQueryProvider
// No manual setup required!
```

## Production Optimizations

### Automatic Mock Exclusion

```typescript
// Vite automatically sets VITE_DISABLE_MSW=true in production
// MSW code is tree-shaken out of production bundles

const isProduction = import.meta.env.VITE_DISABLE_MSW;
// Provider automatically respects this flag
```

### Bundle Size Impact

- **Development**: Includes MSW and mock handlers
- **Production**: MSW code eliminated via tree-shaking
- **Size Difference**: ~150KB savings in production

## API Reference

### AppletQueryProvider Props

```typescript
interface AppletQueryProviderProps {
  children: ReactNode;

  /** External QueryClient to use instead of creating new one */
  queryClient?: QueryClient;

  /** Enable MSW mocks (default: true in dev, false in prod) */
  enableMocks?: boolean;

  /** Custom loading component during MSW setup */
  loadingComponent?: ReactNode;

  /** Custom error component for MSW failures */
  errorComponent?: (error: string) => ReactNode;

  /** Global API configuration */
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

## Architecture Benefits

### Cache Efficiency

- **SMBC**: Single cache shared across all applets
- **Benefit**: Dramatic reduction in network requests and memory usage
- **Shared Cache**: Cross-team data sharing without coordination

### Developer Experience

- **Zero Configuration**: Works out of the box
- **Hot Reload**: MSW mocks update automatically
- **Type Safety**: Full TypeScript support
- **Debugging**: Single QueryClient for easy debugging

### Production Ready

- **Automatic Optimization**: Mocks removed in production
- **Monitoring**: Single point for query observability
