import { Components, Theme } from "@mui/material/styles";
import { ui, shadow } from "@smbc/ui-core";
import { getScrollbarStyles } from "../dark/scrollbar";
import { token, cssVar } from "../../utils/tokens";

export const createBaseComponents = (
  theme: Theme,
): Components<Omit<Theme, "components">> => {
  const mode = theme.palette.mode as "light" | "dark";

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
            color:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.3) !important"
                : "rgba(0, 0, 0, 0.26) !important",
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
            background:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.12) !important"
                : "rgba(0, 0, 0, 0.12) !important",
            color:
              mode === "dark"
                ? "rgba(255, 255, 255, 0.3) !important"
                : "rgba(0, 0, 0, 0.26) !important",
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
            backgroundColor: 'var(--ui-input-base-default-background)',
            "& fieldset": {
              borderColor: token(theme, ui.input.base.default.borderColor),
              ...(theme.palette.mode === "dark" && {
                borderRadius: theme.spacing(3),
              }),
            },
            "&:hover fieldset": {
              borderColor: token(theme, ui.input.base.hover.borderColor),
            },
            "&.Mui-focused fieldset": {
              borderColor: token(theme, ui.input.base.focus.borderColor),
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: token(theme, ui.input.base.focus.background),
            },
            "& .MuiSvgIcon-root": {
              color: token(theme, ui.input.base.focus.borderColor),
            },
          },
          "& .MuiInputBase-input": {
            padding: "9px 12px",
            color: token(theme, ui.input.base.default.color),
            "&::placeholder": {
              color: token(theme, ui.input.base.default.placeholder),
              opacity: 1,
              fontSize: "1rem",
            },
          },
          "& .MuiInputLabel-root": {
            color: token(theme, ui.input.base.default.color),
            "&.Mui-focused": {
              color: `${token(
                theme,
                ui.input.base.focus.borderColor,
              )} !important`,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: cssVar(theme).ui.input.base.default.background(),
          borderRadius: theme.spacing(3),
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: theme.spacing(3),
            borderColor: token(theme, ui.input.base.default.borderColor),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: token(theme, ui.input.base.hover.borderColor),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: token(theme, ui.input.base.focus.borderColor),
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: token(theme, ui.input.base.focus.background),
          },
          "& .MuiSvgIcon-root": {
            color: token(theme, ui.input.base.focus.borderColor),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundColor: `${token(
            theme,
            ui.card.base.default.background,
          )} !important`,
          border: `1px solid ${token(
            theme,
            ui.card.base.default.borderColor,
          )}`,
          boxShadow: shadow.base,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          // Less border radius for dropdown menus
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
          backgroundColor: token(theme, ui.chip.default.default.background),
          color: token(theme, ui.chip.default.default.color),
        },
        colorPrimary: {
          backgroundColor: token(theme, ui.chip.primary.default.background),
          color: token(theme, ui.chip.primary.default.color),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${token(
            theme,
            ui.navigation.base.default.background,
          )} !important`,
          color: `${token(theme, ui.navigation.base.default.color)} !important`,
          boxShadow: shadow.base,
          borderRadius: 0,
          borderBottom: "3px solid #02080b",
          // Remove MUI's default overlay
          "&::before": {
            display: "none",
          },
          // Override CSS custom properties that add overlays
          "--Paper-overlay": "none !important",
          "--Paper-elevation": "none !important",
          // Navigation dropdown underline styles
          "& [role='button'][aria-haspopup='true']": {
            "& .nav-underline, & .active-indicator, &::after": {
              right: "20px !important", // Shift underline left to exclude arrow
              width: "calc(100% - 24px) !important",
            },
          },
          // Active navigation item blue gradient underline
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
          backgroundColor: token(theme, ui.navigation.base.default.background),
          color: token(theme, ui.navigation.base.default.color),
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.mode === "dark" ? "#222" : "#f5f5f5",
        },
        indicator: {
          backgroundColor: token(theme, ui.input.base.focus.borderColor),
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: token(theme, ui.color.text.secondary),
          "&.Mui-selected": {
            color: token(theme, ui.input.base.focus.borderColor),
            backgroundColor: token(theme, ui.color.action.selected),
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${token(theme, ui.color.border.primary)}`,
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
          backgroundColor: token(theme, ui.tableHeader.base.default.background),
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: token(theme, ui.tableRow.base.hover.background),
          },
          "&.Mui-selected": {
            backgroundColor: token(theme, ui.tableRow.base.selected.background),
            "&:hover": {
              backgroundColor: token(
                theme,
                ui.tableRow.base.selected.background,
              ),
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
            backgroundColor: token(theme, ui.color.action.hover),
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
            backgroundColor: token(theme, ui.color.action.hover),
          },
          "&.Mui-selected": {
            backgroundColor: token(theme, ui.color.action.selected),
            "&:hover": {
              backgroundColor: token(theme, ui.color.action.hover),
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: `${token(
              theme,
              ui.color.action.selected,
            )} !important`,
            "&:hover": {
              backgroundColor: `${token(
                theme,
                ui.color.action.hover,
              )} !important`,
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
          borderColor: token(theme, ui.tableRow.base.default.borderColor),
        },
        head: {
          fontWeight: 600,
          backgroundColor: token(theme, ui.tableHeader.base.default.background),
          color: token(theme, ui.tableHeader.base.default.color),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          "&:hover": {
            backgroundColor: token(theme, ui.color.action.hover),
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: token(theme, ui.input.base.default.color),
          "&.Mui-focused": {
            color: `${token(
              theme,
              ui.input.base.focus.borderColor,
            )} !important`,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: mode === "dark" ? "#ffffff" : "#424242",
          color: mode === "dark" ? "#000000" : "#ffffff",
          fontSize: "0.75rem",
          borderRadius: 6,
          boxShadow:
            mode === "dark"
              ? "0px 2px 8px rgba(0,0,0,0.3)"
              : "0px 2px 8px rgba(0,0,0,0.15)",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: token(theme, ui.color.text.primary),
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: token(theme, ui.input.base.default.background),
          borderRadius: theme.spacing(3),
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "&.MuiPickersTextField-root": {
            "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
              backgroundColor: token(theme, ui.input.base.default.background),
              borderRadius: theme.spacing(3),
              "& fieldset": {
                borderColor:
                  mode === "dark"
                    ? token(theme, ui.input.base.default.borderColor)
                    : token(theme, ui.input.base.default.borderColor),
              },
              "&:hover fieldset": {
                borderColor: token(theme, ui.input.base.hover.borderColor),
              },
              "&.Mui-focused fieldset": {
                borderColor: token(theme, ui.input.base.focus.borderColor),
                borderWidth: 2,
              },
              "&.Mui-focused": {
                backgroundColor: token(theme, ui.input.base.focus.background),
              },
            },
            "& .MuiIconButton-root": {
              color: token(theme, ui.input.base.focus.borderColor),
            },
          },
        },
      },
    },
    // Date picker specific styling
    // @ts-ignore - MuiPickersInputBase may not be in types but is used by MUI X Date Pickers
    MuiPickersInputBase: {
      styleOverrides: {
        root: {
          padding: "5px 0",
          backgroundColor: token(theme, ui.input.base.default.background),
          borderRadius: theme.spacing(3),
          "&.MuiPickersOutlinedInput-root": {
            backgroundColor: token(theme, ui.input.base.default.background),
            borderRadius: theme.spacing(3),
            "& fieldset": {
              borderColor: `${token(
                theme,
                ui.input.base.default.borderColor,
              )} !important`,
            },
            "&:hover fieldset": {
              borderColor: `${token(
                theme,
                ui.input.base.hover.borderColor,
              )} !important`,
            },
            "&.Mui-focused fieldset": {
              borderColor: `${token(
                theme,
                ui.input.base.focus.borderColor,
              )} !important`,
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: token(theme, ui.input.base.focus.background),
            },
          },
          "& .MuiIconButton-root": {
            color: token(theme, ui.input.base.focus.borderColor),
          },
          "& .MuiInputBase-input": {
            color: token(theme, ui.input.base.default.color),
            "&::placeholder": {
              color: token(theme, ui.input.base.default.placeholder),
              opacity: 1,
              fontSize: "1rem",
            },
          },
        },
      },
    },
    // @ts-ignore - MuiPickersDay may not be in types but is used by MUI X Date Pickers
    MuiPickersDay: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: `${token(
              theme,
              ui.input.base.focus.borderColor,
            )} !important`,
            color: mode === "dark" ? "#000000" : "#ffffff",
            "&:hover": {
              backgroundColor: `${token(
                theme,
                ui.input.base.focus.borderColor,
              )} !important`,
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor:
            mode === "dark"
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(0, 0, 0, 0.12)",
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
            backgroundColor: mode === "dark" ? "#1976D2" : "#FAFAFA",
            boxShadow:
              mode === "light" ? "0 2px 4px 0 rgba(0,0,0,0.3)" : "none",
          },
          "& .MuiSwitch-track": {
            backgroundColor: mode === "dark" ? "#114377" : "#9E9E9E",
          },
        },
      },
    },
    // Global body and navigation styling
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor:
            mode === "light"
              ? token(theme, ui.color.surface.body)
              : "transparent",
          color: token(theme, ui.color.text.primary),
        },
        // Global scrollbar styling for both light and dark modes
        "html, body, .ag-theme-quartz, .ag-body-viewport, .MuiPaper-root": {
          ...getScrollbarStyles(mode === "dark", ""),
        },
      },
    },
  };
};
