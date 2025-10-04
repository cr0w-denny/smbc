import React from "react";
import { useMediaQuery, useTheme, SvgIcon } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Card, StatusChip } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

// Custom error icon with white filled exclamation mark
const ErrorIconFilled: React.FC<{ sx?: any }> = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    {/* Circle outline */}
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      fill="currentColor"
    />
    {/* White filled exclamation mark */}
    <path d="M11 7h2v6h-2zm0 8h2v2h-2z" fill="#FFFFFF" />
  </SvgIcon>
);

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
        icon = <ErrorIconFilled sx={{ fontSize: 16 }} />;
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
