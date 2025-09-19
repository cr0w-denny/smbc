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
import { ConfigurableCard, CardMenuItem } from "@smbc/mui-components";

const meta: Meta<typeof ConfigurableCard> = {
  title: "Components/ConfigurableCard",
  component: ConfigurableCard,
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
    menuItems: sampleMenuItems,
    children: (
      <Typography>
        This is the content area of the card. You can put any content here.
      </Typography>
    ),
  },
};

export const NoMenu: Story = {
  args: {
    title: "Card Without Menu",
    subtitle: "This card has no action menu",
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

export const UserProfile: Story = {
  args: {
    title: "John Doe",
    subtitle: "Senior Developer",
    menuItems: [
      {
        label: "View Profile",
        icon: <ViewIcon />,
        onClick: () => console.log("View profile"),
      },
      {
        label: "Edit Profile",
        icon: <EditIcon />,
        onClick: () => console.log("Edit profile"),
      },
      {
        label: "Settings",
        icon: <SettingsIcon />,
        onClick: () => console.log("Settings"),
        divider: true,
      },
      {
        label: "Archive",
        icon: <ArchiveIcon />,
        onClick: () => console.log("Archive"),
      },
    ],
    children: (
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ width: 56, height: 56, mr: 2 }}>JD</Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              john.doe@company.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last login: 2 hours ago
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label="React" size="small" />
          <Chip label="TypeScript" size="small" />
          <Chip label="Node.js" size="small" />
        </Box>
      </Box>
    ),
  },
};

export const ProjectCard: Story = {
  args: {
    title: "E-commerce Platform",
    subtitle: "React + Node.js Application",
    menuItems: [
      {
        label: "Open Project",
        icon: <ViewIcon />,
        onClick: () => console.log("Open project"),
      },
      {
        label: "Clone",
        icon: <CopyIcon />,
        onClick: () => console.log("Clone project"),
      },
      {
        label: "Settings",
        icon: <SettingsIcon />,
        onClick: () => console.log("Project settings"),
        divider: true,
      },
      {
        label: "Archive",
        icon: <ArchiveIcon />,
        onClick: () => console.log("Archive project"),
      },
    ],
    children: (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          A full-stack e-commerce application with modern React frontend and Node.js backend.
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">73%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={73} />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label="Active" color="success" size="small" />
            <Chip label="Frontend" variant="outlined" size="small" />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Due: Dec 15, 2023
          </Typography>
        </Box>
      </Box>
    ),
  },
};

export const WithDisabledItems: Story = {
  args: {
    title: "Read-Only Document",
    subtitle: "Some actions are disabled",
    menuItems: [
      {
        label: "View",
        icon: <ViewIcon />,
        onClick: () => console.log("View"),
      },
      {
        label: "Edit",
        icon: <EditIcon />,
        onClick: () => console.log("Edit"),
        disabled: true,
      },
      {
        label: "Download",
        icon: <DownloadIcon />,
        onClick: () => console.log("Download"),
      },
      {
        label: "Delete",
        icon: <DeleteIcon />,
        onClick: () => console.log("Delete"),
        disabled: true,
        divider: true,
      },
    ],
    children: (
      <Box>
        <Typography variant="body1" gutterBottom>
          This is a read-only document.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Some menu actions are disabled because you don't have edit permissions.
        </Typography>
      </Box>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    title: "Custom Styled Card",
    subtitle: "With custom header and content styling",
    elevation: 3,
    menuItems: sampleMenuItems,
    headerSx: {
      backgroundColor: "primary.main",
      color: "primary.contrastText",
      "& .MuiCardHeader-subheader": {
        color: "primary.contrastText",
        opacity: 0.8,
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