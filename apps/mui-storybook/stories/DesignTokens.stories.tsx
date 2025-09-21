import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Typography,
  GridLegacy as Grid,
  Paper,
  Chip,
} from "@mui/material";
import * as ui from "@smbc/ui-core";

const meta: Meta = {
  title: "Foundations/Tokens",
  parameters: {
    layout: "fullscreen",
    docs: {
      page: null,
    },
    // Mark this as the homepage
    viewMode: "story",
  },
};

export default meta;

type Story = StoryObj;

const SpacingExample = ({ size, value }: { size: string; value: string }) => (
  <Paper sx={{ p: 2, mb: 1 }}>
    <Typography
      variant="body2"
      sx={{ mb: 1, fontFamily: "monospace", color: "primary.main" }}
    >
      {size}
    </Typography>
    <Box
      sx={{
        height: "16px",
        backgroundColor: ui.TradGreen,
        width: `${Math.min(parseInt(value), 200)}px`,
      }}
    />
  </Paper>
);

const ShadowExample = ({ name, value }: { name: string; value: string }) => (
  <Paper
    sx={{
      p: 3,
      textAlign: "center",
      boxShadow: value,
      m: 1,
    }}
  >
    <Typography
      variant="body2"
      fontWeight="medium"
      color="primary.main"
      sx={{ fontFamily: "monospace" }}
    >
      {name}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: "block", mt: 1, wordBreak: "break-all" }}
    >
      {value}
    </Typography>
  </Paper>
);

export const Tokens: Story = {
  render: () => (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          SMBC Tokens
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: "600px", mx: "auto" }}
        >
          Foundation design tokens for spacing, borders, shadows, and layout -
          ensuring consistency and scalability across all components and
          applications.
        </Typography>
      </Box>

      {/* Spacing */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Spacing Scale
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { name: "Spacing1", value: ui.SizeSpacing1 },
          { name: "Spacing2", value: ui.SizeSpacing2 },
          { name: "Spacing3", value: ui.SizeSpacing3 },
          { name: "Spacing4", value: ui.SizeSpacing4 },
          { name: "Spacing6", value: ui.SizeSpacing6 },
          { name: "Spacing8", value: ui.SizeSpacing8 },
        ].map(({ name, value }) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <SpacingExample size={name} value={value} />
          </Grid>
        ))}
      </Grid>

      {/* Border Radius */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Border Radius
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { name: "BorderRadiusSm", value: ui.SizeBorderRadiusSm },
          { name: "BorderRadiusBase", value: ui.SizeBorderRadiusBase },
          { name: "BorderRadiusMd", value: ui.SizeBorderRadiusMd },
          { name: "BorderRadiusLg", value: ui.SizeBorderRadiusLg },
          { name: "BorderRadiusXl", value: ui.SizeBorderRadiusXl },
          { name: "BorderRadius2xl", value: ui.SizeBorderRadius2xl },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: ui.TradGreen,
                  borderRadius: `${value}px`,
                  mx: "auto",
                  mb: 1,
                }}
              />
              <Typography
                variant="body2"
                fontWeight="medium"
                color="primary.main"
                sx={{ fontFamily: "monospace" }}
              >
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {value}px
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Shadows */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Shadows
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { name: "ShadowSm", value: ui.ShadowSm },
          { name: "ShadowBase", value: ui.ShadowBase },
          { name: "ShadowMd", value: ui.ShadowMd },
          { name: "ShadowLg", value: ui.ShadowLg },
          { name: "ShadowXl", value: ui.ShadowXl },
          { name: "Shadow2xl", value: ui.Shadow2xl },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <ShadowExample name={name} value={value} />
          </Grid>
        ))}
      </Grid>

      {/* Z-Index */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Z-Index Scale
      </Typography>
      <Grid container spacing={1} sx={{ mb: 4 }}>
        {[
          { name: "ZBase", value: ui.ZIndexBase },
          { name: "ZDropdown", value: ui.ZIndexDropdown },
          { name: "ZModal", value: ui.ZIndexModal },
          { name: "ZTooltip", value: ui.ZIndexTooltip },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={3} key={name}>
            <Chip
              label={`${name}: ${value}`}
              variant="outlined"
              sx={{
                width: "100%",
                fontFamily: "monospace",
                color: "primary.main",
              }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Usage */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Usage
      </Typography>
      <Paper
        sx={{
          p: 3,
          backgroundColor: "background.default",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
        >
          {`import * as ui from '@smbc/ui-core';

// Use in MUI sx prop
<Button sx={{
  backgroundColor: ui.TradGreen,
  color: '#ffffff',
  padding: \`\${ui.SizeSpacing3}px \${ui.SizeSpacing4}px\`,
  borderRadius: \`\${ui.SizeBorderRadiusBase}px\`,
  boxShadow: ui.ShadowSm,
}} />

// Use in styled components
const StyledCard = styled(Paper)\`
  padding: \${ui.SizeSpacing6}px;
  border-radius: \${ui.SizeBorderRadiusMd}px;
  box-shadow: \${ui.ShadowMd};
  background-color: \${ui.Gray50};
\`;`}
        </Typography>
      </Paper>
    </Box>
  ),
};
