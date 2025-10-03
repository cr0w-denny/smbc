import React from "react";
import { Box, Typography } from "@mui/material";
import { Width } from "../../Width";

export interface ContentProps {
  children: React.ReactNode;
  error?: Error | null;
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
      "AppShell.Content Error Boundary caught an error:",
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
 * Automatically reads toolbar height from CSS custom property set by AppShell.Toolbar.
 *
 * CSS Variables:
 * - `--appshell-content-offset`: Top offset for content (default: header height)
 * - `--appshell-toolbar-height`: Toolbar height (auto-calculated)
 */
export const Content: React.FC<ContentProps> = ({ children, error }) => {
  const content = error ? (
    <ErrorDisplay error={error} />
  ) : (
    <ErrorBoundary fallback={(err) => <ErrorDisplay error={err} />}>
      {children}
    </ErrorBoundary>
  );

  return (
    <Box
      className="AppShell-content"
      sx={{
        // Account for fixed header and toolbar above using CSS custom properties
        paddingTop:
          "calc(var(--appshell-content-offset, var(--appshell-header-height, 104px)) + var(--appshell-toolbar-height, 0px) + 16px)",
        paddingBottom: 3,
        minHeight: "100%",
      }}
    >
      <Width>{content}</Width>
    </Box>
  );
};

export default Content;
