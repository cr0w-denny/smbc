import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Box, Paper, Typography, TextField, InputAdornment } from "@mui/material";
import {
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Analytics as AnalyticsIcon,
  IntegrationInstructions as IntegrationIcon,
} from "@mui/icons-material";
import {
  TreeMenu,
  TreeMenuSection,
  TreeMenuHeader,
  NavigationRoute,
} from "@smbc/mui-components";

const meta: Meta<typeof TreeMenu> = {
  title: "Components/TreeMenu",
  component: TreeMenu,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    showDebugInfo: {
      control: "boolean",
    },
    compact: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleRootRoute: NavigationRoute = {
  path: "/dashboard",
  label: "Dashboard",
  icon: DashboardIcon,
};

const sampleHeaders: TreeMenuHeader[] = [
  { id: "main", label: "Main Navigation", icon: "menu" },
  { id: "tools", label: "Tools & Utilities", icon: "build" },
];

const sampleMenuSections: TreeMenuSection[] = [
  {
    sectionId: "user-management",
    sectionLabel: "User Management",
    sectionIcon: PeopleIcon,
    sectionVersion: "v2.1",
    hasInternalNavigation: true,
    groups: [
      {
        id: "users",
        label: "Users",
        order: 1,
        routes: [
          { path: "/users/list", label: "User List" },
          { path: "/users/create", label: "Create User" },
          { path: "/users/roles", label: "User Roles" },
        ],
      },
      {
        id: "permissions",
        label: "Permissions",
        order: 2,
        routes: [
          { path: "/permissions/manage", label: "Manage Permissions" },
          { path: "/permissions/groups", label: "Permission Groups" },
        ],
      },
    ],
  },
  {
    sectionId: "content",
    sectionLabel: "Content Management",
    sectionIcon: ArticleIcon,
    hasInternalNavigation: true,
    groups: [
      {
        id: "articles",
        label: "Articles",
        order: 1,
        routes: [
          { path: "/content/articles", label: "All Articles" },
          { path: "/content/articles/create", label: "New Article" },
          { path: "/content/articles/drafts", label: "Drafts" },
        ],
      },
      {
        id: "media",
        label: "Media",
        order: 2,
        routes: [
          { path: "/content/media/library", label: "Media Library" },
          { path: "/content/media/upload", label: "Upload Files" },
        ],
      },
    ],
  },
  {
    sectionId: "reports",
    sectionLabel: "Reports",
    sectionIcon: AssessmentIcon,
    hasInternalNavigation: false,
    directRoute: { path: "/reports", label: "Reports Dashboard" },
  },
  {
    sectionId: "settings",
    sectionLabel: "System Settings",
    sectionIcon: SettingsIcon,
    hasInternalNavigation: true,
    groups: [
      {
        id: "general",
        label: "General",
        order: 1,
        routes: [
          { path: "/settings/general", label: "General Settings" },
          { path: "/settings/appearance", label: "Appearance" },
        ],
      },
      {
        id: "advanced",
        label: "Advanced",
        order: 2,
        routes: [
          { path: "/settings/api", label: "API Configuration" },
          { path: "/settings/security", label: "Security Settings" },
          { path: "/settings/backup", label: "Backup & Restore" },
        ],
      },
    ],
  },
];

// Interactive wrapper
const TreeMenuWrapper = ({
  menuSections,
  headers,
  rootRoute,
  showSearch = false,
  ...props
}: {
  menuSections: TreeMenuSection[];
  headers?: TreeMenuHeader[];
  rootRoute?: NavigationRoute;
  showSearch?: boolean;
  showDebugInfo?: boolean;
  compact?: boolean;
}) => {
  const [currentPath, setCurrentPath] = useState("/dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const searchInput = showSearch ? (
    <TextField
      fullWidth
      size="small"
      placeholder="Search menu..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 2 }}
    />
  ) : undefined;

  return (
    <Box sx={{ display: "flex", height: 600 }}>
      <Paper sx={{ width: 300, overflow: "auto" }}>
        <TreeMenu
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          menuSections={menuSections}
          headers={headers}
          rootRoute={rootRoute}
          searchTerm={searchTerm}
          searchInput={searchInput}
          totalSections={menuSections.length}
          {...props}
        />
      </Paper>
      <Box sx={{ flex: 1, p: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="h6">
          Current Path: <strong>{currentPath}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

export const Basic: Story = {
  render: () => (
    <TreeMenuWrapper
      menuSections={sampleMenuSections}
      rootRoute={sampleRootRoute}
    />
  ),
};

export const WithHeaders: Story = {
  render: () => (
    <TreeMenuWrapper
      menuSections={sampleMenuSections}
      headers={sampleHeaders}
      rootRoute={sampleRootRoute}
    />
  ),
};

export const WithSearch: Story = {
  render: () => (
    <TreeMenuWrapper
      menuSections={sampleMenuSections}
      rootRoute={sampleRootRoute}
      showSearch
    />
  ),
};

export const WithDebugInfo: Story = {
  render: () => (
    <TreeMenuWrapper
      menuSections={sampleMenuSections}
      rootRoute={sampleRootRoute}
      showDebugInfo
    />
  ),
};

export const Compact: Story = {
  render: () => (
    <TreeMenuWrapper
      menuSections={sampleMenuSections}
      rootRoute={sampleRootRoute}
      compact
    />
  ),
};

