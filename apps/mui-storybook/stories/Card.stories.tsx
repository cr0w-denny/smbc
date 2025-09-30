import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography, Button, Chip, Avatar, LinearProgress } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  FileCopy as CopyIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import { Card, CardMenuItem } from "@smbc/mui-components";
import { ui } from "@smbc/ui-core";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    elevation: {
      control: { type: "range", min: 0, max: 24, step: 1 },
    },
    showMenu: {
      control: "boolean",
    },
    size: {
      control: "select",
      options: ["medium", "large"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMenuItems: CardMenuItem[] = [
  {
    label: "Edit",
    icon: <EditIcon />,
    onClick: () => console.log("Edit clicked"),
  },
  {
    label: "Share",
    icon: <ShareIcon />,
    onClick: () => console.log("Share clicked"),
  },
  {
    label: "Download",
    icon: <DownloadIcon />,
    onClick: () => console.log("Download clicked"),
    divider: true,
  },
  {
    label: "Delete",
    icon: <DeleteIcon />,
    onClick: () => console.log("Delete clicked"),
  },
];

export const Basic: Story = {
  args: {
    title: "Basic Card",
    subtitle: "A simple card with basic content",
    size: "medium",
    menuItems: sampleMenuItems,
    children: (
      <Typography>
        This is the content area of the card. You can put any content here.
      </Typography>
    ),
  },
};

export const LargeSize: Story = {
  args: {
    title: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        Events Workflow
        <Chip
          label="142"
          size="small"
          sx={{
            color: ui.card.header.text.dark || "#98A4B9",
            backgroundColor: "#0E131D", // Custom dark chip background
            fontSize: "14px",
            "& .MuiChip-label": {
              px: 1.5,
              fontSize: "14px"
            }
          }}
        />
      </Box>
    ),
    size: "large",
    menuItems: sampleMenuItems,
    children: (
      <Box>
        <Typography variant="body1" gutterBottom>
          This is a large size card with a 21px title font.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Notice the larger title text and the count chip using card header text token.
        </Typography>
      </Box>
    ),
  },
};

export const NoMenu: Story = {
  args: {
    title: "Card Without Menu",
    subtitle: "This card has no action menu",
    size: "medium",
    showMenu: false,
    children: (
      <Box>
        <Typography variant="body1" gutterBottom>
          This card doesn't show the menu button in the header.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Useful when you don't need any card-level actions.
        </Typography>
      </Box>
    ),
  },
};

export const WithToolbar: Story = {
  args: {
    title: "Card with Toolbar",
    subtitle: "Additional toolbar actions in the header",
    size: "medium",
    menuItems: sampleMenuItems,
    toolbar: (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button size="small" variant="outlined">
          Action 1
        </Button>
        <Button size="small" variant="contained">
          Action 2
        </Button>
      </Box>
    ),
    children: (
      <Typography>
        This card has both a toolbar with buttons and a menu with additional actions.
      </Typography>
    ),
  },
};

export const ComplexTitle: Story = {
  args: {
    title: (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
            Dashboard Overview
          </Typography>
          <Chip
            label="LIVE"
            size="small"
            sx={{
              backgroundColor: "#12A187",
              color: "white",
              fontSize: "11px",
              height: "20px"
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: ui.color.text.secondary.dark || "rgba(255,255,255,0.6)" }}>
          Last updated: 2 minutes ago
        </Typography>
      </Box>
    ),
    size: "large",
    menuItems: [
      {
        label: "Refresh",
        icon: <ViewIcon />,
        onClick: () => console.log("Refresh"),
      },
      {
        label: "Export Data",
        icon: <DownloadIcon />,
        onClick: () => console.log("Export"),
      },
      {
        label: "Settings",
        icon: <SettingsIcon />,
        onClick: () => console.log("Settings"),
        divider: true,
      },
    ],
    children: (
      <Box>
        <Typography variant="body1" gutterBottom>
          This card demonstrates a complex title with multiple elements.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The title prop accepts React nodes, allowing for rich header content including status badges,
          timestamps, and multi-line layouts.
        </Typography>
      </Box>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    title: "Custom Styled Card",
    subtitle: "With custom header and content styling",
    size: "medium",
    elevation: 3,
    menuItems: sampleMenuItems,
    headerSx: {
      backgroundColor: "primary.main",
      color: "primary.contrastText",
      "& .MuiTypography-root": {
        color: "primary.contrastText",
      },
    },
    contentSx: {
      backgroundColor: "grey.50",
    },
    sx: {
      border: "2px solid",
      borderColor: "primary.main",
    },
    children: (
      <Box>
        <Typography variant="body1" gutterBottom>
          This card demonstrates custom styling capabilities.
        </Typography>
        <Typography variant="body2">
          The header has a custom background color, and the content area has a different background.
        </Typography>
      </Box>
    ),
  },
};