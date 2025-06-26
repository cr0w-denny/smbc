# Applet Development Guide

This guide covers building custom applets for the SMBC Applets Platform, from initial setup to production deployment.

## 🚀 Quick Start: New Applet

Create a complete business domain applet in 15 minutes:

```bash
# Generate applet structure (interactive mode)
npm run create:applet
```

## 🏗️ Applet Structure

Each applet follows a standardized structure for consistency and tooling:

```
applets/your-applet/
├── api/                          # API First Development
│   ├── main.tsp                  # TypeSpec schema definition
│   ├── models/                   # Data model definitions
│   ├── operations/               # API endpoint definitions
│   └── tsp-output/               # Generated OpenAPI JSON
├── api-client/                   # Generated TypeScript Client
│   ├── src/generated/            # Auto-generated types & client
│   ├── src/mocks/                # MSW mock handlers
│   ├── src/client.ts             # Client configuration
│   └── package.json              # Client package config
├── mui/                          # React UI Components
│   ├── src/components/           # Business logic components
│   ├── src/permissions.ts        # Permission definitions
│   ├── src/index.ts              # Applet exports
│   └── package.json              # Package config
└── django/                       # Backend Implementation
    ├── models.py                 # Django data models
    ├── views.py                  # API endpoint implementations
    ├── serializers.py            # Data serialization
    ├── urls.py                   # URL routing
    └── requirements.txt          # Python dependencies
```

## 📝 Step 1: Define Your API

Start with API-first development using TypeSpec:

```typescript
// applets/product-catalog/api/main.tsp
import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service({
  title: "Product Catalog API",
  version: "1.0.0",
})
namespace ProductCatalog;

model Product {
  id: string;
  name: string;
  description?: string;
  price: decimal;
  category: string;
  inStock: boolean;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model CreateProductRequest {
  name: string;
  description?: string;
  price: decimal;
  category: string;
}

@route("/products")
interface Products {
  @get list(): Product[];
  @post create(@body product: CreateProductRequest): Product;
  @get get(@path id: string): Product;
  @put update(@path id: string, @body product: CreateProductRequest): Product;
  @delete remove(@path id: string): void;
}
```

### Generate Client Code

```bash
cd applets/product-catalog
npm run generate  # Generates TypeScript client, types, and mocks
```

This creates:

- **Types**: `api-client/src/generated/types.ts`
- **Client**: `api-client/src/generated/client.ts`
- **Mocks**: `api-client/src/mocks/handlers.ts`

## 🎨 Step 2: Build UI Components

Create React components using the generated client:

```typescript
// applets/product-catalog/mui/src/components/ProductList.tsx
import { useQuery } from '@tanstack/react-query'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useProductCatalogClient } from '@smbc/product-catalog-api-client'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Product Name', width: 200 },
  { field: 'category', headerName: 'Category', width: 150 },
  { field: 'price', headerName: 'Price', width: 100, type: 'number' },
  { field: 'inStock', headerName: 'In Stock', width: 100, type: 'boolean' },
]

export function ProductList() {
  const client = useProductCatalogClient()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => client.products.list()
  })

  return (
    <DataGrid
      rows={products}
      columns={columns}
      loading={isLoading}
      pageSizeOptions={[25, 50, 100]}
      checkboxSelection
      disableRowSelectionOnClick
    />
  )
}
```

### Add Permissions

Define granular permissions for your applet:

```typescript
// applets/product-catalog/mui/src/permissions.ts
export const PRODUCT_PERMISSIONS = {
  VIEW_PRODUCTS: "VIEW_PRODUCTS",
  EDIT_PRODUCTS: "EDIT_PRODUCTS",
  DELETE_PRODUCTS: "DELETE_PRODUCTS",
  MANAGE_CATEGORIES: "MANAGE_CATEGORIES",
} as const;

export type ProductPermission = keyof typeof PRODUCT_PERMISSIONS;
```

#### Permission Design Best Practices

**Use Action-Oriented Names:**

```typescript
// ✅ Good - Clear actions
VIEW_PRODUCTS: "Can view product catalog";
CREATE_PRODUCTS: "Can add new products";
EDIT_PRODUCT_PRICING: "Can modify product prices";
MANAGE_CATEGORIES: "Can create/edit categories";

// ❌ Bad - Too broad
PRODUCT_ACCESS: "Can access products";
ADMIN_PRODUCTS: "Product administrator";
```

**Design for Growth:**

```typescript
// ✅ Room for future features
VIEW_ORDERS: "Can view order history";
PROCESS_ORDERS: "Can fulfill and ship orders";
REFUND_ORDERS: "Can issue refunds";
CANCEL_ORDERS: "Can cancel pending orders";

// Instead of just:
// ORDER_ACCESS: "Can work with orders"
```

**Common Permission Patterns:**

```typescript
// Data Operations
VIEW_[RESOURCE]: "Read access"
CREATE_[RESOURCE]: "Create new items"
EDIT_[RESOURCE]: "Modify existing items"
DELETE_[RESOURCE]: "Remove items"

// Administrative
MANAGE_[FEATURE]: "Full control over feature"
CONFIGURE_[SETTINGS]: "Change configuration"
EXPORT_[DATA]: "Download/export capabilities"
```

### Permission-Aware Components

```typescript
import { usePermissions } from '@smbc/mui-applet-core'
import { PRODUCT_PERMISSIONS } from '../permissions'

export function ProductActions({ productId }: { productId: string }) {
  const { hasPermission } = usePermissions()

  return (
    <Stack direction="row" spacing={1}>
      {hasPermission(PRODUCT_PERMISSIONS.EDIT_PRODUCTS) && (
        <IconButton onClick={() => editProduct(productId)}>
          <EditIcon />
        </IconButton>
      )}
      {hasPermission(PRODUCT_PERMISSIONS.DELETE_PRODUCTS) && (
        <IconButton onClick={() => deleteProduct(productId)}>
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  )
}
```

## 🔄 Step 3: Create Mock Data

Develop with realistic mock data using MSW:

```typescript
// applets/product-catalog/api-client/src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";

const products = Array.from({ length: 50 }, () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  price: parseFloat(faker.commerce.price()),
  category: faker.commerce.department(),
  inStock: faker.datatype.boolean(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

export const productCatalogHandlers = [
  http.get("/api/products", () => {
    return HttpResponse.json(products);
  }),

  http.post("/api/products", async ({ request }) => {
    const newProduct = await request.json();
    const product = {
      id: faker.string.uuid(),
      ...newProduct,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(product);
    return HttpResponse.json(product, { status: 201 });
  }),

  http.get("/api/products/:id", ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    return product
      ? HttpResponse.json(product)
      : HttpResponse.json({ error: "Product not found" }, { status: 404 });
  }),
];
```

## 🎯 Step 4: Export Your Applet

Make your applet available to host applications:

```typescript
// applets/product-catalog/mui/src/index.ts
export { ProductList } from "./components/ProductList";
export { ProductForm } from "./components/ProductForm";
export { ProductDetail } from "./components/ProductDetail";

export { PRODUCT_PERMISSIONS } from "./permissions";

// Main applet export
export const productCatalogApplet = {
  name: "product-catalog",
  displayName: "Product Catalog",
  routes: [
    { path: "/", component: ProductList, permission: "VIEW_PRODUCTS" },
    { path: "/new", component: ProductForm, permission: "EDIT_PRODUCTS" },
    { path: "/:id", component: ProductDetail, permission: "VIEW_PRODUCTS" },
    { path: "/:id/edit", component: ProductForm, permission: "EDIT_PRODUCTS" },
  ],
  permissions: PRODUCT_PERMISSIONS,
  navigationItems: [
    { label: "Products", path: "/", icon: "inventory" },
    { label: "Categories", path: "/categories", icon: "category" },
  ],
};
```

## 🔧 Step 5: Development Workflow

### Live Development

```bash
# Start development environment
npm run dev

# Your applet is automatically available at:
# http://localhost:3000/product-catalog
```

The development server includes:

- **Hot reload** for component changes
- **Mock API responses** for immediate development
- **Permission testing** with different user roles
- **Type checking** with instant feedback

### Testing

```typescript
// applets/product-catalog/mui/src/components/__tests__/ProductList.test.tsx
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductList } from '../ProductList'
import { productCatalogHandlers } from '@smbc/product-catalog-api-client/mocks'
import { setupServer } from 'msw/node'

const server = setupServer(...productCatalogHandlers)
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('renders product list', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <ProductList />
    </QueryClientProvider>
  )

  expect(await screen.findByText(/Product Name/i)).toBeInTheDocument()
})
```

### Building

```bash
# Build your applet for distribution
npm run build

# This creates optimized packages:
# - @smbc/product-catalog-api-client
# - @smbc/product-catalog-mui
```

## 🚀 Step 6: Host Integration

### Use in Greenfield Apps

```typescript
import { createApp } from "@smbc/mui-host";

createApp({
  config: {
    applets: [
      "@smbc/user-management-mui",
      "@smbc/product-catalog-mui", // Your new applet
    ],
    roles: ["Guest", "Staff", "Admin"],
    permissions: {
      permissionMappings: {
        "product-catalog": {
          VIEW_PRODUCTS: ["Staff", "Admin"],
          EDIT_PRODUCTS: ["Admin"],
          DELETE_PRODUCTS: ["Admin"],
        },
      },
    },
  },
});
```

### Add to Existing Apps

```typescript
import { AppletRoute } from '@smbc/mui-host'

<Routes>
  <Route path="/products/*" element={<AppletRoute applet="product-catalog" />} />
</Routes>
```

## 🔧 Advanced Development

### Custom Hooks

Create reusable data fetching hooks:

```typescript
// applets/product-catalog/mui/src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductCatalogClient } from "@smbc/product-catalog-api-client";

export function useProducts() {
  const client = useProductCatalogClient();

  return useQuery({
    queryKey: ["products"],
    queryFn: () => client.products.list(),
  });
}

export function useCreateProduct() {
  const client = useProductCatalogClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product) => client.products.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
    },
  });
}
```

### Complex Forms

Build sophisticated forms with validation:

```typescript
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
})

export function ProductForm({ productId }: { productId?: string }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(productSchema)
  })

  const createProduct = useCreateProduct()

  const onSubmit = (data) => {
    createProduct.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Product Name"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      {/* More form fields */}
    </form>
  )
}
```

### Backend Integration

Connect to real APIs in production:

```typescript
// applets/product-catalog/api-client/src/client.ts
import { createApiClient } from '@smbc/react-openapi-client'

export function createProductCatalogClient(config: ClientConfig) {
  return createApiClient({
    baseUrl: config.apiBaseUrl || '/api',
    spec: productCatalogOpenApiSpec,
    defaultHeaders: {
      'Content-Type': 'application/json',
      ...config.headers
    }
  })
}

// In host app
<AppletProvider
  config={{
    api: {
      baseUrl: 'https://api.smbcgroup.com',
      endpoints: {
        'product-catalog': '/v1/products'
      }
    }
  }}
>
```

## 📦 Distribution

### Package Publishing

```bash
# Publish to npm registry
npm run changeset:publish

# Or publish specific packages
npm publish --workspace=@smbc/product-catalog-api-client
npm publish --workspace=@smbc/product-catalog-mui
```

### Versioning Strategy

```json
{
  "name": "@yourcompany/product-catalog-mui",
  "version": "1.2.3",
  "peerDependencies": {
    "@smbc/mui-applet-core": "^1.0.0",
    "@smbc/mui-components": "^1.0.0"
  }
}
```

## 🧪 Testing Strategy

### Unit Tests

- Component rendering
- Hook behavior
- Utility functions

### Integration Tests

- API client integration
- Permission enforcement
- Form submissions

### E2E Tests

- Complete user workflows
- Cross-applet interactions
- Permission scenarios
