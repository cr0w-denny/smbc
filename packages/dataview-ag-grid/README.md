# @smbc/dataview-ag-grid

AG-Grid renderer for dataview

## Installation

```bash
npm install @smbc/dataview-ag-grid ag-grid-react ag-grid-community
```

For enterprise features (row grouping, pivoting, Excel export):
```bash
npm install ag-grid-enterprise
```

## Usage

```tsx
import { useDataView } from '@smbc/dataview';
import { AgGridDataView } from '@smbc/dataview-ag-grid';
import type { AgGridConfig } from '@smbc/dataview-ag-grid';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const config: DataViewConfig<Product, AgGridConfig> = {
  api: { /* ... */ },
  schema: { /* ... */ },
  columns: [
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'category', label: 'Category', filterable: true },
  ],
  renderer: AgGridDataView,
  rendererConfig: {
    theme: 'ag-theme-alpine',
    enableCsvExport: true,
    showSidebar: true,
    gridOptions: {
      enableRangeSelection: true,
      animateRows: true,
    },
  },
};

function ProductTable() {
  const dataView = useDataView(config);
  
  return <dataView.TableComponent />;
}
```

## Configuration

### AgGridConfig Options

```tsx
interface AgGridConfig {
  /** AG-Grid theme ('ag-theme-alpine', 'ag-theme-material', etc.) */
  theme?: string;
  
  /** Full AG-Grid options - merged with computed options */
  gridOptions?: GridOptions;
  
  /** Enable advanced filtering features */
  enableAdvancedFilters?: boolean;
  
  /** Enable Excel export (requires ag-grid-enterprise) */
  enableExcelExport?: boolean;
  
  /** Enable CSV export */
  enableCsvExport?: boolean;
  
  /** Custom column definitions transformation */
  customColumnDefs?: (defaultColDefs: ColDef[]) => ColDef[];
  
  /** Default column definition properties */
  defaultColDef?: ColDef;
  
  /** Show the sidebar */
  showSidebar?: boolean;
  
  /** Sidebar configuration */
  sidebarConfig?: {
    toolPanels?: string[];
    defaultToolPanel?: string;
  };
}
```
