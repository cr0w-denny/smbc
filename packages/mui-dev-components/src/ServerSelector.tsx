import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import { useFeatureFlag, useFeatureFlags, getAvailableServers, useAppletCore, type Environment } from "@smbc/applet-core";
import type { CurrentAppletInfo } from "./HostAppBar";

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
}: ServerSelectorProps) {
  const environment = useFeatureFlag<Environment>("environment") || "development";
  const { setFlag } = useFeatureFlags();
  const { state } = useAppletCore();
  const [serverStatus, setServerStatus] = React.useState<ServerStatus>('unknown');
  
  // Get available servers from the current applet's API spec
  const availableServers = React.useMemo(() => {
    if (!currentAppletInfo?.apiSpec) {
      return [];
    }
    
    const servers = getAvailableServers(currentAppletInfo.apiSpec);
    console.log(`🔍 Available servers for ${currentAppletInfo.id}:`, servers);
    
    // Sort servers in standard order: mock, dev, qa, prod
    const order = ["mock", "dev", "qa", "prod"];
    return order
      .map(type => servers.find(s => s.description === type))
      .filter((server): server is NonNullable<typeof server> => server != null);
  }, [currentAppletInfo]);

  // Check server status
  React.useEffect(() => {
    if (!showStatus || !currentAppletInfo) return;

    // For mock environment, use MSW status
    if (environment === 'mock') {
      if (isMswInitializing) {
        setServerStatus('mock-initializing');
      } else if (state.mswStatus?.isReady) {
        setServerStatus('mock-ready');
      } else {
        setServerStatus('offline');
      }
      return;
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
    
    console.log("Server selector change:", {
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
          return '#4caf50'; // green
        case 'offline':
          return '#f44336'; // red
        case 'mock-initializing':
          return '#ff9800'; // orange
        default:
          return '#9e9e9e'; // gray
      }
    };

    if (serverStatus === 'mock-initializing') {
      return (
        <CircularProgress 
          size={12} 
          sx={{ color: getStatusColor() }}
        />
      );
    }
    
    return (
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }}
      />
    );
  };

  // Don't render if no applet or no API spec
  if (!currentAppletInfo?.apiSpec || availableServers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          sx={{
            fontSize: "0.875rem",
            "& .MuiSelect-select": {
              py: 0.5,
              px: 1,
            },
          }}
        >
          {availableServers.map((server) => (
            <MenuItem key={server.url} value={server.description}>
              {server.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}