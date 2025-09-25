import React from "react";
import { Box, Typography } from "@mui/material";

export interface PageProps {
  children: React.ReactNode;
  error?: Error | null;
  toolbarHeight?: number; // For calculating top spacing
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Display Component
const ErrorDisplay: React.FC<{ error: Error }> = ({ error }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
      Something went wrong
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {error.message}
    </Typography>
    {process.env.NODE_ENV === "development" && (
      <Typography
        variant="caption"
        color="text.disabled"
        component="pre"
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 200,
          overflow: "auto",
        }}
      >
        {error.stack}
      </Typography>
    )}
  </Box>
);

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: (error: Error) => React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "AppShell.Page Error Boundary caught an error:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

/**
 * Main content area for AppShell-based applications.
 * Handles AppShell spacing offsets and provides error boundary protection.
 */
export const Page: React.FC<PageProps> = ({
  children,
  error,
  toolbarHeight = 0,
}) => {
  const content = error ? (
    <ErrorDisplay error={error} />
  ) : (
    <ErrorBoundary fallback={(err) => <ErrorDisplay error={err} />}>
      {children}
    </ErrorBoundary>
  );

  return (
    <Box
      className="AppShell-page"
      sx={{
        // Account for fixed toolbar above
        paddingTop: toolbarHeight > 0 ? `${toolbarHeight + 16}px` : 2,
        paddingBottom: 3,
        minHeight: toolbarHeight > 0
          ? `calc(100vh - 104px - ${toolbarHeight + 16}px)`
          : "calc(100vh - 104px)",
      }}
    >
      {content}
    </Box>
  );
};

export default Page;