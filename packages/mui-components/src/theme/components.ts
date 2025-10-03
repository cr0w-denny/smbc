import { Components, Theme } from "@mui/material/styles";
import { ui } from "@smbc/ui-core";

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
    // MUI X Date Pickers
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
    // MuiSelect: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: 3,
    //       backgroundColor: ui.input.background,
    //       "& .MuiOutlinedInput-notchedOutline": {
    //         borderRadius: 3,
    //         borderColor: ui.input.borderColor,
    //       },
    //       "&:hover": {
    //         backgroundColor: ui.input.on.hover.background,
    //       },
    //       "&:hover .MuiOutlinedInput-notchedOutline": {
    //         borderColor: ui.input.on.hover.borderColor,
    //       },
    //       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    //         borderColor: ui.input.on.focus.borderColor,
    //         borderWidth: 2,
    //       },
    //       "&.Mui-focused": {
    //         backgroundColor: ui.input.on.focus.background,
    //       },
    //       "& .MuiSvgIcon-root": {
    //         color: ui.input.on.focus.borderColor,
    //       },
    //       transition: "none",
    //     },
    //   },
    // },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": {
            "& + .MuiSwitch-track": {
              backgroundColor: "#114377",
            },
            "& .MuiSwitch-thumb": {
              backgroundColor: "#1976D2",
            },
          },
          "& .MuiSwitch-thumb": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#A5A5A5" : "#FAFAFA",
            boxShadow: ui.switchThumb.boxShadow,
          },
          "& .MuiSwitch-track": {
            backgroundColor:
              theme.palette.mode === "dark" ? "#878787" : "#9E9E9E",
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: ui.tableHeader.background,
          color: ui.tableHeader.color,
          fontWeight: 600,
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
  };
};
