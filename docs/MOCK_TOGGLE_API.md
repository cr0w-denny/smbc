# Mock Toggle API Configuration

The mock toggle feature now switches between MSW mocks and real API endpoints, allowing you to test against both mock data and real backend services.

## How It Works

When you toggle the "Mock Data" feature flag:

- **Mock Mode ON**: 
  - MSW intercepts all API calls at `/api/v1`
  - API clients are configured to use local endpoints
  - Mock data stores are reset for fresh data
  
- **Mock Mode OFF**:
  - MSW is stopped and disabled
  - API clients are reconfigured to use real API endpoints
  - Calls go directly to your configured backend servers

## Configuration

### Environment Variables

The system supports a hierarchical configuration approach:

#### Option 1: Single API URL (Recommended)
```bash
# All services use the same base URL
VITE_API_URL=https://your-api-server.com/api/v1
```

#### Option 2: Service-Specific Overrides
```bash
# Default for all services
VITE_API_URL=https://main-api.yourcompany.com/api/v1

# Override specific services if needed
VITE_PRODUCT_CATALOG_API_URL=https://catalog-api.yourcompany.com/api/v1
```

### Configuration Priority

1. **Service-specific URL** (e.g., `VITE_USER_MANAGEMENT_API_URL`)
2. **Global API URL** (`VITE_API_URL`)
3. **Default fallback** (`http://localhost:3001/api/v1`)

### Default Endpoints

- **Mock Mode**: `/api/v1` (intercepted by MSW)
- **Real Mode**: Uses environment configuration or `http://localhost:3001/api/v1`

## Usage Examples

### Simple Development Setup (Recommended)

```bash
# .env - Single backend server
VITE_API_URL=http://localhost:8000/api/v1
```

### Staging Environment

```bash
# .env - Point to staging
VITE_API_URL=https://staging-api.company.com/api/v1
```

### Production Environment

```bash
# .env - Production API
VITE_API_URL=https://api.company.com/api/v1
```

### Mixed Environment (Different Services)

```bash
# .env - Most services use main API, catalog uses dedicated service
VITE_API_URL=https://main-api.company.com/api/v1
VITE_PRODUCT_CATALOG_API_URL=https://catalog-api.company.com/api/v1
```

### API Gateway Setup

```bash
# .env - All services through gateway
VITE_API_URL=https://api-gateway.company.com/api/v1
```

## Implementation Details

### API Client Reconfiguration

When the mock toggle changes, the system:

1. Switches endpoint configuration (`switchToMockEndpoints()` / `switchToRealEndpoints()`)
2. Recreates API client instances with new base URLs (`updateApiClients()`)
3. Clears React Query cache to avoid stale data
4. Starts/stops MSW worker as needed

### Console Logging

The system provides clear console output when switching:

```
🎭 Setting up mock environment...
📡 Switched to mock endpoints: {userManagement: "/api/v1", productCatalog: "/api/v1"}
🔄 API clients reconfigured with endpoints: {userManagement: "/api/v1", productCatalog: "/api/v1"}
✅ MSW worker started successfully
```

```
🌐 Setting up real API environment...
📡 Switched to real endpoints: {userManagement: "http://localhost:3001/api/v1", productCatalog: "http://localhost:3002/api/v1"}
🔄 API clients reconfigured with endpoints: {userManagement: "http://localhost:3001/api/v1", productCatalog: "http://localhost:3002/api/v1"}
✅ MSW worker stopped
```

## Adding New Services

To add a new service to the mock toggle system:

1. **Add endpoint configuration** in `apps/mui-host-dev/src/api-config.ts`:
   ```typescript
   export interface ApiEndpoints {
     userManagement: string;
     productCatalog: string;
     yourNewService: string; // Add this
   }
   ```

2. **Update endpoint defaults**:
   ```typescript
   const REAL_ENDPOINTS: ApiEndpoints = {
     userManagement: process.env.VITE_USER_MANAGEMENT_API_URL || "http://localhost:3001/api/v1",
     productCatalog: process.env.VITE_PRODUCT_CATALOG_API_URL || "http://localhost:3002/api/v1",
     yourNewService: process.env.VITE_YOUR_NEW_SERVICE_API_URL || "http://localhost:3003/api/v1",
   };
   ```

3. **Add client reconfiguration** in `updateApiClients()`:
   ```typescript
   const yourNewServiceApi = await import("@smbc/your-new-service-api/client");
   yourNewServiceApi.configureClient(currentEndpoints.yourNewService);
   ```

4. **Make your API client configurable** (follow the pattern in existing clients):
   ```typescript
   // In your-new-service/api/client.ts
   let apiClient = createApiClient<paths>();
   
   export function configureClient(baseUrl: string): void {
     apiClient = createApiClient<paths>({ baseUrl });
   }
   
   export { apiClient };
   ```

## Benefits

- **Seamless Testing**: Switch between mock and real data without code changes
- **Environment Flexibility**: Point to different backend environments
- **Development Efficiency**: Use mocks for UI development, real APIs for integration testing
- **No Code Changes**: Toggle behavior via UI, no restart required
- **Clear Visibility**: Console logging shows exactly what's happening