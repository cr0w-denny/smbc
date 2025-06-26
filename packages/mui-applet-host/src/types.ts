// =============================================================================
// SMBC MUI Host - Type Definitions
// =============================================================================

import { ComponentType, ReactNode } from 'react';

// Re-export core types
export type {
  RoleConfig,
  User,
  FeatureFlagConfig,
} from '@smbc/mui-applet-core';

// =============================================================================
// Config File Types
// =============================================================================

export interface AppletConfig {
  name: string;
  mountPath?: string;
  permissions?: string[];
  config?: Record<string, any>;
}

export interface HostConfig {
  applets: (string | AppletConfig)[];
  roles: string[];
  app?: {
    name?: string;
    theme?: 'light' | 'dark' | 'auto';
    logo?: string;
    version?: string;
  };
  permissions?: Record<string, string[]>;
  features?: Record<string, boolean>;
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    preferences?: Record<string, any>;
  };
}

// =============================================================================
// Component Types
// =============================================================================

export interface AppletProviderProps {
  children: ReactNode;
  applets: (string | AppletConfig)[];
  roles: string[];
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    preferences?: Record<string, any>;
  };
  permissions?: Record<string, string[]>;
  features?: Record<string, boolean>;
  theme?: 'light' | 'dark' | 'auto';
}

export interface AppletRouteProps {
  applet: string;
  mountPath?: string;
  fallback?: ComponentType;
}

export interface CreateAppOptions {
  config?: HostConfig;
  container?: string | HTMLElement;
}

// =============================================================================
// Internal Types (reserved for future use)
// =============================================================================