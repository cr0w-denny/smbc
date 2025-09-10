import React from "react";
import { Box } from "@mui/material";
import { ConfigurableCard } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

export const ObligorDetailsCard: React.FC<{
  items: KV[];
  menuItems?: CardMenuItem[];
}> = ({ items }) => {
  return (
    <Box>
      <ConfigurableCard title="Obligor Details">
        <KeyValueTable items={items} />
      </ConfigurableCard>
    </Box>
  );
};
