import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ui } from "@smbc/ui-core";

interface AppletPageProps {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  error?: Error | null;
  height?: string;
  toolbarOffset?: number;
  toolbarHeight?: number;
  maxWidth: Record<string, string>;
  bgExtended?: boolean;
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

const PageLayout: React.FC<{
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  height?: string;
  toolbarOffset?: number;
  toolbarHeight?: number;
  maxWidth?: Record<string, string>;
  bgExtended?: boolean;
}> = ({
  toolbar,
  children,
  height,
  toolbarOffset = 104,
  toolbarHeight = 94,
  maxWidth,
  bgExtended,
}) => {
  const theme = useTheme();
  const isLightMode = theme.palette.mode === "light";
  const gradient =
    "linear-gradient(116.47deg, rgba(13, 21, 36, 0.905882) -3.25%, #0B1220 30.67%, #070F1A 61.84%, #040B13 105.6%)";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 104,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? gradient
              : theme.palette.background.default,
          zIndex: -1,
        },
        paddingBottom: 3,
        isolation: "isolate",
      }}
    >
      {toolbar && (
        <>
          {/* Background-only element that extends below content - only in light mode */}
          <Box
            sx={{
              position: "fixed",
              top: toolbarOffset,
              left: 0,
              right: 0,
              height: `${toolbarHeight + 100}px`, // Extend 20px below toolbar content
              backgroundColor: ui.color.navigation.background.light,
              zIndex: 1000, // Behind content and toolbar
              display: isLightMode && bgExtended ? "block" : "none",
            }}
          />
          {/* Actual toolbar container */}
          <Box
            sx={{
              position: "fixed",
              top: toolbarOffset,
              left: 0,
              right: 0,
              zIndex: 1002, // Above background
              py: 2,
              background: isLightMode
                ? bgExtended
                  ? ui.color.navigation.background.light
                  : ""
                : gradient,
            }}
          >
            <Box
              sx={{
                maxWidth: maxWidth,
                margin: "0 auto",
                width: "100%",
              }}
            >
              {toolbar}
            </Box>
          </Box>
        </>
      )}
      <Box
        sx={{
          flexGrow: 1,
          // Account for fixed header height
          marginTop: "104px",
          height: toolbar
            ? `calc(100vh - 104px - ${toolbarHeight}px)`
            : "calc(100vh - 104px)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1001, // Above background, below toolbar
          // Add extra top padding when toolbar is present to prevent overlap with fixed toolbar
          ...(toolbar && { paddingTop: `${toolbarHeight}px` }), // Account for toolbar height + padding
        }}
      >
        {(() => {
          const content = (
            <Box
              sx={{
                height: "100%",
                width: "100%",
                paddingBottom: 1,
                ...(height && { height }),
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                position: "relative",
              }}
            >
              {children}
            </Box>
          );

          return (
            <Box
              sx={{
                maxWidth: maxWidth,
                margin: "0 auto",
                width: "100%",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {content}
            </Box>
          );
        })()}
      </Box>
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
  height,
  toolbarOffset,
  toolbarHeight,
  maxWidth,
  bgExtended,
}) => {
  const content = error ? (
    <PageLayout
      toolbar={toolbar}
      height={height}
      toolbarOffset={toolbarOffset}
      toolbarHeight={toolbarHeight}
      maxWidth={maxWidth}
    >
      <ErrorDisplay error={error} />
    </PageLayout>
  ) : (
    <ErrorBoundary
      fallback={(err) => (
        <PageLayout
          toolbar={toolbar}
          height={height}
          toolbarOffset={toolbarOffset}
          toolbarHeight={toolbarHeight}
          maxWidth={maxWidth}
        >
          <ErrorDisplay error={err} />
        </PageLayout>
      )}
    >
      <PageLayout
        toolbar={toolbar}
        height={height}
        toolbarOffset={toolbarOffset}
        toolbarHeight={toolbarHeight}
        maxWidth={maxWidth}
        bgExtended={bgExtended}
      >
        {children}
      </PageLayout>
    </ErrorBoundary>
  );

  return content;
};

export default AppletPage;
