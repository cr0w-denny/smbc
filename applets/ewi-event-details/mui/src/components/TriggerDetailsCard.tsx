import React from "react";
import { Card } from "@smbc/mui-components";
import type { CardMenuItem } from "@smbc/mui-components";
import { KeyValueTable, type KV } from "@smbc/mui-components";

export const TriggerDetailsCard: React.FC<{
  items: KV[];
  menuItems?: CardMenuItem[];
}> = ({ items, menuItems }) => (
  <Card title="Events Trigger Details" menuItems={menuItems}>
    <KeyValueTable items={items} />
  </Card>
);