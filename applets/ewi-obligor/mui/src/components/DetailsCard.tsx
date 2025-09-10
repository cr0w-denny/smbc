import React from "react";
import { Box } from "@mui/material";
import { ConfigurableCard } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

export const DetailsCard: React.FC<{
  items: KV[];
  menuItems?: CardMenuItem[];
}> = ({ items, menuItems }) => {
  return (
    <Box sx={{ height: "100%" }}>
      <ConfigurableCard
        title="Obligor Details"
        menuItems={menuItems}
        sx={{
          height: "100%",
        }}
      >
        <KeyValueTable items={items} />
      </ConfigurableCard>
    </Box>
  );
};
