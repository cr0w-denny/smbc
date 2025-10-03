import React, { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { Console } from "@smbc/mui-components";
import type { CurrentAppletInfo } from "./HostAppBar";
import { ServerSelector } from "./ServerSelector";
import { getAvailableServersWithOverrides } from "./utils/apiOverrides";
import {
  useFeatureFlag,
  useAppletCore,
  useUser,
  usePersistedRoles,
  useAppletPermissions,
  type Environment,
} from "@smbc/applet-core";
import { TextField } from "@mui/material";
import { RoleManager } from "./RoleManager";
import { TokenEditor } from "./TokenEditor";
interface DevConsoleProps {
  open: boolean;
  onClose: () => void;
  currentAppletInfo?: CurrentAppletInfo | null;
  impersonationEmail?: string;
  onImpersonationEmailChange?: (email: string) => void;
  theme?: any;
  setTheme?: (theme: any) => void;
}

export const DevConsole: React.FC<DevConsoleProps> = ({
  open,
  onClose,
  currentAppletInfo,
  impersonationEmail = "",
  onImpersonationEmailChange,
  theme: _theme,
  setTheme: _setTheme,
}) => {
  const environment =
    useFeatureFlag<Environment>("environment") || "development";

  const handleImpersonateEmailChange = (email: string) => {
    onImpersonationEmailChange?.(email);
  };

  const [activeTab, setActiveTab] = useState("api");

  // Real applet integration
  const { user, setRoles, availableRoles } = useUser();
  const { roleUtils, applets, roleConfig } = useAppletCore();

  // Use mounted applets from context
  const mountedApplets = applets;

  // Use the fixed usePersistedRoles hook
  const { selectedRoles, toggleRole } = usePersistedRoles({
    userRoles: user?.roles || ["Analyst"],
    availableRoles,
    storageKey: "dev-console-roles",
    onRolesChange: setRoles,
  });

  // Use real permission calculation
  const appletPermissions = useAppletPermissions({
    hostApplets: mountedApplets,
    roleConfig,
    selectedRoles,
    hasPermission: roleUtils.hasPermission,
  });

  // Use context setEmail function directly - no need for local handler

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Console
      open={open}
      onClose={onClose}
      defaultHeight={500}
      minHeight={200}
      maxHeight={window.innerHeight * 0.9}
      storageKey="dev-console"
      header={
        <Box
          sx={{
            display: "flex",
            width: "100%",
            gap: 0,
            borderBottom: 1,
            borderColor: "divider",
            minHeight: 32,
          }}
        >
          {[
            { label: "API", value: "api" },
            { label: "Permissions", value: "permissions" },
            { label: "Tokens", value: "tokens" },
          ].map((tab) => (
            <Box
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              sx={{
                px: 2,
                pt: 1,
                pb: 0.75,
                fontSize: "0.8125rem",
                cursor: "pointer",
                color:
                  activeTab === tab.value
                    ? (theme) =>
                        theme.palette.mode === "dark" ? "#e8eaed" : "#1a1a1a"
                    : (theme) =>
                        theme.palette.mode === "dark" ? "#9aa0a6" : "#5f6368",
                fontWeight: activeTab === tab.value ? 500 : 400,
                borderBottom: activeTab === tab.value ? "2px solid" : "none",
                borderColor: (theme) =>
                  theme.palette.mode === "dark" ? "#1a73e8" : "#1a73e8",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              {tab.label}
            </Box>
          ))}
        </Box>
      }
    >
      {/* Tab Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "api" && (
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
                  currentAppletInfo.id,
                );
                const currentServer = availableServers.find(
                  (s) => s.description === environment,
                );

                return (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Server Environment
                    </Typography>
                    <ServerSelector
                      currentAppletInfo={currentAppletInfo}
                      showStatus
                      showTooltip={false}
                    />

                    {currentServer && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Current Endpoint
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            bgcolor: "background.default",
                            p: 1,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
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

        {activeTab === "permissions" && (
          <Box sx={{ height: "100%", overflow: "auto" }}>
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

        {activeTab === "tokens" && (
          <Box sx={{ height: "100%", overflow: "hidden" }}>
            <TokenEditor />
          </Box>
        )}
      </Box>
    </Console>
  );
};
