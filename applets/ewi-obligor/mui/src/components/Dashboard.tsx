import React, { useMemo } from "react";
import { Box, Typography, ThemeProvider } from "@mui/material";
import {
  Card,
  Filter,
  darkTheme,
  RelatedNews,
  AppShell,
  Width,
} from "@smbc/mui-components";
import type { NewsItem } from "@smbc/mui-components";
import { useHashNavigation } from "@smbc/applet-core";
import { DetailsCard } from "./DetailsCard";
import { Grid } from "./Grid";
import type { FilterValues, CardMenuItem } from "@smbc/mui-components";

// Mock data for obligors
const mockObligors = [
  {
    id: "1",
    obligor_name: "ABC Corporation",
    sun_id: "SUN123456",
    exposure: "$2,500,000",
    risk_rating: "BBB",
    country: "USA",
    industry: "Manufacturing",
    last_review: "2024-01-15",
  },
  {
    id: "2",
    obligor_name: "XYZ Industries",
    sun_id: "SUN789012",
    exposure: "$1,800,000",
    risk_rating: "A",
    country: "Canada",
    industry: "Technology",
    last_review: "2024-02-20",
  },
  {
    id: "3",
    obligor_name: "Global Trading Co",
    sun_id: "SUN345678",
    exposure: "$3,200,000",
    risk_rating: "BB",
    country: "UK",
    industry: "Trade",
    last_review: "2024-01-08",
  },
];

// Mock KV data for DetailsCard
const mockKVData = [
  { label: "Total Exposure", value: "$7,500,000" },
  { label: "Number of Obligors", value: "3" },
  { label: "Average Risk Rating", value: "BBB+" },
  { label: "Last Updated", value: "2024-03-01" },
  { label: "Portfolio Status", value: "Active" },
  { label: "Review Cycle", value: "Quarterly" },
];

// Mock news data for RelatedNews
const mockNewsData: NewsItem[] = [
  {
    id: "1",
    title:
      "Sandy Tong: S.F.'s first Asian fire chief - and first without fire...",
    date: "06-Sep",
    author: "Yujie Zhou",
    source: "Google: 70.4%",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/news/1",
    readingProgress: 70,
  },
  {
    id: "2",
    title: "Election Results 2025: See results across San Francisco",
    date: "05-Sep",
    author: "News Team",
    source: "Google: 78.1%",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/news/2",
    readingProgress: 45,
  },
  {
    id: "3",
    title: "Homeless people often choose the street over a bed. We look...",
    date: "04-Sep",
    author: "Reporter",
    source: "Google: 65.2%",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/news/3",
    readingProgress: 90,
  },
  {
    id: "4",
    title: "Auto Towing owners accused of buying Lamborghini while...",
    date: "03-Sep",
    author: "Business Desk",
    source: "Google: 72.8%",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/news/4",
    readingProgress: 25,
  },
  {
    id: "5",
    title:
      "San Francisco Harley-Davidson closes abruptly after 110 Years in...",
    date: "02-Sep",
    author: "Auto Reporter",
    source: "Google: 81.3%",
    imageUrl: "/api/placeholder/38/38",
    externalUrl: "https://example.com/news/5",
    readingProgress: 60,
  },
];

interface ObligorFilters {
  obligorName: string;
  sunId: string;
  fromDate: string;
  toDate: string;
}

const Dashboard: React.FC = () => {
  // Filter state - using auto-applied params (immediate URL sync)
  const { autoParams: params, setAutoParams: setParams } =
    useHashNavigation<ObligorFilters>({
      obligorName: "",
      sunId: "",
      fromDate: "",
      toDate: "",
    });

  // Filter obligors based on search criteria
  const filteredObligors = useMemo(() => {
    return mockObligors.filter((obligor) => {
      const nameMatch =
        !params.obligorName || obligor.obligor_name === params.obligorName;
      const sunIdMatch = !params.sunId || obligor.sun_id === params.sunId;

      return nameMatch && sunIdMatch;
    });
  }, [params.obligorName, params.sunId]);

  // Filter configuration
  const filterSpec = {
    fields: [
      {
        name: "obligorName",
        type: "select" as const,
        label: "Obligor Name",
        placeholder: "Select obligor...",
        options: [
          { value: "", label: "All Obligors" },
          { value: "ABC Corporation", label: "ABC Corporation" },
          { value: "XYZ Industries", label: "XYZ Industries" },
          { value: "Global Trading Co", label: "Global Trading Co" },
        ],
      },
      {
        name: "sunId",
        type: "select" as const,
        label: "SUN ID",
        placeholder: "Select SUN ID...",
        options: [
          { value: "", label: "All SUN IDs" },
          { value: "SUN123456", label: "SUN123456" },
          { value: "SUN789012", label: "SUN789012" },
          { value: "SUN345678", label: "SUN345678" },
        ],
      },
    ],
  };

  const handleFilterChange = (values: FilterValues) => {
    setParams(values as ObligorFilters);
  };

  // Menu items for the AG Grid card
  const gridMenuItems: CardMenuItem[] = [
    { label: "Export", onClick: () => console.log("Export clicked") },
    { label: "Refresh", onClick: () => console.log("Refresh clicked") },
    { label: "Settings", onClick: () => console.log("Settings clicked") },
  ];

  // Menu items for dummy cards
  const dummyMenuItems: CardMenuItem[] = [
    { label: "Action 1", onClick: () => console.log("Action 1") },
    { label: "Action 2", onClick: () => console.log("Action 2") },
  ];

  return (
    <AppShell.Page>
      <AppShell.Toolbar variant="extended">
        <Width>
          <ThemeProvider theme={darkTheme}>
            <Filter
              spec={filterSpec}
              values={params}
              onFiltersChange={handleFilterChange}
            />
          </ThemeProvider>
        </Width>
      </AppShell.Toolbar>

      <AppShell.Content>
        <Width>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              height: "100%",
            }}
          >
            {/* First row: DetailsCard and Grid */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {/* Position 1,1: DetailsCard */}
              <Box sx={{ flex: "1 1 30%", minWidth: 300, height: 400 }}>
                <DetailsCard items={mockKVData} />
              </Box>

              {/* Position 1,2: Grid */}
              <Box sx={{ flex: "2 1 60%", height: 400 }}>
                <Grid obligors={filteredObligors} menuItems={gridMenuItems} />
              </Box>
            </Box>

            {/* Second row: Two dummy cards */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {/* Position 2,1: Dummy Card 1 */}
              <Box sx={{ flex: "1 1 45%", minWidth: 400 }}>
                <Card
                  title="Event Occurrence by Month"
                  menuItems={dummyMenuItems}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      INSERT CHART
                    </Typography>
                  </Box>
                </Card>
              </Box>

              {/* Position 2,2: Related News */}
              <Box sx={{ flex: "1 1 45%", minWidth: 400 }}>
                <Card title="Related News" menuItems={dummyMenuItems}>
                  <RelatedNews items={mockNewsData} />
                </Card>
              </Box>
            </Box>
          </Box>
        </Width>
      </AppShell.Content>
    </AppShell.Page>
  );
};

export default Dashboard;
