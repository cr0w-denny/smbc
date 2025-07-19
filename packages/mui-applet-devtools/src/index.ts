// Development UI components
export { HostAppBar } from './HostAppBar';
export type { HostAppBarProps, CurrentAppletInfo } from './HostAppBar';

export { AppletDrawer } from './AppletDrawer';
export type { AppletDrawerProps } from './AppletDrawer';

export { MuiAppletRouter } from './MuiAppletRouter';
export type { MuiAppletRouterProps } from './MuiAppletRouter';

export { ServerSelector } from './ServerSelector';
export type { ServerSelectorProps } from './ServerSelector';

export { ApiDocsModal } from './ApiDocsModal';
export type { ApiDocsModalProps } from './ApiDocsModal';


export { InstallationModal } from './InstallationModal/InstallationModal';
export { MarkdownRenderer } from './InstallationModal/MarkdownRenderer';

// Utilities
export { getPackageName } from './utils/getPackageName';

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

