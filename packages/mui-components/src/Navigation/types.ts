/**
 * Pure UI types for Navigation components
 */

import type { SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";

export interface NavigationItemData {
  id: string;
  label: string;
  path?: string;
  icon?: OverridableComponent<SvgIconTypeMap<{}, "svg">>;
  badge?: {
    count?: number;
    color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
    variant?: "standard" | "dot";
  };
  children?: NavigationItemData[];
  disabled?: boolean;
}

export interface NavigationItemProps {
  item: NavigationItemData;
  level?: number;
  isActive?: boolean;
  isExpanded?: boolean;
  isParentOfActive?: boolean;
  onToggleExpand?: () => void;
  onNavigate?: (path: string) => void;
  showItem?: boolean; // For permission-based visibility
}

export interface NavigationListProps {
  items: NavigationItemData[];
  activeItemPath?: string;
  expandedItems?: Set<string>;
  onToggleExpand?: (itemId: string) => void;
  onNavigate?: (path: string) => void;
  shouldShowItem?: (item: NavigationItemData) => boolean;
}

export interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  width: number;
  variant?: "permanent" | "persistent" | "temporary";
  title?: string;
  children: React.ReactNode;
}
