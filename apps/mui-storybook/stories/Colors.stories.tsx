import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography, GridLegacy as Grid, Paper } from "@mui/material";
import * as tokens from "@smbc/ui-core";

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
            value={tokens.TradGreen}
            tokenName="TradGreen"
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
            value={tokens.FreshGreen}
            tokenName="FreshGreen"
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
            value={tokens.HoneyBeige100}
            tokenName="HoneyBeige100"
            textColor="#fff"
            pantone="2470 C"
            cmyk="0/15/42/39"
            rgb="155/132/90"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Wheat Yellow"
            value={tokens.WheatYellow100}
            tokenName="WheatYellow100"
            textColor="#000"
            pantone="4023 C"
            cmyk="0/14/50/13"
            rgb="225/194/129"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Jade Green"
            value={tokens.JadeGreen100}
            tokenName="JadeGreen100"
            textColor="#fff"
            pantone="5565 C"
            cmyk="50/19/36/7"
            rgb="127/156/144"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ColorSwatch
            name="Storm Blue"
            value={tokens.StormBlue100}
            tokenName="StormBlue100"
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
            value={tokens.SoftGray100}
            tokenName="SoftGray100"
            textColor="#000"
            pantone="427C"
            cmyk="0/1/4/16"
            rgb="215/213/206"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Dark Gray"
            value={tokens.DarkGray100}
            tokenName="DarkGray100"
            textColor="#fff"
            pantone="4278 C"
            cmyk="0/0/0/50"
            rgb="127/127/127"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Plum"
            value={tokens.Plum100}
            tokenName="Plum100"
            textColor="#fff"
            pantone="668 C"
            cmyk="13/37/0/53"
            rgb="103/75/119"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Khaki"
            value={tokens.Khaki100}
            tokenName="Khaki100"
            textColor="#000"
            pantone="4241 C"
            cmyk="0/7/28/25"
            rgb="191/177/137"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Sky Blue"
            value={tokens.SkyBlue100}
            tokenName="SkyBlue100"
            textColor="#fff"
            pantone="2121C"
            cmyk="36/19/0/16"
            rgb="136/172/213"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <ColorSwatch
            name="Calm Navy"
            value={tokens.CalmNavy100}
            tokenName="CalmNavy100"
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
          { name: "Gray100", value: tokens.Gray100 },
          { name: "Gray300", value: tokens.Gray300 },
          { name: "Gray500", value: tokens.Gray500 },
          { name: "Gray700", value: tokens.Gray700 },
          { name: "Gray900", value: tokens.Gray900 },
        ].map(({ name, value }) => (
          <Grid item xs={6} sm={4} md={2} key={name}>
            <ColorSwatch
              name={name}
              value={value}
              tokenName={name}
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
            value={tokens.Success500}
            tokenName="Success500"
            textColor="#fff"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Warning"
            value={tokens.Warning500}
            tokenName="Warning500"
            textColor="#000"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Error"
            value={tokens.Error500}
            tokenName="Error500"
            textColor="#fff"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <ColorSwatch
            name="Info"
            value={tokens.Info500}
            tokenName="Info500"
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
              value={(tokens as any)[`Data${num}`]}
              tokenName={`Data${num}`}
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
                  value={tokens.JadeGreen100}
                  textColor="#fff"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="75%"
                  value={tokens.JadeGreen75}
                  textColor="#000"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="50%"
                  value={tokens.JadeGreen50}
                  textColor="#000"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <ColorSwatch
                  name="25%"
                  value={tokens.JadeGreen25}
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
              <ColorSwatch
                name="Input Value Light"
                value={tokens.InputValueLight}
                tokenName="InputValueLight"
                textColor="#fff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Input Value Dark"
                value={tokens.InputValueDark}
                tokenName="InputValueDark"
                textColor="#000"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Input Active Light"
                value={tokens.InputActiveLight}
                tokenName="InputActiveLight"
                textColor="#fff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Input Active Dark"
                value={tokens.InputActiveDark}
                tokenName="InputActiveDark"
                textColor="#000"
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
              <ColorSwatch
                name="Header BG Light"
                value={tokens.TableHeaderBackgroundLight}
                tokenName="TableHeaderBackgroundLight"
                textColor="#000"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Header BG Dark"
                value={tokens.TableHeaderBackgroundDark}
                tokenName="TableHeaderBackgroundDark"
                textColor="#fff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Row BG Light"
                value={tokens.TableRowBackgroundLight}
                tokenName="TableRowBackgroundLight"
                textColor="#000"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Row BG Dark"
                value={tokens.TableRowBackgroundDark}
                tokenName="TableRowBackgroundDark"
                textColor="#fff"
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
              <ColorSwatch
                name="Card BG Light"
                value={tokens.CardBackgroundLight}
                tokenName="CardBackgroundLight"
                textColor="#000"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Card BG Dark"
                value={tokens.CardBackgroundDark}
                tokenName="CardBackgroundDark"
                textColor="#fff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Card Border Light"
                value={tokens.CardBorderLight}
                tokenName="CardBorderLight"
                textColor="#000"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <ColorSwatch
                name="Card Border Dark"
                value={tokens.CardBorderDark}
                tokenName="CardBorderDark"
                textColor="#fff"
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
