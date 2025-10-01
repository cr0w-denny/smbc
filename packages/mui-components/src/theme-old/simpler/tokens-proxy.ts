// Hypothetical proxy-based token system with sweet syntax

// Define the token data interface for type safety
interface TokenData {
  ui: {
    input: {
      base: {
        default: {
          background: string;
          borderColor: string;
          color: string;
          placeholder: string;
        };
        hover: {
          background: string;
          borderColor: string;
        };
        focus: {
          background: string;
          borderColor: string;
        };
      };
    };
    card: {
      base: {
        default: {
          background: string;
          borderColor: string;
        };
      };
    };
    navigation: {
      base: {
        default: {
          background: string;
          color: string;
        };
        hover: {
          background: string;
        };
      };
    };
    color: {
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
      action: {
        hover: string;
        selected: string;
        disabled: string;
        active: string;
      };
      border: {
        primary: string;
        secondary: string;
      };
      background: {
        primary: string;
        secondary: string;
      };
      surface: {
        body: string;
      };
      brand: {
        primary: string;
        primaryContrast: string;
        secondary: string;
        secondaryContrast: string;
      };
      status: {
        success: string;
        error: string;
        warning: string;
        info: string;
      };
    };
    chip: {
      default: {
        default: {
          background: string;
          color: string;
        };
      };
      primary: {
        default: {
          background: string;
          color: string;
        };
      };
    };
    tableHeader: {
      base: {
        default: {
          background: string;
          color: string;
        };
      };
    };
    tableRow: {
      base: {
        hover: {
          background: string;
        };
        selected: {
          background: string;
        };
        default: {
          borderColor: string;
        };
      };
    };
    tooltip: {
      background: string;
      color: string;
      shadow: string;
    };
    switch: {
      thumb: {
        background: string;
        shadow: string;
      };
      track: {
        background: string;
      };
    };
  };
}

// Mock the token structure (in reality this would come from ui-core)
const mockTokenData: TokenData = {
  ui: {
    input: {
      base: {
        default: {
          background: "#ffffff",
          borderColor: "#e0e0e0",
          color: "#212121",
          placeholder: "#757575",
        },
        hover: {
          background: "#f8f8f8",
          borderColor: "#bdbdbd",
        },
        focus: {
          background: "#f5f5f5",
          borderColor: "#2196f3",
        },
      },
    },
    card: {
      base: {
        default: {
          background: "#ffffff",
          borderColor: "#e0e0e0",
        },
      },
    },
    navigation: {
      base: {
        default: {
          background: "#ffffff",
          color: "#212121",
        },
        hover: {
          background: "#f5f5f5",
        },
      },
    },
    color: {
      text: {
        primary: "#212121",
        secondary: "#757575",
        disabled: "rgba(0, 0, 0, 0.26)",
      },
      action: {
        hover: "rgba(0, 0, 0, 0.04)",
        selected: "rgba(0, 0, 0, 0.08)",
        disabled: "rgba(0, 0, 0, 0.26)",
        active: "#1976d2",
      },
      border: {
        primary: "rgba(0, 0, 0, 0.12)",
        secondary: "rgba(0, 0, 0, 0.08)",
      },
      background: {
        primary: "#ffffff",
        secondary: "#fafafa",
      },
      surface: {
        body: "#ffffff",
      },
      brand: {
        primary: "#1976d2",
        primaryContrast: "#ffffff",
        secondary: "#dc004e",
        secondaryContrast: "#ffffff",
      },
      status: {
        success: "#2e7d32",
        error: "#d32f2f",
        warning: "#ed6c02",
        info: "#0288d1",
      },
    },
    chip: {
      default: {
        default: {
          background: "#e0e0e0",
          color: "#212121",
        },
      },
      primary: {
        default: {
          background: "#2196f3",
          color: "#ffffff",
        },
      },
    },
    tableHeader: {
      base: {
        default: {
          background: "#fafafa",
          color: "#212121",
        },
      },
    },
    tableRow: {
      base: {
        hover: {
          background: "#f5f5f5",
        },
        selected: {
          background: "#e3f2fd",
        },
        default: {
          borderColor: "rgba(0, 0, 0, 0.12)",
        },
      },
    },
    tooltip: {
      background: "#424242",
      color: "#ffffff",
      shadow: "0px 2px 8px rgba(0,0,0,0.15)",
    },
    switch: {
      thumb: {
        background: "#fafafa",
        shadow: "0 2px 4px 0 rgba(0,0,0,0.3)",
      },
      track: {
        background: "#9e9e9e",
      },
    },
  },
};

function createTokenProxy(data: any, path: string[] = []): any {
  return new Proxy(() => {}, {
    get(target, prop) {
      if (typeof prop === "string") {
        const newPath = [...path, prop];
        const value = getNestedValue(data, newPath);

        if (
          value !== undefined &&
          (typeof value === "string" || typeof value === "number")
        ) {
          // This is a leaf value, return a callable proxy with toString
          const leafProxy = new Proxy(() => {}, {
            apply(_target, _thisArg, args) {
              // Called as function = return actual value
              if (args.length === 0) {
                return value; // No args = base value
              }

              const [isDarkOrTheme] = args;

              // If boolean passed, use it as isDark flag
              if (typeof isDarkOrTheme === "boolean") {
                const isDark = isDarkOrTheme;
                // In a real implementation, this would resolve the token for the given mode
                // For mock purposes, return different values for dark mode
                if (isDark && newPath.includes("background")) {
                  return value === "#ffffff" ? "#1e1e1e" : value;
                }
                if (
                  isDark &&
                  newPath.includes("text") &&
                  newPath.includes("primary")
                ) {
                  return value === "#212121" ? "#ffffff" : value;
                }
                if (isDark && newPath.includes("borderColor")) {
                  return value === "#e0e0e0" ? "#424242" : value;
                }
                if (isDark && newPath.includes("placeholder")) {
                  return value === "#757575" ? "#b0b0b0" : value;
                }
                if (isDark && newPath.includes("disabled")) {
                  return value === "rgba(0, 0, 0, 0.26)"
                    ? "rgba(255, 255, 255, 0.3)"
                    : value;
                }
                return value;
              }

              // If theme object passed, extract mode and resolve
              if (
                isDarkOrTheme &&
                typeof isDarkOrTheme === "object" &&
                isDarkOrTheme.palette?.mode
              ) {
                const isDark = isDarkOrTheme.palette.mode === "dark";
                // Same logic as boolean param
                if (isDark && newPath.includes("background")) {
                  return value === "#ffffff" ? "#1e1e1e" : value;
                }
                if (
                  isDark &&
                  newPath.includes("text") &&
                  newPath.includes("primary")
                ) {
                  return value === "#212121" ? "#ffffff" : value;
                }
                if (isDark && newPath.includes("borderColor")) {
                  return value === "#e0e0e0" ? "#424242" : value;
                }
                if (isDark && newPath.includes("placeholder")) {
                  return value === "#757575" ? "#b0b0b0" : value;
                }
                if (isDark && newPath.includes("disabled")) {
                  return value === "rgba(0, 0, 0, 0.26)"
                    ? "rgba(255, 255, 255, 0.3)"
                    : value;
                }
                return value;
              }

              // Default fallback
              return value;
            },
          });

          // Add toString method that returns CSS variable
          leafProxy.toString = () => `var(--${newPath.join("-")})`;
          leafProxy.valueOf = () => `var(--${newPath.join("-")})`;

          return leafProxy;
        } else if (value !== undefined && typeof value === "object") {
          // This is an intermediate object, continue proxy chain
          return createTokenProxy(data, newPath);
        }

        // Property doesn't exist, but still return a proxy for potential future calls
        return createTokenProxy(data, newPath);
      }
      return target;
    },
  });
}

function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => current?.[key], obj);
}

// Enhanced type declarations for IDE autocomplete
// Intersection type that TypeScript treats as assignable to string
type TokenFunction = {
  (): string; // No args = CSS variable
  (isDark: boolean): string; // Boolean = resolve for mode
  (theme: any): string; // Theme object = extract mode and resolve
  toString(): string; // For implicit string conversion
  valueOf(): string; // For valueOf operations
} & string; // This makes TypeScript treat it as compatible with string!

type TokenProxy<T> = {
  [K in keyof T]: T[K] extends string ? TokenFunction : TokenProxy<T[K]>;
};

export type UITokens = TokenProxy<TokenData["ui"]>;

// Export the sweet syntax proxies with proper typing
export const ui: UITokens = createTokenProxy(mockTokenData.ui, [
  "ui",
]) as UITokens;
