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
  Chip,
} from "@mui/material";
import {
  Api as ApiIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";

/**
 * Represents current applet information for API documentation
 */
export interface CurrentAppletInfo {
  id: string;
  label: string;
  apiSpec?: {
    spec: any;
  };
}

/**
 * Mapping of applet IDs to their npm package names
 */
const APPLET_PACKAGE_MAP: Record<string, string> = {
  "hello": "@smbc/hello-applet",
  "user-management": "@smbc/user-management-mui",
  "admin-users": "@smbc/user-management-mui",
  "product-catalog": "@smbc/product-catalog-mui",
};

/**
 * Core peer dependencies required by all applets
 * These versions are dynamically determined to stay in sync with dependency management tool
 */
const CORE_PEER_DEPS = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^7.1.2",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@tanstack/react-query": "^5.0.0",
    "@smbc/applet-core": "^0.0.1",
    "@smbc/mui-applet-core": "^0.0.1",
    "@smbc/mui-components": "^0.0.1"
  };

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
  // onNavigate?: (url: string) => void; // Removed - ActivityNotifications moved
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
  drawerWidth = 240,
  children,
  sx,
}: DevHostAppBarProps) {
  const [copyFeedback, setCopyFeedback] = React.useState(false);

  const handleCopyPackage = async () => {
    if (!currentAppletInfo?.id) return;
    
    const packageName = APPLET_PACKAGE_MAP[currentAppletInfo.id];
    if (!packageName) return;

    // Build install command with peer dependencies
    const peerDeps = Object.entries(CORE_PEER_DEPS)
      .map(([pkg, version]) => `${pkg}@${version.replace('^', '')}`)
      .join(' ');
    
    const installCommand = `npm install ${packageName} ${peerDeps}`;
    
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = installCommand;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      document.body.removeChild(textArea);
    }
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
        {/* Package Install Copy Component */}
        {currentAppletInfo?.id && APPLET_PACKAGE_MAP[currentAppletInfo.id] && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Copy install command with all required dependencies">
              <Chip
                label={APPLET_PACKAGE_MAP[currentAppletInfo.id]}
                icon={<ContentCopyIcon />}
                onClick={handleCopyPackage}
                size="small"
                sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'inherit',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
                '& .MuiChip-icon': {
                  color: 'inherit',
                  fontSize: '1rem',
                },
                '& .MuiChip-label': {
                  padding: '0 8px',
                },
              }}
              />
            </Tooltip>
            
            {/* Feedback chip */}
            {copyFeedback && (
              <Chip
                label="Copied!"
                size="small"
                sx={{
                  backgroundColor: 'success.main',
                  color: 'success.contrastText',
                  fontSize: '0.75rem',
                  animation: 'fadeIn 0.2s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'scale(0.8)' },
                    to: { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
            )}
          </Box>
        )}

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 2 }}>
          {/* API Docs button - only show when applet has API spec and callback is provided */}
          {currentAppletInfo && currentAppletInfo.apiSpec && onApiDocsOpen && (
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
