import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useTheme,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

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
}

export const ActionMenu = <T = void,>({
  menuItems,
  item,
  onMenuOpen,
  onMenuClose,
  trigger,
  icon,
  sx,
  ariaLabel = "more options",
  stopPropagation = false,
}: ActionMenuProps<T>) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    setAnchorEl(event.currentTarget);
    onMenuOpen?.();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    onMenuClose?.();
  };

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
          "aria-controls": anchorEl ? "action-menu" : undefined,
          "aria-haspopup": "true",
          "aria-expanded": anchorEl ? "true" : undefined,
        })
      ) : (
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label={ariaLabel}
          aria-controls={anchorEl ? "action-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? "true" : undefined}
          sx={{ mr: "-8px", ...sx, height: "36px" }}
        >
          {icon || <MoreVertIcon fontSize="small" />}
        </IconButton>
      )}
      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              boxShadow:
                "0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)",
            },
          },
        }}
      >
        {visibleItems.map((menuItem, index) => {
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
                onClick={(e: React.MouseEvent) =>
                  handleMenuItemClick(menuItem, e)
                }
                disabled={isDisabled}
                sx={{
                  color: theme.palette.mode === "dark" ? "#E6E7E8" : "#ddd",
                  pr: "4px",
                  "&:hover": {
                    pr: "4px",
                    backgroundColor: "transparent",
                  },
                  "& .MuiSvgIcon-root": {
                    color: theme.palette.mode === "dark" ? "#98A4B9" : "",
                  },
                  "& .menu-item-text": {
                    borderRadius: "4px",
                    padding: "2px 6px",
                    margin: "-2px -6px",
                    display: "block",
                    width: "100%",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#524747" : "red",
                    },
                  },
                }}
              >
                {menuItem.icon && <ListItemIcon>{menuItem.icon}</ListItemIcon>}
                <span className="menu-item-text">{menuItem.label}</span>
              </MenuItem>
            </React.Fragment>
          );
        })}
      </Menu>
    </>
  );
};

export default ActionMenu;
