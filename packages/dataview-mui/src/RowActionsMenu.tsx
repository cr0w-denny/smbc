import React from "react";
import { ActionMenu, ActionMenuItem } from "@smbc/mui-components";
import type { RowAction } from "@smbc/dataview";

interface RowActionsMenuProps<T> {
  actions: RowAction<T>[];
  item: T;
}

export function RowActionsMenu<T>({ actions, item }: RowActionsMenuProps<T>) {
  // Convert RowAction format to ActionMenuItem format
  const menuItems: ActionMenuItem<T>[] = actions.map((action) => ({
    label: action.label || action.key,
    icon: action.icon ? React.createElement(action.icon) : undefined,
    onClick: (item: T) => action.onClick?.(item),
    disabled: (item: T) => action.disabled?.(item) || false,
    appliesTo: (item: T) => !action.hidden?.(item),
  }));

  return (
    <ActionMenu<T>
      menuItems={menuItems}
      item={item}
      stopPropagation={true}
      ariaLabel="more actions"
    />
  );
}