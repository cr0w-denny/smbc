// Auto-generated types from tokens.json
export interface TokenStructure {
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
  };
  color: {
    text: {
      primary: string;
      secondary: string;
    };
    action: {
      hover: string;
      selected: string;
    };
  };
}

// Type to convert object structure to callable proxy structure
type TokenProxy<T> = {
  [K in keyof T]: T[K] extends string
    ? () => string
    : TokenProxy<T[K]>
}

export type UITokens = TokenProxy<TokenStructure['ui']>;
export type ColorTokens = TokenProxy<TokenStructure['color']>;
