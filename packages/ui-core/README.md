# @smbc/design-tokens

Design token system for the SMBC Applets Platform.

## Overview

This package provides a centralized design token system for consistent styling across SMBC applications. Tokens are defined in JSON format and transformed using Style Dictionary into TypeScript/JavaScript exports.

## Installation

```bash
npm install @smbc/design-tokens
```

## Usage

### TypeScript/JavaScript

```typescript
import {
  colors,
  spacing,
  getSemanticColor,
  getSemanticShadow,
} from "@smbc/design-tokens";

// Base colors
const primaryColor = colors.primary[500]; // '#335500'
const secondaryColor = colors.secondary[500]; // '#e8ff5f'

// Semantic tokens (theme-aware)
const backgroundColor = getSemanticColor("background.primary", "light"); // '#fafafa'
const darkBackground = getSemanticColor("background.primary", "dark"); // '#121212'
const textColor = getSemanticColor("text.primary", "light"); // '#212121'

// Shadows
const lightShadow = getSemanticShadow("md", "light");
const darkShadow = getSemanticShadow("md", "dark");

// Spacing
const mediumSpacing = spacing[4]; // 16
```

### CSS Custom Properties

```css
/* Manual import of generated CSS */
@import "@smbc/design-tokens/src/tokens.css";

.my-component {
  background-color: var(--color-primary-500);
  padding: var(--size-spacing-4);
  border-radius: var(--size-border-radius-md);
}
```

## Available Tokens

### Colors

**Base Colors:**

- **Primary**: SMBC green (`#335500` base with variants)
- **Secondary**: Yellow-green accent (`#e8ff5f` base with variants)
- **Gray**: Neutral grayscale palette
- **Status**: Success, warning, error, info colors

**Semantic Colors (Theme-Aware):**

- **Background**: Primary, secondary, tertiary surfaces
- **Text**: Primary, secondary, disabled text colors
- **Border**: Primary, secondary, focus borders
- **Surface**: Raised surfaces and overlays
- **Action**: Hover, selected, disabled states
- **Brand**: Primary and secondary brand colors
- **Status**: Success, warning, error, info with backgrounds

### Other Tokens

- **Spacing**: Scale from 0 to 64 (4px increments)
- **Typography**: Font families, sizes, weights, line heights
- **Shadows**: Box shadow variants with light/dark mode support
- **Border Radius**: Corner radius values
- **Z-Index**: Layering system values
- **Breakpoints**: Responsive breakpoints

## Integration

### With MUI Components

```typescript
// Automatically used in @smbc/mui-components themes
import { lightTheme, darkTheme } from '@smbc/mui-components'

// Themes use design tokens internally
<ThemeProvider theme={lightTheme}>
  <App />
</ThemeProvider>
```

### In Custom Components

```typescript
import { getSemanticColor, getSemanticShadow } from "@smbc/design-tokens";

const MyComponent = styled.div`
  background-color: ${getSemanticColor("background.primary", "light")};
  box-shadow: ${getSemanticShadow("md", "light")};

  @media (prefers-color-scheme: dark) {
    background-color: ${getSemanticColor("background.primary", "dark")};
    box-shadow: ${getSemanticShadow("md", "dark")};
  }
`;
```

## Development

### Building Tokens

```bash
# Build TypeScript tokens
npm run build

# Generate tokens from JSON sources
npm run tokens:build
```

### File Structure

```
packages/design-tokens/
├── tokens/                 # Source JSON definitions
│   ├── color.json         # Color tokens
│   ├── size.json          # Spacing, border radius, etc.
│   ├── typography.json    # Font tokens
│   ├── shadow.json        # Shadow tokens
│   └── zIndex.json        # Layer tokens
├── src/                   # TypeScript source
│   ├── index.ts           # Main exports
│   ├── tokens.generated.ts # Generated from JSON
│   └── tokens.css         # Manual CSS variables
└── style-dictionary.config.js # Style Dictionary config
```

### Adding New Tokens

1. Add tokens to the appropriate JSON file in `tokens/`
2. Use Style Dictionary format:
   ```json
   {
     "tokenName": {
       "value": "#ff0000",
       "type": "color",
       "description": "Error color"
     }
   }
   ```
3. Run `npm run tokens:build` to regenerate TypeScript exports

## Theme Support

The design tokens support both light and dark themes through semantic color functions:

```typescript
// Light theme colors
const lightBg = getSemanticColor("background.primary", "light"); // '#fafafa'
const lightText = getSemanticColor("text.primary", "light"); // '#212121'

// Dark theme colors
const darkBg = getSemanticColor("background.primary", "dark"); // '#121212'
const darkText = getSemanticColor("text.primary", "dark"); // '#ffffff'
```

All semantic tokens automatically provide appropriate values for both light and dark modes.

## Integration with SMBC Platform

This package is used by:

- `@smbc/mui-components` - MUI theme system
- Custom applet components
- Any SMBC application needing consistent design tokens
