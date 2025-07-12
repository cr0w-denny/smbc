import React from "react";
import { Box, Card, Tabs, Tab } from "@mui/material";
import { DeveloperExperience } from "./DeveloperExperience";
import { LiveCodeExamples } from "./LiveCodeExamples";

export const Develop: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    {
      label: "Developer Experience",
      component: <DeveloperExperience />,
    },
    {
      label: "Live Code Examples",
      component: <LiveCodeExamples />,
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