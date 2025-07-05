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
  Chip,
} from "@mui/material";
import {
  Api as ApiIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import {
  useFeatureFlag,
  useFeatureFlagToggle,
} from "@smbc/applet-core";

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
  /** Devtools functions (passed in dev mode, undefined in production) */
  devTools?: {
    isMswAvailable: () => Promise<boolean>;
    setupMswForAppletProvider: () => Promise<void>;
    stopMswForAppletProvider: () => Promise<void>;
  };
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
  devTools,
}: HostAppBarProps) {
  const [copyFeedback, setCopyFeedback] = React.useState(false);
  const [mswStatus, setMswStatus] = React.useState({
    available: false,
    active: false,
    initialized: false,
  });

  const mockEnabled = useFeatureFlag("mockData");
  const toggleMockData = useFeatureFlagToggle("mockData");

  // Check MSW availability when dev tools are loaded
  React.useEffect(() => {
    console.log("HostAppBar: devTools effect", { devTools: !!devTools, initialized: mswStatus.initialized });
    if (devTools && !mswStatus.initialized) {
      console.log("HostAppBar: Checking MSW availability...");
      devTools.isMswAvailable().then((available: boolean) => {
        console.log("HostAppBar: MSW available:", available);
        setMswStatus((prev) => ({
          ...prev,
          available,
          initialized: true,
        }));
      });
    }
  }, [devTools, mswStatus.initialized]);

  // Handle mock toggle
  const handleMockToggle = async (enabled: boolean) => {
    if (!devTools) return;

    try {
      if (enabled) {
        await devTools.setupMswForAppletProvider();
        setMswStatus((prev) => ({ ...prev, active: true }));
      } else {
        await devTools.stopMswForAppletProvider();
        setMswStatus((prev) => ({ ...prev, active: false }));
      }
      toggleMockData();
    } catch (error) {
      console.error("Failed to toggle MSW:", error);
    }
  };

  // Update active status when mock flag changes
  React.useEffect(() => {
    if (devTools && mswStatus.initialized && mockEnabled && !mswStatus.active) {
      devTools.setupMswForAppletProvider()
        .then(() => setMswStatus((prev: any) => ({ ...prev, active: true })))
        .catch(console.error);
    }
  }, [devTools, mockEnabled, mswStatus.initialized, mswStatus.active]);

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
        document.execCommand('copy'); // @ts-ignore - deprecated but needed for fallback
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

        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* API Docs button - only in development and when applet has API spec */}
          {process.env.NODE_ENV !== 'production' && currentAppletInfo?.apiSpec && onApiDocsOpen && (
            <Tooltip title={`View ${currentAppletInfo.label} API Documentation`}>
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

          {/* Mock Data Toggle - only in development and when MSW is available */}
          {process.env.NODE_ENV !== 'production' && mswStatus.initialized && mswStatus.available && (
            <Tooltip
              title={`${mockEnabled ? "Using mock data for development" : "Using real API endpoints"} - Toggle to switch between mock and real data`}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(mockEnabled)}
                    onChange={(e) => handleMockToggle(e.target.checked)}
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
                    ml: 0.5
                  },
                }}
              />
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
    </AppBar>
  );
}