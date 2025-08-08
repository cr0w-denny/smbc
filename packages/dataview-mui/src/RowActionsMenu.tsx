import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import type { RowAction } from "@smbc/dataview";

interface RowActionsMenuProps<T> {
  actions: RowAction<T>[];
  item: T;
}

export function RowActionsMenu<T>({ actions, item }: RowActionsMenuProps<T>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const visibleActions = actions.filter((action) => !action.hidden?.(item));

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        aria-label="more actions"
        aria-controls={open ? "row-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="row-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          '& .MuiPaper-root': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.08)',
          }
        }}
      >
        {visibleActions.map((action) => (
          <MenuItem
            key={action.key}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
              action.onClick?.(item);
            }}
            disabled={action.disabled?.(item)}
          >
            {action.icon && (
              <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>
                {React.createElement(action.icon)}
              </ListItemIcon>
            )}
            <ListItemText>{action.label || action.key}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}