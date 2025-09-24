import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Typography,
  GridLegacy as Grid,
  Paper,
  Chip,
} from "@mui/material";
import { color, size, shadow, zIndex } from "@smbc/ui-core";

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
        backgroundColor: color.brand.primary.tradGreen,
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
          { name: "size.spacing['1']", value: size.spacing["1"] },
          { name: "size.spacing['2']", value: size.spacing["2"] },
          { name: "size.spacing['3']", value: size.spacing["3"] },
          { name: "size.spacing['4']", value: size.spacing["4"] },
          { name: "size.spacing['6']", value: size.spacing["6"] },
          { name: "size.spacing['8']", value: size.spacing["8"] },
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
          { name: "size.borderRadius.sm", value: size.borderRadius.sm },
          { name: "size.borderRadius.base", value: size.borderRadius.base },
          { name: "size.borderRadius.md", value: size.borderRadius.md },
          { name: "size.borderRadius.lg", value: size.borderRadius.lg },
          { name: "size.borderRadius.xl", value: size.borderRadius.xl },
          { name: "size.borderRadius['2xl']", value: size.borderRadius["2xl"] },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: color.brand.primary.tradGreen,
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
          { name: "shadow.sm", value: shadow.sm },
          { name: "shadow.base", value: shadow.base },
          { name: "shadow.md", value: shadow.md },
          { name: "shadow.lg", value: shadow.lg },
          { name: "shadow.xl", value: shadow.xl },
          { name: "shadow['2xl']", value: shadow["2xl"] },
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
          { name: "zIndex.base", value: zIndex.base },
          { name: "zIndex.dropdown", value: zIndex.dropdown },
          { name: "zIndex.modal", value: zIndex.modal },
          { name: "zIndex.tooltip", value: zIndex.tooltip },
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
          {`import { color, size, shadow } from '@smbc/ui-core';

// Use in MUI sx prop
<Button sx={{
  backgroundColor: color.brand.primary.tradGreen,
  color: '#ffffff',
  padding: \`\${size.spacing['3']}px \${size.spacing['4']}px\`,
  borderRadius: \`\${size.borderRadius.base}px\`,
  boxShadow: shadow.sm,
}} />

// Use in styled components
const StyledCard = styled(Paper)\`
  padding: \${size.spacing['6']}px;
  border-radius: \${size.borderRadius.md}px;
  box-shadow: \${shadow.md};
  background-color: \${color.gray['50']};
\`;`}
        </Typography>
      </Paper>
    </Box>
  ),
};
