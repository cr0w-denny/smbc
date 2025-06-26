import React from 'react';
import { {{APPLET_PASCAL_CASE}}Component } from './components/{{APPLET_PASCAL_CASE}}Component';
import { {{APPLET_UPPER_CASE}}_PERMISSIONS } from './permissions';

// Main applet component
const {{APPLET_PASCAL_CASE}}Applet: React.FC = () => {
  return React.createElement({{APPLET_PASCAL_CASE}}Component);
};

// Standard applet export
const applet = {
  permissions: {{APPLET_UPPER_CASE}}_PERMISSIONS,
  routes: [
    {
      path: '/',
      label: '{{APPLET_DISPLAY_NAME}}',
      component: {{APPLET_PASCAL_CASE}}Applet
    }
  ],
  apiSpec: {
    name: '{{APPLET_DISPLAY_NAME}} API',
    spec: {} // Will be populated when API package is connected
  }
} as const;

export default applet;

// Export individual components for custom usage
export { {{APPLET_PASCAL_CASE}}Component } from './components/{{APPLET_PASCAL_CASE}}Component';

// Export types (add your types here as they're created)
export type {};