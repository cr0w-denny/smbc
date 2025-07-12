import React from "react";
import { Box, Card, Tabs, Tab } from "@mui/material";
import { VersioningStrategy } from "./VersioningStrategy";
import { ReleaseWorkflow } from "./ReleaseWorkflow";

export const Deploy: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    {
      label: "Versioning & Publishing",
      component: <VersioningStrategy />,
    },
    {
      label: "Release Workflow",
      component: <ReleaseWorkflow />,
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              label={tab.label}
              sx={{ fontWeight: activeTab === index ? 'bold' : 'normal' }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabs[activeTab]?.component}
        </Box>
      </Card>
    </Box>
  );
};