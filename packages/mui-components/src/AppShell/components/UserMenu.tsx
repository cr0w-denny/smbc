import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { InputActiveDark, InputActiveLight } from "@smbc/ui-core";

export type UserRole = {
  id: string;
  label: string;
  enabled: boolean;
};

export type UserMenuProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;

  /** Top header */
  name: string;
  avatarUrl?: string;

  /** Handlers */
  onProfile?: () => void;
  onSettings?: () => void;
  onQuickGuide?: () => void;
  onLogout?: () => void;

  /** Dark mode switch */
  darkMode?: boolean;
  onToggleDarkMode?: (next: boolean) => void;

  /** User roles */
  userRoles?: UserRole[];
  onToggleRole?: (roleId: string, enabled: boolean) => void;
};

export function UserMenu({
  open,
  anchorEl,
  onClose,
  name,
  avatarUrl,
  onProfile,
  onSettings,
  onQuickGuide,
  onLogout,
  darkMode = false,
  onToggleDarkMode,
  userRoles = [],
  onToggleRole,
}: UserMenuProps) {
  const [personasExpanded, setPersonasExpanded] = useState(false);

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      slotProps={{
        paper: {
          elevation: 6,
          sx: {
            width: 280,
            borderRadius: 3,
            overflow: "visible",
            mt: 1.5,
            ml: 0.125, // 1px offset to the right
            p: 2,
          },
        },
        list: { dense: true, sx: { p: 0 } }
      }}
    >
      {/* Header */}
      <Box sx={{ pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={avatarUrl} alt={name} sx={{ width: 44, height: 44, mb: 1 }} />
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, letterSpacing: 1.2, textAlign: 'center' }}
          noWrap
        >
          {name?.toUpperCase()}
        </Typography>
      </Box>

      {/* Profile / Settings */}
      <MenuItem
        onClick={() => {
          onProfile?.();
          onClose();
        }}
        sx={{ justifyContent: 'center', py: 1.5 }}
      >
        <ListItemText primary="Profile" sx={{ textAlign: 'center', flex: 'none' }} />
      </MenuItem>
      <MenuItem
        onClick={() => {
          onSettings?.();
          onClose();
        }}
        sx={{ justifyContent: 'center', py: 1.5 }}
      >
        <ListItemText primary="Settings" sx={{ textAlign: 'center', flex: 'none' }} />
      </MenuItem>

      <Divider sx={{ my: 2 }} />

      {/* Dashboard section */}
      <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 0.5 }}
        >
          DASHBOARD
        </Typography>
      </Box>
      <MenuItem
        onClick={() => {
          onQuickGuide?.();
          onClose();
        }}
        sx={{ justifyContent: 'center' }}
      >
        <ListItemText primary="Quick Guide" sx={{ textAlign: 'center', flex: 'none' }} />
      </MenuItem>

      <Divider sx={{ my: 2 }} />

      {/* Personas section */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setPersonasExpanded(!personasExpanded)}
      >
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 0.5 }}
        >
          PERSONAS
        </Typography>
        <IconButton size="small" sx={{ ml: 1 }}>
          {personasExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={personasExpanded}>
        <Box
          sx={{
            px: 2,
            py: 1,
            maxHeight: 200, // Limit height to prevent menu from being too tall
            overflowY: 'auto', // Add scrolling when content exceeds max height
          }}
        >
          {/* Role toggles */}
          {userRoles.map((role) => (
            <MenuItem
              key={role.id}
              disableRipple
              sx={{ py: 0.75, justifyContent: 'space-between' }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleRole?.(role.id, !role.enabled);
              }}
            >
              <Typography variant="body2">
                {role.label}
              </Typography>
              <Switch
                size="small"
                checked={role.enabled}
                onChange={() => onToggleRole?.(role.id, !role.enabled)}
                onClick={(e) => e.stopPropagation()}
                sx={(theme) => ({
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    '& .MuiSwitch-thumb': {
                      backgroundColor: theme.palette.mode === "dark" ? InputActiveDark : InputActiveLight,
                    },
                  },
                })}
              />
            </MenuItem>
          ))}
        </Box>
      </Collapse>

      {/* Dark Mode - Always visible */}
      <MenuItem
        disableRipple
        sx={{ py: 1.25, justifyContent: 'center', mt: 1 }}
        onClick={(e) => {
          // avoid closing when toggling
          e.stopPropagation();
          onToggleDarkMode?.(!darkMode);
        }}
      >
        <Switch
          checked={!!darkMode}
          onChange={(e) => onToggleDarkMode?.(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          slotProps={{ input: { "aria-label": "Toggle dark mode" } }}
          sx={(theme) => ({
            width: 62,
            height: 34,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: 0,
              margin: '2px',
              transitionDuration: '300ms',
              '&.Mui-checked': {
                transform: 'translateX(28px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                  backgroundColor: theme.palette.action.disabledBackground,
                  opacity: 1,
                  border: 0,
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: theme.palette.mode === "dark" ? InputActiveDark : InputActiveLight,
                  '&::before': {
                    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M6 0.278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z'/%3E%3C/svg%3E") center/14px no-repeat`,
                  },
                },
              },
            },
            '& .MuiSwitch-thumb': {
              backgroundColor: theme.palette.grey[600],
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px 0 rgba(0,35,11,0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                borderRadius: '50%',
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M6 0.278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z'/%3E%3C/svg%3E") center/14px no-repeat`,
              },
            },
            '& .MuiSwitch-track': {
              borderRadius: 34 / 2,
              backgroundColor: theme.palette.action.disabledBackground,
              opacity: 1,
              transition: theme.transitions.create(['background-color'], {
                duration: 500,
              }),
              border: 0,
            },
          })}
        />
        <Typography sx={{ ml: 2 }}>Dark Mode</Typography>
      </MenuItem>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={() => {
            onLogout?.();
            onClose();
          }}
          startIcon={<Logout />}
          sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            py: 1.1,
          }}
        >
          Logout
        </Button>
      </Box>
    </Menu>
  );
}

export default UserMenu;