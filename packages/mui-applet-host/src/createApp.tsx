// =============================================================================
// SMBC MUI Host - Create App (for greenfield apps)
// =============================================================================

import { createRoot } from 'react-dom/client';
import { CreateAppOptions, HostConfig } from './types';
import { AppletProvider } from './AppletProvider';
import { validateConfig, getDefaultConfig } from './config';

/**
 * Create a complete SMBC app with full app shell
 * 
 * This function creates a greenfield app with the complete SMBC experience:
 * - App bar with navigation
 * - Side drawer with applet menu
 * - Routing system
 * - Theme management
 * - Mock data toggle
 */
export async function createApp(options: CreateAppOptions = {}) {
  const { config, container } = options;
  
  // Load configuration
  let hostConfig: HostConfig;
  if (config) {
    hostConfig = { ...getDefaultConfig(), ...config };
  } else {
    hostConfig = getDefaultConfig();
  }

  // Validate configuration
  const errors = validateConfig(hostConfig);
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }

  // Create app component
  const App = () => (
    <AppletProvider
      applets={hostConfig.applets}
      roles={hostConfig.roles}
      user={hostConfig.user}
      permissions={hostConfig.permissions}
      features={hostConfig.features}
      theme={hostConfig.app?.theme}
    >
      <SMBCApp />
    </AppletProvider>
  );

  // Mount the app
  const targetContainer = getContainer(container);
  const root = createRoot(targetContainer);
  root.render(<App />);

  return {
    root,
    config: hostConfig,
  };
}

function SMBCApp() {
  return (
    <div>
      {/* TODO: Implement static app shell for createApp use case */}
      <div>SMBC App Shell - Static Implementation Needed</div>
    </div>
  );
}

function getContainer(container?: string | HTMLElement): HTMLElement {
  if (typeof container === 'string') {
    const element = document.querySelector(container);
    if (!element) {
      throw new Error(`Container element not found: ${container}`);
    }
    return element as HTMLElement;
  }
  
  if (container instanceof HTMLElement) {
    return container;
  }
  
  // Default to body
  return document.body;
}