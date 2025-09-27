import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFeatureFlag, useFeatureFlags, useAppletCore, type Environment } from "@smbc/applet-core";
import type { CurrentAppletInfo } from "./HostAppBar";
import { getAvailableServersWithOverrides } from "./utils/apiOverrides";

/**
 * Props for the ServerSelector component
 */
export interface ServerSelectorProps {
  /** Current applet information to get available servers */
  currentAppletInfo?: CurrentAppletInfo | null;
  /** Whether MSW is initializing */
  isMswInitializing?: boolean;
  /** Whether to show server status indicator */
  showStatus?: boolean;
  /** Whether to show tooltip on status hover */
  showTooltip?: boolean;
}

/**
 * Server selector component that replaces the mock toggle.
 * Shows all available servers for the currently active applet.
 */
type ServerStatus = 'online' | 'offline' | 'unknown' | 'mock-ready' | 'mock-initializing';

export function ServerSelector({
  currentAppletInfo,
  isMswInitializing = false,
  showStatus = false,
  showTooltip = true,
}: ServerSelectorProps) {
  const environment = useFeatureFlag<Environment>("environment") || "development";
  const { setFlag } = useFeatureFlags();
  const { state } = useAppletCore();
  const [serverStatus, setServerStatus] = React.useState<ServerStatus>('unknown');
  
  // Get available servers from the current applet's API spec with overrides
  const availableServers = React.useMemo(() => {
    if (!currentAppletInfo?.apiSpec) {
      return [];
    }

    const servers = getAvailableServersWithOverrides(
      currentAppletInfo.apiSpec,
      currentAppletInfo.id
    );
    console.log(`🔍 Available servers for ${currentAppletInfo.id}:`, servers);
    
    // Sort servers in standard order: mock, local, dev, qa, prod
    const order = ["mock", "local", "dev", "qa", "prod"];
    return order
      .map(type => servers.find(s => s.description === type))
      .filter((server): server is NonNullable<typeof server> => server != null);
  }, [currentAppletInfo]);

  // Check server status
  React.useEffect(() => {
    if (!showStatus || !currentAppletInfo) return;

    // For mock environment, use MSW status with additional verification
    if (environment === 'mock') {
      if (isMswInitializing) {
        setServerStatus('mock-initializing');
        return;
      }
      
      // Stable MSW status checking with retry logic
      let consecutiveFailures = 0;
      const maxFailures = 2; // Allow 2 failures before marking as offline
      
      const checkMswStatus = async () => {
        try {
          // First check the state
          if (state.mswStatus?.isReady) {
            consecutiveFailures = 0;
            setServerStatus('mock-ready');
            return;
          }
          
          // Fallback: Try a mock health check
          const response = await fetch('/api/health', {
            method: 'GET',
            signal: AbortSignal.timeout(1500)
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.service === 'msw') {
              consecutiveFailures = 0;
              setServerStatus('mock-ready');
              return;
            }
          }
          
          // If we get here, the check failed
          consecutiveFailures++;
          
        } catch (error) {
          consecutiveFailures++;
        }
        
        // Only mark as offline after consecutive failures
        if (consecutiveFailures >= maxFailures) {
          setServerStatus('offline');
        }
        // Otherwise keep current status to avoid flickering
      };
      
      // Initial check
      checkMswStatus();
      
      // Set up more frequent periodic check when switching to mock
      const mockCheckInterval = setInterval(checkMswStatus, 2000);
      
      return () => clearInterval(mockCheckInterval);
    }

    // For non-mock environments, try a simple health check
    const checkServerHealth = async () => {
      try {
        const currentServer = availableServers.find(s => s.description === environment);
        if (!currentServer) {
          setServerStatus('unknown');
          return;
        }

        // Try a simple HEAD request to the server root
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        await fetch(currentServer.url, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors', // Avoid CORS issues for simple connectivity check
        });

        clearTimeout(timeoutId);
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServerHealth();
  }, [environment, isMswInitializing, state.mswStatus, availableServers, currentAppletInfo, showStatus]);

  // Handle server selection change
  const handleServerChange = (event: SelectChangeEvent<string>) => {
    const selectedDescription = event.target.value;
    
    console.log("🔄 Server selector change:", {
      selectedDescription,
      currentEnvironment: environment,
    });
    
    setFlag("environment", selectedDescription as Environment);
    
    // Reset status when changing servers
    if (showStatus) {
      setServerStatus('unknown');
    }
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    if (!showStatus) return null;

    const getStatusColor = () => {
      switch (serverStatus) {
        case 'online':
        case 'mock-ready':
          return '#4caf50';
        case 'offline':
          return '#f44336';
        case 'mock-initializing':
          return '#ff9800';
        default:
          return '#9e9e9e';
      }
    };

    const getStatusText = () => {
      switch (serverStatus) {
        case 'online':
          return 'Online';
        case 'mock-ready':
          return 'Mock Ready';
        case 'offline':
          return 'Offline';
        case 'mock-initializing':
          return 'Initializing...';
        default:
          return 'Unknown';
      }
    };

    const currentServer = availableServers.find(s => s.description === environment);
    const tooltipContent = currentServer ?
      `${currentServer.description.toUpperCase()}\n${currentServer.url}` :
      getStatusText();

    const statusElement = serverStatus === 'mock-initializing' ? (
      <CircularProgress
        size={12}
        sx={{ color: getStatusColor() }}
      />
    ) : (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }}
      />
    );

    return showTooltip ? (
      <Tooltip
        title={tooltipContent}
        arrow
        placement="left"
        componentsProps={{
          tooltip: {
            sx: {
              py: 0.5,
              px: 1,
              fontSize: '0.6rem',
              maxWidth: 'none',
            }
          }
        }}
      >
        {statusElement}
      </Tooltip>
    ) : statusElement;
  };

  // Don't render if no applet or no API spec
  if (!currentAppletInfo?.apiSpec || availableServers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
      {renderStatusIndicator()}
      <FormControl
          size="small"
          sx={{
            minWidth: 80,
            "& .MuiOutlinedInput-root": {
              color: "inherit",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.7)",
              },
            },
            "& .MuiSelect-icon": {
              color: "inherit",
            },
          }}
        >
          <Select
            value={availableServers.find(s => s.description === environment)?.description || availableServers[0]?.description || ''}
            onChange={handleServerChange}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 200, // Limit dropdown height
                },
              },
            }}
            sx={{
              fontSize: "0.875rem",
              "& .MuiSelect-select": {
                py: 1,
                px: 1.5,
              },
            }}
          >
            {availableServers.map((server) => (
              <MenuItem key={server.url} value={server.description}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {server.description}
                  </Typography>
                  {server.isOverride && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }}
                    >
                      ENV
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
    </Box>
  );
}