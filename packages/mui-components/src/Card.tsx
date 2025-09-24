import React, { useState } from "react";
import {
  Card as MuiCard,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { ui } from "@smbc/ui-core";
import { token } from "./utils/tokens";

export interface CardMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface CardProps {
  title: string | React.ReactNode;
  subtitle?: string;
  menuItems?: CardMenuItem[];
  children: React.ReactNode;
  elevation?: number;
  size?: "medium" | "large";
  sx?: any;
  headerSx?: any;
  contentSx?: any;
  showMenu?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  toolbar?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  menuItems = [],
  children,
  elevation = 1,
  size = "medium",
  sx,
  headerSx,
  contentSx,
  showMenu = true,
  onMenuOpen,
  onMenuClose,
  toolbar,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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

  // Get the padding value based on size
  const headerPadding = size === "large" ? ui.color.card.header.padding.large : ui.color.card.header.padding.medium;

  return (
    <MuiCard
      elevation={elevation}
      sx={{
        backgroundImage: "none !important",
        backgroundColor: token(isDark, ui.color.card.background),
        border: `1px solid ${token(isDark, ui.color.card.border)}`,
        borderRadius: ui.color.card.borderRadius.dark,
        "&:hover": {
          boxShadow: elevation,
          backgroundColor: token(isDark, ui.color.card.background),
          backgroundImage: "none !important",
          transform: "none",
        },
        transition: "none",
        ...sx,
      }}
    >
      {/* Header section with title, toolbar, and menu */}
      <Box sx={{
        px: 3,
        pt: headerPadding,
        ...headerSx
      }}>
        {/* Top row: title, toolbar, and menu */}
        <Box sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: subtitle ? 0.5 : 0
        }}>
          {/* Title */}
          <Typography
            component="div"
            sx={{
              fontSize: size === "large" ? ui.color.card.header.fontSize.large : ui.color.card.header.fontSize.medium,
              fontWeight: token(isDark, ui.color.card.header.fontWeight),
              fontFamily: token(isDark, ui.color.card.header.fontFamily),
              color: token(isDark, ui.color.card.header.text),
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>

          {/* Toolbar in the middle */}
          {toolbar && (
            <Box sx={{ mt: -1, display: "flex", alignItems: "center" }}>
              {toolbar}
            </Box>
          )}

          {/* Menu button on the right */}
          {showMenu && menuItems.length > 0 && (
            <IconButton
              size="small"
              onClick={handleMenuClick}
              aria-label="more options"
              sx={{ mr: "-8px", mt: -0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        )}
      </Box>
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
    </MuiCard>
  );
};

export default Card;
