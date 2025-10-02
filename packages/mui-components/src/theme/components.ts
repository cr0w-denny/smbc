import { Components, Theme } from "@mui/material/styles";
import { ui, shadow } from "@smbc/ui-core";

declare module "@mui/material/styles" {
  interface Components<Theme> {
    MuiPickersInputBase?: Components<Theme>["MuiTextField"];
    MuiPickersOutlinedInput?: Components<Theme>["MuiTextField"];
  }
}

export const createCssVarComponents = (
  theme: Theme,
): Components<Omit<Theme, "components">> => {
  console.log(
    "DENNY",
    ui.navigation.background,
    ui.navigation.background(theme),
    theme.palette.mode,
  );
  return {
    MuiAppBar: {
      styleOverrides: {
        root: {
          "--Paper-overlay": "none !important",
          "--Paper-elevation": "none !important",
          backgroundColor: `${ui.navigation.background(theme)} !important`,
          borderBottom: "3px solid #02080b",
          color: `${ui.navigation.color(theme)} !important`,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "&.MuiPickersTextField-root": {
            "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
              borderRadius: theme.spacing(3),
              "& fieldset": {
                borderColor: ui.input.borderColor,
              },
              "&:hover": {
                backgroundColor: ui.input.on.hover.background,
              },
              "&:hover fieldset": {
                borderColor: ui.input.on.hover.borderColor,
              },
              "&.Mui-focused fieldset": {
                borderColor: ui.input.on.focus.borderColor,
                borderWidth: 2,
              },
            },
            "& .MuiIconButton-root": {
              color: ui.input.on.focus.borderColor,
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: ui.input.background,
          borderRadius: theme.spacing(3),
          "&:hover": {
            backgroundColor: ui.input.on.hover.background,
          },
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
      },
    },
    // MUI X Date Pickers - using correct component names
    MuiPickersInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: ui.input.background,
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
      },
    },
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: ui.input.background,
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: ui.input.color,
          "&.Mui-focused": {
            color: `${ui.input.on.focus.borderColor(theme)} !important`,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "0 8px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {},
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          "&.MuiMenu-paper, &.MuiPopover-paper": {
            "--Paper-overlay": "none !important",
            "--Paper-elevation": "none !important",
            backgroundColor: `${ui.color.background.secondary(
              theme,
            )} !important`,
            border: `1px solid ${ui.color.border.primary(theme)}`,
            color: ui.color.text.primary,
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
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: theme.spacing(3),
            borderColor: ui.input.borderColor,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: ui.input.on.hover.borderColor,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: ui.input.on.focus.borderColor,
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
          "& .MuiSvgIcon-root": {
            color: ui.input.on.focus.borderColor,
          },
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
            backgroundColor: ui.switchThumb.background,
            boxShadow: ui.switchThumb.boxShadow,
          },
          "& .MuiSwitch-track": {
            backgroundColor: ui.switchThumb.background,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "8px 16px",
          fontSize: "0.875rem",
          borderColor: ui.tableRow.borderColor,
        },
        head: {
          fontWeight: 600,
          backgroundColor: ui.tableHeader.background,
          color: ui.tableHeader.color,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: ui.tableHeader.background,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: ui.tableRow.on.hover.background,
          },
          "&.Mui-selected": {
            backgroundColor: ui.tableRow.on.selected.background,
            "&:hover": {
              backgroundColor: ui.tableRow.on.selected.background,
            },
          },
        },
      },
    },
  };

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          background: ui.button.background,
          borderRadius: ui.button.borderRadius,
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
            color: `${ui.color.text.disabled} !important`,
          },
        },
        contained: {
          background: ui.button.background,
          border: "1px solid #2C88F3",
          color: "#ffffff",
          "&:hover": {
            background: ui.button.background,
            border: "1px solid #2472d9",
            boxShadow: shadow.md,
          },
          "&.MuiButton-containedSecondary": {
            background: ui.button.background,
            "&:hover": {
              background: `linear-gradient(180deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
            },
          },
          "&.Mui-disabled": {
            background: `${ui.color.action.disabled} !important`,
            color: `${ui.color.text.disabled} !important`,
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
            "& fieldset": {
              borderColor: `${ui.input.borderColor}`,
            },
            "&:hover": {
              backgroundColor: `${ui.input.on.hover.background}`,
            },
            "&:hover fieldset": {
              borderColor: `${ui.input.on.hover.borderColor}`,
            },
            "&.Mui-focused fieldset": {
              borderColor: `${ui.input.on.focus.borderColor}`,
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: `${ui.input.on.focus.background}`,
            },
            "& .MuiSvgIcon-root": {
              color: `${ui.input.on.focus.borderColor}`,
            },
          },
          "& .MuiInputBase-input": {
            padding: "9px 12px",
            color: `${ui.input.color}`,
            "&::placeholder": {
              color: `${ui.input.placeholder}`,
              opacity: 1,
              fontSize: "1rem",
            },
          },
          "& .MuiInputLabel-root": {
            color: ui.input.color,
            "&.Mui-focused": {
              color: `${ui.input.on.focus.borderColor} !important`,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: theme.spacing(3),
            borderColor: ui.input.borderColor,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: ui.input.on.hover.borderColor,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: ui.input.on.focus.borderColor,
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
          "& .MuiSvgIcon-root": {
            color: ui.input.on.focus.borderColor,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundColor: `${ui.card.background} !important`,
          border: `1px solid ${ui.card.borderColor}`,
          boxShadow: shadow.base,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.MuiMenu-paper, &.MuiPopover-paper": {
            backgroundColor: ui.popover.background,
            borderColor: ui.popover.borderColor,
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${ui.navigation.background} !important`,
          color: `${ui.navigation.color} !important`,
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
          backgroundColor: ui.navigation.background,
          color: ui.navigation.color,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: ui.navigation.on.hover.background,
        },
        indicator: {
          backgroundColor: ui.input.on.focus.borderColor,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: ui.color.text.secondary,
          "&.Mui-selected": {
            color: ui.input.on.focus.borderColor,
            backgroundColor: ui.color.action.selected,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${ui.color.border.primary}`,
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
          backgroundColor: ui.tableHeader.background,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: ui.tableRow.on.hover.background,
          },
          "&.Mui-selected": {
            backgroundColor: ui.tableRow.on.selected.background,
            "&:hover": {
              backgroundColor: ui.tableRow.on.selected.background,
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
            backgroundColor: ui.color.action.hover,
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
            backgroundColor: ui.color.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: ui.color.action.selected,
            "&:hover": {
              backgroundColor: ui.color.action.hover,
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: `${ui.color.action.selected} !important`,
            "&:hover": {
              backgroundColor: `${ui.color.action.hover} !important`,
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
          borderColor: ui.tableRow.borderColor,
        },
        head: {
          fontWeight: 600,
          backgroundColor: ui.tableHeader.background,
          color: ui.tableHeader.color,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          "&:hover": {
            backgroundColor: ui.color.action.hover,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: ui.input.color,
          "&.Mui-focused": {
            color: `${ui.input.on.focus.borderColor} !important`,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: ui.input.background,
          borderRadius: theme.spacing(3),
          "&:hover": {
            backgroundColor: ui.input.on.hover.background,
          },
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "&.MuiPickersTextField-root": {
            "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
              borderRadius: theme.spacing(3),
              "& fieldset": {
                borderColor: ui.input.borderColor,
              },
              "&:hover": {
                backgroundColor: ui.input.on.hover.background,
              },
              "&:hover fieldset": {
                borderColor: ui.input.on.hover.borderColor,
              },
              "&.Mui-focused fieldset": {
                borderColor: ui.input.on.focus.borderColor,
                borderWidth: 2,
              },
            },
            "& .MuiIconButton-root": {
              color: ui.input.on.focus.borderColor,
            },
          },
        },
      },
    },
    // MUI X Date Pickers - using correct component names
    MuiPickersInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: ui.input.background,
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
      },
    } as any,
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: ui.input.background,
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
      },
    } as any,
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
            backgroundColor: ui.switchThumb.background,
            boxShadow: ui.switchThumb.boxShadow,
          },
          "& .MuiSwitch-track": {
            backgroundColor: ui.switchThumb.background,
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: ui.color.background.primary,
          color: ui.color.text.primary,
        },
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
  };
};
