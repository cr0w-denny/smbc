# Mock Generation Scripts

Schema-driven MSW mock generator that analyzes OpenAPI specifications to create realistic, type-safe mock data.

## Features

- **Schema Intelligence**: Auto-detects field types (email, name, price) from property names and formats
- **Relationship Mapping**: Identifies foreign keys and generates related data
- **Smart Filtering**: Creates intelligent search/filter endpoints
- **Zero Configuration**: Works with any valid OpenAPI spec
- **Constraint Awareness**: Respects min/max, enums, patterns

## Usage

### CLI (Recommended)

```bash
# Basic generation
pnpm run generate-mocks -- ./openapi.json ./src/mocks/index.ts

# With options
pnpm run generate-mocks -- ./spec.json ./mocks.ts \
  --base-url "/api/v1" \
  --package-name "user-service" \
  --verbose
```

### Programmatic

```typescript
import { MockGenerator } from "../scripts/mock-generation/generator";

const generator = new MockGenerator(openApiSpec, {
  baseUrl: "/api/v1",
  errorRate: 0.05,
});

const handlers = generator.generateHandlers();
```

## Schema Analysis

### Field Detection

```yaml
# OpenAPI Schema
User:
  properties:
    id: { type: string, format: uuid }
    firstName: { type: string }
    email: { type: string, format: email }
    isActive: { type: boolean }
```

**Generated Mock:**

```javascript
function generateMockUser() {
  return {
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    email: faker.internet.email(),
    isActive: faker.datatype.boolean(),
  };
}
```

### Relationships

```yaml
Order:
  properties:
    customerId: { type: string } # Foreign key detected
    items: # One-to-many detected
      type: array
      items: { $ref: "#/components/schemas/OrderItem" }
```

## Configuration

```typescript
const config = {
  baseUrl: "/api/v1",
  delay: { min: 0, max: 100 },
  errorRate: 0.05,
  dataSetSize: { min: 20, max: 50 },
};
```

## Custom Overrides

Generated `custom.ts` file allows customization:

```typescript
export function updateConfig(defaultConfig) {
  return {
    delay: { min: 100, max: 500 },
  };
}

export const customHandlers = [
  http.post("/api/orders", async ({ request }) => {
    const order = await request.json();

    // Custom validation
    if (!order.items?.length) {
      return HttpResponse.json(
        { error: "Order must contain items" },
        { status: 400 }
      );
    }

    return HttpResponse.json(generateMockOrder(order), { status: 201 });
  }),
];
```

## Usage

### Applet Development

```bash
# 1. Generate from TypeSpec
npm run build --workspace=@smbc/user-management-api

# 2. Generate mocks
pnpm run generate-mocks -- ./api/openapi.json ./src/mocks/index.ts \
  --base-url "/api/v1" --package-name user-management

# 3. Develop with mocks
npm run dev
```

### Multi-Applet Setup

MSW handlers from each applet are automatically registered:

```typescript
// Host app automatically combines handlers
import { registerMswHandlers } from "@smbc/shared-query-client";
import { handlers as userHandlers } from "@smbc/user-management-client";
import { handlers as productHandlers } from "@smbc/product-catalog-client";

registerMswHandlers([...userHandlers, ...productHandlers]);
```

## Best Practices

- Use descriptive property names (`firstName` vs `fname`)
- Include OpenAPI formats (`date-time`, `email`, `uuid`)
- Define enums for categorical fields
- Use `custom.ts` for business logic and stateful mocks
- Set `delay: { min: 0, max: 0 }` for instant development responses
