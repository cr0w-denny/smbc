import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface ActionMenuProps {
  menuItems: ActionMenuItem[];
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  sx?: any;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  menuItems,
  onMenuOpen,
  onMenuClose,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    onMenuOpen?.();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    onMenuClose?.();
  };

  const handleMenuItemClick = (item: ActionMenuItem) => {
    item.onClick();
    handleMenuClose();
  };

  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuClick}
        aria-label="more options"
        sx={{ mr: "-8px", ...sx }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
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
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider && index > 0 && <Divider />}
            <MenuItem
              onClick={() => handleMenuItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;