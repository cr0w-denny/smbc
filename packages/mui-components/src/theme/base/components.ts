import { Components, Theme } from "@mui/material/styles";
import * as ui from "@smbc/ui-core";
import { darkScrollbarStyles, lightScrollbarStyles } from "../dark/scrollbar";

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
            boxShadow:
              mode === "dark"
                ? ui.SemanticShadowDarkSm
                : ui.SemanticShadowLightSm,
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
            boxShadow:
              mode === "dark"
                ? ui.SemanticShadowDarkMd
                : ui.SemanticShadowLightMd,
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
            backgroundColor:
              mode === "dark"
                ? ui.InputBackgroundDark
                : ui.InputBackgroundLight,
            "& fieldset": {
              borderColor:
                mode === "dark" ? ui.InputBorderDark : ui.InputBorderLight,
              ...(theme.palette.mode === "dark" && {
                borderRadius: theme.spacing(3),
              }),
            },
            "&:hover fieldset": {
              borderColor:
                mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
            },
            "&.Mui-focused fieldset": {
              borderColor:
                mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor:
                mode === "dark" ? ui.InputHoverDark : ui.InputHoverLight,
            },
            "& .MuiSvgIcon-root": {
              color: mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
            },
          },
          "& .MuiInputBase-input": {
            padding: "9px 12px",
            color: mode === "dark" ? ui.InputValueDark : ui.InputValueLight,
            "&::placeholder": {
              color: mode === "dark" ? ui.InputValueDark : ui.InputValueLight,
              opacity: 1,
              fontSize: "1rem",
            },
          },
          "& .MuiInputLabel-root": {
            color: mode === "dark" ? ui.InputValueDark : ui.InputValueLight,
            "&.Mui-focused": {
              color: `${
                mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight
              } !important`,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor:
            mode === "dark" ? ui.InputBackgroundDark : ui.InputBackgroundLight,
          borderRadius: theme.spacing(3),
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: theme.spacing(3),
            borderColor:
              mode === "dark" ? ui.InputBorderDark : ui.InputBorderLight,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor:
              mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor:
              mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor:
              mode === "dark" ? ui.InputHoverDark : ui.InputHoverLight,
          },
          "& .MuiSvgIcon-root": {
            color: mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          backgroundColor: `${
            mode === "dark" ? ui.CardBackgroundDark : ui.CardBackgroundLight
          } !important`,
          border: `1px solid ${
            mode === "dark" ? ui.CardBorderDark : ui.CardBorderLight
          }`,
          boxShadow:
            mode === "dark"
              ? ui.SemanticShadowDarkBase
              : ui.SemanticShadowLightBase,
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
          boxShadow:
            mode === "dark"
              ? ui.SemanticShadowDarkBase
              : ui.SemanticShadowLightBase,
        },
        elevation2: {
          boxShadow:
            mode === "dark"
              ? ui.SemanticShadowDarkMd
              : ui.SemanticShadowLightMd,
        },
        elevation3: {
          boxShadow:
            mode === "dark"
              ? ui.SemanticShadowDarkLg
              : ui.SemanticShadowLightLg,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(3),
          fontSize: "0.75rem",
          height: 24,
          backgroundColor:
            mode === "dark"
              ? ui.ChipDefaultBackgroundDark
              : ui.ChipDefaultBackgroundLight,
          color:
            mode === "dark" ? ui.ChipDefaultTextDark : ui.ChipDefaultTextLight,
        },
        colorPrimary: {
          backgroundColor:
            mode === "dark"
              ? ui.ChipPrimaryBackgroundDark
              : ui.ChipPrimaryBackgroundLight,
          color:
            mode === "dark" ? ui.ChipPrimaryTextDark : ui.ChipPrimaryTextLight,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${
            mode === "dark"
              ? ui.NavigationBackgroundDark
              : ui.NavigationBackgroundLight
          } !important`,
          color: `${
            mode === "dark" ? ui.NavigationTextDark : ui.NavigationTextLight
          } !important`,
          boxShadow:
            mode === "dark"
              ? ui.SemanticShadowDarkBase
              : ui.SemanticShadowLightBase,
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
          backgroundColor:
            mode === "dark"
              ? ui.NavigationBackgroundDark
              : ui.NavigationBackgroundLight,
          color:
            mode === "dark" ? ui.NavigationTextDark : ui.NavigationTextLight,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.mode === "dark" ? "#222" : "#f5f5f5",
        },
        indicator: {
          backgroundColor:
            mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: mode === "dark" ? ui.TextSecondaryDark : ui.TextSecondaryLight,
          "&.Mui-selected": {
            color: mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
            backgroundColor:
              mode === "dark" ? ui.ActionSelectedDark : ui.ActionSelectedLight,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${
            mode === "dark" ? ui.BorderPrimaryDark : ui.BorderPrimaryLight
          }`,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor:
            mode === "dark"
              ? ui.TableRowBackgroundDark
              : ui.TableRowBackgroundLight,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor:
            mode === "dark"
              ? ui.TableHeaderBackgroundDark
              : ui.TableHeaderBackgroundLight,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor:
              mode === "dark" ? ui.TableRowHoverDark : ui.TableRowHoverLight,
          },
          "&.Mui-selected": {
            backgroundColor:
              mode === "dark"
                ? ui.TableRowSelectedDark
                : ui.TableRowSelectedLight,
            "&:hover": {
              backgroundColor:
                mode === "dark"
                  ? ui.TableRowSelectedDark
                  : ui.TableRowSelectedLight,
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
            backgroundColor:
              mode === "dark" ? ui.ActionHoverDark : ui.ActionHoverLight,
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
            backgroundColor:
              mode === "dark" ? ui.ActionHoverDark : ui.ActionHoverLight,
          },
          "&.Mui-selected": {
            backgroundColor:
              mode === "dark" ? ui.ActionSelectedDark : ui.ActionSelectedLight,
            "&:hover": {
              backgroundColor:
                mode === "dark" ? ui.ActionHoverDark : ui.ActionHoverLight,
            },
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: `${
              mode === "dark" ? ui.ActionSelectedDark : ui.ActionSelectedLight
            } !important`,
            "&:hover": {
              backgroundColor: `${
                mode === "dark" ? ui.ActionHoverDark : ui.ActionHoverLight
              } !important`,
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
          borderColor:
            mode === "dark" ? ui.TableBorderDark : ui.TableBorderLight,
        },
        head: {
          fontWeight: 600,
          backgroundColor:
            mode === "dark"
              ? ui.TableHeaderBackgroundDark
              : ui.TableHeaderBackgroundLight,
          color:
            mode === "dark" ? ui.TableHeaderTextDark : ui.TableHeaderTextLight,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          "&:hover": {
            backgroundColor:
              mode === "dark" ? ui.ActionHoverDark : ui.ActionHoverLight,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: mode === "dark" ? ui.InputValueDark : ui.InputValueLight,
          "&.Mui-focused": {
            color: `${
              mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight
            } !important`,
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
          color: mode === "dark" ? ui.TextPrimaryDark : ui.TextPrimaryLight,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor:
            mode === "dark" ? ui.InputBackgroundDark : ui.InputBackgroundLight,
          borderRadius: theme.spacing(3),
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "&.MuiPickersTextField-root": {
            "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
              backgroundColor:
                mode === "dark"
                  ? ui.InputBackgroundDark
                  : ui.InputBackgroundLight,
              borderRadius: theme.spacing(3),
              "& fieldset": {
                borderColor:
                  mode === "dark" ? ui.InputBorderDark : ui.InputBorderLight,
              },
              "&:hover fieldset": {
                borderColor:
                  mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
              },
              "&.Mui-focused fieldset": {
                borderColor:
                  mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
                borderWidth: 2,
              },
              "&.Mui-focused": {
                backgroundColor:
                  mode === "dark" ? ui.InputHoverDark : ui.InputHoverLight,
              },
            },
            "& .MuiIconButton-root": {
              color: mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
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
          backgroundColor:
            mode === "dark" ? ui.InputBackgroundDark : ui.InputBackgroundLight,
          borderRadius: theme.spacing(3),
          "&.MuiPickersOutlinedInput-root": {
            backgroundColor:
              mode === "dark"
                ? ui.InputBackgroundDark
                : ui.InputBackgroundLight,
            borderRadius: theme.spacing(3),
            "& fieldset": {
              borderColor: `${
                mode === "dark" ? ui.InputBorderDark : ui.InputBorderLight
              } !important`,
            },
            "&:hover fieldset": {
              borderColor: `${
                mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight
              } !important`,
            },
            "&.Mui-focused fieldset": {
              borderColor: `${
                mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight
              } !important`,
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor:
                mode === "dark" ? ui.InputHoverDark : ui.InputHoverLight,
            },
          },
          "& .MuiIconButton-root": {
            color: mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight,
          },
          "& .MuiInputBase-input": {
            color: mode === "dark" ? ui.InputValueDark : ui.InputValueLight,
            "&::placeholder": {
              color: mode === "dark" ? ui.InputValueDark : ui.InputValueLight,
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
            backgroundColor: `${
              mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight
            } !important`,
            color: mode === "dark" ? "#000000" : "#ffffff",
            "&:hover": {
              backgroundColor: `${
                mode === "dark" ? ui.InputActiveDark : ui.InputActiveLight
              } !important`,
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
            mode === "dark" ? ui.SurfaceBodyDark : ui.SurfaceBodyLight,
          color: mode === "dark" ? ui.TextPrimaryDark : ui.TextPrimaryLight,
        },
        // Global scrollbar styling for both light and dark modes
        "html, body, .ag-theme-quartz, .ag-body-viewport, .MuiPaper-root": {
          ...(mode === "dark" ? darkScrollbarStyles : lightScrollbarStyles),
        },
      },
    },
  };
};
