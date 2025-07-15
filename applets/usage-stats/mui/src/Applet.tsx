import React from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import { MuiDataViewApplet } from "@smbc/mui-applet-core";
import { usePermissions } from "@smbc/applet-core";
import { createUserUsageConfig, createUIUsageConfig, createExceptionsConfig } from "./config";
import permissions from "./permissions";

export interface AppletProps {
  mountPath: string;
}

export const Applet: React.FC<AppletProps> = ({ mountPath: _mountPath }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const { hasPermission } = usePermissions();

  const tabs = [
    {
      label: "User Usage",
      permission: permissions.VIEW_USER_USAGE,
      config: createUserUsageConfig(),
    },
    {
      label: "Component Usage", 
      permission: permissions.VIEW_COMPONENT_USAGE,
      config: createUIUsageConfig(),
    },
    {
      label: "Exception Reports",
      permission: permissions.VIEW_EXCEPTIONS,
      config: createExceptionsConfig(),
    },
  ];

  // Filter tabs based on permissions
  const visibleTabs = tabs.filter(tab => 
    hasPermission("usage-stats", tab.permission)
  );

  // If no tabs are visible, show access denied
  if (visibleTabs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h4" color="error">
          🚫 Access Denied
        </Typography>
        <Typography variant="body1">
          You don't have permission to view usage statistics
        </Typography>
      </Box>
    );
  }

  const currentTab = visibleTabs[activeTab];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((tab, index) => (
            <Tab
              key={tab.label}
              label={tab.label}
              sx={{ fontWeight: activeTab === index ? "bold" : "normal" }}
            />
          ))}
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        {currentTab && (
          <MuiDataViewApplet
            config={currentTab.config}
            permissionContext="usage-stats"
            options={{
              // Usage stats are read-only, so disable transactions
              transaction: { enabled: false },
            }}
          />
        )}
      </Box>
    </Box>
  );
};