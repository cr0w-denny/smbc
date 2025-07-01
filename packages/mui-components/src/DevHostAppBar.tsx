import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import {
  Api as ApiIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { ActivityNotifications } from "./ActivityNotifications";

/**
 * Represents current applet information for API documentation
 */
export interface CurrentAppletInfo {
  label: string;
  apiSpec?: {
    spec: any;
  };
}

/**
 * Props for the DevHostAppBar component
 */
export interface DevHostAppBarProps {
  /** Current applet information for API docs button */
  currentAppletInfo?: CurrentAppletInfo | null;
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Function to toggle dark mode */
  onDarkModeToggle: () => void;
  /** Whether mock data is enabled */
  mockEnabled: boolean;
  /** Function to toggle mock data */
  onMockToggle: (enabled: boolean) => void;
  /** Function to handle API docs opening */
  onApiDocsOpen?: () => void;
  /** Function to handle navigation (for activity notifications) */
  onNavigate?: (url: string) => void;
  /** Width of the drawer for calculating AppBar width */
  drawerWidth?: number;
  /** Additional content to render in the toolbar */
  children?: React.ReactNode;
  /** Custom styling for the AppBar */
  sx?: any;
}

/**
 * A development/host application bar component that provides development-specific controls
 * including dark mode toggle, mock data toggle, and API documentation access.
 *
 * This component is specifically designed for development environments and host applications.
 *
 * @example
 * ```tsx
 * <DevHostAppBar
 *   currentAppletInfo={currentAppletInfo}
 *   isDarkMode={isDarkMode}
 *   onDarkModeToggle={toggleDarkMode}
 *   mockEnabled={mockEnabled}
 *   onMockToggle={setMockEnabled}
 *   onApiDocsOpen={handleApiDocsOpen}
 *   drawerWidth={240}
 * />
 * ```
 */
export function DevHostAppBar({
  currentAppletInfo,
  isDarkMode,
  onDarkModeToggle,
  mockEnabled,
  onMockToggle,
  onApiDocsOpen,
  onNavigate,
  drawerWidth = 240,
  children,
  sx,
}: DevHostAppBarProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        ...sx,
      }}
    >
      <Toolbar>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          {/* API Docs button - only show when in an applet and callback is provided */}
          {currentAppletInfo && onApiDocsOpen && (
            <Tooltip
              title={`View ${currentAppletInfo.label} API Documentation`}
            >
              <Button
                color="inherit"
                startIcon={<ApiIcon />}
                onClick={onApiDocsOpen}
                size="small"
                sx={{
                  textTransform: "none",
                  color: "inherit",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
              >
                API Docs
              </Button>
            </Tooltip>
          )}

          {/* Activity Notifications */}
          <ActivityNotifications onNavigate={onNavigate} />

          {/* Dark Mode Toggle */}
          <Tooltip title="Toggle dark mode">
            <IconButton
              color="inherit"
              onClick={onDarkModeToggle}
              size="small"
              sx={{
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Mock Data Toggle */}
          <Tooltip
            title={`${mockEnabled ? "Using mock data for development" : "Using real API endpoints"} - Toggle to switch between mock and real data`}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={mockEnabled}
                  onChange={(e) => onMockToggle(e.target.checked)}
                  size="small"
                  color="secondary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: "inherit" }}>
                    Mock Data
                  </Typography>
                </Box>
              }
              sx={{
                color: "inherit",
                "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
              }}
            />
          </Tooltip>

          {/* Additional content */}
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
