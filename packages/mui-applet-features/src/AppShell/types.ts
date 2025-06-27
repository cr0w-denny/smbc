/**
 * AppShell feature types - business logic interfaces
 */

export interface AppShellConfig {
  title: string;
  enableUserMenu?: boolean;
  enableNotifications?: boolean;
  initialDrawerOpen?: boolean;
  initialNotificationCount?: number;
}

export interface UserAction {
  type: 'profile' | 'settings' | 'logout';
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

export interface NotificationAction {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  onClick?: () => void;
}

export interface AppShellFeatureProps {
  config: AppShellConfig;
  userActions?: UserAction[];
  notifications?: NotificationAction[];
  onUserAction?: (action: UserAction) => void;
  onNotificationAction?: (notification: NotificationAction) => void;
  children: React.ReactNode;
}