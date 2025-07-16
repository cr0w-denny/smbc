import type { GridOptions, ColDef } from 'ag-grid-community';

export interface AgGridConfig {
  /** AG-Grid theme class name (e.g., 'ag-theme-alpine', 'ag-theme-material') */
  theme?: string;
  
  /** Full AG-Grid options - merged with computed options */
  gridOptions?: GridOptions;
  
  /** Whether to enable advanced filtering features */
  enableAdvancedFilters?: boolean;
  
  /** Whether to enable Excel export (requires ag-grid-enterprise) */
  enableExcelExport?: boolean;
  
  /** Whether to enable CSV export */
  enableCsvExport?: boolean;
  
  /** Custom column definitions to override default mapping */
  customColumnDefs?: (defaultColDefs: ColDef[]) => ColDef[];
  
  /** Default column definition properties */
  defaultColDef?: ColDef;
  
  /** Whether to show the sidebar */
  showSidebar?: boolean;
  
  /** Custom sidebar configuration */
  sidebarConfig?: {
    toolPanels?: string[];
    defaultToolPanel?: string;
  };
}