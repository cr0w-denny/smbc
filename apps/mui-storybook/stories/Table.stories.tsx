import type { Meta, StoryObj } from "@storybook/react";
import { Chip, Avatar, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Table } from "@smbc/mui-components";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
}

const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2023-12-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    status: "active",
    lastLogin: "2023-11-30",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2023-11-15",
  },
];

export const Basic: Story = {
  args: {
    columns: [
      {
        header: "Name",
        render: (user: User) => user.name,
      },
      {
        header: "Email",
        render: (user: User) => user.email,
      },
      {
        header: "Role",
        render: (user: User) => user.role,
      },
    ],
    rows: sampleUsers,
  },
};

export const WithStatus: Story = {
  args: {
    columns: [
      {
        header: "Name",
        render: (user: User) => user.name,
      },
      {
        header: "Email",
        render: (user: User) => user.email,
      },
      {
        header: "Status",
        render: (user: User) => (
          <Chip
            label={user.status}
            color={user.status === "active" ? "success" : "default"}
            size="small"
          />
        ),
        align: "center",
      },
      {
        header: "Last Login",
        render: (user: User) => user.lastLogin,
        align: "right",
      },
    ],
    rows: sampleUsers,
  },
};

export const WithActions: Story = {
  args: {
    columns: [
      {
        header: "User",
        render: (user: User) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.name.split(" ").map(n => n[0]).join("")}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {user.email}
              </div>
            </div>
          </div>
        ),
        width: "40%",
      },
      {
        header: "Role",
        render: (user: User) => user.role,
        align: "center",
      },
      {
        header: "Status",
        render: (user: User) => (
          <Chip
            label={user.status}
            color={user.status === "active" ? "success" : "default"}
            size="small"
          />
        ),
        align: "center",
      },
      {
        header: "Actions",
        render: (user: User) => (
          <div>
            <IconButton size="small" onClick={() => console.log("Edit", user.id)}>
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => console.log("Delete", user.id)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        ),
        align: "center",
        width: 120,
      },
    ],
    rows: sampleUsers,
  },
};

