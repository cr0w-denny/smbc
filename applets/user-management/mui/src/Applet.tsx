import { FC } from "react";
import { Box } from "@mui/material";
import { AppletNavigation } from "@smbc/mui-components";
import { useHashNavigation } from "@smbc/applet-core";
import { UserManager } from "./UserManager";
import { UserProfile } from "./UserProfile";

export interface AppletProps {
  /** The mount path for the applet routing */
  mountPath: string;
  /** Type of users to display in the main table */
  userType?: "all" | "admins" | "non-admins";
  /** Permission context for role-based access control */
  permissionContext?: string;
}

/**
 * 🚀 Main User Management Applet Entry Point
 * 
 * This is the primary entry point for the user management applet.
 * It provides navigation between user management views and handles routing
 * within the applet. This component is automatically loaded when the applet
 * is mounted in an applet host.
 * 
 * Located at `src/Applet.tsx` for easy discoverability by developers.
 * 
 * @example
 * ```tsx
 * // Used automatically by applet host
 * <Applet 
 *   mountPath="/user-management"
 *   userType="all"
 *   permissionContext="admin-panel"
 * />
 * ```
 */
export const Applet: FC<AppletProps> = ({
  mountPath,
  userType = "all",
  permissionContext = "user-management",
}) => {
  const { currentPath, navigateTo } = useHashNavigation(mountPath);

  /**
   * Renders the current route component based on the current path
   */
  const renderCurrentRoute = () => {
    switch (currentPath) {
      case "/profile":
        return <UserProfile />;
      case "/":
      default:
        return (
          <UserManager
            userType={userType}
            permissionContext={permissionContext}
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Navigation - using tabs mode */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <AppletNavigation
          currentPath={currentPath}
          onNavigate={navigateTo}
          routes={[
            {
              path: "/",
              label: "User Management",
            },
            {
              path: "/profile",
              label: "User Profile",
            },
          ]}
          mode="tabs"
        />
      </Box>

      {/* Route content */}
      <Box sx={{ flex: 1 }}>{renderCurrentRoute()}</Box>
    </Box>
  );
};