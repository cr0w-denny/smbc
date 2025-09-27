// Development UI components
export { HostAppBar } from './HostAppBar';
export type { HostAppBarProps, CurrentAppletInfo } from './HostAppBar';

export { AppletDrawer } from './AppletDrawer';
export type { AppletDrawerProps } from './AppletDrawer';

export { MuiAppletRouter } from './MuiAppletRouter';
export type { MuiAppletRouterProps } from './MuiAppletRouter';

export { MuiHostApp } from './MuiHostApp';
export type { MuiHostAppProps } from './MuiHostApp';

export { ServerSelector } from './ServerSelector';
export type { ServerSelectorProps } from './ServerSelector';

export { ApiDocsModal } from './ApiDocsModal';
export type { ApiDocsModalProps } from './ApiDocsModal';


export { InstallationModal } from './InstallationModal/InstallationModal';
export { MarkdownRenderer } from './InstallationModal/MarkdownRenderer';

// Utilities
export { getPackageName } from './utils/getPackageName';
export { getAvailableServersWithOverrides, getApiOverrides, isOverrideServer } from './utils/apiOverrides';
export type { ServerInfo } from './utils/apiOverrides';

// Debug utilities
export { debug, debugLogger, debugComponent, createSessionId } from './utils/debug';
export type { DebugEntry } from './utils/debug';

// Dev Console
export { DevConsole } from './DevConsole';

// Development tools components
export { DevConsoleToggle } from './DevConsoleToggle';
export type { DevConsoleToggleProps } from './DevConsoleToggle';

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

