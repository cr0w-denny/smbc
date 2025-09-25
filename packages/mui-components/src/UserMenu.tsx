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
import { size } from "@smbc/ui-core";
import { DarkModeSwitch } from "./DarkModeSwitch";

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

const sxDivider = {
  my: 2,
  border: "none",
  height: (theme: any) => theme.palette.mode === "dark" ? "1.7px" : "1px",
  background: (theme: any) => theme.palette.mode === "dark"
    ? "linear-gradient(90deg, transparent 0%, #4A5971 50%, transparent 100%)"
    : "linear-gradient(90deg, transparent 0%, #00000080 50%, transparent 100%)",
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
            width: 283,
            borderRadius: `${size.borderRadius.base}px`,
            overflow: "visible",
            mt: 1.5,
            ml: 0.125, // 1px offset to the right
            p: 2,
            backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0A111B" : "#ffffff",
            border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "#24324C" : "rgba(36, 50, 76, 0.17)"}`,
            "&.MuiPaper-root": {
              backgroundImage: "none",
            },
          },
        },
        list: { dense: true, sx: { p: 0 } }
      }}
    >
      {/* Header */}
      <Box sx={{ pb: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar src={avatarUrl} alt={name} sx={{ width: 44, height: 44, mb: 1.5 }} />
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, letterSpacing: 1.2, textAlign: 'center', fontSize: '13px' }}
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
        sx={{ justifyContent: 'center', py: 0.75 }}
      >
        <ListItemText primary="Profile" sx={{ textAlign: 'center', flex: 'none', '& .MuiListItemText-primary': { fontSize: '13px' } }} />
      </MenuItem>
      <MenuItem
        onClick={() => {
          onSettings?.();
          onClose();
        }}
        sx={{ justifyContent: 'center', py: 0.75 }}
      >
        <ListItemText primary="Settings" sx={{ textAlign: 'center', flex: 'none', '& .MuiListItemText-primary': { fontSize: '13px' } }} />
      </MenuItem>

      <Divider sx={sxDivider} />

      {/* Dashboard section */}
      <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
        <Typography
          variant="body2"
          sx={{
            color: (theme) => theme.palette.mode === "dark" ? "#9FBCDE" : "text.secondary",
            fontWeight: 600,
            letterSpacing: 0.5,
            fontSize: '13px'
          }}
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
        <ListItemText
          primary="Quick Guide"
          sx={{
            textAlign: 'center',
            flex: 'none',
            '& .MuiListItemText-primary': {
              fontSize: '13px',
              color: (theme) => theme.palette.mode === "dark" ? "#3794F5" : "#1E68B4E5"
            }
          }}
        />
      </MenuItem>

      <Divider sx={sxDivider} />

      {/* Personas section - only show if userRoles exist */}
      {userRoles.length > 0 && (
        <>
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
              sx={{
                color: (theme) => theme.palette.mode === "dark" ? "#9FBCDE" : "text.secondary",
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: '13px'
              }}
            >
              PERSONAS
            </Typography>
            <IconButton
              size="small"
              sx={{
                ml: 1,
                p: 0.5,
                border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "#3794F5" : "#1163C8"}`,
                borderRadius: '50%',
                width: 20,
                height: 20,
                color: (theme) => theme.palette.mode === "dark" ? "#3794F5" : "#1163C8",
                '& .MuiSvgIcon-root': {
                  fontSize: '0.875rem',
                }
              }}
            >
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
                  sx={{ py: 0.25, justifyContent: 'space-between' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRole?.(role.id, !role.enabled);
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '13px' }}>
                    {role.label}
                  </Typography>
                  <Switch
                    size="small"
                    checked={role.enabled}
                    onChange={() => onToggleRole?.(role.id, !role.enabled)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </MenuItem>
              ))}
            </Box>
          </Collapse>
        </>
      )}

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
        <DarkModeSwitch
          checked={!darkMode}
          onChange={(checked) => onToggleDarkMode?.(!checked)}
          showLabel={true}
        />
      </MenuItem>

      <Divider sx={sxDivider} />

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