import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useTheme,
  Popover,
  MenuList,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { ui, shadow } from "@smbc/ui-core";

export interface ActionMenuItem<T = void> {
  label: string;
  icon?: React.ReactNode;
  onClick?: (item: T, event: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean | ((item: T) => boolean);
  appliesTo?: (item: T) => boolean;
  divider?: boolean;
  component?: React.ElementType;
}

export interface ActionMenuProps<T = void> {
  menuItems: ActionMenuItem<T>[];
  /** Item data for data-driven menus (optional) */
  item?: T;
  /** Controlled open state (optional) */
  open?: boolean;
  /** Anchor element for controlled mode (required when using open prop) */
  anchorEl?: HTMLElement | null;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  /** Custom trigger element (if provided, renders instead of default IconButton) */
  trigger?: React.ReactElement;
  /** Custom icon for the trigger button (defaults to MoreVertIcon) */
  icon?: React.ReactNode;
  /** Custom sx props for the IconButton trigger */
  sx?: any;
  /** Custom aria-label for the trigger button */
  ariaLabel?: string;
  /** Stop propagation on menu item click (useful for grid rows) */
  stopPropagation?: boolean;
  /** Use popover mode to allow background interaction */
  variant?: "menu" | "popover";
}

export const ActionMenu = <T = void,>({
  menuItems,
  item,
  open: controlledOpen,
  anchorEl: controlledAnchorEl,
  onMenuOpen,
  onMenuClose,
  trigger,
  icon,
  sx,
  ariaLabel = "more options",
  stopPropagation = false,
  variant = "menu",
}: ActionMenuProps<T>) => {
  const theme = useTheme();
  const [internalAnchorEl, setInternalAnchorEl] = useState<null | HTMLElement>(null);
  const isControlled = controlledOpen !== undefined;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    if (!isControlled) {
      setInternalAnchorEl(event.currentTarget);
    }
    onMenuOpen?.();
  };

  const handleMenuClose = () => {
    if (!isControlled) {
      setInternalAnchorEl(null);
    }
    onMenuClose?.();
  };

  const isOpen = isControlled ? controlledOpen : Boolean(internalAnchorEl);
  const menuAnchorEl = isControlled ? controlledAnchorEl : internalAnchorEl;

  const handleMenuItemClick = (
    menuItem: ActionMenuItem<T>,
    event: React.MouseEvent,
  ) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    menuItem.onClick?.(item as T, event);
    handleMenuClose();
  };

  const menuItemStyles = {
    color: theme.palette.mode === "dark" ? "#E6E7E8" : "#1A1A1A",
    pr: (menuItem: ActionMenuItem<T>) => (menuItem.icon ? "16px" : 0),
    "&:hover": {
      backgroundColor: "transparent",
      "& .menu-item-text": {
        backgroundColor: theme.palette.mode === "dark" ? "#524747" : "#E8E6E6",
      },
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.mode === "dark" ? "#98A4B9" : "#5A6A7A",
    },
    "& .menu-item-text": {
      borderRadius: "4px",
      padding: "2px 6px",
      marginLeft: "-6px",
      marginRight: (menuItem: ActionMenuItem<T>) => (menuItem.icon ? "-6px" : "10px"),
      marginTop: "-2px",
      marginBottom: "-2px",
      display: "block",
      flex: 1,
    },
  };

  const paperStyles = {
    boxShadow: shadow.md,
    backgroundColor: ui.color.background.secondary(theme),
    border: `1px solid ${ui.color.border.primary(theme)}`,
    color: ui.color.text.primary,
  };

  const renderMenuItem = (menuItem: ActionMenuItem<T>, index: number) => {
    const isDisabled =
      typeof menuItem.disabled === "function"
        ? menuItem.disabled(item as T)
        : menuItem.disabled;

    return (
      <React.Fragment key={index}>
        {menuItem.divider && index > 0 && <Divider />}
        <MenuItem
          component={menuItem.component || (menuItem.href ? "a" : "li")}
          href={menuItem.href}
          onClick={(e: React.MouseEvent) => handleMenuItemClick(menuItem, e)}
          disabled={isDisabled}
          sx={{
            ...menuItemStyles,
            pr: menuItem.icon ? "16px" : 0,
            "& .menu-item-text": {
              ...menuItemStyles["& .menu-item-text"],
              marginRight: menuItem.icon ? "-6px" : "10px",
            },
          }}
        >
          {menuItem.icon && <ListItemIcon>{menuItem.icon}</ListItemIcon>}
          <span className="menu-item-text">{menuItem.label}</span>
        </MenuItem>
      </React.Fragment>
    );
  };

  // Filter items based on appliesTo
  const visibleItems = menuItems.filter(
    (menuItem) => !menuItem.appliesTo || menuItem.appliesTo(item as T),
  );

  if (!visibleItems || visibleItems.length === 0) {
    return null;
  }

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger, {
          onClick: handleMenuClick,
          "aria-controls": isOpen ? "action-menu" : undefined,
          "aria-haspopup": "true",
          "aria-expanded": isOpen ? "true" : undefined,
        })
      ) : (
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label={ariaLabel}
          aria-controls={isOpen ? "action-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isOpen ? "true" : undefined}
          sx={{
            mr: "-8px",
            ...sx,
            height: "36px",
            "& .MuiSvgIcon-root": {
              color: theme.palette.mode === "dark" ? "#B2D0E1" : "#1D1B20",
            },
          }}
        >
          {icon || <MoreVertIcon fontSize="small" />}
        </IconButton>
      )}
      {variant === "popover" ? (
        <Popover
          id="action-menu"
          anchorEl={menuAnchorEl}
          open={isOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          disablePortal={false}
          hideBackdrop
          disableScrollLock
          sx={{
            mt: 1,
            pointerEvents: "none",
            "& .MuiPopover-root": {
              pointerEvents: "none",
            },
            "& .MuiPaper-root": {
              pointerEvents: "auto",
            },
          }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: paperStyles,
            },
          }}
        >
          <MenuList>
            {visibleItems.map(renderMenuItem)}
          </MenuList>
        </Popover>
      ) : (
        <Menu
          id="action-menu"
          anchorEl={menuAnchorEl}
          open={isOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: paperStyles,
            },
          }}
        >
          {visibleItems.map(renderMenuItem)}
        </Menu>
      )}
    </>
  );
};

export default ActionMenu;
