import { Theme } from '@mui/material/styles';
import { ReactNode } from 'react';

// Tree-style navigation items for dropdowns (framework-agnostic)
export interface TreeNavigationItem {
  id: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: TreeNavigationItem[];
  isCollapsible?: boolean;
  onClick?: () => void;
}

// Extended navigation item that supports tree-style dropdowns
export interface NavigationItem {
  label: string;
  type: 'link' | 'dropdown' | 'tree-dropdown' | 'button';
  href?: string;
  items?: { label: string; href?: string; onClick?: () => void }[];
  treeItems?: TreeNavigationItem[]; // For tree-style dropdowns
  onClick?: () => void;
  variant?: 'text' | 'contained' | 'outlined';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

export interface StatusChip {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  variant?: 'filled' | 'outlined';
  onClick?: () => void;
}

export interface AppShellProps {
  logo?: ReactNode;
  /** Optional hamburger menu for mobile/drawer navigation */
  hamburgerMenu?: ReactNode;
  navigation: NavigationItem[];
  children: ReactNode;
  theme?: Theme;
  onNavigate?: (href: string) => void;
  /** Current path for active navigation highlighting */
  currentPath?: string;
  /** Whether dark mode is currently enabled */
  isDarkMode?: boolean;
  /** Callback when dark mode toggle changes */
  onDarkModeToggle?: (enabled: boolean) => void;
  /** User display name */
  username?: string;
  /** User avatar URL */
  avatarUrl?: string;
  /** Additional components to render in the top nav before the user menu */
  right?: ReactNode;
  /** Color for active navigation indicators */
  activeColor?: string;
}