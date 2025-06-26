import React, { FC } from 'react';
import { {{APPLET_PASCAL_CASE}}List } from './components/{{APPLET_PASCAL_CASE}}List';
import { {{APPLET_PASCAL_CASE}}Detail } from './components/{{APPLET_PASCAL_CASE}}Detail';
import { {{APPLET_PASCAL_CASE}}Applet } from './components/{{APPLET_PASCAL_CASE}}Applet';
import { {{APPLET_UPPER_CASE}}_PERMISSIONS } from './permissions';

// Individual route components for legacy/custom usage
const {{APPLET_PASCAL_CASE}}ListRoute: FC = () => {
  return React.createElement({{APPLET_PASCAL_CASE}}List);
};

const {{APPLET_PASCAL_CASE}}DetailRoute: FC = () => {
  return React.createElement({{APPLET_PASCAL_CASE}}Detail);
};

// Standard applet export - this is what host apps should import
const applet = {
  permissions: {{APPLET_UPPER_CASE}}_PERMISSIONS,
  routes: [
    {
      path: '/',
      label: '{{APPLET_DISPLAY_NAME}}',
      component: {{APPLET_PASCAL_CASE}}ListRoute,
    },
    {
      path: '/detail',
      label: '{{APPLET_DISPLAY_NAME}} Detail',
      component: {{APPLET_PASCAL_CASE}}DetailRoute,
    },
  ],
  // Main applet component with built-in navigation and URL routing
  component: {{APPLET_PASCAL_CASE}}Applet,
  apiSpec: {
    name: '{{APPLET_DISPLAY_NAME}} API',
    spec: {}, // Will be populated when API package is connected
  },
} as const;

// Export the applet (primary export)
export default applet;

// Export individual components for storybook and custom usage
export { {{APPLET_PASCAL_CASE}}List } from './components/{{APPLET_PASCAL_CASE}}List';
export { {{APPLET_PASCAL_CASE}}Detail } from './components/{{APPLET_PASCAL_CASE}}Detail';
export { {{APPLET_PASCAL_CASE}}Applet } from './components/{{APPLET_PASCAL_CASE}}Applet';

// Export types (add your types here as they're created)
export type {};