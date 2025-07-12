// Development UI components
export { DevHostAppBar } from './DevHostAppBar';
export type { DevHostAppBarProps, CurrentAppletInfo } from './DevHostAppBar';

export { MockToggle } from './MockToggle';
export type { MockToggleProps } from './MockToggle';

export { ApiDocsModal } from './ApiDocsModal';
export type { ApiDocsModalProps } from './ApiDocsModal';

export { DevDashboard } from './DevDashboard';
export type { DevDashboardProps } from './DevDashboard';

export { InstallationModal } from './InstallationModal/InstallationModal';
export { MarkdownRenderer } from './InstallationModal/MarkdownRenderer';

// Role management dev tools
export {
  RoleManager,
  DashboardHeader,
  CurrentUserInfo,
  PermissionChip,
  PermissionCard,
  PermissionsGrid,
} from "./RoleManager";

export type { 
  RoleManagerProps,
  User, 
  Permission, 
  PermissionGroup 
} from "./RoleManager";

// Re-export MSW integration from applet-devtools (bundled functionality)
export {
  registerMswHandlers,
  registerHostMockOverrides,
  setupMswForAppletProvider,
  stopMswForAppletProvider,
  clearRegisteredHandlers,
  getRegisteredHandlers,
  resetMswWorker,
  stopMswWorker,
  autoHealMswWorker,
  isMswAvailable,
  userManagementHandlers,
  productCatalogHandlers,
  resetAllMocks,
} from '@smbc/applet-devtools';
export type { ApiConfig } from '@smbc/applet-devtools';