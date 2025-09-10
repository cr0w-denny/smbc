import React from "react";
import { ConfigurableCard } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { Table } from "@smbc/mui-components";

export type ActivityRow = { when: string; by: string; comments: string };

export const ActivityCard: React.FC<{
  rows: ActivityRow[];
  menuItems?: CardMenuItem[];
}> = ({ rows, menuItems }) => (
  <ConfigurableCard title="Event Activity" menuItems={menuItems}>
    <Table
      columns={[
        {
          header: "Activity Date / Time",
          render: (r: ActivityRow) => r.when,
          width: 220,
        },
        { header: "Activity By", render: (r) => r.by, width: 180 },
        { header: "Comments", render: (r) => r.comments },
      ]}
      rows={rows}
    />
  </ConfigurableCard>
);
