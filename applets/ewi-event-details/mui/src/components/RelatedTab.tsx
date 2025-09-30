import React from "react";
import { Box } from "@mui/material";
import {
  Card,
  RelatedNews,
  AgGridTheme,
  StatusChip,
} from "@smbc/mui-components";
import type { NewsItem } from "@smbc/mui-components";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";

// Mock events data for Related Events grid
const mockEventsData = [
  {
    id: "EV-2024-001",
    event_date: "2024-09-15T00:00:00Z",
    event_category: "Credit Rating Change",
    workflow_status: "In Review",
    obligor: "Global Manufacturing Corp",
    sun_id: "SUN123456",
    plo: "PLO001",
    exposure: "$2.5M",
    trigger_shortname: "Rating Downgrade",
    trigger_type: "Credit",
    lifecycle_status: "almost-due",
  },
  {
    id: "EV-2024-002",
    event_date: "2024-09-18T00:00:00Z",
    event_category: "Covenant Breach",
    workflow_status: "Pending Review",
    obligor: "Tech Solutions Inc",
    sun_id: "SUN789012",
    plo: "PLO002",
    exposure: "$1.8M",
    trigger_shortname: "Debt Service Coverage",
    trigger_type: "Financial",
    lifecycle_status: "needs-attention",
  },
  {
    id: "EV-2024-003",
    event_date: "2024-09-20T00:00:00Z",
    event_category: "Market Event",
    workflow_status: "Completed",
    obligor: "Energy Partners LLC",
    sun_id: "SUN345678",
    plo: "PLO003",
    exposure: "$3.2M",
    trigger_shortname: "Commodity Price Drop",
    trigger_type: "Market",
    lifecycle_status: "on-course",
  },
];

// Mock news data for RelatedNews
const mockNewsData: NewsItem[] = [
  {
    id: "1",
    title: "Market volatility triggers review of risk exposure limits",
    date: "20-Sep",
    author: "Risk Team",
    source: "Risk Portal",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/risk/1",
    readingProgress: 85,
  },
  {
    id: "2",
    title: "Regulatory update: New compliance requirements for Q4",
    date: "19-Sep",
    author: "Compliance Dept",
    source: "Regulatory News",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/compliance/2",
    readingProgress: 60,
  },
  {
    id: "3",
    title: "Credit facility adjustment for major obligor portfolio",
    date: "18-Sep",
    author: "Credit Team",
    source: "Credit Watch",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/credit/3",
    readingProgress: 40,
  },
  {
    id: "4",
    title: "Industry analysis: Impact of recent market conditions",
    date: "17-Sep",
    author: "Research Analyst",
    source: "Market Intel",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/research/4",
    readingProgress: 75,
  },
];

// Status cell renderer for AG Grid
const StatusCellRenderer = (params: any) => {
  const getVariant = (status: string) => {
    const statusMap = {
      "on-course": "success" as const,
      "almost-due": "warning" as const,
      "past-due": "error" as const,
      "needs-attention": "custom" as const,
    };
    return statusMap[status as keyof typeof statusMap] || ("default" as const);
  };

  if (!params.value) {
    return <StatusChip variant="default" label="UNKNOWN" size="small" />;
  }

  const variant = getVariant(params.value);
  const label = params.value
    .replace("-", " ")
    .split(" ")
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");

  return (
    <StatusChip
      variant={variant}
      label={label}
      size="small"
      sx={{
        fontSize: "12px",
        height: "24px",
        width: "160px",
        "& .MuiChip-label": {
          px: 1.5,
          py: 0.5,
          textAlign: "center",
          width: "100%",
        },
      }}
    />
  );
};

export const RelatedTab: React.FC = () => {
  const gridRef = React.useRef<AgGridReact>(null);

  // Abbreviated column definitions for related events
  const columnDefs: ColDef[] = [
    {
      headerName: "Event Date",
      field: "event_date",
      minWidth: 120,
      valueFormatter: ({ value }) => (value ? value.split("T")[0] : "---"),
      flex: 1,
    },
    {
      headerName: "Category",
      field: "event_category",
      minWidth: 140,
      flex: 1,
    },
    {
      headerName: "Obligor",
      field: "obligor",
      minWidth: 160,
      flex: 1,
    },
    {
      headerName: "Exposure",
      field: "exposure",
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "lifecycle_status",
      cellRenderer: StatusCellRenderer,
      minWidth: 155,
      flex: 1,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        flex: 1,
        overflowY: "auto",
        p: 0,
        m: 0,
      }}
    >
      <Card title="Related Events">
        <Box sx={{ height: 300 }}>
          <AgGridTheme>
            {(popupParent) => (
              <AgGridReact
                ref={gridRef}
                popupParent={popupParent}
                rowData={mockEventsData}
                columnDefs={columnDefs}
                domLayout="normal"
                suppressRowClickSelection={true}
                animateRows={true}
                enableCellTextSelection={true}
                suppressCellFocus={true}
                suppressRowHoverHighlight={false}
                headerHeight={40}
                rowHeight={56}
                defaultColDef={{
                  filter: true,
                  sortable: true,
                  resizable: true,
                  menuTabs: ["filterMenuTab", "columnsMenuTab"],
                }}
                sortingOrder={["asc", "desc"]}
                multiSortKey={"ctrl"}
                columnMenu="legacy"
              />
            )}
          </AgGridTheme>
        </Box>
      </Card>

      <Card title="Related News">
        <RelatedNews
          items={mockNewsData}
          onItemClick={(item) => console.log("Clicked news item:", item)}
        />
      </Card>
    </Box>
  );
};
