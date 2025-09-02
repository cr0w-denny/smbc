import React from "react";
import { Box, ThemeProvider, Typography } from "@mui/material";
import { useAppletCore } from "@smbc/applet-core";

interface AppletPageProps {
  filter?: React.ReactNode;
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

// Page Layout Component
const PageLayout: React.FC<{
  filter?: React.ReactNode;
  children: React.ReactNode;
}> = ({ filter, children }) => {
  const { theme } = useAppletCore();

  return (
    <Box sx={{ height: "100%" }}>
      {filter && (
        <Box
          sx={{
            py: 1,
            mb: "100px",
            backgroundColor: "transparent", // Inherit gradient from app layout
          }}
        >
          <Box sx={{ maxWidth: "100%", mx: "auto", py: 2 }}>{filter}</Box>
        </Box>
      )}
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 0.5,
            position: "relative",
            top: "-100px",
            bgcolor: "background.paper",
            py: 2,
            minHeight: "calc(100vh - 250px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </Box>
  );
};

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
      "AppletPage Error Boundary caught an error:",
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

// Main AppletPage Component
export const AppletPage: React.FC<AppletPageProps> = ({
  filter,
  children,
  error,
}) => {
  const content = error ? (
    <PageLayout filter={filter}>
      <ErrorDisplay error={error} />
    </PageLayout>
  ) : (
    <ErrorBoundary
      fallback={(err) => (
        <PageLayout filter={filter}>
          <ErrorDisplay error={err} />
        </PageLayout>
      )}
    >
      <PageLayout filter={filter}>{children}</PageLayout>
    </ErrorBoundary>
  );

  return content;
};

export default AppletPage;
