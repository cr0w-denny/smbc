import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { AgGridTheme, Filter, Console, TabBar, type TabBarItem } from '@smbc/mui-components';
import type { ColDef, GridReadyEvent, IDetailCellRendererParams } from 'ag-grid-community';
import type { FilterSpec, FilterValues } from '@smbc/mui-components';
import type { DebugEntry } from './utils/debug';
import type { CurrentAppletInfo } from './HostAppBar';
import { ServerSelector } from './ServerSelector';
import { getAvailableServersWithOverrides } from './utils/apiOverrides';
import { useFeatureFlag, type Environment } from '@smbc/applet-core';
import { TextField } from '@mui/material';
import { RoleManager, type RoleManagerProps, type User, type PermissionGroup, type Permission } from './RoleManager';
interface DevConsoleProps {
  open: boolean;
  onClose: () => void;
  currentAppletInfo?: CurrentAppletInfo | null;
  impersonationEmail?: string;
  onImpersonationEmailChange?: (email: string) => void;
}

// Detail cell renderer for master-detail
const DetailCellRenderer: React.FC<IDetailCellRendererParams> = (props) => {
  const { data } = props;

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="pre"
        sx={{
          fontSize: '0.75rem',
          overflow: 'auto',
          bgcolor: 'background.default',
          p: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          flex: 1,
          minHeight: 0
        }}
      >
        {JSON.stringify(data?.data || {}, null, 2)}
      </Box>
    </Box>
  );
};

export const DevConsole: React.FC<DevConsoleProps> = ({
  open,
  onClose,
  currentAppletInfo,
  impersonationEmail = '',
  onImpersonationEmailChange
}) => {
  const [logs, setLogs] = useState<DebugEntry[]>([]);
  const environment = useFeatureFlag<Environment>("environment") || "development";

  const handleImpersonateEmailChange = (email: string) => {
    console.log('🔄 DevConsole setting impersonation email:', email);
    onImpersonationEmailChange?.(email);
  };

  // No longer need storage sync since we're using context directly
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    components: [] as string[],
    minutes: 5,
  });
  const [activeTab, setActiveTab] = useState('debug');

  // Role manager state
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Analyst']);

  // Mock data for role manager
  const availableRoles = ['Guest', 'Analyst', 'Staff', 'Manager', 'Admin'];
  const mockUser: User = {
    id: '1',
    name: 'Development User',
    email: 'dev@example.com',
    roles: selectedRoles,
  };

  // Helper to compute permissions with access based on selected roles
  const computePermissions = (rawPermissions: any[]): Permission[] => {
    return rawPermissions.map(perm => ({
      key: perm.id,
      label: perm.name,
      hasAccess: selectedRoles.some(role => perm.requiredRoles.includes(role))
    }));
  };

  const rawPermissionData = [
    {
      id: 'ewi-events',
      label: 'EWI Events',
      permissions: [
        { id: 'VIEW_EVENTS', name: 'View Events', requiredRoles: ['Analyst', 'Staff', 'Manager', 'Admin'] },
        { id: 'CREATE_EVENTS', name: 'Create Events', requiredRoles: ['Staff', 'Manager', 'Admin'] },
        { id: 'DELETE_EVENTS', name: 'Delete Events', requiredRoles: ['Manager', 'Admin'] },
      ]
    },
    {
      id: 'ewi-obligor',
      label: 'Obligor Management',
      permissions: [
        { id: 'VIEW_OBLIGOR', name: 'View Obligor Data', requiredRoles: ['Analyst', 'Staff', 'Manager', 'Admin'] },
        { id: 'EDIT_OBLIGOR', name: 'Edit Obligor Data', requiredRoles: ['Staff', 'Manager', 'Admin'] },
      ]
    }
  ];

  const mockPermissions: PermissionGroup[] = rawPermissionData.map(group => ({
    id: group.id,
    label: group.label,
    permissions: computePermissions(group.permissions)
  }));

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const refreshLogs = () => {
    const allLogs = (window as any).__debugLogs || [];
    const newLogs = [...allLogs].reverse(); // Show newest first

    // Only update if data actually changed to prevent unnecessary re-renders
    setLogs(prevLogs => {
      if (JSON.stringify(prevLogs) === JSON.stringify(newLogs)) {
        return prevLogs; // No change, return same reference
      }
      return newLogs;
    });
  };

  useEffect(() => {
    if (!open) return;

    refreshLogs();

    if (autoRefresh) {
      const interval = setInterval(refreshLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, open]);

  // Get unique components from logs for filter options
  const availableComponents = useMemo(() => {
    const components = Array.from(new Set(logs.map(log => log.component)));
    return components.map(comp => ({ label: comp, value: comp }));
  }, [logs]);

  // Create filter spec
  const filterSpec: FilterSpec = {
    debounceMs: 300,
    fields: [
      {
        name: 'components',
        type: 'select',
        label: 'Components',
        multiple: true,
        placeholder: 'All Components',
        options: availableComponents,
      },
      {
        name: 'minutes',
        type: 'number',
        label: 'Last N minutes',
        placeholder: '5',
      },
    ],
  };

  // Filter logs based on filter values
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Skip any malformed entries
      if (!log || !log.timestamp || !log.component || !log.event) {
        console.warn('Skipping malformed log entry:', log);
        return false;
      }

      // Component filter
      const componentMatch = filterValues.components.length === 0 ||
                           filterValues.components.includes(log.component);

      // Time filter - show logs from last N minutes
      const logTime = new Date(log.timestamp);
      const cutoffTime = new Date(Date.now() - (filterValues.minutes || 5) * 60 * 1000);
      const timeMatch = logTime >= cutoffTime;

      return componentMatch && timeMatch;
    });
  }, [logs, filterValues]);

  // The impersonation context already manages the global variable

  // Column definitions for ag-grid
  const columnDefs: ColDef[] = useMemo(() => [
    {
      // Master detail column for expand/collapse
      cellRenderer: "agGroupCellRenderer",
      headerName: "",
      width: 60,
      minWidth: 60,
      cellRendererParams: {
        innerRenderer: () => "", // No content in the cell
      },
      pinned: "left",
      lockPosition: true,
      sortable: false,
      filter: false,
      suppressColumnsToolPanel: true,
    },
    {
      headerName: 'Time',
      field: 'timestamp',
      width: 120,
      cellRenderer: (params: any) => new Date(params.value).toLocaleTimeString(),
      sort: 'desc'
    },
    {
      headerName: 'Component',
      field: 'component',
      width: 140,
      filter: 'agTextColumnFilter'
    },
    {
      headerName: 'Event',
      field: 'event',
      width: 180,
      filter: 'agTextColumnFilter'
    },
    {
      headerName: 'Session ID',
      field: 'id',
      width: 200,
      filter: 'agTextColumnFilter'
    },
    {
      headerName: 'Entry',
      field: 'data',
      flex: 1,
      cellRenderer: (params: any) => {
        const preview = JSON.stringify(params.value).substring(0, 100);
        return preview.length > 97 ? preview + '...' : preview;
      }
    }
  ], []);

  const downloadLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    (window as any).__debug?.clear();
    setLogs([]);
  };

  // Use context setEmail function directly - no need for local handler

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Tab configuration
  const tabs: TabBarItem[] = [
    { value: 'debug', label: 'Debug' },
    { value: 'api', label: 'API' },
    { value: 'permissions', label: 'Permissions' },
    { value: 'settings', label: 'Settings' },
  ];

  return (
    <Console
      open={open}
      onClose={onClose}
      defaultHeight={500}
      minHeight={200}
      maxHeight={window.innerHeight * 0.9}
      storageKey="dev-console"
      header={
        <TabBar
          items={tabs}
          value={activeTab}
          onChange={(value: string) => setActiveTab(value)}
        />
      }
    >
      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'debug' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, height: '100%' }}>
            {/* Filters and Controls */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Filter
                spec={filterSpec}
                values={filterValues}
                onFiltersChange={setFilterValues}
                sx={{ flex: 1, minWidth: 300 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto Refresh"
                />
                <Chip label={`${filteredLogs.length} logs`} size="small" />
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={refreshLogs}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton size="small" onClick={downloadLogs}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear">
                  <IconButton size="small" onClick={clearLogs}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider />

            {/* Logs Display */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              {filteredLogs.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No debug logs found. Enable debug flows and interact with the app to see logs.
                  </Typography>
                </Box>
              ) : (
                <AgGridTheme>
                  {(popupParent: HTMLElement | null) => (
                    <AgGridReact
                      rowData={filteredLogs}
                      columnDefs={columnDefs}
                      domLayout="normal"
                      suppressRowClickSelection={true}
                      headerHeight={40}
                      suppressCellFocus={true}
                      animateRows={false}
                      masterDetail={true}
                      detailCellRenderer={DetailCellRenderer}
                      isRowMaster={() => true}
                      popupParent={popupParent}
                      defaultColDef={{
                        resizable: true,
                        sortable: true,
                        filter: true,
                        menuTabs: ["filterMenuTab", "columnsMenuTab"],
                      }}
                      columnMenu="legacy"
                      onGridReady={(params: GridReadyEvent) => {
                        params.api.sizeColumnsToFit();
                        console.log('Debug grid data:', filteredLogs);
                      }}
                    />
                  )}
                </AgGridTheme>
              )}
            </Box>
          </Box>
        )}

        {activeTab === 'api' && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Configuration
            </Typography>

            {(() => {
              const hasApiSpec = !!currentAppletInfo?.apiSpec?.spec;

              if (hasApiSpec) {
                const availableServers = getAvailableServersWithOverrides(
                  currentAppletInfo.apiSpec,
                  currentAppletInfo.id
                );
                const currentServer = availableServers.find(s => s.description === environment);

                return (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Server Environment
                    </Typography>
                    <ServerSelector
                      currentAppletInfo={currentAppletInfo}
                      showStatus
                      showTooltip={false}
                    />

                    {currentServer && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Current Endpoint
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            bgcolor: 'background.default',
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          {currentServer.url}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Impersonate User
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="user@smbcgroup.com"
                        value={impersonationEmail}
                        onChange={(e) => handleImpersonateEmailChange(e.target.value)}
                        helperText="API requests will include X-Impersonate header with this email"
                        sx={{ mt: 1 }}
                      />
                    </Box>

                  </Box>
                );
              } else if (currentAppletInfo) {
                return (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No API configuration
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This applet doesn't use external APIs
                    </Typography>
                  </Box>
                );
              } else {
                return (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No applet detected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Navigate to an applet to see API options
                    </Typography>
                  </Box>
                );
              }
            })()}
          </Box>
        )}

        {activeTab === 'permissions' && (
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <RoleManager
              user={mockUser}
              availableRoles={availableRoles}
              selectedRoles={selectedRoles}
              onRoleToggle={handleRoleToggle}
              appletPermissions={mockPermissions}
              title="Development Roles & Permissions"
              showUserInfo={true}
              persistRoles={true}
              localStorageKey="dev-console-roles"
            />
          </Box>
        )}

        {activeTab === 'settings' && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theme toggle and preferences coming soon
            </Typography>
          </Box>
        )}
      </Box>
    </Console>
  );
};

// Helper to show dev console
(window as any).__showDevConsole = () => {
  console.log('Dev console would open here. Add <DevConsole> to your app and call setOpen(true).');
};