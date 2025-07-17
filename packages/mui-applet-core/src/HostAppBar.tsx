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
  CircularProgress,
} from "@mui/material";
import {
  Api as ApiIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  GetApp as InstallIcon,
} from "@mui/icons-material";
import { useFeatureFlag, useFeatureFlagToggle, useAppletCore } from "@smbc/applet-core";
import { APPLET_REGISTRY } from "@smbc/applet-meta";
// Dynamic import for development tools

/**
 * Represents current applet information
 */
export interface CurrentAppletInfo {
  id: string;
  label: string;
  apiSpec?: {
    spec: any;
  };
}

/**
 * Props for the HostAppBar component
 */
export interface HostAppBarProps {
  /** Current applet information for package copy */
  currentAppletInfo?: CurrentAppletInfo | null;
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Function to toggle dark mode */
  onDarkModeToggle: () => void;
  /** Function to handle API docs opening (dev mode only) */
  onApiDocsOpen?: () => void;
  /** Width of the drawer for calculating AppBar width */
  drawerWidth?: number;
  /** Additional content to render in the toolbar */
  children?: React.ReactNode;
  /** Custom styling for the AppBar */
  sx?: any;
  /** Whether to show applet installation guide */
  showAppletInstallation?: boolean;
  /** Whether to show MSW mock controls */
  showMockControls?: boolean;
}

/**
 * A host application bar component that provides essential host app controls
 * including dark mode toggle, package installation help, and development features.
 *
 * In development, this component includes API docs and mock data controls.
 * In production, these development features are excluded via tree-shaking.
 */
export function HostAppBar({
  currentAppletInfo,
  isDarkMode,
  onDarkModeToggle,
  onApiDocsOpen,
  drawerWidth = 240,
  children,
  sx,
  showAppletInstallation = false,
  showMockControls = false,
}: HostAppBarProps) {
  const { state } = useAppletCore();
  const [installModalOpen, setInstallModalOpen] = React.useState(false);
  const [InstallationModal, setInstallationModal] =
    React.useState<React.ComponentType<any> | null>(null);
  const mockEnabled = useFeatureFlag("mockData");
  
  // Determine if MSW is initializing - default to false if status not available
  const isMswInitializing = state.mswStatus?.isInitializing === true;
  const toggleMockData = useFeatureFlagToggle("mockData");

  const handleOpenInstallModal = async () => {
    if (!InstallationModal) {
      try {
        // Dynamic import for development tools
        const devtools = await import("@smbc/mui-applet-devtools" as any);
        setInstallationModal(() => devtools.InstallationModal);
      } catch (error) {
        console.warn("Could not load InstallationModal from devtools:", error);
        return;
      }
    }
    setInstallModalOpen(true);
  };

  const handleCloseInstallModal = () => {
    setInstallModalOpen(false);
  };

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
        {/* Applet Installation Guide Button */}
        {showAppletInstallation &&
          currentAppletInfo?.id &&
          currentAppletInfo.id !== "hello" &&
          APPLET_REGISTRY[currentAppletInfo.id] && (
            <Tooltip title="View installation instructions">
              <Button
                startIcon={<InstallIcon />}
                onClick={handleOpenInstallModal}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: "inherit",
                  textTransform: "none",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                  },
                }}
              >
                Install {APPLET_REGISTRY[currentAppletInfo.id]?.packageName}
              </Button>
            </Tooltip>
          )}

        <Box
          sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}
        >
          {/* API Docs button - only in development and when applet has API spec */}
          {process.env.NODE_ENV !== "production" &&
            currentAppletInfo?.apiSpec &&
            onApiDocsOpen && (
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

          {/* Mock Data Toggle - only when explicitly enabled */}
          {showMockControls && (
            <Tooltip
              title={
                isMswInitializing
                  ? "MSW is initializing..."
                  : `${mockEnabled ? "Using mock data for development" : "Using real API endpoints"} - Toggle to switch between mock and real data`
              }
            >
              {isMswInitializing ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                  <CircularProgress size={16} color="secondary" />
                  <Box sx={{ fontSize: "0.875rem", color: "inherit" }}>Mock</Box>
                </Box>
              ) : (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(mockEnabled)}
                      onChange={() => toggleMockData()}
                      size="small"
                      color="secondary"
                    />
                  }
                  label="Mock"
                  sx={{
                    color: "inherit",
                    m: 0,
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                      ml: 0.5,
                    },
                  }}
                />
              )}
            </Tooltip>
          )}

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

          {/* Additional content */}
          {children}
        </Box>
      </Toolbar>

      {/* Installation Modal - Dynamically Loaded */}
      {currentAppletInfo && InstallationModal && (
        <InstallationModal
          open={installModalOpen}
          onClose={handleCloseInstallModal}
          appletInfo={currentAppletInfo}
        />
      )}
    </AppBar>
  );
}
