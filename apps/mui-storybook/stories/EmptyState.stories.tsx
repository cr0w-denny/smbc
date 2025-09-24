import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FolderOpen as FolderIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import { EmptyState } from "@smbc/mui-components";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 400,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "No data available",
    description: "There's nothing to display here yet.",
  },
};

export const WithIcon: Story = {
  args: {
    icon: <SearchIcon sx={{ fontSize: 64, color: "text.secondary" }} />,
    title: "No search results",
    description:
      "Try adjusting your search criteria to find what you're looking for.",
  },
};

export const WithPrimaryAction: Story = {
  args: {
    icon: <AddIcon sx={{ fontSize: 64, color: "primary.main" }} />,
    title: "No items yet",
    description: "Get started by creating your first item.",
    primaryAction: {
      label: "Create Item",
      onClick: () => console.log("Create clicked"),
      variant: "contained",
      color: "primary",
    },
  },
};

export const WithBothActions: Story = {
  args: {
    icon: <FolderIcon sx={{ fontSize: 64, color: "text.secondary" }} />,
    title: "Empty folder",
    description: "This folder doesn't contain any files yet.",
    primaryAction: {
      label: "Upload Files",
      onClick: () => console.log("Upload clicked"),
      variant: "contained",
      color: "primary",
    },
    secondaryAction: {
      label: "Create Folder",
      onClick: () => console.log("Create folder clicked"),
      variant: "outlined",
      color: "primary",
    },
  },
};

export const ErrorState: Story = {
  args: {
    icon: <ErrorIcon sx={{ fontSize: 64, color: "error.main" }} />,
    title: "Failed to load data",
    description: "There was an error loading the content. Please try again.",
    primaryAction: {
      label: "Retry",
      onClick: () => console.log("Retry clicked"),
      variant: "contained",
      color: "primary",
    },
    secondaryAction: {
      label: "Refresh Page",
      onClick: () => console.log("Refresh clicked"),
      variant: "text",
      color: "primary",
    },
  },
};
