import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { Console, TabBar, type TabBarItem } from '@smbc/mui-components';
import type { CurrentAppletInfo } from './HostAppBar';
import { ServerSelector } from './ServerSelector';
import { getAvailableServersWithOverrides } from './utils/apiOverrides';
import { useFeatureFlag, useAppletCore, useUser, usePersistedRoles, useAppletPermissions, type Environment } from '@smbc/applet-core';
import { TextField } from '@mui/material';
import { RoleManager } from './RoleManager';
import { TokenEditor } from './TokenEditor';
interface DevConsoleProps {
  open: boolean;
  onClose: () => void;
  currentAppletInfo?: CurrentAppletInfo | null;
  impersonationEmail?: string;
  onImpersonationEmailChange?: (email: string) => void;
}


export const DevConsole: React.FC<DevConsoleProps> = ({
  open,
  onClose,
  currentAppletInfo,
  impersonationEmail = '',
  onImpersonationEmailChange
}) => {
  const environment = useFeatureFlag<Environment>("environment") || "development";

  const handleImpersonateEmailChange = (email: string) => {
    console.log('🔄 DevConsole setting impersonation email:', email);
    onImpersonationEmailChange?.(email);
  };

  const [activeTab, setActiveTab] = useState('api');

  // Real applet integration
  const { user, setRoles, availableRoles } = useUser();
  const { roleUtils, applets, roleConfig } = useAppletCore();

  // Use mounted applets from context
  const mountedApplets = applets;

  // Use the fixed usePersistedRoles hook
  const { selectedRoles, toggleRole } = usePersistedRoles({
    userRoles: user?.roles || ['Analyst'],
    availableRoles,
    storageKey: "dev-console-roles",
    onRolesChange: setRoles,
  });

  // Debug logging
  console.log('DevConsole Debug:', {
    mountedApplets: mountedApplets.map(a => ({ id: a.id, label: a.label })),
    roleConfig,
    permissionMappings: roleConfig?.permissionMappings,
    selectedRoles,
    availableRoles,
  });

  // Use real permission calculation
  const appletPermissions = useAppletPermissions({
    hostApplets: mountedApplets,
    roleConfig,
    selectedRoles,
    hasPermission: roleUtils.hasPermission,
  });

  console.log('DevConsole appletPermissions result:', appletPermissions);


  // Use context setEmail function directly - no need for local handler

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Tab configuration
  const tabs: TabBarItem[] = [
    { value: 'api', label: 'API' },
    { value: 'permissions', label: 'Permissions' },
    { value: 'tokens', label: 'Tokens' },
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

        {activeTab === 'api' && (
          <Box sx={{ p: 3 }}>
            {/* Global Impersonation - Always shown */}
            <Box>
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

            <Divider sx={{ my: 3 }} />

            {/* Applet-specific API configuration */}
            {(() => {
              const hasApiSpec = !!currentAppletInfo?.apiSpec?.spec;

              if (hasApiSpec) {
                const availableServers = getAvailableServersWithOverrides(
                  currentAppletInfo.apiSpec,
                  currentAppletInfo.id
                );
                const currentServer = availableServers.find(s => s.description === environment);

                return (
                  <Box>
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
                  </Box>
                );
              } else if (currentAppletInfo) {
                return (
                  <Box>
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
                  <Box>
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
              user={user || undefined}
              availableRoles={availableRoles}
              selectedRoles={selectedRoles}
              onRoleToggle={toggleRole}
              appletPermissions={appletPermissions as any}
              title=""
              showUserInfo={false}
              persistRoles={true}
              localStorageKey="dev-console-roles"
            />
          </Box>
        )}

        {activeTab === 'tokens' && (
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <TokenEditor />
          </Box>
        )}

      </Box>
    </Console>
  );
};

