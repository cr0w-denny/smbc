import React, { FC } from 'react';
import { FilterableUserTable } from './components/FilterableUserTable';
import { UserProfile } from './components/UserProfile';
import { UserManagementApplet } from './components/UserManagementApplet';
import { USER_MANAGEMENT_PERMISSIONS } from './permissions';
import spec from '@smbc/user-management-api';

// Individual route components for legacy/custom usage
const UserManagementRoute: FC = () => {
  return React.createElement(FilterableUserTable);
};

const UserProfileRoute: FC = () => {
  return React.createElement(UserProfile);
};

// Standard applet export - this is what host apps should import
const applet = {
  permissions: USER_MANAGEMENT_PERMISSIONS,
  routes: [
    {
      path: '/',
      label: 'User Management',
      component: UserManagementRoute,
    },
    {
      path: '/profile',
      label: 'User Profile',
      component: UserProfileRoute,
    },
  ],
  // Main applet component with built-in navigation and URL routing
  component: UserManagementApplet,
  apiSpec: {
    name: 'User Management API',
    spec,
  },
} as const;

// Export the applet (primary export)
export default applet;

// Export individual components for storybook and custom usage
export { FilterableUserTable } from './components/FilterableUserTable';
export { UserTableWithApi } from './components/UserTableWithApi';
export { UserFilterBar } from './components/UserFilterBar';
export { UserProfile } from './components/UserProfile';
export { UserManagementApplet } from './components/UserManagementApplet';
