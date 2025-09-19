import React from "react";
import { Box, Typography, ThemeProvider } from "@mui/material";
import { useAppletCore } from "@smbc/applet-core";
import { darkTheme } from "@smbc/mui-components";

interface AppletPageProps {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  error?: Error | null;
  showContainer?: boolean;
  height?: string;
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
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  showContainer?: boolean;
  height?: string;
}> = ({ toolbar, children, showContainer = false, height }) => {
  const { toolbarOffset = 67 } = useAppletCore();

  return (
    <Box sx={{ height: "100%" }}>
      {toolbar && (
        <ThemeProvider theme={darkTheme}>
          <Box
            sx={() => ({
              position: "sticky",
              top: toolbarOffset,
              left: 0,
              right: 0,
              backgroundColor: "#242b2f",
              // backdropFilter: "blur(8px)",
              zIndex: 1000,
              py: 2,
            })}
          >
            {toolbar}
          </Box>
        </ThemeProvider>
      )}
      {(() => {
        const content = (
          <Box
            sx={{
              width: "100%",
              ...(height && { height }),
              ...(showContainer && {
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0.5,
                bgcolor: "background.paper",
              }),
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              position: "relative",
            }}
          >
            {children}
          </Box>
        );

        return content;
      })()}
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
  toolbar,
  children,
  error,
  showContainer = false,
  height,
}) => {
  const content = error ? (
    <PageLayout toolbar={toolbar} height={height}>
      <ErrorDisplay error={error} />
    </PageLayout>
  ) : (
    <ErrorBoundary
      fallback={(err) => (
        <PageLayout toolbar={toolbar} height={height}>
          <ErrorDisplay error={err} />
        </PageLayout>
      )}
    >
      <PageLayout
        toolbar={toolbar}
        showContainer={showContainer}
        height={height}
      >
        {children}
      </PageLayout>
    </ErrorBoundary>
  );

  return content;
};

export default AppletPage;
