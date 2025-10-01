import React, { useState } from "react";
import {
  Box,
  Typography,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  PsychologyAlt as DiscretionaryIcon,
  Gavel as MandatoryIcon,
  ChipToggleGroup,
  ActionMenu,
} from "@smbc/mui-components";
import { ui, color } from "@smbc/ui-core";
import type { ChipToggleItem, ActionMenuItem } from "@smbc/mui-components";

interface ActionBarProps {
  values: Record<string, any> & {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    category?: string;
    exRatings?: string;
    workflow?: string;
    priority?: string;
  };
  onValuesChange: (values: any) => void;
  statusCounts?: {
    onCourse?: number;
    almostDue?: number;
    pastDue?: number;
    discretionary?: number;
    mandatory?: number;
  };
  /** Menu items for the action menu (vertical dots) */
  actionMenuItems?: ActionMenuItem[];
}

export const ActionBar: React.FC<ActionBarProps> = ({
  values,
  onValuesChange,
  statusCounts = {},
  actionMenuItems = [],
}) => {

  // Create chip data for ChipToggleGroup
  const filterChips: ChipToggleItem[] = [
    {
      value: "Mandatory",
      label: "Mandatory",
      icon: <MandatoryIcon />,
      count: statusCounts.mandatory ?? 0,
      color: color.status.info500,
    },
    {
      value: "Discretionary",
      label: "Discretionary",
      icon: <DiscretionaryIcon />,
      count: statusCounts.discretionary ?? 0,
      color: color.neutral.plum100,
    },
    {
      value: "on-course",
      label: "On Course",
      icon: <CheckCircleIcon />,
      count: statusCounts.onCourse ?? 0,
      color: ui.color.status.success,
    },
    {
      value: "past-due",
      label: "Past Due",
      icon: <ErrorIcon />,
      count: statusCounts.pastDue ?? 0,
      color: ui.color.status.error,
    },
    {
      value: "almost-due",
      label: "Almost Due",
      icon: <WarningIcon />,
      count: statusCounts.almostDue ?? 0,
      color: ui.color.status.warning,
    },
  ];

  // Handle chip toggle - allow multiple chips to be active
  const handleChipToggle = (chipValue: string, isActive: boolean) => {
    const chip = filterChips.find((c) => c.value === chipValue);
    if (!chip) return;

    // Calculate new active chips
    let newActiveChips;
    if (isActive) {
      newActiveChips = [...activeChips, chipValue];
    } else {
      newActiveChips = activeChips.filter((v) => v !== chipValue);
    }

    // Update active chips state for visual feedback
    setActiveChips(newActiveChips);

    // Update URL params with all selections
    const categoryChips = ["Mandatory", "Discretionary"];
    const statusChips = ["on-course", "past-due", "almost-due"];
    const activeCategories = newActiveChips.filter(v => categoryChips.includes(v));
    const activeStatuses = newActiveChips.filter(v => statusChips.includes(v));

    const newValues = { ...values };
    newValues.categories = activeCategories;
    newValues.statuses = activeStatuses;

    // Update URL params
    onValuesChange(newValues);
  };

  // Initialize active chips from current filter values
  const [activeChips, setActiveChips] = useState<string[]>(() => {
    const active = [];
    if (values.statuses && Array.isArray(values.statuses)) {
      active.push(...values.statuses);
    }
    if (values.categories && Array.isArray(values.categories)) {
      active.push(...values.categories);
    }
    return active;
  });

  // Sync activeChips when values change externally (e.g., from URL)
  React.useEffect(() => {
    const active = [];
    if (values.statuses && Array.isArray(values.statuses)) {
      active.push(...values.statuses);
    }
    if (values.categories && Array.isArray(values.categories)) {
      active.push(...values.categories);
    }
    setActiveChips(active);
  }, [values.statuses, values.categories]);

  return (
    <Box sx={{ p: 2, pb: 0 }}>
      {/* Status Chips */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "nowrap",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
            Quick Filters:
          </Typography>
          <ChipToggleGroup
            chips={filterChips}
            activeValues={activeChips}
            onChipToggle={handleChipToggle}
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          />
        </Box>

        {/* Right Side Controls */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* Action Menu */}
          <ActionMenu menuItems={actionMenuItems} />
        </Box>
      </Box>

    </Box>
  );
};
