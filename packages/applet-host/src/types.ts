/**
 * Convenience types for host applications
 */

import { AppletMount, RoleConfig } from '@smbc/applet-core';

export interface HostConfig {
  appName: string;
  appletMounts: Record<string, AppletMount>;
  roles: readonly string[];
  roleConfig: RoleConfig;
  demoUser?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    preferences?: {
      theme?: 'light' | 'dark';
      language?: string;
      timezone?: string;
      notifications?: {
        email?: boolean;
        push?: boolean;
        desktop?: boolean;
      };
    };
  };
}

export interface FeatureFlagConfig {
  key: string;
  defaultValue: boolean;
  description: string;
  persist?: boolean;
}