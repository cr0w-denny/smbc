import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { UserMenu } from "@smbc/mui-components";

const meta: Meta<typeof UserMenu> = {
  title: "Components/UserMenu",
  component: UserMenu,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
const UserMenuWrapper = ({ ...props }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [userRoles, setUserRoles] = useState(props.userRoles || []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleRole = (roleId: string, enabled: boolean) => {
    setUserRoles((prev: any[]) =>
      prev.map((role) => (role.id === roleId ? { ...role, enabled } : role)),
    );
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        onClick={handleClick}
        startIcon={<PersonIcon />}
      >
        Open User Menu
      </Button>

      <UserMenu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        name={props.name}
        avatarUrl={props.avatarUrl}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
        userRoles={userRoles}
        onToggleRole={handleToggleRole}
        onProfile={() => console.log("Profile clicked")}
        onSettings={() => console.log("Settings clicked")}
        onQuickGuide={() => console.log("Quick Guide clicked")}
        onLogout={() => console.log("Logout clicked")}
      />
    </>
  );
};

export const Default: Story = {
  render: () => (
    <UserMenuWrapper
      name="John Doe"
      userRoles={[
        { id: "admin", label: "Administrator", enabled: true },
        { id: "manager", label: "Manager", enabled: false },
        { id: "viewer", label: "Viewer", enabled: true },
      ]}
    />
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <UserMenuWrapper
      name="Jane Smith"
      avatarUrl="https://i.pravatar.cc/150?img=1"
      userRoles={[
        { id: "developer", label: "Developer", enabled: true },
        { id: "reviewer", label: "Code Reviewer", enabled: true },
      ]}
    />
  ),
};

export const ManyRoles: Story = {
  render: () => (
    <UserMenuWrapper
      name="Alex Johnson"
      userRoles={[
        { id: "admin", label: "System Administrator", enabled: true },
        { id: "manager", label: "Project Manager", enabled: false },
        { id: "developer", label: "Senior Developer", enabled: true },
        { id: "reviewer", label: "Code Reviewer", enabled: true },
        { id: "analyst", label: "Business Analyst", enabled: false },
        { id: "tester", label: "QA Tester", enabled: false },
        { id: "designer", label: "UX Designer", enabled: true },
        { id: "writer", label: "Technical Writer", enabled: false },
      ]}
    />
  ),
};

export const NoRoles: Story = {
  render: () => <UserMenuWrapper name="Basic User" userRoles={[]} />,
};

export const LongName: Story = {
  render: () => (
    <UserMenuWrapper
      name="Christopher Alexander Wellington III"
      userRoles={[
        { id: "executive", label: "Executive Director", enabled: true },
        { id: "board", label: "Board Member", enabled: true },
      ]}
    />
  ),
};
