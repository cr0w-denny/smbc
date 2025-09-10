import React from "react";
import { Chip, useMediaQuery, useTheme } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ConfigurableCard } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

export const EventDetailsCard: React.FC<{
  items: KV[];
  menuItems?: CardMenuItem[];
}> = ({ items, menuItems }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  // Transform lifecycle status to use Chip component with icon
  const transformedItems = items.map((item) => {
    if (item.label === "Lifecycle Status") {
      const status = String(item.value);
      let icon: React.ReactElement;
      let colors: { border: string; badge: string };

      // Determine icon and colors based on status
      if (status.toLowerCase().includes("past due")) {
        icon = <ErrorIcon sx={{ fontSize: 16 }} />;
        colors = { border: "#EF5569", badge: "#EF5569" };
      } else if (
        status.toLowerCase().includes("pending") ||
        status.toLowerCase().includes("almost")
      ) {
        icon = <WarningIcon sx={{ fontSize: 16 }} />;
        colors = { border: "#FD992E", badge: "#FD992E" };
      } else if (
        status.toLowerCase().includes("complete") ||
        status.toLowerCase().includes("resolved") ||
        status.toLowerCase().includes("on course")
      ) {
        icon = <CheckCircleIcon sx={{ fontSize: 16 }} />;
        colors = { border: "#12A187", badge: "#12A187" };
      } else {
        icon = <CheckCircleIcon sx={{ fontSize: 16 }} />;
        colors = { border: "#666", badge: "#666" };
      }

      return {
        ...item,
        value: (
          <Chip
            icon={icon}
            label={status}
            size="small"
            variant="outlined"
            sx={{
              borderColor: colors.border,
              color: colors.badge,
              "& .MuiChip-icon": {
                color: colors.badge,
              },
            }}
          />
        ),
      };
    }
    return item;
  });

  return (
    <ConfigurableCard title="Event Details" menuItems={menuItems}>
      <KeyValueTable
        items={transformedItems}
        pairsPerRow={isLargeScreen ? 2 : 1}
      />
    </ConfigurableCard>
  );
};