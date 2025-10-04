import { Components, Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Components<Theme> {
    MuiPickersInputBase?: Components<Theme>["MuiTextField"];
    MuiPickersOutlinedInput?: Components<Theme>["MuiTextField"];
  }
}

export const createCssVarComponents = (
  theme: Theme,
): Components<Omit<Theme, "components">> => {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, .ag-theme-quartz, .ag-body-viewport, .MuiPaper-root": {
          // TODO: Add scrollbar styles
        },
        // CSS variables will handle dark mode automatically
        '[data-theme="dark"] html, [data-theme="dark"] body, [data-theme="dark"] .ag-theme-quartz, [data-theme="dark"] .ag-body-viewport, [data-theme="dark"] .MuiPaper-root':
          {
            // TODO: Add scrollbar styles
          },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.MuiMenu-paper': {
            backgroundColor: theme.palette.mode === "dark" ? "#0A111B !important" : undefined,
          },
          '&.MuiPopover-paper': {
            backgroundColor: theme.palette.mode === "dark" ? "#0A111B !important" : undefined,
          },
        },
      },
    },
  };
};
