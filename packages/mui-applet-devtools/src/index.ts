// Development UI components
export { DevHostAppBar } from './DevHostAppBar';
export type { DevHostAppBarProps, CurrentAppletInfo } from './DevHostAppBar';

export { MockToggle } from './MockToggle';
export type { MockToggleProps } from './MockToggle';

export { ApiDocsModal } from './ApiDocsModal';
export type { ApiDocsModalProps } from './ApiDocsModal';

export { DevDashboard } from './DevDashboard';
export type { DevDashboardProps } from './DevDashboard';

// Role management dev tools
export {
  DashboardHeader,
  CurrentUserInfo,
  PermissionChip,
  PermissionCard,
  PermissionsGrid,
} from "./RoleManager";

export type { User, Permission, PermissionGroup } from "./RoleManager";

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
  isMswAvailable,
  userManagementHandlers,
  productCatalogHandlers,
} from '@smbc/applet-devtools';
export type { ApiConfig } from '@smbc/applet-devtools';