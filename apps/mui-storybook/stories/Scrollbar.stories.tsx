import type { Meta, StoryObj } from "@storybook/react";
import { Box, Typography, ThemeProvider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { darkScrollbarStyles, lightScrollbarStyles, lightTheme, darkTheme } from "@smbc/mui-components";

const ScrollableContainer = styled(Box)<{ variant: 'light' | 'dark' }>(({ variant }) => ({
  height: '300px',
  width: '400px',
  border: '1px solid #ccc',
  padding: '16px',
  overflow: 'auto',
  backgroundColor: variant === 'dark' ? '#121b2c' : '#ffffff',
  color: variant === 'dark' ? '#ffffff' : '#000000',
  ...(variant === 'dark' ? darkScrollbarStyles : lightScrollbarStyles),
}));

const LongContent = () => (
  <>
    <Typography variant="h6" gutterBottom>
      Scrollable Content
    </Typography>
    {Array.from({ length: 50 }, (_, i) => (
      <Typography key={i} paragraph>
        This is line {i + 1} of scrollable content. The scrollbar should be styled according to the theme.
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </Typography>
    ))}
  </>
);

const meta: Meta<typeof ScrollableContainer> = {
  title: "Components/Scrollbar",
  component: ScrollableContainer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Custom scrollbar styles for light and dark themes.

**Usage:**
\`\`\`typescript
import { darkScrollbarStyles, lightScrollbarStyles } from '@smbc/mui-components';

const StyledBox = styled(Box)(({ theme }) => ({
  overflow: 'auto',
  ...(theme.palette.mode === 'dark' ? darkScrollbarStyles : lightScrollbarStyles),
}));
\`\`\`

**Features:**
- Webkit browser support (Chrome, Safari, Edge)
- Firefox support via scrollbar-width and scrollbar-color
- Theme-aware colors using design tokens
- Hover and active states
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["light", "dark"],
      description: "Theme variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Comparison: Story = {
  render: () => (
    <Box display="flex" gap={4}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Light Theme
        </Typography>
        <Typography variant="caption" display="block" gutterBottom sx={{ color: 'text.secondary' }}>
          Track: ui.ScrollbarTrackLight • Thumb: ui.ScrollbarThumbLight
        </Typography>
        <ThemeProvider theme={lightTheme}>
          <ScrollableContainer variant="light">
            <LongContent />
          </ScrollableContainer>
        </ThemeProvider>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Dark Theme
        </Typography>
        <Typography variant="caption" display="block" gutterBottom sx={{ color: 'text.secondary' }}>
          Track: ui.ScrollbarTrackDark • Thumb: ui.ScrollbarThumbDark
        </Typography>
        <ThemeProvider theme={darkTheme}>
          <ScrollableContainer variant="dark">
            <LongContent />
          </ScrollableContainer>
        </ThemeProvider>
      </Box>
    </Box>
  ),
  parameters: {
    layout: "padded",
  },
};