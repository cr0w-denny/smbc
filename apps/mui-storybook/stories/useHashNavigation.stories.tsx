import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { useHashNavigationStory } from "./useHashNavigationStory";

const meta: Meta = {
  title: "Hooks/useHashNavigation",
  parameters: {
    docs: {
      description: {
        component: `Interactive documentation for the useHashNavigation hook with live examples.`,
      },
    },
  },
};

export default meta;

interface DemoComponentProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const DemoComponent: React.FC<DemoComponentProps> = ({
  title,
  description,
  children,
}) => (
  <Card variant="outlined" sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

interface AutoParams {
  status: string;
  category: string;
}

interface DraftParams {
  start_date: Date;
  end_date: Date;
  types: string[];
  my: boolean;
}

// Overview story component
const OverviewDemo: React.FC = () => (
  <Box sx={{ p: 3 }}>
    {/* Main Header */}
    <Typography variant="h3" gutterBottom color="primary">
      useHashNavigation Hook
    </Typography>

    <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
      A URL state management hook that supports both auto-applied and
      draft/apply parameter patterns.
    </Typography>

    {/* Architecture Overview */}
    <Card variant="outlined" sx={{ mb: 3, bgcolor: "info.50" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🏗️ Architecture Overview
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This hook manages two separate parameter streams that both feed into
          the URL.
        </Typography>

        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Important:</strong> The URL reflects state but never drives
            it. All changes come through the hook's API.
            <p>
              {" "}
              This makes programming simpler and avoids render loops that occur
              when URL changes trigger state updates that trigger more URL
              changes.
            </p>
          </Typography>
        </Alert>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              🚀 Auto-Applied Stream
            </Typography>
            <Typography variant="body2">
              Parameters that sync to URL immediately when changed - perfect for
              quick filters and instant feedback
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="secondary" gutterBottom>
              📝 Draft/Apply Stream
            </Typography>
            <Typography variant="body2">
              Parameters that use a draft+apply pattern - ideal for complex
              filters and expensive operations
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>

    {/* Key Features */}
    <Card variant="outlined" sx={{ mb: 3, bgcolor: "warning.50" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="warning.main">
          ✨ Key Features
        </Typography>
        <Box component="ul" sx={{ pl: 2, "& li": { mb: 0.5 } }}>
          <li>
            <strong>Dual Stream Architecture</strong> - Independent auto-applied
            and draft parameters
          </li>
          <li>
            <strong>Unified URL Generation</strong> - Both streams combine into
            shareable URLs
          </li>
          <li>
            <strong>Auto Type Detection</strong> - Handles dates, arrays,
            booleans, and numbers
          </li>
          <li>
            <strong>Date Handling</strong> - Timezone-safe parsing with URL
            preservation
          </li>
          <li>
            <strong>Stream Isolation</strong> - Auto-applied changes don't reset
            draft state
          </li>
          <li>
            <strong>Namespace Support</strong> - Multiple hook instances can
            coexist
          </li>
          <li>
            <strong>Change Detection</strong> - Built-in dirty state tracking
            for Apply button behavior
          </li>
        </Box>
      </CardContent>
    </Card>

    {/* Field Transformations */}
    <Card variant="outlined" sx={{ mb: 3, bgcolor: "success.50" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="success.main">
          🔄 Automatic Field Transformations
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          The hook automatically detects field types from your defaults and
          applies the correct transformations:
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Supported Types:
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 2, "& li": { mb: 0.5, fontSize: "0.875rem" } }}
            >
              <li>
                <strong>Arrays:</strong> <code>["urgent", "normal"]</code> →{" "}
                <code>"urgent,normal"</code>
              </li>
              <li>
                <strong>Booleans:</strong> <code>true</code> →{" "}
                <code>"true"</code>, <code>false</code> → <code>""</code>
              </li>
              <li>
                <strong>Dates:</strong> <code>Date</code> →{" "}
                <code>"YYYY-MM-DD"</code>
              </li>
              <li>
                <strong>Numbers:</strong> <code>42</code> → <code>"42"</code>
              </li>
              <li>
                <strong>Date Ranges:</strong>{" "}
                <code>
                  {"{"} from: Date, to: Date {"}"}
                </code>{" "}
                → JSON string
              </li>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Behaviors:
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 2, "& li": { mb: 0.5, fontSize: "0.875rem" } }}
            >
              <li>Dates always preserved in URLs for context</li>
              <li>Default values filtered out for clean URLs</li>
              <li>Local timezone parsing for consistent dates</li>
              <li>Type safety maintained throughout transformations</li>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

const InteractiveDemo: React.FC = () => {
  const [url, setUrl] = useState("#/events");
  const [testUrl, setTestUrl] = useState(
    "#/events?category=Mandatory&start_date=2025-08-26&end_date=2025-09-30&my=true",
  );
  const [showInitTesting, setShowInitTesting] = useState(false);

  const {
    // Auto-applied stream
    autoParams,
    setAutoParams,

    // Draft stream
    params,
    appliedParams,
    setParams,
    applyParams,
    hasChanges,

    // Navigation
    navigate,
    path,
    currentUrl,
  } = useHashNavigationStory<AutoParams, DraftParams>(
    // Auto-applied defaults (quick filters)
    {
      status: "",
      category: "",
    },
    // Draft defaults (server filters)
    {
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end_date: new Date(),
      types: [] as string[],
      my: false,
    },
    {
      initialUrl: showInitTesting ? testUrl : url,
      onUrlChange: showInitTesting ? setTestUrl : setUrl,
    },
  );

  const quickFilterChips = [
    { value: "on-course", label: "On Course", group: "status" },
    { value: "almost-due", label: "Almost Due", group: "status" },
    { value: "past-due", label: "Past Due", group: "status" },
    { value: "Mandatory", label: "Mandatory", group: "category" },
    { value: "Discretionary", label: "Discretionary", group: "category" },
  ];

  const testCases = [
    {
      label: "Empty URL",
      url: "#/events",
      description:
        "Tests default value application when no parameters are present in the URL",
      color: "inherit" as const,
    },
    {
      label: "Auto-Param Only",
      url: "#/events?category=Mandatory",
      description:
        "Only quick filter parameters - shows how draft params get defaults while auto params are populated",
      color: "primary" as const,
    },
    {
      label: "Draft Params Only",
      url: "#/events?start_date=2025-01-01&end_date=2025-12-31",
      description:
        "Only server filter parameters - shows how auto params remain empty while draft params are populated",
      color: "secondary" as const,
    },
    {
      label: "Mixed Parameters",
      url: "#/events?category=Mandatory&status=on-course&start_date=2025-01-01&my=true",
      description:
        "Parameters from both streams - demonstrates how the hook separates and distributes them correctly",
      color: "warning" as const,
    },
  ];

  const handleQuickFilter = (chipValue: string, group: string) => {
    const currentValue = autoParams[group as keyof typeof autoParams];
    const newValue = currentValue === chipValue ? "" : chipValue;
    setAutoParams({
      ...autoParams,
      [group]: newValue,
    });
  };

  const isChipActive = (chipValue: string, group: string) => {
    return autoParams[group as keyof typeof autoParams] === chipValue;
  };

  const handleTestCase = (testCase: (typeof testCases)[0]) => {
    const targetUrl = showInitTesting ? setTestUrl : setUrl;
    targetUrl(testCase.url);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Mode Toggle */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant={!showInitTesting ? "contained" : "outlined"}
          onClick={() => setShowInitTesting(false)}
          sx={{ mr: 1 }}
        >
          Interactive Demo
        </Button>
        <Button
          variant={showInitTesting ? "contained" : "outlined"}
          onClick={() => setShowInitTesting(true)}
        >
          Initialization Testing
        </Button>
      </Box>

      {!showInitTesting ? (
        <>
          {/* Interactive Demo Content */}
          <Typography variant="h4" gutterBottom>
            Interactive Demonstration
          </Typography>

          {/* URL Display */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current URL (Mock):
            </Typography>
            <Typography variant="body2" fontFamily="monospace">
              http://localhost:3001{currentUrl}
            </Typography>
          </Alert>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ flex: "1 1 45%", minWidth: "400px" }}>
              {/* Quick Filters (Auto-Applied Stream) */}
              <DemoComponent
                title="🚀 Auto-Applied Filters (Quick Filters)"
                description="These update the URL immediately when clicked. No Apply button needed."
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Status Filters:
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                  >
                    {quickFilterChips
                      .filter((chip) => chip.group === "status")
                      .map((chip) => (
                        <Chip
                          key={chip.value}
                          label={chip.label}
                          variant={
                            isChipActive(chip.value, chip.group)
                              ? "filled"
                              : "outlined"
                          }
                          color={
                            isChipActive(chip.value, chip.group)
                              ? "primary"
                              : "default"
                          }
                          onClick={() =>
                            handleQuickFilter(chip.value, chip.group)
                          }
                          clickable
                        />
                      ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Category Filters:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {quickFilterChips
                      .filter((chip) => chip.group === "category")
                      .map((chip) => (
                        <Chip
                          key={chip.value}
                          label={chip.label}
                          variant={
                            isChipActive(chip.value, chip.group)
                              ? "filled"
                              : "outlined"
                          }
                          color={
                            isChipActive(chip.value, chip.group)
                              ? "primary"
                              : "default"
                          }
                          onClick={() =>
                            handleQuickFilter(chip.value, chip.group)
                          }
                          clickable
                        />
                      ))}
                  </Box>
                </Box>

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Stream Isolation:</strong> Quick filter changes
                    don't affect draft changes - each stream operates
                    independently.
                  </Typography>
                </Alert>
              </DemoComponent>

              {/* State Inspection */}
              <DemoComponent
                title="🔍 Internal State Inspection"
                description="Peek inside the hook to understand what's happening."
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Auto Params:
                    </Typography>
                    <Box
                      sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}
                    >
                      <pre style={{ margin: 0, fontSize: "12px" }}>
                        {JSON.stringify(autoParams, null, 2)}
                      </pre>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Draft Params:
                    </Typography>
                    <Box
                      sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}
                    >
                      <pre style={{ margin: 0, fontSize: "12px" }}>
                        {JSON.stringify(
                          params,
                          (_key, value) => {
                            if (value instanceof Date)
                              return value.toISOString().split("T")[0];
                            return value;
                          },
                          2,
                        )}
                      </pre>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Applied Params:
                    </Typography>
                    <Box sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                      <pre style={{ margin: 0, fontSize: "12px" }}>
                        {JSON.stringify(
                          appliedParams,
                          (_key, value) => {
                            if (value instanceof Date)
                              return value.toISOString().split("T")[0];
                            return value;
                          },
                          2,
                        )}
                      </pre>
                    </Box>
                  </Box>
                  <Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Has Changes:
                      </Typography>
                      <Chip
                        label={hasChanges ? "YES" : "NO"}
                        color={hasChanges ? "warning" : "success"}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </DemoComponent>
            </Box>

            <Box sx={{ flex: "1 1 45%", minWidth: "400px" }}>
              {/* Draft Filters (Apply Pattern) */}
              <DemoComponent
                title="📝 Draft/Apply Filters (Server Filters)"
                description="These use a draft+apply pattern. Changes are held in local state until Apply is clicked."
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={
                      params.start_date instanceof Date
                        ? params.start_date.toISOString().split("T")[0]
                        : params.start_date
                    }
                    onChange={(e) =>
                      setParams({
                        ...params,
                        start_date: new Date(e.target.value),
                      })
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                  />

                  <TextField
                    label="End Date"
                    type="date"
                    value={
                      params.end_date instanceof Date
                        ? params.end_date.toISOString().split("T")[0]
                        : params.end_date
                    }
                    onChange={(e) =>
                      setParams({
                        ...params,
                        end_date: new Date(e.target.value),
                      })
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                  />

                  <TextField
                    label="Event Types (comma-separated)"
                    value={
                      Array.isArray(params.types)
                        ? params.types.join(", ")
                        : params.types
                    }
                    onChange={(e) =>
                      setParams({
                        ...params,
                        types: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., Credit, Operational"
                    size="small"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={params.my || false}
                        onChange={(e) =>
                          setParams({
                            ...params,
                            my: e.target.checked,
                          })
                        }
                      />
                    }
                    label="My Events Only"
                  />

                  <Button
                    variant="contained"
                    onClick={() => applyParams()}
                    disabled={!hasChanges}
                    color={hasChanges ? "primary" : "success"}
                  >
                    {hasChanges ? "Apply Changes" : "Applied ✓"}
                  </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>📅 Date Preservation:</strong> Dates are always
                    preserved in URLs to maintain context for shareable links.
                  </Typography>
                </Alert>
              </DemoComponent>

              {/* Navigation Demo */}
              <DemoComponent
                title="🧭 Navigation"
                description="Test path navigation while preserving parameters."
              >
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Button
                    variant={path === "/" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => navigate("/")}
                  >
                    Home
                  </Button>
                  <Button
                    variant={path === "/events" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => navigate("/events")}
                  >
                    Events
                  </Button>
                  <Button
                    variant={path === "/users" ? "contained" : "outlined"}
                    size="small"
                    onClick={() => navigate("/users")}
                  >
                    Users
                  </Button>
                </Box>

                <Typography variant="body2">
                  Current Path: <code>{path}</code>
                </Typography>
              </DemoComponent>
            </Box>
          </Box>
        </>
      ) : (
        <>
          {/* Initialization Testing Content */}
          <Typography variant="h4" gutterBottom>
            Hook Initialization Testing
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Test how the hook parses and initializes from different URL
              patterns.
            </Typography>
          </Alert>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Current Test URL:
              </Typography>
              <Typography
                variant="body2"
                fontFamily="monospace"
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  wordBreak: "break-all",
                }}
              >
                {testUrl}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Hook State After Initialization:
              </Typography>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}
              >
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Auto Params (Quick Filters):
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                    <pre style={{ margin: 0, fontSize: "14px" }}>
                      {JSON.stringify(autoParams, null, 2)}
                    </pre>
                  </Box>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="secondary"
                    gutterBottom
                  >
                    Draft Params (Server Filters):
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                    <pre style={{ margin: 0, fontSize: "14px" }}>
                      {JSON.stringify(
                        params,
                        (_k, v) =>
                          v instanceof Date ? v.toISOString().split("T")[0] : v,
                        2,
                      )}
                    </pre>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Test Scenarios:
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click a button to test different URL patterns and see how
                parameters are distributed:
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {testCases.map((testCase) => (
                  <Button
                    key={testCase.label}
                    variant="contained"
                    color={testCase.color}
                    size="small"
                    onClick={() => handleTestCase(testCase)}
                  >
                    {testCase.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

type Story = StoryObj<typeof OverviewDemo>;

export const Overview: Story = {
  render: () => <OverviewDemo />,
  parameters: {
    docs: {
      description: {
        story: `Complete documentation of the useHashNavigation hook's architecture, features, and usage patterns.`,
      },
    },
  },
};

export const Demo: Story = {
  render: () => <InteractiveDemo />,
  parameters: {
    docs: {
      description: {
        story: `
## Interactive Demo & Testing

This combined story provides both interactive demonstrations and initialization testing:

### Interactive Demo Mode:
- Test dual-stream functionality with live examples
- See how auto-applied and draft parameters work together
- Inspect internal hook state in real-time
- Test navigation while preserving parameters

### Initialization Testing Mode:
- Test different URL initialization patterns
- See how parameters are distributed between streams
- Understand parameter parsing and type detection
- Verify stream separation with various URL formats

Use the toggle buttons at the top to switch between modes.
        `,
      },
    },
  },
};
