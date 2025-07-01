import { FC } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { apiClient, type components } from "@smbc/user-management-client";

type User = components["schemas"]["User"];

export interface UserProfileProps {
  /** The user ID to display. If not provided, shows current user */
  userId?: string;
  /** Optional user data to display directly (skips API call) */
  user?: User;
  /** Callback to navigate back to the user list */
  onBack?: () => void;
}

/**
 * UserProfile component for displaying detailed user information
 *
 * @example
 * ```tsx
 * // Display a specific user by ID
 * <UserProfile userId="123" />
 *
 * // Display user data directly
 * <UserProfile user={userData} />
 *
 * // Display current user (requires userId from context)
 * <UserProfile />
 * ```
 */
export const UserProfile: FC<UserProfileProps> = ({
  userId,
  user: providedUser,
  onBack,
}) => {
  // Use React Query to fetch user data if not provided
  const {
    data: fetchedUser,
    isLoading,
    error,
  } = apiClient.useQuery("get", "/users/{id}", {
    params: { path: { id: userId || "current" } },
    // Only fetch if no user data is provided and we have a userId
    enabled: !providedUser && !!userId,
  });

  // Use provided user data or fetched data
  const user = providedUser || fetchedUser;

  // Loading state
  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: "auto" }}>
          Failed to load user profile: {error.message || "Unknown error"}
        </Alert>
      </Box>
    );
  }

  // No user found
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
          User not found
        </Alert>
      </Box>
    );
  }

  // Get user initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {onBack && (
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.7,
            },
          }}
          onClick={onBack}
        >
          <IconButton sx={{ mr: 1, p: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Back to User List
          </Typography>
        </Box>
      )}
      <Card sx={{ maxWidth: 600, mx: "auto" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status
            </Typography>
            <Chip
              label={user.isActive ? "Active" : "Inactive"}
              color={user.isActive ? "success" : "default"}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Role
            </Typography>
            <Chip
              label={user.isAdmin ? "Administrator" : "User"}
              color={user.isAdmin ? "primary" : "default"}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Member Since
            </Typography>
            <Typography variant="body1">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Last Updated
            </Typography>
            <Typography variant="body1">
              {formatDate(user.updatedAt)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

/**
 * Loading skeleton for UserProfile component
 */
const UserProfileSkeleton: FC = () => (
  <Box sx={{ p: 3 }}>
    <Card sx={{ maxWidth: 600, mx: "auto" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        </Box>

        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton variant="text" width="30%" height={24} />
            <Skeleton variant="text" width="50%" height={20} />
          </Box>
        ))}
      </CardContent>
    </Card>
  </Box>
);

export default UserProfile;
