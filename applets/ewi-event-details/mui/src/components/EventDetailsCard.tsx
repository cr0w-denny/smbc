import React from "react";
import { Chip, useMediaQuery, useTheme } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Card, StatusChip } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

export const EventDetailsCard: React.FC<{
  items: KV[];
  menuItems?: CardMenuItem[];
}> = ({ items, menuItems }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  // Transform lifecycle status to use StatusChip component with icon
  const transformedItems = items.map((item) => {
    if (item.label === "Lifecycle Status") {
      const status = String(item.value);
      let icon: React.ReactElement;
      let variant: "error" | "warning" | "success" | "default";

      // Determine icon and variant based on status
      if (status.toLowerCase().includes("past due")) {
        icon = <ErrorIcon sx={{ fontSize: 16 }} />;
        variant = "error";
      } else if (
        status.toLowerCase().includes("pending") ||
        status.toLowerCase().includes("almost")
      ) {
        icon = <WarningIcon sx={{ fontSize: 16 }} />;
        variant = "warning";
      } else if (
        status.toLowerCase().includes("complete") ||
        status.toLowerCase().includes("resolved") ||
        status.toLowerCase().includes("on course")
      ) {
        icon = <CheckCircleIcon sx={{ fontSize: 16 }} />;
        variant = "success";
      } else {
        icon = <CheckCircleIcon sx={{ fontSize: 16 }} />;
        variant = "default";
      }

      return {
        ...item,
        value: (
          <StatusChip
            icon={icon}
            label={status}
            size="small"
            variant={variant}
          />
        ),
      };
    }
    return item;
  });

  return (
    <Card title="Event Details" menuItems={menuItems}>
      <KeyValueTable
        items={transformedItems}
        pairsPerRow={isLargeScreen ? 2 : 1}
      />
    </Card>
  );
};