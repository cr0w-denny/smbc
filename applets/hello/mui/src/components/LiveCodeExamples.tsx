import React from "react";
import { Box, Card, CardContent, Tabs, Tab } from "@mui/material";
import { FilteringDemo } from "./demos/FilteringDemo";
import { PermissionsDemo } from "./demos/PermissionsDemo";
import { DataViewDemo } from "./demos/DataViewDemo";
import { NavigationDemo } from "./demos/NavigationDemo";

export const LiveCodeExamples: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const demos = [
    {
      label: "Smart Filtering",
      icon: "🔍",
      component: <FilteringDemo />,
    },
    {
      label: "Hash Navigation",
      icon: "🧭", 
      component: <NavigationDemo />,
    },
    {
      label: "Permissions System",
      icon: "🔐",
      component: <PermissionsDemo />,
    },
    {
      label: "DataView Component",
      icon: "📊",
      component: <DataViewDemo />,
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
          {demos.map((demo, index) => (
            <Tab 
              key={index}
              label={`${demo.icon} ${demo.label}`}
              sx={{ fontWeight: activeTab === index ? 'bold' : 'normal' }}
            />
          ))}
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {demos[activeTab]?.component}
        </CardContent>
      </Card>
    </Box>
  );
};