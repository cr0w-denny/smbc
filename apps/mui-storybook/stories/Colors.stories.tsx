import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography, GridLegacy as Grid, Paper } from "@mui/material";
import { color, ui } from "@smbc/ui-core";

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: {
    layout: "fullscreen",
    docs: {
      page: null,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface ColorSwatchProps {
  name: string;
  value: string;
  tokenName?: string;
  description?: string;
  textColor?: string;
  size?: "small" | "medium" | "large";
  pantone?: string;
  cmyk?: string;
  rgb?: string;
}

function ColorSwatch({
  value,
  tokenName,
  description,
  textColor = "#000",
  size = "medium",
  pantone,
  cmyk,
  rgb,
}: ColorSwatchProps) {
  const height = size === "small" ? 60 : size === "large" ? 120 : 80;

  return (
    <Paper
      elevation={2}
      sx={{
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      <Box
        sx={{
          bgcolor: value,
          height: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontWeight: "bold",
          fontSize: "0.75rem",
        }}
      >
        {value.toUpperCase()}
      </Box>
      <Box sx={{ p: 1.5 }}>
        {tokenName && (
          <Typography
            variant="subtitle2"
            color="primary.main"
            sx={{ fontWeight: 600, mb: 0.5, fontFamily: "monospace" }}
          >
            {tokenName}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.5, fontFamily: "monospace" }}
        >
          {value.toUpperCase()}
        </Typography>
        {pantone && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.25 }}
          >
            <strong>PANTONE:</strong> {pantone}
          </Typography>
        )}
        {cmyk && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.25 }}
          >
            <strong>CMYK:</strong> {cmyk}
          </Typography>
        )}
        {rgb && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            <strong>RGB:</strong> {rgb}
          </Typography>
        )}
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

interface LightDarkSwatchProps {
  name: string;
  lightValue: string;
  darkValue: string;
  lightTokenName: string;
  darkTokenName: string;
  size?: "small" | "medium" | "large";
}

function LightDarkSwatch({
  name,
  lightValue,
  darkValue,
  lightTokenName,
  darkTokenName,
  size = "medium",
}: LightDarkSwatchProps) {
  const height = size === "small" ? 40 : size === "large" ? 80 : 60;

  // Function to calculate contrast and determine text color
  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      {/* Light Theme Color */}
      <Box
        sx={{
          bgcolor: lightValue,
          height: height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #ddd",
          p: 1.5,
        }}
      >
        <Typography variant="caption" sx={{
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: "0.75rem",
          color: getContrastColor(lightValue),
          textShadow: getContrastColor(lightValue) === '#ffffff' ? "0 0 3px rgba(0,0,0,0.9)" : "0 0 3px rgba(255,255,255,0.9)",
          mb: 0.5
        }}>
          {lightValue.toUpperCase()}
        </Typography>
        <Typography variant="caption" sx={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: getContrastColor(lightValue),
          textShadow: getContrastColor(lightValue) === '#ffffff' ? "0 0 3px rgba(0,0,0,0.9)" : "0 0 3px rgba(255,255,255,0.9)",
          opacity: 0.9
        }}>
          {lightTokenName}
        </Typography>
      </Box>

      {/* Dark Theme Color */}
      <Box
        sx={{
          bgcolor: darkValue,
          height: height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 1.5,
        }}
      >
        <Typography variant="caption" sx={{
          fontFamily: "monospace",
          fontWeight: "bold",
          fontSize: "0.75rem",
          color: getContrastColor(darkValue),
          textShadow: getContrastColor(darkValue) === '#ffffff' ? "0 0 3px rgba(0,0,0,0.9)" : "0 0 3px rgba(255,255,255,0.9)",
          mb: 0.5
        }}>
          {darkTokenName}
        </Typography>
        <Typography variant="caption" sx={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: getContrastColor(darkValue),
          textShadow: getContrastColor(darkValue) === '#ffffff' ? "0 0 3px rgba(0,0,0,0.9)" : "0 0 3px rgba(255,255,255,0.9)",
          opacity: 0.9
        }}>
          {darkValue.toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Typography
          variant="subtitle2"
          color="primary.main"
          sx={{ fontWeight: 600, textAlign: "center" }}
        >
          {name}
        </Typography>
      </Box>
    </Paper>
  );
}

interface ColorSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function ColorSection({ title, subtitle, children }: ColorSectionProps) {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: "800px" }}
        >
          {subtitle}
        </Typography>
      )}
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );
}

export const Colors: Story = {
  render: () => (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          SMBC Colors
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: "500px", mx: "auto" }}
        >
          A comprehensive color palette that expresses the corporate strength of
          SMBC Group, combining traditional reliability with fresh innovation.
        </Typography>
      </Box>

      {/* Brand Colors */}
      <ColorSection
        title="Brand Colors"
        subtitle="The core brand colors that express SMBC Group's identity."
      >
        <Grid item xs={12} sm={6}>
          <ColorSwatch
            name="Trad Green"
            value={color.brand.primary.tradGreen}
            tokenName="color.brand.primary.tradGreen"
            description="Tradition, reliability, and trust"
            textColor="#fff"
            size="large"
            pantone="3308C"
            cmyk="100/0/70/70"
            rgb="0/72/49"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <ColorSwatch
            name="Fresh Green"
            value={color.brand.primary.freshGreen}
            tokenName="color.brand.primary.freshGreen"
            description="Youth, sensitivity, and kindness"
            textColor="#000"
            size="large"
            pantone="382C"
            cmyk="30/0/100/0"
            rgb="196/215/0"
          />
        </Grid>
      </ColorSection>

      {/* Secondary Palette */}
      <ColorSection
        title="Secondary Palette"
        subtitle="Natural and elegant colors that add support to the corporate logo colors, used for print and digital layouts."
      >
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Honey Beige"
            value={color.secondary.honeyBeige100}
            tokenName="color.secondary.honeyBeige100"
            textColor="#fff"
            pantone="2470 C"
            cmyk="0/15/42/39"
            rgb="155/132/90"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Wheat Yellow"
            value={color.secondary.wheatYellow100}
            tokenName="color.secondary.wheatYellow100"
            textColor="#000"
            pantone="4023 C"
            cmyk="0/14/50/13"
            rgb="225/194/129"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Jade Green"
            value={color.secondary.jadeGreen100}
            tokenName="color.secondary.jadeGreen100"
            textColor="#fff"
            pantone="5565 C"
            cmyk="50/19/36/7"
            rgb="127/156/144"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Storm Blue"
            value={color.secondary.stormBlue100}
            tokenName="color.secondary.stormBlue100"
            textColor="#fff"
            pantone="4158 C"
            cmyk="64/15/0/46"
            rgb="49/117/137"
          />
        </Grid>
      </ColorSection>

      {/* Tertiary Palette */}
      <ColorSection
        title="Tertiary Palette"
        subtitle="Extended color palette for additional design flexibility and sophisticated layouts."
      >
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Soft Gray"
            value={color.tertiary.softGray100}
            tokenName="color.tertiary.softGray100"
            textColor="#000"
            pantone="427C"
            cmyk="0/1/4/16"
            rgb="215/213/206"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Dark Gray"
            value={color.tertiary.darkGray100}
            tokenName="color.tertiary.darkGray100"
            textColor="#fff"
            pantone="4278 C"
            cmyk="0/0/0/50"
            rgb="127/127/127"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Plum"
            value={color.tertiary.plum100}
            tokenName="color.tertiary.plum100"
            textColor="#fff"
            pantone="668 C"
            cmyk="13/37/0/53"
            rgb="103/75/119"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Khaki"
            value={color.tertiary.khaki100}
            tokenName="color.tertiary.khaki100"
            textColor="#000"
            pantone="4241 C"
            cmyk="0/7/28/25"
            rgb="191/177/137"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Sky Blue"
            value={color.tertiary.skyBlue100}
            tokenName="color.tertiary.skyBlue100"
            textColor="#fff"
            pantone="2121C"
            cmyk="36/19/0/16"
            rgb="136/172/213"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Calm Navy"
            value={color.tertiary.calmNavy100}
            tokenName="color.tertiary.calmNavy100"
            textColor="#fff"
            pantone="2378 C"
            cmyk="54/36/0/55"
            rgb="52/73/114"
          />
        </Grid>
      </ColorSection>

      {/* Gray Scale */}
      <ColorSection
        title="Gray Scale"
        subtitle="Neutral colors for text, borders, backgrounds, and UI elements."
      >
        {[
          { name: "Gray100", value: color.gray100, tokenName: "color.gray100" },
          { name: "Gray300", value: color.gray300, tokenName: "color.gray300" },
          { name: "Gray500", value: color.gray500, tokenName: "color.gray500" },
          { name: "Gray700", value: color.gray700, tokenName: "color.gray700" },
          { name: "Gray900", value: color.gray900, tokenName: "color.gray900" },
        ].map(({ name, value, tokenName }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <ColorSwatch
              name={name}
              value={value}
              tokenName={tokenName || name}
              textColor={
                name.includes("700") || name.includes("900") ? "#fff" : "#000"
              }
            />
          </Grid>
        ))}
      </ColorSection>

      {/* Status Colors */}
      <ColorSection
        title="Status Colors"
        subtitle="Semantic colors for success, warning, error, and info states across the application."
      >
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Success"
            value={color.status.success500}
            tokenName="color.status.success500"
            textColor="#fff"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Warning"
            value={color.status.warning500}
            tokenName="color.status.warning500"
            textColor="#000"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Error"
            value={color.status.error500}
            tokenName="color.status.error500"
            textColor="#fff"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Info"
            value={color.status.info500}
            tokenName="color.status.info500"
            textColor="#fff"
          />
        </Grid>
      </ColorSection>

      {/* Chart Colors */}
      <ColorSection
        title="Chart & Data Visualization"
        subtitle="Optimized color palette for charts, graphs, and data visualization ensuring accessibility and clarity."
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={num}>
            <ColorSwatch
              name={`Data ${num}`}
              value={(color.chart as any)[`data${num}`]}
              tokenName={`color.chart.data${num}`}
              textColor={[2, 4, 8].includes(num) ? "#000" : "#fff"}
              size="small"
            />
          </Grid>
        ))}
      </ColorSection>

      {/* Tinting Examples */}
      <ColorSection
        title="Tinting System"
        subtitle="Each color can be tinted at 75%, 50%, and 25% opacity for subtle variations and layering effects."
      >
        <Grid item xs={12}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Jade Green Tints
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="100%"
                  value={color.secondary.jadeGreen100}
                  tokenName="color.secondary.jadeGreen100"
                  textColor="#fff"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="75%"
                  value={color.secondary.jadeGreen75}
                  tokenName="color.secondary.jadeGreen75"
                  textColor="#000"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="50%"
                  value={color.secondary.jadeGreen50}
                  tokenName="color.secondary.jadeGreen50"
                  textColor="#000"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="25%"
                  value={color.secondary.jadeGreen25}
                  tokenName="color.secondary.jadeGreen25"
                  textColor="#000"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </ColorSection>

      {/* Semantic Colors */}
      <ColorSection
        title="Semantic Colors"
        subtitle="Design tokens that automatically adapt to light/dark themes using semantic color system."
      >
        {/* Input Colors */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Input Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Input Value"
                lightValue={ui.input.default.text.light}
                darkValue={ui.input.default.text.dark}
                lightTokenName="ui.input.default.text.light"
                darkTokenName="ui.input.default.text.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Input Active"
                lightValue={ui.input.focus.border.color.light}
                darkValue={ui.input.focus.border.color.dark}
                lightTokenName="ui.input.focus.border.color.light"
                darkTokenName="ui.input.focus.border.color.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Input Background"
                lightValue={ui.input.default.background.light}
                darkValue={ui.input.default.background.dark}
                lightTokenName="ui.input.default.background.light"
                darkTokenName="ui.input.default.background.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Input Border"
                lightValue={ui.input.default.border.color.light}
                darkValue={ui.input.default.border.color.dark}
                lightTokenName="ui.input.default.border.color.light"
                darkTokenName="ui.input.default.border.color.dark"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Table Colors */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 3 }}>
            Table Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Header Background"
                lightValue={ui.table.header.background.light}
                darkValue={ui.table.header.background.dark}
                lightTokenName="ui.table.header.background.light"
                darkTokenName="ui.table.header.background.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Row Background"
                lightValue={ui.table.row.background.light}
                darkValue={ui.table.row.background.dark}
                lightTokenName="ui.table.row.background.light"
                darkTokenName="ui.table.row.background.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Header Text"
                lightValue={ui.table.header.text.light}
                darkValue={ui.table.header.text.dark}
                lightTokenName="ui.table.header.text.light"
                darkTokenName="ui.table.header.text.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Table Border"
                lightValue={ui.table.border.light}
                darkValue={ui.table.border.dark}
                lightTokenName="ui.table.border.light"
                darkTokenName="ui.table.border.dark"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Card Colors */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 3 }}>
            Card Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Card Background"
                lightValue={ui.card.background.light}
                darkValue={ui.card.background.dark}
                lightTokenName="ui.card.background.light"
                darkTokenName="ui.card.background.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Card Border"
                lightValue={ui.card.border.light}
                darkValue={ui.card.border.dark}
                lightTokenName="ui.card.border.light"
                darkTokenName="ui.card.border.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Card Header Text"
                lightValue={ui.card.header.text.light}
                darkValue={ui.card.header.text.dark}
                lightTokenName="ui.card.header.text.light"
                darkTokenName="ui.card.header.text.dark"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Scrollbar Colors */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 3 }}>
            Scrollbar Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Track"
                lightValue={ui.scrollbar.track.light}
                darkValue={ui.scrollbar.track.dark}
                lightTokenName="ui.scrollbar.track.light"
                darkTokenName="ui.scrollbar.track.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Thumb"
                lightValue={ui.scrollbar.thumb.light}
                darkValue={ui.scrollbar.thumb.dark}
                lightTokenName="ui.scrollbar.thumb.light"
                darkTokenName="ui.scrollbar.thumb.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Thumb Hover"
                lightValue={ui.scrollbar.thumbHover.light}
                darkValue={ui.scrollbar.thumbHover.dark}
                lightTokenName="ui.scrollbar.thumbHover.light"
                darkTokenName="ui.scrollbar.thumbHover.dark"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <LightDarkSwatch
                name="Thumb Active"
                lightValue={ui.scrollbar.thumbActive.light}
                darkValue={ui.scrollbar.thumbActive.dark}
                lightTokenName="ui.scrollbar.thumbActive.light"
                darkTokenName="ui.scrollbar.thumbActive.dark"
              />
            </Grid>
          </Grid>
        </Grid>
      </ColorSection>

      {/* Usage Guidelines */}
      <Box sx={{ mt: 6, p: 3, bgcolor: "background.default", borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Usage Guidelines
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Brand Colors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use sparingly for key brand moments, CTAs, and important UI
                elements. Maintain high contrast for accessibility.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Secondary & Tertiary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Perfect for illustrations, backgrounds, and supporting elements.
                Use tints for subtle layering effects.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Chart Colors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Designed for data visualization with optimal contrast and
                accessibility. Use in sequence for multiple data series.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  ),
};
