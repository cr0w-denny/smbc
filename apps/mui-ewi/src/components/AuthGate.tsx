import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface AuthGateProps {
  children: React.ReactNode;
  authCheckUrl?: string;
  loginUrl?: string;
  checkInterval?: number; // in milliseconds
}

export const AuthGate: React.FC<AuthGateProps> = ({
  children,
  authCheckUrl = "/api/v1/auth/check",
  loginUrl = "/login",
  checkInterval = 60000, // 1 minute default
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const checkAuth = async () => {
    if (isChecking) return; // Prevent overlapping checks

    setIsChecking(true);
    try {
      const response = await fetch(authCheckUrl, {
        method: "GET",
        credentials: "include", // Include cookies for session-based auth
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Unauthorized - redirect to login
        setIsAuthenticated(false);
        window.location.href = loginUrl;
      } else if (response.ok) {
        // Authorized
        setIsAuthenticated(true);
      } else {
        // Other error - log but don't redirect
        console.error("Auth check failed with status:", response.status);
        // Assume authenticated to avoid blocking the user
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Network error - assume authenticated to avoid blocking
      setIsAuthenticated(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Set up periodic auth checks
    intervalRef.current = setInterval(checkAuth, checkInterval);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkInterval]);

  // Handle visibility change - check auth when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Show loading state during initial auth check
  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // If authenticated, render children
  return children;
};

export default AuthGate;
