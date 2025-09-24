import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Typography as MuiTypography,
  GridLegacy as Grid,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import { typography } from "@smbc/ui-core";

const meta: Meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "fullscreen",
    docs: {
      page: null,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface TypographySpecimenProps {
  variant: string;
  sample?: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  fontFamily?: string;
  description?: string;
  usage?: string;
}

function TypographySpecimen({
  variant,
  sample = "The quick brown fox jumps over the lazy dog",
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing = "normal",
  fontFamily = "Roboto",
  description,
  usage,
}: TypographySpecimenProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <MuiTypography
          variant="h6"
          sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}
        >
          {variant}
        </MuiTypography>
        {description && (
          <MuiTypography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </MuiTypography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <MuiTypography
          sx={{
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            fontFamily: fontFamily,
            mb: 2,
          }}
        >
          {sample}
        </MuiTypography>
        <MuiTypography
          sx={{
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            fontFamily: fontFamily,
            mb: 2,
          }}
        >
          1234567890 !@#$%^&*()
        </MuiTypography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <MuiTypography variant="caption" color="text.secondary" gutterBottom>
            Font Size
          </MuiTypography>
          <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
            {fontSize}px
          </MuiTypography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <MuiTypography variant="caption" color="text.secondary" gutterBottom>
            Weight
          </MuiTypography>
          <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
            {fontWeight}
          </MuiTypography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <MuiTypography variant="caption" color="text.secondary" gutterBottom>
            Line Height
          </MuiTypography>
          <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
            {lineHeight}
          </MuiTypography>
        </Grid>
        <Grid item xs={6} sm={3}>
          <MuiTypography variant="caption" color="text.secondary" gutterBottom>
            Letter Spacing
          </MuiTypography>
          <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
            {letterSpacing}
          </MuiTypography>
        </Grid>
      </Grid>

      {usage && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
          <MuiTypography variant="caption" color="text.secondary" gutterBottom>
            Usage
          </MuiTypography>
          <MuiTypography variant="body2">{usage}</MuiTypography>
        </Box>
      )}
    </Paper>
  );
}

interface TypeScaleProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function TypeScaleSection({ title, subtitle, children }: TypeScaleProps) {
  return (
    <Box sx={{ mb: 6 }}>
      <MuiTypography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </MuiTypography>
      {subtitle && (
        <MuiTypography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: "800px" }}
        >
          {subtitle}
        </MuiTypography>
      )}
      <Grid container spacing={3}>
        {children}
      </Grid>
    </Box>
  );
}

function FontWeightDemo() {
  const weights = [
    { name: "Light", value: "300" },
    { name: "Regular", value: "400" },
    { name: "Medium", value: "500" },
    { name: "Semi Bold", value: "600" },
    { name: "Bold", value: "700" },
    { name: "Extra Bold", value: "800" },
  ];

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <MuiTypography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Font Weight Scale
      </MuiTypography>
      {weights.map((weight) => (
        <Box key={weight.value} sx={{ mb: 2 }}>
          <MuiTypography
            sx={{
              fontSize: "18px",
              fontWeight: weight.value,
              fontFamily: "Montserrat",
              mb: 0.5,
            }}
          >
            SMBC Typography - {weight.name}
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            Font Weight: {weight.value}
          </MuiTypography>
        </Box>
      ))}
    </Paper>
  );
}

function FontFamilyDemo() {
  const fonts = [
    {
      name: "Montserrat (Display & Headings)",
      family: "Montserrat, sans-serif",
      usage: "Display text, headings, and emphasis",
    },
    {
      name: "Roboto (Body & UI)",
      family: "Roboto, sans-serif",
      usage: "Body text, UI elements, and general content",
    },
    {
      name: "Roboto Mono (Code)",
      family: "Roboto Mono, monospace",
      usage: "Code blocks, technical content, and data",
    },
  ];

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <MuiTypography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Font Families
      </MuiTypography>
      {fonts.map((font) => (
        <Box key={font.name} sx={{ mb: 3 }}>
          <MuiTypography
            sx={{
              fontSize: "24px",
              fontWeight: "500",
              fontFamily: font.family,
              mb: 1,
            }}
          >
            The quick brown fox jumps over the lazy dog
          </MuiTypography>
          <MuiTypography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {font.name}
          </MuiTypography>
          <MuiTypography variant="body2" color="text.secondary">
            {font.usage}
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            Font Stack: {font.family}
          </MuiTypography>
        </Box>
      ))}
    </Paper>
  );
}

export const Typography: Story = {
  render: () => (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <MuiTypography
          variant="h2"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          SMBC Typography
        </MuiTypography>
        <MuiTypography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: "600px", mx: "auto" }}
        >
          A comprehensive typography system built on Montserrat and Roboto,
          designed for clarity, accessibility, and consistent brand expression
          across all digital experiences.
        </MuiTypography>
      </Box>

      {/* Display Text */}
      <TypeScaleSection
        title="Display Text"
        subtitle="Large-scale typography for hero sections, marketing materials, and impactful messaging."
      >
        <Grid item xs={12}>
          <TypographySpecimen
            variant="Display Large"
            sample="SMBC Group"
            fontSize="72"
            fontWeight="700"
            lineHeight="1.1"
            letterSpacing="-0.05em"
            fontFamily="Montserrat"
            description="The largest display size for hero sections and major brand moments"
            usage="Hero headlines, landing page titles, major announcements"
          />
        </Grid>
        <Grid item xs={12}>
          <TypographySpecimen
            variant="Display Medium"
            sample="Financial Innovation"
            fontSize="60"
            fontWeight="700"
            lineHeight="1.1"
            letterSpacing="-0.025em"
            fontFamily="Montserrat"
            description="Medium display size for section headers and sub-hero content"
            usage="Section headers, feature callouts, page titles"
          />
        </Grid>
        <Grid item xs={12}>
          <TypographySpecimen
            variant="Display Small"
            sample="Trusted Banking Solutions"
            fontSize="48"
            fontWeight="600"
            lineHeight="1.25"
            letterSpacing="-0.025em"
            fontFamily="Montserrat"
            description="Smallest display size for prominent headings"
            usage="Card headers, modal titles, prominent CTAs"
          />
        </Grid>
      </TypeScaleSection>

      {/* Headings */}
      <TypeScaleSection
        title="Headings"
        subtitle="Standard heading hierarchy for content structure and navigation."
      >
        <Grid item xs={12} md={6}>
          <TypographySpecimen
            variant="Heading 1"
            sample="Executive Summary"
            fontSize="36"
            fontWeight="600"
            lineHeight="1.25"
            letterSpacing="-0.025em"
            fontFamily="Montserrat"
            description="Primary page headings and major content sections"
            usage="Page titles, main content headers"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TypographySpecimen
            variant="Heading 2"
            sample="Market Analysis"
            fontSize="32"
            fontWeight="600"
            lineHeight="1.25"
            letterSpacing="-0.025em"
            fontFamily="Montserrat"
            description="Secondary headings for content subsections"
            usage="Section headers, content categories"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TypographySpecimen
            variant="Heading 3"
            sample="Investment Portfolio"
            fontSize="28"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0em"
            fontFamily="Montserrat"
            description="Third-level headings for detailed content organization"
            usage="Subsection headers, card titles"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TypographySpecimen
            variant="Heading 4"
            sample="Account Services"
            fontSize="24"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0em"
            fontFamily="Montserrat"
            description="Fourth-level headings for content grouping"
            usage="Widget titles, form sections"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TypographySpecimen
            variant="Heading 5"
            sample="Transaction History"
            fontSize="20"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0em"
            fontFamily="Montserrat"
            description="Fifth-level headings for detailed sections"
            usage="Table headers, list categories"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TypographySpecimen
            variant="Heading 6"
            sample="Account Details"
            fontSize="18"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0em"
            fontFamily="Montserrat"
            description="Smallest heading for minor content divisions"
            usage="Small section headers, component titles"
          />
        </Grid>
      </TypeScaleSection>

      {/* Body Text */}
      <TypeScaleSection
        title="Body Text"
        subtitle="Optimized text styles for reading comfort and content hierarchy."
      >
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Body Large"
            sample="SMBC Group provides comprehensive financial services to individuals and corporations worldwide. Our commitment to innovation drives us to deliver exceptional banking experiences."
            fontSize="18"
            fontWeight="400"
            lineHeight="1.5"
            letterSpacing="0em"
            fontFamily={typography.fontFamily.secondary}
            description="Large body text for introductory content and emphasis"
            usage="Lead paragraphs, feature descriptions, important notices"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Body Medium"
            sample="We offer a wide range of banking products including personal accounts, business solutions, and investment services. Our digital platform ensures secure and convenient access to your finances."
            fontSize="16"
            fontWeight="400"
            lineHeight="1.5"
            letterSpacing="0em"
            fontFamily={typography.fontFamily.secondary}
            description="Standard body text for general content"
            usage="Standard paragraphs, descriptions, content blocks"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Body Small"
            sample="Additional terms and conditions apply. Please review our privacy policy for information about data handling. Contact customer service for assistance with account inquiries."
            fontSize="14"
            fontWeight="400"
            lineHeight="1.4"
            letterSpacing="0em"
            fontFamily={typography.fontFamily.secondary}
            description="Small body text for secondary information"
            usage="Secondary descriptions, terms, disclaimers"
          />
        </Grid>
      </TypeScaleSection>

      {/* Labels */}
      <TypeScaleSection
        title="Labels"
        subtitle="Text styles for form labels, buttons, and interactive elements."
      >
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Label Large"
            sample="Account Balance"
            fontSize="16"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0em"
            description="Large labels for primary form fields and buttons"
            usage="Primary buttons, main form labels, key metrics"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Label Medium"
            sample="Transaction Type"
            fontSize="14"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0.025em"
            description="Standard labels for form elements and navigation"
            usage="Form labels, navigation items, secondary buttons"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Label Small"
            sample="Sort By"
            fontSize="12"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0.025em"
            description="Small labels for minor interface elements"
            usage="Small buttons, tags, filter labels, status indicators"
          />
        </Grid>
      </TypeScaleSection>

      {/* Utility Text */}
      <TypeScaleSection
        title="Utility Text"
        subtitle="Specialized text styles for specific use cases and technical content."
      >
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Caption"
            sample="Last updated: March 15, 2024 at 2:30 PM JST"
            fontSize="12"
            fontWeight="400"
            lineHeight="1.4"
            letterSpacing="0.025em"
            description="Small descriptive text for additional context"
            usage="Timestamps, metadata, image captions, helper text"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Overline"
            sample="ACCOUNT STATUS"
            fontSize="10"
            fontWeight="500"
            lineHeight="1.4"
            letterSpacing="0.1em"
            description="Uppercase labels for categorization"
            usage="Section labels, status indicators, breadcrumbs"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TypographySpecimen
            variant="Code"
            sample="const balance = account.getBalance();"
            fontSize="14"
            fontWeight="400"
            lineHeight="1.5"
            fontFamily="Roboto Mono"
            description="Monospace text for technical content"
            usage="Code snippets, account numbers, technical data"
          />
        </Grid>
      </TypeScaleSection>

      {/* Font Demonstrations */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <FontWeightDemo />
        </Grid>
        <Grid item xs={12} md={6}>
          <FontFamilyDemo />
        </Grid>
      </Grid>

      {/* Typography Guidelines */}
      <Box sx={{ mt: 6, p: 4, bgcolor: "background.default", borderRadius: 2 }}>
        <MuiTypography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, mb: 3 }}
        >
          Typography Guidelines
        </MuiTypography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box>
              <MuiTypography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Hierarchy
              </MuiTypography>
              <MuiTypography variant="body2" color="text.secondary">
                Use consistent type scales to create clear information
                hierarchy. Montserrat for display and headings, Roboto for body
                text and UI elements.
              </MuiTypography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <MuiTypography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Accessibility
              </MuiTypography>
              <MuiTypography variant="body2" color="text.secondary">
                Maintain sufficient color contrast (4.5:1 minimum). Use
                appropriate font sizes (16px+ for body text). Ensure proper
                line-height for readability.
              </MuiTypography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <MuiTypography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Consistency
              </MuiTypography>
              <MuiTypography variant="body2" color="text.secondary">
                Stick to the defined type scale. Use Montserrat for headings,
                Roboto for body text, and Roboto Mono for technical content.
                Maintain consistent spacing and alignment.
              </MuiTypography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <MuiTypography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2 }}
        >
          Best Practices
        </MuiTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label="DO"
                color="success"
                size="small"
                sx={{ mr: 2, minWidth: 40 }}
              />
              <MuiTypography variant="body2">
                Use semantic HTML elements with proper heading hierarchy
              </MuiTypography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label="DO"
                color="success"
                size="small"
                sx={{ mr: 2, minWidth: 40 }}
              />
              <MuiTypography variant="body2">
                Maintain consistent line-height for improved readability
              </MuiTypography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label="DO"
                color="success"
                size="small"
                sx={{ mr: 2, minWidth: 40 }}
              />
              <MuiTypography variant="body2">
                Use appropriate font weights to create visual emphasis
              </MuiTypography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label="DON'T"
                color="error"
                size="small"
                sx={{ mr: 2, minWidth: 40 }}
              />
              <MuiTypography variant="body2">
                Mix multiple font families within the same content block
              </MuiTypography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label="DON'T"
                color="error"
                size="small"
                sx={{ mr: 2, minWidth: 40 }}
              />
              <MuiTypography variant="body2">
                Use font sizes smaller than 14px for body text
              </MuiTypography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Chip
                label="DON'T"
                color="error"
                size="small"
                sx={{ mr: 2, minWidth: 40 }}
              />
              <MuiTypography variant="body2">
                Overuse bold or italic styling for emphasis
              </MuiTypography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  ),
};
