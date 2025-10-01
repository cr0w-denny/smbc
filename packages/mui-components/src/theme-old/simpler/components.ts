import { Components, Theme } from "@mui/material/styles";
import { shadow } from "@smbc/ui-core";
import { getScrollbarStyles } from "../dark/scrollbar";
import { ui } from "./tokens-proxy";

export const createCssVarComponents = (
  theme: Theme,
): Components<Omit<Theme, "components">> => {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          padding: "6px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: shadow.sm,
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent !important",
            color: `${ui.color.text.disabled()} !important`,
          },
        },
        contained: {
          background:
            "linear-gradient(130.39deg, #024FB0 24.79%, #2C88F3 75.21%)",
          border: "1px solid #2C88F3",
          color: "#ffffff",
          "&:hover": {
            background:
              "linear-gradient(130.39deg, #023d8a 24.79%, #2472d9 75.21%)",
            border: "1px solid #2472d9",
            boxShadow: shadow.md,
          },
          "&.MuiButton-containedSecondary": {
            background: `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            "&:hover": {
              background: `linear-gradient(180deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
            },
          },
          "&.Mui-disabled": {
            background: `${ui.color.action.disabled()} !important`,
            color: `${ui.color.text.disabled()} !important`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: theme.spacing(3),
            fontSize: "0.875rem",
            backgroundColor: `${ui.input.base.default.background}`,
            "& fieldset": {
              borderColor: `${ui.input.base.default.borderColor}`,
            },
            "&:hover fieldset": {
              borderColor: `${ui.input.base.hover.borderColor}`,
            },
            "&.Mui-focused fieldset": {
              borderColor: `${ui.input.base.focus.borderColor}`,
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: `${ui.input.base.focus.background}`,
            },
            "& .MuiSvgIcon-root": {
              color: `${ui.input.base.focus.borderColor}`,
            },
          },
          "& .MuiInputBase-input": {
            padding: "9px 12px",
            color: `${ui.input.base.default.color}`,
            "&::placeholder": {
              color: `${ui.input.base.default.placeholder}`,
              opacity: 1,
              fontSize: "1rem",
            },
          },
          "& .MuiInputLabel-root": {
            color: "var(--ui-input-base-default-color)",
            "&.Mui-focused": {
              color: "var(--ui-input-base-focus-borderColor) !important",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--ui-input-base-default-background)",
          borderRadius: theme.spacing(3),
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: theme.spacing(3),
            borderColor: "var(--ui-input-base-default-borderColor)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--ui-input-base-hover-borderColor)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--ui-input-base-focus-borderColor)",
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: "var(--ui-input-base-focus-background)",
          },
          "& .MuiSvgIcon-root": {
            color: "var(--ui-input-base-focus-borderColor)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundColor: "var(--ui-card-base-default-background) !important",
          border: "1px solid var(--ui-card-base-default-borderColor)",
          boxShadow: shadow.base,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          "&.MuiMenu-paper, &.MuiPopover-paper": {
            borderRadius: 8,
          },
        },
        elevation1: {
          boxShadow: shadow.base,
        },
        elevation2: {
          boxShadow: shadow.md,
        },
        elevation3: {
          boxShadow: shadow.lg,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          fontSize: "0.75rem",
          height: 24,
          backgroundColor: "var(--ui-chip-default-default-background)",
          color: "var(--ui-chip-default-default-color)",
        },
        colorPrimary: {
          backgroundColor: "var(--ui-chip-primary-default-background)",
          color: "var(--ui-chip-primary-default-color)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--ui-navigation-base-default-background) !important",
          color: "var(--ui-navigation-base-default-color) !important",
          boxShadow: shadow.base,
          borderRadius: 0,
          borderBottom: "3px solid #02080b",
          "&::before": {
            display: "none",
          },
          "--Paper-overlay": "none !important",
          "--Paper-elevation": "none !important",
          "& [role='button'][aria-haspopup='true']": {
            "& .nav-underline, & .active-indicator, &::after": {
              right: "20px !important",
              width: "calc(100% - 24px) !important",
            },
          },
          "& .nav-active-indicator": {
            background:
              "linear-gradient(90deg, #27A0E4 0%, #7BDEE9 100%) !important",
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 70,
          backgroundColor: "var(--ui-navigation-base-default-background)",
          color: "var(--ui-navigation-base-default-color)",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--ui-navigation-base-hover-background)",
        },
        indicator: {
          backgroundColor: "var(--ui-input-base-focus-borderColor)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "var(--ui-color-text-secondary)",
          "&.Mui-selected": {
            color: "var(--ui-input-base-focus-borderColor)",
            backgroundColor: "var(--ui-color-action-selected)",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid var(--ui-color-border-primary)",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--ui-tableHeader-base-default-background)",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "var(--ui-tableRow-base-hover-background)",
          },
          "&.Mui-selected": {
            backgroundColor: "var(--ui-tableRow-base-selected-background)",
            "&:hover": {
              backgroundColor: "var(--ui-tableRow-base-selected-background)",
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 6,
          paddingBottom: 6,
          "&:hover": {
            backgroundColor: "var(--ui-color-action-hover)",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "0 8px",
          "&:hover": {
            backgroundColor: "var(--ui-color-action-hover)",
          },
          "&.Mui-selected": {
            backgroundColor: "var(--ui-color-action-selected)",
            "&:hover": {
              backgroundColor: "var(--ui-color-action-hover)",
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "var(--ui-color-action-selected) !important",
            "&:hover": {
              backgroundColor: "var(--ui-color-action-hover) !important",
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
          fontSize: "0.875rem",
          borderColor: "var(--ui-tableRow-base-default-borderColor)",
        },
        head: {
          fontWeight: 600,
          backgroundColor: "var(--ui-tableHeader-base-default-background)",
          color: "var(--ui-tableHeader-base-default-color)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          "&:hover": {
            backgroundColor: "var(--ui-color-action-hover)",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "var(--ui-input-base-default-color)",
          "&.Mui-focused": {
            color: "var(--ui-input-base-focus-borderColor) !important",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "var(--ui-tooltip-background)",
          color: "var(--ui-tooltip-color)",
          fontSize: "0.75rem",
          borderRadius: 6,
          boxShadow: "var(--ui-tooltip-shadow)",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "var(--ui-color-text-primary)",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--ui-input-base-default-background)",
          borderRadius: theme.spacing(3),
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "&.MuiPickersTextField-root": {
            "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
              backgroundColor: "var(--ui-input-base-default-background)",
              borderRadius: theme.spacing(3),
              "& fieldset": {
                borderColor: "var(--ui-input-base-default-borderColor)",
              },
              "&:hover fieldset": {
                borderColor: "var(--ui-input-base-hover-borderColor)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--ui-input-base-focus-borderColor)",
                borderWidth: 2,
              },
              "&.Mui-focused": {
                backgroundColor: "var(--ui-input-base-focus-background)",
              },
            },
            "& .MuiIconButton-root": {
              color: "var(--ui-input-base-focus-borderColor)",
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "var(--ui-color-border-secondary)",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: "#1976D2",
            "& + .MuiSwitch-track": {
              backgroundColor: "#114377",
            },
            "& .MuiSwitch-thumb": {
              backgroundColor: "#1976D2",
            },
          },
          "& .MuiSwitch-thumb": {
            backgroundColor: "var(--ui-switch-thumb-background)",
            boxShadow: "var(--ui-switch-thumb-shadow)",
          },
          "& .MuiSwitch-track": {
            backgroundColor: "var(--ui-switch-track-background)",
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--ui-color-surface-body)",
          color: "var(--ui-color-text-primary)",
        },
        "html, body, .ag-theme-quartz, .ag-body-viewport, .MuiPaper-root": {
          ...getScrollbarStyles(false, ""),
        },
        // CSS variables will handle dark mode automatically
        "[data-theme=\"dark\"] html, [data-theme=\"dark\"] body, [data-theme=\"dark\"] .ag-theme-quartz, [data-theme=\"dark\"] .ag-body-viewport, [data-theme=\"dark\"] .MuiPaper-root": {
          ...getScrollbarStyles(true, ""),
        },
      },
    },
  };
};