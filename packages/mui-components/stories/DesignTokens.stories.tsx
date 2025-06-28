import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
} from "@mui/material";
import * as tokens from "@smbc/design-tokens";

const meta: Meta = {
  title: "Design Tokens",
  parameters: {
    layout: "fullscreen",
    docs: {
      page: null,
    },
  },
};

export default meta;

type Story = StoryObj;

const ColorSwatch = ({
  color,
  name,
  value,
}: {
  color: string;
  name: string;
  value: string;
}) => (
  <Paper
    sx={{
      p: 2,
      textAlign: "center",
      height: "120px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}
  >
    <Box
      sx={{
        backgroundColor: color,
        flex: 1,
        borderRadius: 1,
        mb: 1,
        border: "1px solid rgba(0,0,0,0.1)",
      }}
    />
    <Typography variant="body2" fontWeight="medium">
      {name}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {value}
    </Typography>
  </Paper>
);

const SpacingExample = ({ size, value }: { size: string; value: string }) => (
  <Paper sx={{ p: 2, mb: 1 }}>
    <Typography variant="body2" sx={{ mb: 1 }}>
      {size}: {value}px
    </Typography>
    <Box
      sx={{
        height: "16px",
        backgroundColor: tokens.ColorPrimary500,
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
    <Typography variant="body2" fontWeight="medium">
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

export const Overview: Story = {
  render: () => (
    <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h3" component="h1" gutterBottom>
        SMBC Design Tokens
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Design tokens are the foundation of our design system, ensuring
        consistency across all components and applications.
      </Typography>

      {/* Brand Colors */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Brand Colors
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            color={tokens.ColorPrimary500}
            name="Primary"
            value={tokens.ColorPrimary500}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            color={tokens.ColorSecondary500}
            name="Secondary"
            value={tokens.ColorSecondary500}
          />
        </Grid>
      </Grid>

      {/* Gray Scale */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Gray Scale
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { name: "Gray 100", value: tokens.ColorGray100 },
          { name: "Gray 300", value: tokens.ColorGray300 },
          { name: "Gray 500", value: tokens.ColorGray500 },
          { name: "Gray 700", value: tokens.ColorGray700 },
          { name: "Gray 900", value: tokens.ColorGray900 },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <ColorSwatch color={value} name={name} value={value} />
          </Grid>
        ))}
      </Grid>

      {/* Status Colors */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Status Colors
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            color={tokens.ColorSuccess500}
            name="Success"
            value={tokens.ColorSuccess500}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            color={tokens.ColorWarning500}
            name="Warning"
            value={tokens.ColorWarning500}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            color={tokens.ColorError500}
            name="Error"
            value={tokens.ColorError500}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            color={tokens.ColorInfo500}
            name="Info"
            value={tokens.ColorInfo500}
          />
        </Grid>
      </Grid>

      {/* Typography */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Typography
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Primary Font: {tokens.TypographyFontFamilyPrimary}
        </Typography>
        <Box sx={{ fontFamily: tokens.TypographyFontFamilyPrimary, mb: 3 }}>
          The quick brown fox jumps over the lazy dog
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Monospace Font: {tokens.TypographyFontFamilyMonospace}
        </Typography>
        <Box sx={{ fontFamily: tokens.TypographyFontFamilyMonospace }}>
          The quick brown fox jumps over the lazy dog
        </Box>
      </Paper>

      {/* Spacing */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Spacing Scale
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { name: "spacing-1", value: tokens.SizeSpacing1 },
          { name: "spacing-2", value: tokens.SizeSpacing2 },
          { name: "spacing-3", value: tokens.SizeSpacing3 },
          { name: "spacing-4", value: tokens.SizeSpacing4 },
          { name: "spacing-6", value: tokens.SizeSpacing6 },
          { name: "spacing-8", value: tokens.SizeSpacing8 },
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
          { name: "sm", value: tokens.SizeBorderRadiusSm },
          { name: "base", value: tokens.SizeBorderRadiusBase },
          { name: "md", value: tokens.SizeBorderRadiusMd },
          { name: "lg", value: tokens.SizeBorderRadiusLg },
          { name: "xl", value: tokens.SizeBorderRadiusXl },
          { name: "2xl", value: tokens.SizeBorderRadius2xl },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: tokens.ColorPrimary500,
                  borderRadius: `${value}px`,
                  mx: "auto",
                  mb: 1,
                }}
              />
              <Typography variant="body2" fontWeight="medium">
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
          { name: "sm", value: tokens.ShadowSm },
          { name: "base", value: tokens.ShadowBase },
          { name: "md", value: tokens.ShadowMd },
          { name: "lg", value: tokens.ShadowLg },
          { name: "xl", value: tokens.ShadowXl },
          { name: "2xl", value: tokens.Shadow2xl },
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
          { name: "base", value: tokens.ZIndexBase },
          { name: "dropdown", value: tokens.ZIndexDropdown },
          { name: "modal", value: tokens.ZIndexModal },
          { name: "tooltip", value: tokens.ZIndexTooltip },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={3} key={name}>
            <Chip
              label={`${name}: ${value}`}
              variant="outlined"
              sx={{ width: "100%" }}
            />
          </Grid>
        ))}
      </Grid>

      {/* Usage */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4 }}>
        Usage
      </Typography>
      <Paper sx={{ p: 3, backgroundColor: "grey.50" }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
        >
          {`import * as tokens from '@smbc/design-tokens';

// Use in MUI sx prop
<Button sx={{
  backgroundColor: tokens.ColorPrimary500,
  color: tokens.SemanticColorBrandPrimaryContrastLight,
  padding: \`\${tokens.SizeSpacing3}px \${tokens.SizeSpacing4}px\`,
  borderRadius: \`\${tokens.SizeBorderRadiusBase}px\`,
}} />

// Use in styled components
const StyledButton = styled(Button)\`
  background-color: \${tokens.ColorPrimary500};
  box-shadow: \${tokens.ShadowSm};
\`;`}
        </Typography>
      </Paper>
    </Box>
  ),
};