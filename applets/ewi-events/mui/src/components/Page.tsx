import React from "react";
import { Box, ThemeProvider, Typography, Theme } from "@mui/material";

interface PageProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  error?: Error | null;
  theme: Theme;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error
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

// Content
const contentBoxStyles = {
  width: "100%",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 0.5,
  position: "relative",
  top: "-100px",
  bgcolor: "background.paper",
  pt: 2,
};

// Layout
const PageLayout: React.FC<{
  header?: React.ReactNode;
  children: React.ReactNode;
  theme: Theme;
}> = ({ header, children, theme }) => (
  <Box sx={{ height: "100%" }}>
    {header}
    <ThemeProvider theme={theme}>
      <Box sx={contentBoxStyles}>{children}</Box>
    </ThemeProvider>
  </Box>
);

// Error boundary
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
    console.error("Page Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

// Main
export const Page: React.FC<PageProps> = ({
  header,
  children,
  error,
  theme,
}) => {
  const content = error ? (
    <PageLayout header={header} theme={theme}>
      <ErrorDisplay error={error} />
    </PageLayout>
  ) : (
    <ErrorBoundary
      fallback={(err) => (
        <PageLayout header={header} theme={theme}>
          <ErrorDisplay error={err} />
        </PageLayout>
      )}
    >
      <PageLayout header={header} theme={theme}>
        {children}
      </PageLayout>
    </ErrorBoundary>
  );

  return content;
};

export default Page;
