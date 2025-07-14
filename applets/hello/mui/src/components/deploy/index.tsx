import React from "react";
import {
  Box,
  Card,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { VersioningStrategy } from "./VersioningStrategy";
import { ReleaseWorkflow } from "./ReleaseWorkflow";
import { CheckCircle as CheckIcon } from "@mui/icons-material";

export const Deploy: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const DeploymentChecklist = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Pre-Deployment Checklist
      </Typography>
      <List dense>
        {[
          "API TypeSpec is complete and generates valid types",
          "All permissions are defined and documented",
          "DataView configuration matches your API structure",
          "Host integration is tested with app.config.ts",
          "Build passes without errors: npm run build",
          "Linting passes: npm run lint",
          "Type checking passes: npm run typecheck",
        ].map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <CheckIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const tabs = [
    {
      label: "Release Process",
      component: <ReleaseWorkflow />,
    },
    {
      label: "Versioning",
      component: <VersioningStrategy />,
    },
    {
      label: "Checklist",
      component: <DeploymentChecklist />,
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
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              sx={{ fontWeight: activeTab === index ? "bold" : "normal" }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>{tabs[activeTab]?.component}</Box>
      </Card>
    </Box>
  );
};
