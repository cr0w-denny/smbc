# @smbc/mui-components

Shared MUI component library for SMBC applets.

## Features

- **Shared Components** - Common UI patterns used across applets
- **Theme System** - Light/dark themes with design tokens
- **AutoFilter System** - Generate filters from OpenAPI specifications (WIP)
- **Permission Integration** - Components that respect user permissions

## Installation

```bash
npm install @smbc/mui-components
```

## Quick Start

### Theme

```typescript
import { ThemeProvider } from '@mui/material/styles'
import { lightTheme } from '@smbc/mui-components'

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <YourApp />
    </ThemeProvider>
  )
}
```

### Components

```typescript
import {
  SearchInput,
  LoadingTable,
  ConfirmationDialog,
  EmptyState
} from '@smbc/mui-components'

function UserList() {
  return (
    <>
      <SearchInput onSearch={handleSearch} />
      <LoadingTable loading={isLoading}>
        <UserTable data={users} />
      </LoadingTable>
      <EmptyState
        title="No users found"
        description="Add your first user to get started"
      />
    </>
  )
}
```

## Available Components

> ⚠️ **Warning**: All components listed below are still in active development and design phase. APIs, props, and component behavior are subject to change.

### Layout & Navigation

- `AppShell` - Main application layout
- `TopNavShell` - Top navigation layout
- `NavigationDrawer` - Sidebar navigation
- `AppletDrawer` - Applet-specific drawer
- `HostAppBar` - Application header

### Data & Forms

- `SearchInput` - Search input with debouncing
- `LoadingTable` - Table loading states
- `EmptyState` - Empty state messaging
- `AutoFilter` - Generate filters from OpenAPI specs

### Dialogs & Menus

- `ConfirmationDialog` - Confirmation dialogs
- `ApiDocsModal` - API documentation modal
- `UserMenu` - User profile menu
- `NotificationMenu` - Notification menu

### Permissions

- `RolePermissionDashboard` - Manage user permissions
- `AppletRouter` - Routing with permission checks

## Themes

Available themes:

- `lightTheme` - Light theme (default)
- `darkTheme` - Dark theme
- `smbcTheme` - Alias for light theme

All themes use `@smbc/design-tokens` for consistent colors, spacing, and typography.

## AutoFilter System

Generate filter components from OpenAPI specifications:

```typescript
import { AutoFilter, useAutoFilter } from '@smbc/mui-components'

function UserFilters() {
  const { filters, updateFilter, clearFilters } = useAutoFilter({
    spec: userApiSpec,
    operation: 'listUsers'
  })

  return (
    <AutoFilter
      filters={filters}
      onFilterChange={updateFilter}
      onClear={clearFilters}
    />
  )
}
```

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm test
```
