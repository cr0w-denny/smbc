import type { DataView, DataViewConfig } from "@smbc/dataview";
import type { AgGridConfig } from "./types";
import { AgGridTable } from "./components/AgGridTable";

// Components AG Grid handles internally
function NotSupportedPaginationComponent() {
  throw new Error(
    "Internal feature. Configure through rendererConfig instead of using custom component.",
  );
}

// Components that need to be provided by the application
function PlaceholderComponent() {
  return <div>Component not implemented</div>;
}

/**
 * AG-Grid renderer for dataview
 */
export const AgGridDataView: DataView<any, AgGridConfig> = {
  name: "AgGrid",
  TableComponent: AgGridTable,

  // External components that can work alongside AG-Grid
  FilterComponent: PlaceholderComponent as any,
  FormComponent: PlaceholderComponent as any,
  CreateButtonComponent: PlaceholderComponent as any,

  // Components that AG-Grid handles internally - throw helpful errors
  PaginationComponent: NotSupportedPaginationComponent as any,
};

/**
 * Type-safe factory function for creating AG-Grid renderer
 */
export function createAgGridDataView<T>() {
  return AgGridDataView as DataView<T, AgGridConfig>;
}
