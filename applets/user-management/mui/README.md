# @smbc/user-management-mui

A comprehensive React MUI applet for user management, serving as a reference implementation for the SMBC applet architecture.

## 🚀 Quick Start

```bash
npm install @smbc/user-management-mui
```

### Basic Usage

```tsx
import userManagementApplet from "@smbc/user-management-mui";

// Use in applet host - this is the intended usage
<AppletHost applets={[userManagementApplet]} />;
```

## ✨ Features

This applet provides a comprehensive user management solution:

- ✅ **Full CRUD operations** (Create, Read, Update, Delete)
- ✅ **Advanced filtering** with search, status, email filters
- ✅ **Sorting** by multiple fields with customizable order
- ✅ **Pagination** with configurable page sizes
- ✅ **Permission-based access control**
- ✅ **Responsive design** that works on all screen sizes
- ✅ **Real-time updates** with optimistic UI
- ✅ **Loading states** and error handling
- ✅ **User profile views** with real data fetching
- ✅ **Multiple view modes** (summary/detailed)

## 🛠 Advanced Usage

### Applet Configuration

The applet can be configured through its props when used in an applet host:

```tsx
// Configure applet behavior through host
const userManagementConfig = {
  ...userManagementApplet,
  // Applet-level configuration goes here
};

<AppletHost applets={[userManagementConfig]} />;
```

### Permission System

The applet integrates with the SMBC permission system:

```tsx
import userManagementApplet from "@smbc/user-management-mui";

// Permissions are defined within the applet and automatically
// handled by the applet host - no manual setup required
const { permissions } = userManagementApplet;
```

## 🎨 Customization

### Styling

The applet uses Material-UI's theming system and will inherit themes from the applet host:

```tsx
// Theme is provided by the applet host
<AppletHost theme={customTheme} applets={[userManagementApplet]} />
```

## 🏗 Architecture

This applet demonstrates several key architectural patterns:

### Clear Entry Points

The applet follows a clear structure with the main entry point easily discoverable at `src/Applet.tsx`. This makes it immediately obvious to developers where the applet's entry point is located:

```
src/
├── Applet.tsx             # 🚀 Main applet entry point
├── index.ts               # Package exports
├── permissions.ts         # Permission definitions
└── components/
    ├── UserManager/       # Complete user management interface
    │   ├── index.tsx      # Main component (clean & focused)
    │   ├── config/        # Modular configuration
    │   │   ├── api.ts     # API configuration
    │   │   ├── schema.ts  # Data schema
    │   │   ├── columns.tsx # Column definitions
    │   │   ├── filters.ts # Filter configuration
    │   │   ├── actions.ts # Action definitions
    │   │   └── forms.ts   # Form configurations
    │   └── hooks/         # Custom hooks
    │       ├── useUserPermissions.ts
    │       └── useUserManagerConfig.ts
    └── UserProfile.tsx    # User profile component
```

### Type Safety

All components use strict TypeScript types generated from TypeSpec schemas:

```tsx
import { type components } from "@smbc/user-management-client";

type User = components["schemas"]["User"];
```

### Data Fetching Patterns

- **React Query integration** for caching and synchronization
- **Optimistic updates** for better UX
- **Error boundaries** for graceful error handling
- **Loading states** with skeletons

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Example Tests

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppletHost } from "@smbc/mui-applet-host";
import userManagementApplet from "@smbc/user-management-mui";

describe("User Management Applet", () => {
  it("displays user management interface when loaded", async () => {
    render(<AppletHost applets={[userManagementApplet]} />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  it("respects permission configurations", async () => {
    // Test applet behavior through the host
  });
});
```

## 📚 API Reference

### TypeSpec Schema

The applet uses TypeSpec-generated types from the user management API:

```typescript
// User model
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// API endpoints
GET    /users          # List users with filtering
POST   /users          # Create new user
GET    /users/{id}     # Get user by ID
PATCH  /users/{id}     # Update user
DELETE /users/{id}     # Delete user
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Mock Data

The applet includes MSW (Mock Service Worker) integration for development:

```tsx
// Mock handlers are automatically generated from OpenAPI spec
import { handlers } from "@smbc/user-management-mui/mocks";

// Setup MSW in your app
setupWorker(...handlers).start();
```

## 📋 Common Recipes

### Permission-Based Usage

```tsx
// The applet automatically adapts based on user permissions
// No need to manually configure - handled by the applet host
<AppletHost
  applets={[userManagementApplet]}
  userPermissions={currentUserPermissions}
/>
```

### Multiple Applet Integration

```tsx
// Use alongside other applets
<AppletHost
  applets={[
    userManagementApplet,
    productCatalogApplet,
    // ... other applets
  ]}
/>
```

## 🚨 Troubleshooting

### Common Issues

**Q: Applet shows no data**
A: Check that the API client is properly configured and the mock service worker is running in development.

**Q: Permission errors**
A: Ensure the applet host is properly configured with user permissions.

**Q: Type errors**
A: Make sure you're using the latest generated types from the API client package.

## 🤝 Contributing

This applet serves as a reference implementation. When making changes:

1. Ensure backward compatibility
2. Add comprehensive tests
3. Update documentation
4. Follow the established patterns

## 📄 License

MIT License - see LICENSE file for details.
