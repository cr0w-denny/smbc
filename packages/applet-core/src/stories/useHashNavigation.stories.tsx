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
import { useHashNavigationStory } from "../hooks/useHashNavigationStory";

const meta: Meta = {
  title: "Hooks/useHashNavigation",
  parameters: {
    docs: {
      description: {
        component: `
# useHashNavigation Hook Documentation

A powerful dual-stream URL state management hook that supports both auto-applied and draft/apply parameter patterns.

## Architecture Overview

The hook manages two separate parameter streams that both feed into the URL:

1. **Auto-Applied Stream** - Parameters that sync to URL immediately when changed
2. **Draft/Apply Stream** - Parameters that use a draft+apply pattern with an Apply button

## Key Features

- 🔄 **Dual Stream Architecture** - Auto-applied and draft parameters coexist
- 🔗 **URL Synchronization** - Both streams feed into a unified URL for sharing
- 🔧 **Auto Transformations** - Automatically infers field types and transforms between URL and UI formats
- 📅 **Smart Date Handling** - Prevents timezone shifts and preserves dates in URLs
- 🎯 **Stream Isolation** - Auto-applied changes don't reset draft state
- 🏷️ **Namespace Support** - Multiple hook instances can coexist with namespaces

## Common Gotchas & Implementation Quirks

### 1. Date Timezone Handling
- **Problem**: \`new Date("2025-09-30")\` creates UTC midnight, which can be previous day in local timezone
- **Solution**: Manual parsing with \`new Date(year, month-1, day)\` for YYYY-MM-DD format
- **Impact**: Ensures URLs show correct dates regardless of user timezone

### 2. Draft State Isolation
- **Problem**: Hash changes from auto-params were resetting draft state
- **Solution**: \`isInitialized\` flag prevents draft resets after first render
- **Impact**: Clicking quick filters doesn't lose draft form data

### 3. Apply Button State Sync
- **Problem**: Apply button stayed enabled after clicking due to state mismatch
- **Solution**: Sync \`draftParams\` to match filtered \`appliedParams\` after apply
- **Impact**: Apply button correctly disables after successful apply

### 4. Date Filtering in URLs
- **Problem**: Auto-calculated date defaults were being filtered out of URLs
- **Solution**: Never filter dates from URLs - always preserve for context
- **Impact**: Ensures shareable URLs include date context even with defaults

### 5. Stream Independence
- **Problem**: Both streams were interfering with each other
- **Solution**: Separate state management with careful hash change handling
- **Impact**: Auto-params and draft params operate independently

## Transformation Types

The hook automatically detects and transforms these field types:

- **Arrays** → CSV strings (\`["a","b"]\` ↔ \`"a,b"\`)
- **Booleans** → Truthy strings (\`true\` ↔ \`"true"\`, \`false\` ↔ \`""\`)
- **Dates** → ISO date strings (\`Date\` ↔ \`"YYYY-MM-DD"\`)
- **Numbers** → String representations (\`42\` ↔ \`"42"\`)
- **Date Ranges** → JSON strings (\`{from: Date, to: Date}\` ↔ \`"{'from':'2025-01-01','to':'2025-12-31'}"\`)

## Usage Patterns

\`\`\`typescript
// Auto-applied filters (immediate URL sync)
const autoDefaults = {
  status: "",      // Quick status filter
  category: "",    // Quick category filter
};

// Draft filters (apply pattern)
const draftDefaults = {
  start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  end_date: new Date(),
  types: [],
  my: false,
};

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
} = useHashNavigation(autoDefaults, draftDefaults);
\`\`\`
        `,
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

const DemoComponent: React.FC<DemoComponentProps> = ({ title, description, children }) => (
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

const FilterDemo: React.FC = () => {
  const [url, setUrl] = useState("#/events");

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
      initialUrl: url,
      onUrlChange: setUrl,
    }
  );

  const quickFilterChips = [
    { value: "on-course", label: "On Course", group: "status" },
    { value: "almost-due", label: "Almost Due", group: "status" },
    { value: "past-due", label: "Past Due", group: "status" },
    { value: "Mandatory", label: "Mandatory", group: "category" },
    { value: "Discretionary", label: "Discretionary", group: "category" },
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

  return (
    <Box>
      {/* URL Display */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Current URL (Mock):
        </Typography>
        <Typography variant="body2" fontFamily="monospace">
          http://localhost:3001/{currentUrl}
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
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {quickFilterChips.filter(chip => chip.group === "status").map((chip) => (
                  <Chip
                    key={chip.value}
                    label={chip.label}
                    variant={isChipActive(chip.value, chip.group) ? "filled" : "outlined"}
                    color={isChipActive(chip.value, chip.group) ? "primary" : "default"}
                    onClick={() => handleQuickFilter(chip.value, chip.group)}
                    clickable
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Category Filters:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {quickFilterChips.filter(chip => chip.group === "category").map((chip) => (
                  <Chip
                    key={chip.value}
                    label={chip.label}
                    variant={isChipActive(chip.value, chip.group) ? "filled" : "outlined"}
                    color={isChipActive(chip.value, chip.group) ? "primary" : "default"}
                    onClick={() => handleQuickFilter(chip.value, chip.group)}
                    clickable
                  />
                ))}
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary">
              💡 <strong>Quirk:</strong> When you click these, they include any applied draft params in the URL,
              but NOT unapplied draft changes. This ensures URLs are shareable but don't expose uncommitted state.
            </Typography>
          </DemoComponent>

          {/* State Inspection */}
          <DemoComponent
            title="🔍 Internal State Inspection"
            description="Peek inside the hook to understand what's happening."
          >
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Auto Params:
                </Typography>
                <Box sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}>
                  <pre style={{ margin: 0, fontSize: "12px" }}>
                    {JSON.stringify(autoParams, null, 2)}
                  </pre>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Draft Params:
                </Typography>
                <Box sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1, mb: 2 }}>
                  <pre style={{ margin: 0, fontSize: "12px" }}>
                    {JSON.stringify(params, (_key, value) => {
                      if (value instanceof Date) return value.toISOString().split('T')[0];
                      return value;
                    }, 2)}
                  </pre>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Applied Params:
                </Typography>
                <Box sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
                  <pre style={{ margin: 0, fontSize: "12px" }}>
                    {JSON.stringify(appliedParams, (_key, value) => {
                      if (value instanceof Date) return value.toISOString().split('T')[0];
                      return value;
                    }, 2)}
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
                value={params.start_date instanceof Date
                  ? params.start_date.toISOString().split('T')[0]
                  : params.start_date}
                onChange={(e) => setParams({
                  ...params,
                  start_date: new Date(e.target.value)
                })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />

              <TextField
                label="End Date"
                type="date"
                value={params.end_date instanceof Date
                  ? params.end_date.toISOString().split('T')[0]
                  : params.end_date}
                onChange={(e) => setParams({
                  ...params,
                  end_date: new Date(e.target.value)
                })}
                InputLabelProps={{ shrink: true }}
                size="small"
              />

              <TextField
                label="Event Types (comma-separated)"
                value={Array.isArray(params.types) ? params.types.join(", ") : params.types}
                onChange={(e) => setParams({
                  ...params,
                  types: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., Credit, Operational"
                size="small"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={params.my || false}
                    onChange={(e) => setParams({
                      ...params,
                      my: e.target.checked
                    })}
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

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>🐛 Key Quirk:</strong> Dates are NEVER filtered from URLs, even if they match defaults.
                This prevents the "disappearing dates" bug where Apply would remove date context from shareable URLs.
              </Typography>
            </Alert>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>🔧 Stream Isolation:</strong> Notice how clicking quick filters above doesn't reset
                your draft changes here. The streams are independent!
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

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>💡 Notice:</strong> Parameters are preserved during navigation.
                Both auto-applied and applied draft params stay in the URL.
              </Typography>
            </Alert>
          </DemoComponent>
        </Box>
      </Box>

      {/* Technical Details */}
      <Card variant="outlined" sx={{ mt: 3, bgcolor: "grey.50" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔬 Technical Implementation Details
          </Typography>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Field Type Detection:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2 }}>
            The hook automatically detects field types from defaults:
            <ul>
              <li><code>Array.isArray(value)</code> → Array field (CSV transform)</li>
              <li><code>typeof value === "boolean"</code> → Boolean field</li>
              <li><code>value instanceof Date</code> → Date field (ISO date transform)</li>
              <li><code>typeof value === "number"</code> → Number field</li>
              <li><code>value && typeof value === "object" && ("from" in value || "to" in value)</code> → Date range field</li>
            </ul>
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            URL Update Timing:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2 }}>
            <ul>
              <li><strong>Auto-params:</strong> URL updates immediately on <code>setAutoParams</code></li>
              <li><strong>Draft params:</strong> URL updates only on <code>applyParams</code></li>
              <li><strong>Navigation:</strong> URL updates immediately with current applied state</li>
            </ul>
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Hash Change Behavior:
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2 }}>
            <ul>
              <li>Auto-params always sync from URL changes</li>
              <li>Draft params only sync from URL on initial load (prevented by <code>isInitialized</code> flag)</li>
              <li>This prevents auto-filter clicks from resetting draft form state</li>
            </ul>
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Date Handling Gotchas:
          </Typography>
          <Typography variant="body2" component="div">
            <ul>
              <li><code>new Date("2025-09-30")</code> creates UTC midnight → can be wrong day in local timezone</li>
              <li>Solution: Parse YYYY-MM-DD manually as <code>new Date(year, month-1, day)</code></li>
              <li>Dates never filtered from URLs to preserve shareability context</li>
              <li>Date comparison normalizes to YYYY-MM-DD strings to handle Date/string mixing</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

type Story = StoryObj<typeof FilterDemo>;

export const InteractiveDemo: Story = {
  render: () => <FilterDemo />,
  parameters: {
    docs: {
      description: {
        story: `
## Interactive Demonstration

This story demonstrates all the key behaviors and edge cases of the useHashNavigation hook:

### Try These Test Scenarios:

1. **Basic Auto-Filtering:**
   - Click "Mandatory" chip → URL immediately updates
   - Click "On Course" chip → URL includes both filters
   - Click same chip again → Removes filter from URL

2. **Draft/Apply Pattern:**
   - Change start/end dates → Notice URL doesn't change
   - Click "Apply Changes" → URL updates with new dates
   - Notice Apply button becomes disabled after applying

3. **Stream Isolation:**
   - Set some draft dates but don't apply
   - Click a quick filter chip → Draft dates are preserved
   - Your uncommitted changes aren't lost!

4. **Date Preservation:**
   - Load page with default dates
   - Click any quick filter → Dates appear in URL
   - Apply some draft changes → Dates stay in URL (not filtered out)

5. **Navigation:**
   - Set some filters and navigate between routes
   - Parameters are preserved across navigation
   - Both auto and applied params stay in URL

### Key Observations:

- **URL Structure:** Auto-params and applied draft params combine into one clean URL
- **State Independence:** Two streams operate independently without interference
- **Shareability:** URLs always contain complete context for sharing
- **Form Preservation:** Draft form state survives quick filter interactions
- **Apply State:** Apply button correctly reflects when changes need to be applied
        `,
      },
    },
  },
};

export const EdgeCases: Story = {
  render: () => {
    const [testUrl, setTestUrl] = useState("#/events?category=Mandatory&start_date=2025-08-26&end_date=2025-09-30&my=true");

    const hook = useHashNavigationStory<AutoParams, DraftParams>(
      { status: "", category: "" },
      {
        start_date: new Date("2025-08-26"),
        end_date: new Date("2025-09-30"),
        my: false,
        types: [] as string[],
      },
      {
        initialUrl: testUrl,
        onUrlChange: setTestUrl,
      }
    );

    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Edge Case Testing Environment
          </Typography>
          <Typography variant="body2">
            This story starts with a pre-populated URL to test initialization and edge cases.
          </Typography>
        </Alert>

        <Typography variant="body2" fontFamily="monospace" sx={{ mb: 2, p: 1, bgcolor: "grey.100", borderRadius: 1 }}>
          {testUrl}
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            <Typography variant="h6">Auto Params (from URL):</Typography>
            <pre>{JSON.stringify(hook.autoParams, null, 2)}</pre>
          </Box>
          <Box>
            <Typography variant="h6">Draft Params (from URL):</Typography>
            <pre>{JSON.stringify(hook.params, (_k, v) => v instanceof Date ? v.toISOString().split('T')[0] : v, 2)}</pre>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Test Cases:</Typography>

          <Button
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
            onClick={() => setTestUrl("#/events")}
          >
            Reset to Empty
          </Button>

          <Button
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
            onClick={() => setTestUrl("#/events?category=Mandatory")}
          >
            Only Auto-Param
          </Button>

          <Button
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
            onClick={() => setTestUrl("#/events?start_date=2025-01-01&end_date=2025-12-31")}
          >
            Only Draft Params
          </Button>

          <Button
            variant="outlined"
            sx={{ mr: 1, mb: 1 }}
            onClick={() => setTestUrl("#/events?category=Mandatory&status=on-course&start_date=2025-01-01&my=true")}
          >
            Mixed Params
          </Button>
        </Box>
      </Box>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
## Edge Case Testing

This story helps test various edge cases and initialization scenarios:

### Test Scenarios:

1. **Empty URL Initialization** - Defaults should be applied correctly
2. **Auto-Param Only URLs** - Draft params should use defaults
3. **Draft-Param Only URLs** - Auto params should be empty/defaults
4. **Mixed Parameter URLs** - Both streams should initialize correctly
5. **Date Timezone Edge Cases** - Dates should parse correctly regardless of timezone

### Expected Behaviors:

- Parameters are correctly distributed between auto and draft streams
- Dates parse without day-shift issues
- Both streams maintain independence
- URL structure remains clean and shareable
        `,
      },
    },
  },
};