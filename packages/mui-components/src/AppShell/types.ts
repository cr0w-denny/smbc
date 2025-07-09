/**
 * Pure AppShell types - no business logic
 */

export interface AppToolbarProps {
  title: string;
  showMenuButton?: boolean;
  onMenuButtonClick?: () => void;

  // User menu
  showUserMenu?: boolean;
  userMenuAnchor?: HTMLElement | null;
  onUserMenuOpen?: (event: React.MouseEvent<HTMLElement>) => void;
  onUserMenuClose?: () => void;
  userMenuContent?: React.ReactNode;

  // Notifications
  showNotifications?: boolean;
  notificationCount?: number;
  notificationMenuAnchor?: HTMLElement | null;
  onNotificationMenuOpen?: (event: React.MouseEvent<HTMLElement>) => void;
  onNotificationMenuClose?: () => void;
  notificationMenuContent?: React.ReactNode;

  // Additional toolbar content
  children?: React.ReactNode;
}

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  elevation?: number;

  // Navigation drawer
  showDrawer?: boolean;
  drawerOpen?: boolean;
  drawerWidth?: number;
  drawerContent?: React.ReactNode;
  onDrawerClose?: () => void;
  drawerVariant?: "permanent" | "persistent" | "temporary";

  // Responsive behavior
  isMobile?: boolean;

  // Toolbar props
  toolbarProps?: Omit<AppToolbarProps, "title">;
}

export interface AppMainContentProps {
  children: React.ReactNode;
  drawerWidth?: number;
  showDrawer?: boolean;
  isMobile?: boolean;
}
