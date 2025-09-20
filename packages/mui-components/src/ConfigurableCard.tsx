import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import * as ui from "@smbc/ui-core";

export interface CardMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface ConfigurableCardProps {
  title: string | React.ReactNode;
  subtitle?: string;
  menuItems?: CardMenuItem[];
  children: React.ReactNode;
  elevation?: number;
  sx?: any;
  headerSx?: any;
  contentSx?: any;
  showMenu?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  toolbar?: React.ReactNode;
}

export const ConfigurableCard: React.FC<ConfigurableCardProps> = ({
  title,
  subtitle,
  menuItems = [],
  children,
  elevation = 1,
  sx,
  headerSx,
  contentSx,
  showMenu = true,
  onMenuOpen,
  onMenuClose,
  toolbar,
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

  const handleMenuItemClick = (item: CardMenuItem) => {
    item.onClick();
    handleMenuClose();
  };

  return (
    <Card
      elevation={elevation}
      sx={{
        backgroundImage: "none !important",
        backgroundColor: (theme) => theme.palette.mode === "dark" ? ui.CardBackgroundDark : ui.CardBackgroundLight,
        border: (theme) => `1px solid ${theme.palette.mode === "dark" ? ui.CardBorderDark : ui.CardBorderLight}`,
        borderRadius: "16px",
        "&:hover": {
          boxShadow: elevation,
          backgroundColor: (theme) => theme.palette.mode === "dark" ? ui.CardBackgroundDark : ui.CardBackgroundLight,
          backgroundImage: "none !important",
          transform: "none",
        },
        transition: "none",
        ...sx,
      }}
    >
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>{toolbar}</Box>
            <Box>
              {showMenu && menuItems.length > 0 && (
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  aria-label="more options"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        }
        sx={{
          pb: 0,
          pt: 1.5,
          px: 2,
          ...headerSx,
        }}
      />
      {showMenu && menuItems.length > 0 && (
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
      )}
      <CardContent
        sx={{
          p: 2,
          pb: 4,
          height: "100%",
          "&:last-child": {
            pb: 4,
          },
          ...contentSx,
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default ConfigurableCard;
