# Simplified CSS Variable Theme

This is a proof-of-concept for a simplified MUI theme architecture using CSS custom properties.

## Key Benefits

1. **Single Theme**: One theme works for both light and dark modes
2. **Dynamic Updates**: Token changes update instantly without theme recreation
3. **Simplified Architecture**: No separate light/dark theme files needed
4. **Performance**: CSS handles mode switching, not JavaScript

## Usage

### Basic Setup

```typescript
import { cssVarTheme } from './theme/simpler';
import './theme/simpler/tokens.css'; // Import the CSS variables

<ThemeProvider theme={cssVarTheme}>
  <App />
</ThemeProvider>
```

### Switching Modes

```typescript
import { setThemeMode } from './theme/simpler/utils';

// Enable dark mode
setThemeMode(true);

// Enable light mode
setThemeMode(false);
```

### Dynamic Token Updates

```typescript
import { applyTokenOverrides } from './theme/simpler/utils';

// Override tokens for current mode
applyTokenOverrides({
  'ui.input.base.default.background': '#ff0000',
  'ui.color.text.primary': '#00ff00'
});

// Override tokens for dark mode specifically
applyTokenOverrides({
  'ui.input.base.default.background': '#800000'
}, true);
```

### Integration with DevTools

```typescript
// In TokenEditor component:
const handleTokenChange = (path: string, value: string) => {
  const isDark = getThemeMode();
  applyTokenOverrides({ [path]: value }, isDark);
};
```

## Architecture Comparison

### Before (Current)
- `lightTheme.ts` - Creates theme with light tokens
- `darkTheme.ts` - Creates theme with dark tokens
- `palette.ts` - Duplicated logic for light/dark
- Theme recreation needed for token changes

### After (Simplified)
- `index.ts` - Single theme using CSS variables
- `tokens.css` - CSS variables for both modes
- `utils.ts` - Helpers for dynamic updates
- No theme recreation needed

## CSS Variables Structure

Variables follow the pattern: `--{namespace}-{category}-{subcategory}-{property}`

Examples:
- `--ui-input-base-default-background`
- `--ui-color-text-primary`
- `--ui-navigation-base-hover-background`

Dark mode overrides use the `[data-theme="dark"]` selector.