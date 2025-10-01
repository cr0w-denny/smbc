// Import the token structure from generated tokens
import type { tokens } from "./tokens.js";

// Token function type that matches proxy.ts TokenFunction
type TokenFunction = {
  (): string;                    // No args = CSS variable
  (isDark: boolean): string;     // Boolean = resolve for mode
  (theme: any): string;          // Theme object = extract mode and resolve
  toString(): string;            // For implicit string conversion
  valueOf(): string;             // For valueOf operations
} & string;

// Type to convert object structure to callable proxy structure with string intersection
type TokenProxy<T> = {
  [K in keyof T]: T[K] extends string | number
    ? TokenFunction  // Function that can be called with args AND acts like a string
    : T[K] extends { light: any; dark: any }
    ? TokenFunction  // Light/dark objects also become callable strings
    : TokenProxy<T[K]>
}

// Export types for all top-level token nodes
export type UITokens = TokenProxy<typeof tokens.ui>;
export type ColorTokens = TokenProxy<typeof tokens.color>;
export type ShadowTokens = TokenProxy<typeof tokens.shadow>;
export type ZIndexTokens = TokenProxy<typeof tokens.zIndex>;
export type TypographyTokens = TokenProxy<typeof tokens.typography>;
export type BreakpointsTokens = TokenProxy<typeof tokens.breakpoints>;
export type SizeTokens = TokenProxy<typeof tokens.size>;
export type LayoutTokens = TokenProxy<typeof tokens.layout>;