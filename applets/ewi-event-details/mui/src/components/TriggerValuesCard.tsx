import React from "react";
import { ConfigurableCard, KeyValueTable } from "@smbc/mui-components";
import type { CardMenuItem, KV } from "@smbc/mui-components";

export type TriggerValueRow = { attribute: string; value: React.ReactNode };

export const TriggerValuesCard: React.FC<{
  rows: TriggerValueRow[];
  menuItems?: CardMenuItem[];
}> = ({ rows, menuItems }) => {
  // Convert TriggerValueRow to KV format
  const kvItems: KV[] = rows.map((row) => ({
    label: row.attribute,
    value: row.value,
  }));

  return (
    <ConfigurableCard title="Events Trigger Values" menuItems={menuItems}>
      <KeyValueTable items={kvItems} />
    </ConfigurableCard>
  );
};