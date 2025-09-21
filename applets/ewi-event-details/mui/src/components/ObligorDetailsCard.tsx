import React from "react";
import { Box } from "@mui/material";
import { Card } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

export const ObligorDetailsCard: React.FC<{
  items: KV[];
  menuItems?: CardMenuItem[];
}> = ({ items }) => {
  return (
    <Box>
      <Card title="Obligor Details">
        <KeyValueTable items={items} />
      </Card>
    </Box>
  );
};
