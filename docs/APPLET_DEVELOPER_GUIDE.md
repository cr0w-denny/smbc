# SMBC Applet Developer Guide

A comprehensive guide to understanding, creating, and deploying SMBC applets.

## Table of Contents

1. [What Are Applets?](#what-are-applets)
2. [Core Concepts](#core-concepts)
3. [Getting Started](#getting-started)
4. [Applet Architecture](#applet-architecture)
5. [Permissions System](#permissions-system)
6. [Development Workflow](#development-workflow)
7. [Integration with Hosts](#integration-with-hosts)
8. [API Integration](#api-integration)
9. [Routing and Navigation](#routing-and-navigation)
10. [Testing and Development](#testing-and-development)
11. [Best Practices](#best-practices)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

## What Are Applets?

### Definition

**Applets** are self-contained, reusable UI applications that can be embedded into host applications. Think of them as "micro-frontends" that provide specific business functionality while integrating seamlessly with larger applications.

### Purpose

Applets solve several key problems:

1. **Code Reuse**: Write once, deploy anywhere - the same applet can run in multiple host applications
2. **Team Independence**: Different teams can develop applets independently without coordination
3. **Technology Consistency**: Standardized patterns for common functionality (user management, reporting, etc.)
4. **Rapid Development**: Pre-built applets accelerate new application development
5. **Maintainability**: Updates to an applet automatically benefit all consuming applications

### Real-World Example

Instead of every application building its own user management screens, you can:

```typescript
// Install the user management applet
npm install @smbc/user-management-mui

// Integrate it into your app
import userManagementApplet from '@smbc/user-management-mui';

// Mount it with custom configuration
export const APPLETS = [
  mountApplet(userManagementApplet, {
    id: "users",
    path: "/users",
    permissions: [userManagementApplet.permissions.VIEW_USERS],
  })
];
```

Your application now has full user management functionality without writing any user management code.

## Core Concepts

### 1. Applet vs Host

- **Applet**: The reusable component (e.g., user management, product catalog)
- **Host**: The application that embeds applets (e.g., admin dashboard, customer portal)

### 2. Self-Contained

Each applet includes:
- UI components and logic
- Permission definitions
- API specifications
- Routing configuration
- Mock data for development

### 3. Configuration-Driven

Applets are highly configurable:
- Different permission contexts
- Custom styling and branding
- Behavioral variations
- Component injection

### 4. TypeScript-First

The entire system is built with TypeScript:
- Full type safety
- IntelliSense and autocomplete
- Compile-time error checking
- Refactoring support

## Getting Started

### Prerequisites

- Node.js 18+
- TypeScript knowledge
- React 18+ experience
- Material-UI familiarity (for MUI applets)

### Create Your First Applet

```bash
# Create a new applet
npx @smbc/create-applet my-awesome-applet

# Navigate to the generated directory
cd packages/my-awesome-applet-mui

# Start development
npm run dev
```

### Generated Structure

```
my-awesome-applet-mui/
├── src/
│   ├── Applet.tsx           # Main entry component
│   ├── permissions.ts       # Permission definitions
│   ├── index.ts            # Applet export
│   └── components/         # Your components
├── package.json            # Package configuration
├── vite.config.ts         # Build configuration
└── README.md              # Documentation
```

### Your First Applet Code

The generated `src/Applet.tsx` provides a starting point:

```typescript
import React from 'react';
import { useHashNavigation } from '@smbc/applet-core';

export interface AppletProps {
  mountPath: string;
  // Add your custom props here
}

export const Applet: React.FC<AppletProps> = ({ mountPath }) => {
  const { path, navigate } = useHashNavigation({ mountPath });

  return (
    <div>
      <h1>My Awesome Applet</h1>
      <p>Current path: {path}</p>
      {/* Your applet content here */}
    </div>
  );
};
```

## Applet Architecture

### Standard Export Structure

Every applet must export a standard structure:

```typescript
// src/index.ts
import { Applet } from './Applet';
import permissions from './permissions';
import spec from '@smbc/my-awesome-applet-api';

export default {
  permissions,           // Permission definitions
  component: Applet,     // Main React component
  apiSpec: {            // API specification
    name: "My Awesome Applet API",
    spec,
  },
};
```

### Required Props Pattern

All applet components must accept these props:

```typescript
export interface AppletProps {
  /** REQUIRED: Mount path for routing */
  mountPath: string;
  /** OPTIONAL: Children (rarely used) */
  children?: React.ReactNode;
  // Your custom configuration props...
}
```

### Custom Configuration Props

Applets can define additional props for configuration:

```typescript
export interface AppletProps {
  mountPath: string;
  // Business configuration
  viewMode?: 'table' | 'cards' | 'list';
  showAdvancedFeatures?: boolean;
  // Permission configuration
  permissionContext?: string;
  // UI customization
  customHeader?: React.ComponentType<{ title: string }>;
  themeVariant?: 'compact' | 'spacious';
}
```

### Component Reuse Pattern

The same applet can be configured differently for different contexts:

```typescript
// Standard configuration
const StandardUsers = () => userManagementApplet.component({
  mountPath: "/users",
  viewMode: "table",
  showAdvancedFeatures: true,
});

// Simplified configuration
const SimpleUsers = () => userManagementApplet.component({
  mountPath: "/simple-users",
  viewMode: "cards",
  showAdvancedFeatures: false,
  permissionContext: "limited-users",
});

// Branded configuration
const BrandedUsers = () => userManagementApplet.component({
  mountPath: "/branded-users",
  customHeader: ({ title }) => <BrandedHeader title={title} />,
  themeVariant: "compact",
});
```

## Permissions System

### Permission Definition

Define your applet's permissions in `src/permissions.ts`:

```typescript
import { definePermissions } from "@smbc/applet-core";

export default definePermissions("my-awesome-applet", {
  VIEW_ITEMS: "Can view items in the applet",
  CREATE_ITEMS: "Can create new items",
  EDIT_ITEMS: "Can modify existing items",
  DELETE_ITEMS: "Can remove items",
  EXPORT_DATA: "Can export applet data",
});
```

This generates type-safe permission objects:

```typescript
{
  VIEW_ITEMS: {
    id: "my-awesome-applet:view_items",
    name: "VIEW_ITEMS",
    description: "Can view items in the applet"
  }
  // ... other permissions
}
```

### Using Permissions in Components

```typescript
import { usePermissions } from '@smbc/applet-core';
import permissions from './permissions';

export const MyComponent: React.FC = () => {
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission("my-awesome-applet", permissions.CREATE_ITEMS);
  const canDelete = hasPermission("my-awesome-applet", permissions.DELETE_ITEMS);

  return (
    <div>
      {canCreate && <CreateButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
};
```

### Host Permission Configuration

Hosts configure which roles can access your applet's permissions:

```typescript
// In host application
const permissionRequirements = createPermissionRequirements({
  "my-awesome-applet": minRole(myAwesomeApplet, {
    VIEW_ITEMS: "Staff",        // Staff and above can view
    CREATE_ITEMS: "Manager",    // Manager and above can create
    DELETE_ITEMS: "Admin",      // Admin and above can delete
    EXPORT_DATA: "Admin",       // Admin and above can export
  }),
});
```

### Permission Contexts

Different mounts can have different permission requirements:

```typescript
// Regular context - more permissive
"my-awesome-applet": {
  VIEW_ITEMS: "Staff",
  DELETE_ITEMS: "Manager",
}

// Sensitive context - more restrictive
"sensitive-awesome-applet": {
  VIEW_ITEMS: "Manager",
  DELETE_ITEMS: "Admin",
}
```

### Configuration-Based Permission Checking

Best practice: Check permissions at configuration level, not in JSX:

```typescript
// ✅ Good: Configuration-based
const useAppletConfig = (permissions: PermissionFlags) => {
  return {
    actions: [
      { key: 'view', label: 'View', available: true }, // Always available
      ...(permissions.canCreate ? [{ key: 'create', label: 'Create' }] : []),
      ...(permissions.canDelete ? [{ key: 'delete', label: 'Delete' }] : []),
    ],
    features: {
      showExportButton: permissions.canExport,
      enableBulkActions: permissions.canDelete,
    }
  };
};

// ❌ Avoid: Scattered JSX checks
return (
  <div>
    {hasPermission(context, permissions.CREATE_ITEMS) && <CreateButton />}
    {hasPermission(context, permissions.DELETE_ITEMS) && <DeleteButton />}
  </div>
);
```

## Development Workflow

### 1. Planning Your Applet

Before coding, define:
- **Purpose**: What business problem does this solve?
- **Scope**: What features will it include?
- **Permissions**: What actions should be permission-controlled?
- **Configuration**: How should hosts be able to customize it?
- **Data**: What APIs or data sources will it need?

### 2. Create the Applet

```bash
npx @smbc/create-applet my-feature-applet
```

### 3. Define Permissions

Update `src/permissions.ts` with your permission requirements:

```typescript
export default definePermissions("my-feature-applet", {
  VIEW_FEATURE: "Can view the feature",
  MANAGE_FEATURE: "Can create/edit the feature",
  DELETE_FEATURE: "Can delete feature items",
  CONFIGURE_FEATURE: "Can modify feature settings",
});
```

### 4. Build Your Components

Create components in `src/components/`:

```
src/components/
├── FeatureList.tsx
├── FeatureDetail.tsx
├── FeatureForm.tsx
└── FeatureSettings.tsx
```

### 5. Implement Routing

Use hash-based navigation:

```typescript
export const Applet: FC<AppletProps> = ({ mountPath }) => {
  const { path, navigate } = useHashNavigation({ mountPath });

  const renderCurrentRoute = () => {
    if (path === '') return <FeatureList />;
    if (path.startsWith('/detail/')) return <FeatureDetail />;
    if (path === '/settings') return <FeatureSettings />;
    return <NotFound />;
  };

  return (
    <div>
      <Navigation onNavigate={navigate} />
      {renderCurrentRoute()}
    </div>
  );
};
```

### 6. Integrate Permissions

Add permission checking to your components:

```typescript
const FeatureList: FC = () => {
  const { hasPermission } = usePermissions();

  const config = {
    canCreate: hasPermission("my-feature-applet", permissions.MANAGE_FEATURE),
    canDelete: hasPermission("my-feature-applet", permissions.DELETE_FEATURE),
    canConfigure: hasPermission("my-feature-applet", permissions.CONFIGURE_FEATURE),
  };

  return <DataView config={config} />;
};
```

### 7. Add API Integration

Define API types and integrate:

```typescript
// src/api/types.ts
export interface Feature {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

// src/hooks/useFeatures.ts
export const useFeatures = () => {
  const client = useApiClient<FeatureAPI>('my-feature-applet');

  return useQuery({
    queryKey: ['features'],
    queryFn: () => client.get('/features'),
  });
};
```

### 8. Test Your Applet

Create tests for your components:

```typescript
// src/__tests__/Applet.test.tsx
import { render, screen } from '@testing-library/react';
import { Applet } from '../Applet';

test('renders feature list', () => {
  render(<Applet mountPath="/test" />);
  expect(screen.getByText('Feature List')).toBeInTheDocument();
});
```

### 9. Documentation

Update your README with:
- Purpose and features
- Configuration options
- Permission requirements
- Usage examples

## Integration with Hosts

### How Hosts Discover Applets

Hosts import applets directly:

```typescript
// Host application
import myFeatureApplet from '@smbc/my-feature-applet-mui';
import userManagementApplet from '@smbc/user-management-mui';

export const APPLETS: AppletMount[] = [
  mountApplet(myFeatureApplet, {
    id: "my-features",
    label: "My Features",
    path: "/features",
    icon: StarIcon,
    permissions: [myFeatureApplet.permissions.VIEW_FEATURE],
  }),
  // ... other applets
];
```

### Host Configuration Options

Hosts can configure applets in multiple ways:

#### 1. Basic Mounting
```typescript
mountApplet(myApplet, {
  id: "basic-features",
  path: "/features",
  permissions: [myApplet.permissions.VIEW_FEATURE],
})
```

#### 2. Custom Component Configuration
```typescript
{
  id: "custom-features",
  routes: [{
    path: "/custom-features",
    component: () => myApplet.component({
      mountPath: "/custom-features",
      viewMode: "cards",
      customHeader: CustomHeader,
    }),
    permissions: [myApplet.permissions.VIEW_FEATURE],
  }]
}
```

#### 3. Multiple Contexts
```typescript
// Same applet, different configurations
const StandardFeatures = () => myApplet.component({
  mountPath: "/features",
  permissionContext: "standard-features",
});

const AdminFeatures = () => myApplet.component({
  mountPath: "/admin/features",
  permissionContext: "admin-features",
  showAdvancedOptions: true,
});
```

### Host Permission Setup

Hosts define permission mappings:

```typescript
const permissionRequirements = createPermissionRequirements({
  "my-feature-applet": minRole(myFeatureApplet, {
    VIEW_FEATURE: "Staff",
    MANAGE_FEATURE: "Manager",
    DELETE_FEATURE: "Admin",
    CONFIGURE_FEATURE: "Admin",
  }),
});

export const ROLE_CONFIG: RoleConfig = {
  roles: ["Guest", "Staff", "Manager", "Admin"],
  permissionMappings: generatePermissionMappings(
    ["Guest", "Staff", "Manager", "Admin"],
    permissionRequirements,
  ),
};
```

## API Integration

### API Specifications

Applets should include OpenAPI specifications:

```typescript
// In your applet package
export default {
  permissions,
  component: Applet,
  apiSpec: {
    name: "My Feature API",
    spec: require('@smbc/my-feature-api'),
  },
};
```

### Using API Clients

```typescript
import { useApiClient } from '@smbc/applet-core';
import { useQuery, useMutation } from '@tanstack/react-query';

export const useFeatures = () => {
  const client = useApiClient<FeatureAPI>('my-feature-applet');

  // Query for data
  const { data, isLoading } = useQuery({
    queryKey: ['features'],
    queryFn: () => client.GET('/features'),
  });

  // Mutations for changes
  const createMutation = useMutation({
    mutationFn: (feature: NewFeature) =>
      client.POST('/features', { body: feature }),
  });

  return {
    features: data?.features || [],
    isLoading,
    createFeature: createMutation.mutate,
  };
};
```

### Mock Data for Development

Provide mock handlers for development:

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/features', () => {
    return HttpResponse.json({
      features: [
        { id: '1', name: 'Feature 1', status: 'active' },
        { id: '2', name: 'Feature 2', status: 'inactive' },
      ]
    });
  }),

  http.post('/api/features', async ({ request }) => {
    const newFeature = await request.json();
    return HttpResponse.json({
      feature: { ...newFeature, id: Date.now().toString() }
    });
  }),
];
```

## Routing and Navigation

### Hash-Based Routing

Applets use hash-based routing to avoid conflicts with host routing:

```typescript
import { useHashNavigation } from '@smbc/applet-core';

export const Applet: FC<AppletProps> = ({ mountPath }) => {
  const { path, navigate } = useHashNavigation({ mountPath });

  // path will be relative to mountPath
  // e.g., if URL is /app#/features/detail/123
  // and mountPath is "/features"
  // then path will be "/detail/123"

  return (
    <div>
      <button onClick={() => navigate('/list')}>
        Go to List
      </button>
      <button onClick={() => navigate('/detail/123')}>
        Go to Detail
      </button>
    </div>
  );
};
```

### Navigation Patterns

#### 1. Simple Route Matching
```typescript
const renderCurrentRoute = () => {
  switch (path) {
    case '':
    case '/':
      return <FeatureList />;
    case '/create':
      return <FeatureForm />;
    case '/settings':
      return <FeatureSettings />;
    default:
      if (path.startsWith('/detail/')) {
        const id = path.split('/')[2];
        return <FeatureDetail id={id} />;
      }
      return <NotFound />;
  }
};
```

#### 2. Route Configuration
```typescript
const routes = [
  { path: '', component: FeatureList },
  { path: '/create', component: FeatureForm },
  { path: '/detail/:id', component: FeatureDetail },
  { path: '/settings', component: FeatureSettings },
];

const renderCurrentRoute = () => {
  const route = routes.find(r => matchPath(path, r.path));
  if (route) {
    return <route.component {...extractParams(path, route.path)} />;
  }
  return <NotFound />;
};
```

#### 3. Tab Navigation
```typescript
import { TabBar } from '@smbc/mui-components';

const tabs = [
  { id: 'list', label: 'List', path: '/list' },
  { id: 'analytics', label: 'Analytics', path: '/analytics' },
  { id: 'settings', label: 'Settings', path: '/settings' },
];

return (
  <div>
    <TabBar
      items={tabs}
      activeId={getCurrentTabId(path)}
      onItemClick={(tab) => navigate(tab.path)}
    />
    {renderCurrentRoute()}
  </div>
);
```

### Deep Linking

Applets support deep linking through the hash navigation:

```typescript
// URL: https://myapp.com/admin#/features/detail/123
// Will navigate to feature detail with ID 123

const FeatureDetail: FC<{ id: string }> = ({ id }) => {
  const feature = useFeature(id);

  return (
    <div>
      <h1>{feature?.name}</h1>
      <p>ID: {id}</p>
    </div>
  );
};
```

## Testing and Development

### Development Setup

Your applet runs in development mode:

```bash
# Start development server
npm run dev

# Run in watch mode
npm run dev:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### Testing Framework

Use the standard React testing setup:

```typescript
// src/__tests__/FeatureList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeatureList } from '../components/FeatureList';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('FeatureList', () => {
  test('displays feature list', () => {
    renderWithProviders(<FeatureList />);
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  test('handles create button click', () => {
    const mockNavigate = jest.fn();
    renderWithProviders(<FeatureList onNavigate={mockNavigate} />);

    fireEvent.click(screen.getByText('Create Feature'));
    expect(mockNavigate).toHaveBeenCalledWith('/create');
  });
});
```

### Permission Testing

Test different permission scenarios:

```typescript
import { createMockPermissions } from '@smbc/applet-core/testing';

describe('FeatureList permissions', () => {
  test('shows create button when user can manage', () => {
    const permissions = createMockPermissions({
      'my-feature-applet': ['view_feature', 'manage_feature']
    });

    renderWithProviders(<FeatureList />, { permissions });
    expect(screen.getByText('Create Feature')).toBeInTheDocument();
  });

  test('hides create button when user cannot manage', () => {
    const permissions = createMockPermissions({
      'my-feature-applet': ['view_feature']
    });

    renderWithProviders(<FeatureList />, { permissions });
    expect(screen.queryByText('Create Feature')).not.toBeInTheDocument();
  });
});
```

### Integration Testing

Test applet integration with host:

```typescript
import { createAppletHost } from '@smbc/applet-host/testing';
import myFeatureApplet from '../src';

describe('My Feature Applet Integration', () => {
  test('mounts correctly in host', () => {
    const host = createAppletHost({
      applets: [
        mountApplet(myFeatureApplet, {
          id: 'test-features',
          path: '/test-features',
        })
      ]
    });

    render(<host.App initialPath="/test-features" />);
    expect(screen.getByText('Feature List')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Design Principles

#### Single Responsibility
Each applet should focus on one business domain:

```typescript
// ✅ Good: Focused on user management
const userManagementApplet = {
  permissions: definePermissions("user-management", {
    VIEW_USERS: "View user profiles",
    MANAGE_USERS: "Create and edit users",
  }),
  // ...
};

// ❌ Avoid: Mixed responsibilities
const megaApplet = {
  permissions: definePermissions("mega-app", {
    VIEW_USERS: "View users",
    MANAGE_PRODUCTS: "Manage products",
    HANDLE_BILLING: "Process billing",
  }),
  // ...
};
```

#### Configuration Over Hardcoding
Make applets configurable rather than hardcoded:

```typescript
// ✅ Good: Configurable behavior
interface AppletProps {
  mountPath: string;
  viewMode?: 'table' | 'cards' | 'list';
  pageSize?: number;
  enableExport?: boolean;
}

// ❌ Avoid: Hardcoded behavior
const FeatureList = () => {
  const pageSize = 20; // Hardcoded
  const viewMode = 'table'; // Hardcoded
  // ...
};
```

### 2. Permission Best Practices

#### Granular Permissions
Define permissions at the right level of granularity:

```typescript
// ✅ Good: Appropriate granularity
export default definePermissions("document-management", {
  VIEW_DOCUMENTS: "View document list and details",
  CREATE_DOCUMENTS: "Upload and create new documents",
  EDIT_DOCUMENTS: "Modify existing documents",
  DELETE_DOCUMENTS: "Remove documents",
  MANAGE_CATEGORIES: "Create and modify document categories",
  SHARE_DOCUMENTS: "Share documents with others",
});

// ❌ Too granular: Hard to manage
export default definePermissions("document-management", {
  VIEW_DOCUMENT_NAME: "View document names",
  VIEW_DOCUMENT_SIZE: "View document sizes",
  VIEW_DOCUMENT_DATE: "View document dates",
  // ... 20+ micro-permissions
});

// ❌ Too broad: Not flexible enough
export default definePermissions("document-management", {
  DOCUMENT_ACCESS: "Full document access",
});
```

#### Configuration-Based Checks
Check permissions at configuration time, not render time:

```typescript
// ✅ Good: Configuration-based
const useDocumentConfig = () => {
  const { hasPermission } = usePermissions();

  return useMemo(() => ({
    actions: [
      ...(hasPermission(ctx, permissions.CREATE_DOCUMENTS)
        ? [{ key: 'create', label: 'Create Document' }]
        : []),
      ...(hasPermission(ctx, permissions.SHARE_DOCUMENTS)
        ? [{ key: 'share', label: 'Share' }]
        : []),
    ],
    features: {
      showUpload: hasPermission(ctx, permissions.CREATE_DOCUMENTS),
      showBulkActions: hasPermission(ctx, permissions.DELETE_DOCUMENTS),
    }
  }), [hasPermission]);
};

// ❌ Avoid: Runtime JSX checks
return (
  <div>
    {hasPermission(ctx, permissions.CREATE_DOCUMENTS) && <CreateButton />}
    {hasPermission(ctx, permissions.SHARE_DOCUMENTS) && <ShareButton />}
    {hasPermission(ctx, permissions.DELETE_DOCUMENTS) && <DeleteButton />}
  </div>
);
```

### 3. Component Structure

#### Separation of Concerns
Organize components by responsibility:

```
src/
├── Applet.tsx              # Main router/coordinator
├── permissions.ts          # Permission definitions
├── index.ts               # Export structure
├── components/
│   ├── DocumentList.tsx    # List view
│   ├── DocumentDetail.tsx  # Detail view
│   ├── DocumentForm.tsx    # Create/edit form
│   └── shared/
│       ├── DocumentCard.tsx
│       └── CategorySelector.tsx
├── hooks/
│   ├── useDocuments.ts     # Data fetching
│   └── useDocumentActions.ts # Business logic
├── types/
│   └── document.ts         # TypeScript types
└── __tests__/
    └── components/
```

#### Custom Hooks for Logic
Extract business logic into custom hooks:

```typescript
// hooks/useDocuments.ts
export const useDocuments = (filters?: DocumentFilters) => {
  const client = useApiClient<DocumentAPI>('documents');

  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => client.GET('/documents', { params: { query: filters } }),
  });
};

// hooks/useDocumentActions.ts
export const useDocumentActions = () => {
  const client = useApiClient<DocumentAPI>('documents');
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.DELETE('/documents/{id}', {
      params: { path: { id } }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
    },
  });

  return {
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
```

### 4. Error Handling

#### Graceful Degradation
Handle errors gracefully without breaking the applet:

```typescript
const DocumentList: FC = () => {
  const { data, error, isLoading } = useDocuments();

  if (error) {
    return (
      <ErrorBoundary fallback={
        <div>
          <h3>Unable to load documents</h3>
          <p>Please try refreshing the page or contact support.</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      } />
    );
  }

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  return <DocumentTable documents={data?.documents || []} />;
};
```

#### Error Boundaries
Wrap components in error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

export const Applet: FC<AppletProps> = ({ mountPath }) => {
  return (
    <ErrorBoundary
      fallback={<AppletErrorFallback />}
      onError={(error) => console.error('Applet error:', error)}
    >
      <AppletContent mountPath={mountPath} />
    </ErrorBoundary>
  );
};
```

### 5. Performance

#### Code Splitting
Use React lazy loading for routes:

```typescript
import { lazy, Suspense } from 'react';

const DocumentList = lazy(() => import('./components/DocumentList'));
const DocumentDetail = lazy(() => import('./components/DocumentDetail'));
const DocumentForm = lazy(() => import('./components/DocumentForm'));

const renderCurrentRoute = () => {
  const getComponent = () => {
    switch (path) {
      case '/': return <DocumentList />;
      case '/create': return <DocumentForm />;
      case '/detail/:id': return <DocumentDetail id={extractId(path)} />;
      default: return <NotFound />;
    }
  };

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {getComponent()}
    </Suspense>
  );
};
```

#### Memoization
Memoize expensive computations:

```typescript
const DocumentTable: FC<{ documents: Document[] }> = ({ documents }) => {
  const sortedDocuments = useMemo(() =>
    documents.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [documents]
  );

  const documentStats = useMemo(() => ({
    total: documents.length,
    recent: documents.filter(d => isRecent(d.createdAt)).length,
    byType: groupBy(documents, 'type'),
  }), [documents]);

  return (
    <div>
      <DocumentStats stats={documentStats} />
      <DocumentGrid documents={sortedDocuments} />
    </div>
  );
};
```

## Deployment

### Building for Production

```bash
# Build the applet
npm run build

# Output will be in dist/
ls dist/
# index.js, index.d.ts, package.json
```

### Publishing to NPM

```bash
# Build first
npm run build

# Publish to NPM registry
npm publish

# Or to private registry
npm publish --registry https://your-private-registry.com
```

### Version Management

Follow semantic versioning:

```json
{
  "name": "@smbc/my-feature-applet-mui",
  "version": "1.2.3",
  // 1 = major (breaking changes)
  // 2 = minor (new features, backward compatible)
  // 3 = patch (bug fixes)
}
```

### Release Process

1. **Update version**: `npm version patch|minor|major`
2. **Build**: `npm run build`
3. **Test**: `npm test`
4. **Publish**: `npm publish`
5. **Tag release**: `git tag v1.2.3 && git push --tags`

### Host Integration

Once published, hosts can install and use your applet:

```bash
# In host application
npm install @smbc/my-feature-applet-mui

# Add to applet configuration
import myFeatureApplet from '@smbc/my-feature-applet-mui';

export const APPLETS = [
  mountApplet(myFeatureApplet, {
    id: "my-features",
    path: "/features",
    permissions: [myFeatureApplet.permissions.VIEW_FEATURE],
  }),
];
```

## Troubleshooting

### Common Issues

#### 1. Permission Not Working

**Symptoms**: User should have access but gets permission denied

**Debugging Steps**:
```typescript
// Add debugging to your component
const MyComponent = () => {
  const { hasPermission, userRoles, permissionMappings } = usePermissions();

  console.log('Debug permission:', {
    userRoles,
    permissionMappings,
    canView: hasPermission("my-applet", permissions.VIEW_FEATURE),
    permissionId: permissions.VIEW_FEATURE.id,
  });

  return <div>Component content</div>;
};
```

**Common Fixes**:
- Check permission ID format: `"applet-id:permission_name"`
- Verify user has required role in host configuration
- Ensure permission context is correct
- Check host's permission mappings configuration

#### 2. Routing Not Working

**Symptoms**: Navigation doesn't update URL or components

**Debugging Steps**:
```typescript
const Applet = ({ mountPath }) => {
  const { path, navigate } = useHashNavigation({ mountPath });

  console.log('Routing debug:', {
    mountPath,
    currentPath: path,
    fullUrl: window.location.href,
  });

  // Rest of component
};
```

**Common Fixes**:
- Ensure `mountPath` matches host configuration
- Check that hash navigation is being used
- Verify route matching logic
- Look for JavaScript errors preventing navigation

#### 3. API Integration Issues

**Symptoms**: API calls failing or returning unexpected data

**Debugging Steps**:
```typescript
const useMyApi = () => {
  const client = useApiClient('my-applet');

  // Add request/response logging
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      console.log('API request starting...');
      const response = await client.GET('/my-endpoint');
      console.log('API response:', response);
      return response;
    },
    onError: (error) => {
      console.error('API error:', error);
    },
  });
};
```

**Common Fixes**:
- Check API client configuration
- Verify endpoint URLs and methods
- Look at network tab for actual requests
- Check API specification matches implementation
- Ensure mock handlers are set up for development

#### 4. TypeScript Errors

**Common Errors and Fixes**:

```typescript
// Error: Cannot find module '@smbc/my-applet-api'
// Fix: Ensure API package is installed and types are generated

// Error: Property 'VIEW_FEATURE' does not exist on type
// Fix: Check permission definition and imports
import permissions from './permissions';

// Error: Type 'string' is not assignable to type 'never'
// Fix: Ensure HOST_ROLES uses 'as const'
export const HOST_ROLES = ["Guest", "Staff", "Admin"] as const;
```

#### 5. Host Integration Issues

**Symptoms**: Applet not showing up in host application

**Debugging Steps**:
1. Check host's applet configuration
2. Verify package is installed: `npm list @smbc/my-applet-mui`
3. Look for console errors during host startup
4. Check permission requirements are met

**Common Fixes**:
- Ensure applet is added to `APPLETS` configuration
- Check import statements in host
- Verify user has required permissions
- Look at host's role configuration

### Getting Help

#### 1. Enable Debug Mode

```typescript
// Add to your development environment
if (process.env.NODE_ENV === 'development') {
  window.DEBUG_APPLETS = true;
}

// This will enable additional logging in applet core
```

#### 2. Check Console Logs

Most issues will show helpful messages in browser console:
- Permission denials
- Routing errors
- API failures
- Component errors

#### 3. Common Resources

- **Applet Core Documentation**: Core utilities and hooks
- **MUI Components Library**: Pre-built components
- **Host Integration Guide**: How hosts configure applets
- **API Integration Patterns**: Working with APIs
- **Permission System Guide**: Understanding permissions

#### 4. Community Support

- **GitHub Issues**: Report bugs and request features
- **Internal Documentation**: Team-specific guides
- **Code Examples**: Reference implementations

---

## Next Steps

Now that you understand the SMBC applet system:

1. **Create your first applet** using `npx @smbc/create-applet`
2. **Study existing applets** in the repository for patterns
3. **Read the Hello Applet** which serves as a comprehensive tutorial
4. **Join the development community** for support and collaboration

The applet system provides a powerful foundation for building reusable, permission-aware applications. With TypeScript safety, flexible configuration, and comprehensive tooling, you can focus on building great user experiences while benefiting from the shared infrastructure.

Happy coding! 🚀