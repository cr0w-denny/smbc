import type { Preview } from "@storybook/react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { createCssVarTheme } from "@smbc/mui-components";
import { useEffect } from "react";

const lightTheme = createCssVarTheme("light");
const darkTheme = createCssVarTheme("dark");

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["Foundations", "Components"],
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? darkTheme : lightTheme;
      const isDark = context.globals.theme === "dark";

      // Apply theming only to component preview areas
      useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
          root.style.setProperty('--canvas-bg-color', theme.palette.background.default);
          root.style.setProperty('--canvas-text-color', theme.palette.text.primary);
        } else {
          root.style.setProperty('--canvas-bg-color', '#ffffff');
          root.style.setProperty('--canvas-text-color', '#000000');
        }

        // Apply styles only to component preview areas, not entire docs
        const style = document.getElementById('storybook-canvas-theme') || document.createElement('style');
        style.id = 'storybook-canvas-theme';
        style.textContent = `
          /* Only style the component preview areas */
          .docs-story {
            background-color: var(--canvas-bg-color) !important;
            color: var(--canvas-text-color) !important;
          }

          /* Story canvas in regular view */
          #storybook-preview-iframe {
            background-color: var(--canvas-bg-color) !important;
          }

          /* Keep docs content area light */
          .sbdocs-content {
            background-color: #ffffff !important;
            color: #000000 !important;
          }

          .sbdocs-wrapper {
            background-color: #ffffff !important;
          }
        `;
        document.head.appendChild(style);

        return () => {
          const existingStyle = document.getElementById('storybook-canvas-theme');
          if (existingStyle) {
            existingStyle.remove();
          }
        };
      }, [isDark, theme]);

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
