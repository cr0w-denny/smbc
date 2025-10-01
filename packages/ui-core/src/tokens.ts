export const tokens = {
  color: {
    brand: {
      tradGreen: "#004831",
      freshGreen: "#C4D700",
    },
    warm: {
      honeyBeige25: "#e9dbd5",
      honeyBeige50: "#d4c3b2",
      honeyBeige75: "#bfab8f",
      honeyBeige100: "#AA936C",
      wheatYellow25: "#f3e6d5",
      wheatYellow50: "#eddab9",
      wheatYellow75: "#e7ce9d",
      wheatYellow100: "#E1C281",
    },
    cool: {
      jadeGreen25: "#cbd7d5",
      jadeGreen50: "#b0c2bd",
      jadeGreen75: "#95ada5",
      jadeGreen100: "#7A988D",
      stormBlue25: "#b0cdd3",
      stormBlue50: "#88b3bf",
      stormBlue75: "#5f99ab",
      stormBlue100: "#367F97",
      skyBlue25: "#d0dfed",
      skyBlue50: "#b8cee5",
      skyBlue75: "#a0bddd",
      skyBlue100: "#88ACD5",
      calmNavy25: "#a6acbd",
      calmNavy50: "#808ba4",
      calmNavy75: "#5a6a8b",
      calmNavy100: "#344972",
    },
    neutral: {
      softGray25: "#efeded",
      softGray50: "#e7e5e2",
      softGray75: "#dfddd8",
      softGray100: "#D7D5CE",
      darkGray25: "#cccccc",
      darkGray50: "#b3b3b3",
      darkGray75: "#999999",
      darkGray100: "#7F7F7F",
      plum25: "#c1aec8",
      plum50: "#a38dad",
      plum75: "#856c92",
      plum100: "#674B77",
      khaki25: "#efe1d1",
      khaki50: "#dfd1b9",
      khaki75: "#cfc1a1",
      khaki100: "#BFB189",
      gray50: "#fafafa",
      gray100: "#f5f5f5",
      gray200: "#e5e5e5",
      gray300: "#d4d4d4",
      gray400: "#a3a3a3",
      gray500: "#737373",
      gray600: "#525252",
      gray700: "#404040",
      gray800: "#262626",
      gray900: "#171717",
    },
    chart: {
      data1: "#7a988d",
      data2: "#d7d5ce",
      data3: "#9b845a",
      data4: "#ddbd6e",
      data5: "#317589",
      data6: "#7f7f7f",
      data7: "#674b77",
      data8: "#bfb189",
      data9: "#88acd5",
      data10: "#344972",
    },
    main: {
      primary: "#7a988d",
      secondary: "#d7d5ce",
      aux: "#e4eae8",
      accent: "#cfe7ee",
    },
    status: {
      success: "#4caf50",
      success50: "#e8f5e8",
      success100: "#c8e6c9",
      success200: "#bbf7d0",
      success300: "#86efac",
      success400: "#66bb6a",
      success500: "#4caf50",
      success600: "#16a34a",
      success700: "#388e3c",
      success800: "#166534",
      success900: "#1b5e20",
      warning: "#ff9800",
      warning50: "#fff3e0",
      warning100: "#ffe0b2",
      warning200: "#fde68a",
      warning300: "#fcd34d",
      warning400: "#ffb74d",
      warning500: "#ff9800",
      warning600: "#d97706",
      warning700: "#f57c00",
      warning800: "#92400e",
      warning900: "#e65100",
      error: "#f44336",
      error50: "#ffebee",
      error100: "#ffcdd2",
      error200: "#fecaca",
      error300: "#fca5a5",
      error400: "#ef5350",
      error500: "#f44336",
      error600: "#dc2626",
      error700: "#d32f2f",
      error800: "#991b1b",
      error900: "#b71c1c",
      info: "#03a9f4",
      info50: "#e1f5fe",
      info100: "#b3e5fc",
      info200: "#bfdbfe",
      info300: "#93c5fd",
      info400: "#29b6f6",
      info500: "#03a9f4",
      info600: "#2563eb",
      info700: "#0288d1",
      info800: "#1e40af",
      info900: "#01579b",
    },
    gradient: {
      darkBlue:
        "linear-gradient(to bottom right, #0b1524 0%, #0B1220 30%, #070f1a 57%, #040b13 96%)",
    },
  },
  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  zIndex: {
    hide: "-1",
    auto: "auto",
    base: "0",
    docked: "10",
    dropdown: "1000",
    sticky: "1100",
    banner: "1200",
    overlay: "1300",
    modal: "1400",
    popover: "1500",
    skipLink: "1600",
    toast: "1700",
    tooltip: "1800",
  },
  typography: {
    fontFamily: {
      primary: '"Montserrat", "Helvetica", "Arial", sans-serif',
      secondary: '"Roboto", "Helvetica", "Arial", sans-serif',
      monospace: '"Roboto Mono", "Consolas", "Monaco", monospace',
    },
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
    fontSize: {
      xs: "12",
      sm: "14",
      base: "16",
      lg: "18",
      xl: "20",
      "2xl": "24",
      "3xl": "30",
      "4xl": "36",
      "5xl": "48",
      "6xl": "60",
      "7xl": "72",
      "8xl": "96",
      "9xl": "128",
    },
    lineHeight: {
      none: "1",
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
    textStyles: {
      h1: {
        fontSize: "48",
        fontWeight: "700",
        lineHeight: "1.2",
        letterSpacing: "-0.025em",
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      },
      h2: {
        fontSize: "36",
        fontWeight: "600",
        lineHeight: "1.25",
        letterSpacing: "-0.025em",
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      },
      h3: {
        fontSize: "30",
        fontWeight: "600",
        lineHeight: "1.25",
        letterSpacing: "0em",
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      },
      h4: {
        fontSize: "24",
        fontWeight: "600",
        lineHeight: "1.375",
        letterSpacing: "0em",
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      },
      h5: {
        fontSize: "20",
        fontWeight: "600",
        lineHeight: "1.375",
        letterSpacing: "0em",
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      },
      h6: {
        fontSize: "18",
        fontWeight: "600",
        lineHeight: "1.5",
        letterSpacing: "0em",
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
      },
      body1: {
        fontSize: "16",
        fontWeight: "400",
        lineHeight: "1.5",
        letterSpacing: "0em",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      body2: {
        fontSize: "14",
        fontWeight: "400",
        lineHeight: "1.5",
        letterSpacing: "0em",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      caption: {
        fontSize: "12",
        fontWeight: "400",
        lineHeight: "1.5",
        letterSpacing: "0em",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
    },
  },
  breakpoints: {
    xs: "0",
    sm: "600",
    md: "1440",
    lg: "1640",
    xl: "1920",
  },
  size: {
    spacing: {
      "0": "0",
      "1": "4",
      "2": "8",
      "3": "12",
      "4": "16",
      "5": "20",
      "6": "24",
      "8": "32",
      "10": "40",
      "12": "48",
      "16": "64",
      "20": "80",
      "24": "96",
      "32": "128",
      "40": "160",
      "48": "192",
      "56": "224",
      "64": "256",
    },
    borderRadius: {
      sm: "2",
      base: "4",
      md: "6",
      lg: "8",
      xl: "12",
      "2xl": "16",
      "3xl": "24",
      full: "9999",
    },
  },
  layout: {
    breakpoint: {
      xs: "0",
      sm: "600",
      md: "1440",
      lg: "1640",
      xl: "1920",
    },
    maxWidth: {
      xs: "96%",
      sm: "96%",
      md: "88%",
      lg: "88%",
      xl: "92%",
    },
  },
  ui: {
    input: {
      // Direct properties (immediate children)
      background: {
        light: "#ffffff",
        dark: "#1D273A",
      },
      borderColor: {
        light: "var(--color-neutral-gray300)",
        dark: "#12244A",
      },
      borderWidth: "1px",
      borderStyle: "solid",
      padding: "8px",
      color: {
        light: "var(--color-neutral-gray900)",
        dark: "#E2E6EC",
      },
      placeholder: {
        light: "var(--color-neutral-gray600)",
        dark: "rgba(255, 255, 255, 0.6)",
      },
      on: {
        hover: {
          background: {
            light: "var(--color-neutral-gray50)",
            dark: "#1D2427",
          },
          borderColor: {
            light: "var(--color-neutral-gray400)",
            dark: "#1F3359",
          },
        },
        focus: {
          background: {
            light: "#ffffff",
            dark: "#1D273A",
          },
          borderColor: {
            light: "var(--color-brand-freshGreen)",
            dark: "#73ABFB",
          },
          ring: {
            color: {
              light: "rgba(196, 215, 0, 0.25)",
              dark: "rgba(115, 171, 251, 0.25)",
            },
            width: "2px",
            offset: "2px",
          },
        },
        disabled: {
          background: {
            light: "var(--color-neutral-gray100)",
            dark: "rgba(255, 255, 255, 0.05)",
          },
          borderColor: {
            light: "var(--color-neutral-gray200)",
            dark: "rgba(255, 255, 255, 0.12)",
          },
          color: {
            light: "var(--color-neutral-gray400)",
            dark: "rgba(255, 255, 255, 0.38)",
          },
          placeholder: {
            light: "var(--color-neutral-gray300)",
            dark: "rgba(255, 255, 255, 0.25)",
          },
        },
        error: {
          background: {
            light: "#ffffff",
            dark: "#1D273A",
          },
          borderColor: {
            light: "var(--color-status-error500)",
            dark: "var(--color-status-error400)",
          },
          color: {
            light: "var(--color-status-error700)",
            dark: "var(--color-status-error300)",
          },
          message: {
            light: "var(--color-status-error600)",
            dark: "var(--color-status-error400)",
          },
        },
      },
    },
    button: {
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "500",
      padding: "8px 16px",
      background: {
        light: "var(--color-brand-tradGreen)",
        dark: "var(--color-brand-freshGreen)",
      },
      color: {
        light: "#ffffff",
        dark: "#000000",
      },
      borderColor: {
        light: "var(--color-brand-tradGreen)",
        dark: "var(--color-brand-freshGreen)",
      },
      borderWidth: "1px",
      borderStyle: "solid",
      on: {
        hover: {
          cursor: "pointer",
          background: {
            light: "#003d28",
            dark: "var(--color-brand-tradGreen)",
          },
          color: {
            light: "#ffffff",
            dark: "#ffffff",
          },
        },
        active: {
          transform: "translateY(1px)",
          background: {
            light: "#002e1e",
            dark: "#003d28",
          },
        },
        disabled: {
          cursor: "not-allowed",
          opacity: "0.6",
          background: {
            light: "var(--color-neutral-gray200)",
            dark: "rgba(255, 255, 255, 0.12)",
          },
          color: {
            light: "var(--color-neutral-gray400)",
            dark: "rgba(255, 255, 255, 0.38)",
          },
        },
      },
      classes: {
        secondary: {
          background: {
            light: "transparent",
            dark: "transparent",
          },
          color: {
            light: "var(--color-neutral-gray700)",
            dark: "rgba(255, 255, 255, 0.87)",
          },
          borderColor: {
            light: "var(--color-neutral-gray300)",
            dark: "rgba(255, 255, 255, 0.23)",
          },
          on: {
            hover: {
              background: {
                light: "var(--color-neutral-gray50)",
                dark: "rgba(255, 255, 255, 0.08)",
              },
              borderColor: {
                light: "var(--color-neutral-gray400)",
                dark: "rgba(255, 255, 255, 0.35)",
              },
            },
            active: {
              background: {
                light: "var(--color-neutral-gray100)",
                dark: "rgba(255, 255, 255, 0.12)",
              },
            },
            disabled: {
              background: {
                light: "transparent",
                dark: "transparent",
              },
              color: {
                light: "var(--color-neutral-gray400)",
                dark: "rgba(255, 255, 255, 0.38)",
              },
              borderColor: {
                light: "var(--color-neutral-gray200)",
                dark: "rgba(255, 255, 255, 0.12)",
              },
            },
          },
        },
        ghost: {
          background: {
            light: "transparent",
            dark: "transparent",
          },
          color: {
            light: "var(--color-brand-tradGreen)",
            dark: "var(--color-brand-freshGreen)",
          },
          borderColor: {
            light: "transparent",
            dark: "transparent",
          },
          on: {
            hover: {
              background: {
                light: "rgba(0, 72, 49, 0.08)",
                dark: "rgba(196, 215, 0, 0.08)",
              },
            },
            active: {
              background: {
                light: "rgba(0, 72, 49, 0.12)",
                dark: "rgba(196, 215, 0, 0.12)",
              },
            },
            disabled: {
              color: {
                light: "var(--color-neutral-gray400)",
                dark: "rgba(255, 255, 255, 0.38)",
              },
            },
          },
        },
      },
    },
    table: {
      borderCollapse: "collapse",
      width: "100%",
    },
    tableHeader: {
      background: {
        light: "var(--color-neutral-gray100)",
        dark: "#0E131D",
      },
      color: {
        light: "var(--color-neutral-gray700)",
        dark: "rgba(255, 255, 255, 0.87)",
      },
      fontWeight: "600",
      padding: "12px",
    },
    tableRow: {
      background: {
        light: "#ffffff",
        dark: "#121B2C",
      },
      borderColor: {
        light: "var(--color-neutral-gray200)",
        dark: "#1F3359",
      },
      borderWidth: "1px",
      borderStyle: "solid",
      on: {
        hover: {
          background: {
            light: "var(--color-neutral-gray100)",
            dark: "rgba(255, 255, 255, 0.08)",
          },
        },
        selected: {
          background: {
            light: "#EDECEC",
            dark: "rgba(255, 255, 255, 0.12)",
          },
        },
      },
    },
    chip: {
      borderRadius: "16px",
      fontSize: "12px",
      padding: "4px 12px",
      background: {
        light: "var(--color-brand-tradGreen)",
        dark: "var(--color-brand-freshGreen)",
      },
      color: {
        light: "#ffffff",
        dark: "#000000",
      },
      classes: {
        default: {
          background: {
            light: "var(--color-neutral-gray200)",
            dark: "rgba(255, 255, 255, 0.12)",
          },
          color: {
            light: "var(--color-neutral-gray800)",
            dark: "rgba(255, 255, 255, 0.87)",
          },
        },
      },
    },
    navigation: {
      background: {
        light: "#141B1D",
        dark: "#0C121E",
      },
      color: {
        light: "#ffffff",
        dark: "rgba(255, 255, 255, 0.87)",
      },
      on: {
        hover: {
          background: {
            light: "rgba(255, 255, 255, 0.08)",
            dark: "rgba(255, 255, 255, 0.04)",
          },
        },
        active: {
          background: {
            light: "rgba(255, 255, 255, 0.15)",
            dark: "rgba(255, 255, 255, 0.08)",
          },
        },
      },
    },
    card: {
      background: {
        light: "#ffffff",
        dark: "#121B2C",
      },
      borderColor: {
        light: "var(--color-neutral-gray200)",
        dark: "#24324C",
      },
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "16px",
      padding: "24px",
    },
    cardHeader: {
      color: {
        light: "#486C94",
        dark: "#98A4B9",
      },
      fontSize: "18px",
      fontFamily: {
        light: "Roboto, sans-serif",
        dark: "Montserrat, sans-serif",
      },
      fontWeight: {
        light: "400",
        dark: "500",
      },
      padding: "0 0 16px 0",
    },
    scrollbar: {
      width: "8px",
    },
    scrollbarTrack: {
      background: {
        light: "var(--color-neutral-gray100)",
        dark: "#121b2c",
      },
    },
    scrollbarThumb: {
      background: {
        light: "var(--color-neutral-gray400)",
        dark: "#1F3359",
      },
      borderRadius: "4px",
      hover: {
        background: {
          light: "var(--color-neutral-gray500)",
          dark: "#2a4272",
        },
      },
      active: {
        background: {
          light: "var(--color-neutral-gray600)",
          dark: "#35528b",
        },
      },
    },
    tooltip: {
      background: {
        light: "var(--color-neutral-gray800)",
        dark: "var(--color-neutral-gray200)",
      },
      color: {
        light: "#ffffff",
        dark: "var(--color-neutral-gray900)",
      },
      borderRadius: "4px",
      padding: "8px 12px",
      fontSize: "12px",
      fontWeight: "400",
      maxWidth: "200px",
      boxShadow: {
        light: "0 2px 8px rgba(0, 0, 0, 0.15)",
        dark: "0 2px 8px rgba(0, 0, 0, 0.3)",
      },
    },
    switch: {
      width: "44px",
      height: "24px",
      borderRadius: "12px",
      background: {
        light: "var(--color-neutral-gray300)",
        dark: "rgba(255, 255, 255, 0.38)",
      },
      padding: "2px",
      transition: "all 0.2s ease-in-out",
      checked: {
        background: {
          light: "var(--color-brand-tradGreen)",
          dark: "var(--color-brand-freshGreen)",
        },
      },
      disabled: {
        background: {
          light: "var(--color-neutral-gray200)",
          dark: "rgba(255, 255, 255, 0.12)",
        },
        opacity: "0.6",
      },
    },
    switchThumb: {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: "#ffffff",
      boxShadow: {
        light: "0 2px 4px rgba(0, 0, 0, 0.2)",
        dark: "0 2px 4px rgba(0, 0, 0, 0.3)",
      },
      transform: "translateX(0px)",
      transition: "transform 0.2s ease-in-out",
      checked: {
        transform: "translateX(20px)",
      },
      disabled: {
        background: {
          light: "var(--color-neutral-gray400)",
          dark: "rgba(255, 255, 255, 0.38)",
        },
      },
    },
    color: {
      background: {
        primary: {
          light: "#ffffff",
          dark: "#121b2c",
        },
        secondary: {
          light: "#ffffff",
          dark: "#121b2c",
        },
        tertiary: {
          light: "var(--color-neutral-gray100)",
          dark: "#121b2c",
        },
        brand: {
          light: "var(--color-brand-tradGreen)",
          dark: "var(--color-brand-tradGreen)",
        },
      },
      text: {
        primary: {
          light: "var(--color-neutral-gray900)",
          dark: "rgba(255, 255, 255, 0.87)",
        },
        secondary: {
          light: "var(--color-neutral-gray600)",
          dark: "rgba(255, 255, 255, 0.6)",
        },
        disabled: {
          light: "var(--color-neutral-gray400)",
          dark: "rgba(255, 255, 255, 0.38)",
        },
        inverse: {
          light: "#ffffff",
          dark: "var(--color-neutral-gray900)",
        },
      },
      border: {
        primary: {
          light: "var(--color-neutral-gray300)",
          dark: "#1F3359",
        },
        secondary: {
          light: "var(--color-neutral-gray200)",
          dark: "#1F3359",
        },
        focus: {
          light: "var(--color-brand-freshGreen)",
          dark: "var(--color-brand-freshGreen)",
        },
      },
      surface: {
        raised: {
          light: "#ffffff",
          dark: "#121b2c",
        },
        overlay: {
          light: "rgba(0, 0, 0, 0.5)",
          dark: "rgba(0, 0, 0, 0.7)",
        },
        header: {
          light: "var(--color-brand-tradGreen)",
          dark: "var(--color-surface-header)",
        },
        body: {
          light: "var(--color-neutral-gray50)",
          dark: "var(--color-surface-body)",
        },
      },
      action: {
        hover: {
          light: "rgba(51, 85, 0, 0.04)",
          dark: "rgba(255, 255, 255, 0.08)",
        },
        selected: {
          light: "rgba(51, 85, 0, 0.08)",
          dark: "rgba(255, 255, 255, 0.12)",
        },
        disabled: {
          light: "rgba(0, 0, 0, 0.26)",
          dark: "rgba(255, 255, 255, 0.26)",
        },
        disabledBackground: {
          light: "rgba(0, 0, 0, 0.12)",
          dark: "rgba(255, 255, 255, 0.12)",
        },
      },
      brand: {
        primary: {
          light: "var(--color-brand-tradGreen)",
          dark: "var(--color-brand-freshGreen)",
        },
        primaryContrast: {
          light: "#ffffff",
          dark: "#000000",
        },
        secondary: {
          light: "var(--color-cool-jadeGreen100)",
          dark: "var(--color-cool-jadeGreen75)",
        },
        secondaryContrast: {
          light: "#ffffff",
          dark: "#ffffff",
        },
      },
      status: {
        success: {
          light: "var(--color-status-success500)",
          dark: "var(--color-status-success400)",
        },
        successBackground: {
          light: "var(--color-status-success50)",
          dark: "rgba(76, 175, 80, 0.1)",
        },
        warning: {
          light: "var(--color-status-warning500)",
          dark: "var(--color-status-warning400)",
        },
        warningBackground: {
          light: "var(--color-status-warning50)",
          dark: "rgba(255, 152, 0, 0.1)",
        },
        error: {
          light: "var(--color-status-error500)",
          dark: "var(--color-status-error400)",
        },
        errorBackground: {
          light: "var(--color-status-error50)",
          dark: "rgba(244, 67, 54, 0.1)",
        },
        info: {
          light: "var(--color-status-info500)",
          dark: "var(--color-status-info400)",
        },
        infoBackground: {
          light: "var(--color-status-info50)",
          dark: "rgba(3, 169, 244, 0.1)",
        },
      },
    },
    popover: {
      background: {
        light: "var(--ui-color-background-primary)",
        dark: "#0A111B",
      },
      borderColor: {
        light: "var(--shadow-lg)",
        dark: "#24324C",
      },
      borderRadius: "8px",
    },
  },

  // Scope-specific overrides for cascade demonstration
  modal: {
    input: {
      // Override padding in modal context
      padding: "12px",
      secondary: {
        // Modal-specific secondary input style
        borderColor: {
          light: "#000000",
          dark: "#ffffff",
        },
        on: {
          hover: {
            borderColor: {
              light: "#333333",
              dark: "#cccccc",
            },
          },
        },
      },
    },
    button: {
      // Override button border radius in modals
      borderRadius: "8px",
    },
  },

  card: {
    input: {
      // Card context has smaller inputs
      padding: "6px 8px",
      fontSize: "12px",
    },
  },
} as const;
