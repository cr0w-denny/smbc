import { FC, useRef } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { useHashNavigation } from "@smbc/applet-core";
import { UserManager } from "./UserManager";
import { UserProfile } from "./UserProfile";
import { UserAnalytics } from "./UserAnalytics";

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

  // Store the previous URL (including query params) when navigating to profile
  const previousUrlRef = useRef<string | null>(null);

  /**
   * Renders the current route component based on the current path
   */
  const renderCurrentRoute = () => {
    // Check for profile route with ID
    if (currentPath.startsWith("/profile/")) {
      const userId = currentPath.replace("/profile/", "");
      return (
        <UserProfile
          userId={userId}
          onBack={() => {
            // If we have a stored previous URL, restore it; otherwise go to root
            if (previousUrlRef.current) {
              window.location.hash = previousUrlRef.current;
              previousUrlRef.current = null;
            } else {
              navigateTo("/");
            }
          }}
        />
      );
    }

    switch (currentPath) {
      case "/analytics":
        return <UserAnalytics />;
      case "/":
      default:
        return (
          <UserManager
            userType={userType}
            permissionContext={permissionContext}
            onViewUser={(userId) => {
              // Store current URL (including query params) before navigating
              previousUrlRef.current = window.location.hash;
              navigateTo(`/profile/${userId}`);
            }}
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={currentPath}
          onChange={(_, newValue) => navigateTo(newValue)}
        >
          <Tab label="User Management" value="/" />
          <Tab label="Analytics" value="/analytics" />
        </Tabs>
      </Box>

      {/* Route content */}
      <Box sx={{ flex: 1 }}>{renderCurrentRoute()}</Box>
    </Box>
  );
};
