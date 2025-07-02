# @smbc/user-management-mui

React MUI applet for user management operations.

## Installation

```bash
npm install @smbc/user-management-mui
```

## Features

- Full CRUD operations (Create, Read, Update, Delete)
- Advanced filtering with search, status, email filters
- Sorting by multiple fields
- Pagination with configurable page sizes
- Permission-based access control
- Responsive design
- Real-time updates with optimistic UI
- Loading states and error handling
- User profile views
- Multiple view modes (summary/detailed)

## Usage

```typescript
import { AppletProvider } from '@smbc/mui-applet-host'
import userManagementApplet from '@smbc/user-management-mui'

<AppletProvider applets={[userManagementApplet]} roles={roles} user={user}>
  <Routes>
    <Route path="/users/*" element={<AppletRoute applet="user-management" />} />
  </Routes>
</AppletProvider>
```

## Permissions

The applet defines these permissions:

- `VIEW_USERS` - View user list and profiles
- `EDIT_USERS` - Create and update users
- `DELETE_USERS` - Delete users

## Configuration

```typescript
const permissionMappings = {
  'user-management': {
    'VIEW_USERS': ['Staff', 'Admin'],
    'EDIT_USERS': ['Admin'],
    'DELETE_USERS': ['Admin']
  }
}
```

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm test        # Run tests
```