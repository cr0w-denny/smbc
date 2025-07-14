import React from "react";
import {
  Box,
  Card,
  Tabs,
  Tab,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { PermissionsDemo } from "./demos/PermissionsDemo";
import { FiltersDemo } from "./demos/FiltersDemo";
import { DataViewDemo } from "./demos/DataViewDemo";

const DataViewModeSelector: React.FC = () => {
  const [mode, setMode] = React.useState<"optimistic" | "transaction">(
    "optimistic",
  );

  const descriptions = {
    optimistic:
      "Immediate UI updates before API responses. Best for responsive UX when network calls might be slow.",
    transaction:
      "Batch operations with commit/rollback. Perfect for bulk edits where you want to review changes before applying.",
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Choose your update strategy
      </Typography>
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, newMode) => newMode && setMode(newMode)}
        size="small"
        sx={{
          mb: 2,
          backgroundColor: 'action.hover',
          borderRadius: '8px',
          padding: '4px',
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: '6px !important',
            margin: 0,
            '&.Mui-selected': {
              backgroundColor: 'background.paper',
              boxShadow: 1,
              color: 'text.primary',
            },
            '&:not(.Mui-selected)': {
              backgroundColor: 'transparent',
              color: 'text.secondary',
            },
          },
        }}
      >
        <ToggleButton value="optimistic">Optimistic Updates</ToggleButton>
        <ToggleButton value="transaction">Transaction Mode</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
        {descriptions[mode]}
      </Typography>

      <DataViewDemo mode={mode} />
    </Box>
  );
};

export const Develop: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const tabs = [
    {
      label: "Basic",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Basic Applet with Permissions
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Start with simple UI components and permission-based content
            control. No APIs needed.
          </Typography>
          <PermissionsDemo />
        </Box>
      ),
    },
    {
      label: "Filters",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hash Parameter Filters
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Add stateful UI with shareable URLs. Perfect for search interfaces
            and configuration panels.
          </Typography>
          <FiltersDemo />
        </Box>
      ),
    },
    {
      label: "DataView",
      content: (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Data-Driven Interfaces
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Full CRUD with automatic table generation, forms, and bulk
            operations.
          </Typography>
          <DataViewModeSelector />
        </Box>
      ),
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

        <Box sx={{ p: 3 }}>{tabs[activeTab]?.content}</Box>
      </Card>
    </Box>
  );
};
