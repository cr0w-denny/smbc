import { color } from './color.js';

export const ui = {
  color: {
    background: {
      primary: {
        light: "#ffffff",
        dark: "#121b2c"
      },
      secondary: {
        light: "#ffffff",
        dark: "#121b2c"
      },
      tertiary: {
        light: color.gray100,
        dark: "#121b2c"
      },
      brand: {
        light: color.brand.primary.tradGreen,
        dark: color.brand.primary.tradGreen
      }
    },
    text: {
      primary: {
        light: color.gray900,
        dark: "rgba(255, 255, 255, 0.87)"
      },
      secondary: {
        light: color.gray600,
        dark: "rgba(255, 255, 255, 0.6)"
      },
      disabled: {
        light: color.gray400,
        dark: "rgba(255, 255, 255, 0.38)"
      },
      inverse: {
        light: "#ffffff",
        dark: color.gray900
      }
    },
    border: {
      primary: {
        light: color.gray300,
        dark: "#1F3359"
      },
      secondary: {
        light: color.gray200,
        dark: "#1F3359"
      },
      focus: {
        light: color.brand.primary.freshGreen,
        dark: color.brand.primary.freshGreen
      }
    },
    surface: {
      raised: {
        light: "#ffffff",
        dark: "#121b2c"
      },
      overlay: {
        light: "rgba(0, 0, 0, 0.5)",
        dark: "rgba(0, 0, 0, 0.7)"
      },
      header: {
        light: color.brand.primary.tradGreen,
        dark: color.surface.header
      },
      body: {
        light: color.gray50,
        dark: color.surface.body
      }
    },
    action: {
      hover: {
        light: "rgba(51, 85, 0, 0.04)",
        dark: "rgba(255, 255, 255, 0.08)"
      },
      selected: {
        light: "rgba(51, 85, 0, 0.08)",
        dark: "rgba(255, 255, 255, 0.12)"
      },
      disabled: {
        light: "rgba(0, 0, 0, 0.26)",
        dark: "rgba(255, 255, 255, 0.26)"
      },
      disabledBackground: {
        light: "rgba(0, 0, 0, 0.12)",
        dark: "rgba(255, 255, 255, 0.12)"
      }
    },
    brand: {
      primary: {
        light: color.brand.primary.tradGreen,
        dark: color.brand.primary.freshGreen
      },
      primaryContrast: {
        light: "#ffffff",
        dark: "#000000"
      },
      secondary: {
        light: color.secondary.jadeGreen100,
        dark: color.secondary.jadeGreen75
      },
      secondaryContrast: {
        light: "#ffffff",
        dark: "#ffffff"
      }
    },
    status: {
      success: {
        light: color.status.success500,
        dark: color.status.success400
      },
      successBackground: {
        light: color.status.success50,
        dark: "rgba(76, 175, 80, 0.1)"
      },
      warning: {
        light: color.status.warning500,
        dark: color.status.warning400
      },
      warningBackground: {
        light: color.status.warning50,
        dark: "rgba(255, 152, 0, 0.1)"
      },
      error: {
        light: color.status.error500,
        dark: color.status.error400
      },
      errorBackground: {
        light: color.status.error50,
        dark: "rgba(244, 67, 54, 0.1)"
      },
      info: {
        light: color.status.info500,
        dark: color.status.info400
      },
      infoBackground: {
        light: color.status.info50,
        dark: "rgba(3, 169, 244, 0.1)"
      }
    },
    input: {
      background: {
        light: "#ffffff",
        dark: "#1D273A"
      },
      border: {
        light: color.gray300,
        dark: "#12244A"
      },
      label: {
        light: color.gray600,
        dark: "rgba(255, 255, 255, 0.6)"
      },
      value: {
        light: color.gray900,
        dark: "#E2E6EC"
      },
      hover: {
        light: color.gray50,
        dark: "#1D2427"
      },
      focus: {
        light: color.brand.primary.freshGreen,
        dark: "#73ABFB"
      },
      disabled: {
        light: color.gray100,
        dark: "rgba(255, 255, 255, 0.05)"
      },
      active: {
        light: color.gray500,
        dark: "#73ABFB"
      }
    },
    table: {
      header: {
        background: {
          light: color.gray100,
          dark: "#0E131D"
        },
        text: {
          light: color.gray700,
          dark: "rgba(255, 255, 255, 0.87)"
        }
      },
      row: {
        background: {
          light: "#ffffff",
          dark: "#121B2C"
        },
        backgroundAlt: {
          light: color.gray50,
          dark: "#121B2C"
        },
        hover: {
          light: color.gray100,
          dark: "rgba(255, 255, 255, 0.08)"
        },
        selected: {
          light: "#EDECEC",
          dark: "rgba(255, 255, 255, 0.12)"
        }
      },
      border: {
        light: color.gray200,
        dark: "#1F3359"
      }
    },
    chip: {
      default: {
        background: {
          light: color.gray200,
          dark: "rgba(255, 255, 255, 0.12)"
        },
        text: {
          light: color.gray800,
          dark: "rgba(255, 255, 255, 0.87)"
        }
      },
      primary: {
        background: {
          light: color.brand.primary.tradGreen,
          dark: color.brand.primary.freshGreen
        },
        text: {
          light: "#ffffff",
          dark: "#000000"
        }
      }
    },
    button: {
      primary: {
        background: {
          light: color.brand.primary.tradGreen,
          dark: color.brand.primary.freshGreen
        },
        text: {
          light: "#ffffff",
          dark: "#000000"
        },
        hover: {
          light: color.brand.primary.tradGreen,
          dark: color.brand.primary.tradGreen
        }
      },
      secondary: {
        background: {
          light: "transparent",
          dark: "transparent"
        },
        border: {
          light: color.gray300,
          dark: "rgba(255, 255, 255, 0.23)"
        },
        text: {
          light: color.gray700,
          dark: "rgba(255, 255, 255, 0.87)"
        },
        hover: {
          light: color.gray50,
          dark: "rgba(255, 255, 255, 0.08)"
        }
      }
    },
    navigation: {
      background: {
        light: "#141B1D",
        dark: "#0C121E"
      },
      text: {
        light: "#ffffff",
        dark: "rgba(255, 255, 255, 0.87)"
      },
      activeBackground: {
        light: "rgba(255, 255, 255, 0.15)",
        dark: "rgba(255, 255, 255, 0.08)"
      },
      hover: {
        light: "rgba(255, 255, 255, 0.08)",
        dark: "rgba(255, 255, 255, 0.04)"
      }
    },
    card: {
      background: {
        light: "#ffffff",
        dark: "#121B2C"
      },
      border: {
        light: color.gray200,
        dark: "#24324C"
      },
      borderRadius: {
        light: "16px",
        dark: "16px"
      },
      header: {
        text: {
          light: "#486C94",
          dark: "#98A4B9"
        },
        fontSize: {
          medium: "18px",
          large: "21px"
        },
        fontFamily: {
          light: "Roboto, sans-serif",
          dark: "Montserrat, sans-serif"
        },
        fontWeight: {
          light: "400",
          dark: "500"
        },
        padding: {
          medium: "24px",
          large: "24px"
        }
      }
    },
    scrollbar: {
      track: {
        light: color.gray100,
        dark: "#121b2c"
      },
      thumb: {
        light: color.gray400,
        dark: "#1F3359"
      },
      thumbHover: {
        light: color.gray500,
        dark: "#2a4272"
      },
      thumbActive: {
        light: color.gray600,
        dark: "#35528b"
      }
    }
  }
};