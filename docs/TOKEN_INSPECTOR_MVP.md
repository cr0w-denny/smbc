# Token Inspector MVP - Minimal Implementation

## Core Concept
Wrap all tokens from `@smbc/ui-core` with JavaScript Proxies to enable transparent interception and real-time modification without changing any existing code.

## MVP Features (Phase 1)

### 1. Token Proxy System
```javascript
// Transparent wrapper around ui-core tokens
import { ui, color, shadow } from '@smbc/ui-core';

const tokenOverrides = new Map();

const createTokenProxy = (obj, path = '') => {
  return new Proxy(obj, {
    get(target, prop) {
      const fullPath = path ? `${path}.${prop}` : prop;

      // Check for override first
      if (tokenOverrides.has(fullPath)) {
        return tokenOverrides.get(fullPath);
      }

      const value = target[prop];

      // Recursively proxy nested objects
      if (typeof value === 'object' && value !== null) {
        return createTokenProxy(value, fullPath);
      }

      return value;
    }
  });
};

// Export proxied tokens (drop-in replacement)
export const proxiedUi = createTokenProxy(ui, 'ui');
export const proxiedColor = createTokenProxy(color, 'color');
export const proxiedShadow = createTokenProxy(shadow, 'shadow');
```

### 2. Simple Token Editor UI
```
DevConsole → Token Editor Tab
├── Search/Filter Box
├── Token Tree (collapsible categories)
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Shadows
├── Value Editor (contextual based on type)
│   ├── Color Picker (for colors)
│   ├── Number Input (for spacing/sizes)
│   └── Text Input (for strings)
└── Export/Import Buttons
```

### 3. Real-time Update System
```javascript
const updateToken = (path, value) => {
  tokenOverrides.set(path, value);

  // Trigger React re-render
  // Option 1: Force theme recreation
  // Option 2: Use a global event emitter
  // Option 3: Context-based invalidation

  forceAppRerender();
};
```

### 4. Export/Import Functionality
```javascript
// Export current overrides as JSON
const exportTokens = () => {
  const overrides = Object.fromEntries(tokenOverrides);
  return JSON.stringify(overrides, null, 2);
};

// Import and apply token overrides
const importTokens = (jsonString) => {
  const overrides = JSON.parse(jsonString);
  Object.entries(overrides).forEach(([path, value]) => {
    tokenOverrides.set(path, value);
  });
  forceAppRerender();
};
```

## Integration Points (Minimal)

### 1. Token Import Update
```javascript
// In packages/mui-components/src/theme files
// Change from:
import { ui, color, shadow } from '@smbc/ui-core';

// To:
import { ui, color, shadow } from '@smbc/mui-applet-devtools/tokens';
// Which re-exports either proxied or original tokens based on dev mode
```

### 2. DevConsole Addition
```javascript
// Add to DevConsole tabs
<Tab label="Tokens" />
<TabPanel value="tokens">
  <TokenEditor />
</TabPanel>
```

## Benefits of This Approach

### Zero Intrusion
- **No changes** to component code
- **No changes** to theme generation logic
- **Single import change** in theme files
- **Works with existing** token usage patterns

### Transparent Operation
- When DevTools disabled → returns original tokens
- When DevTools enabled → returns proxied tokens
- Components don't know the difference

### Progressive Enhancement
- Start with value editing
- Add features without breaking existing code
- Can be completely removed in production builds

## Implementation Steps

1. **Create proxy wrapper** (~50 lines of code)
2. **Build simple tree UI** using existing TreeMenu component
3. **Add value editors** (color picker, number input)
4. **Wire up re-rendering** (likely through theme context)
5. **Add export/import** buttons

## What We're NOT Building (Yet)

- ❌ Pick-to-inspect tool
- ❌ Usage analytics
- ❌ Token relationships/dependencies
- ❌ Accessibility validation
- ❌ Component mapping
- ❌ Collaboration features

## Example Usage

```javascript
// Designer opens DevConsole
// Navigates to Token tab
// Expands: ui → color → brand → primary
// Changes 'dark' from #2E8B57 to #3A9B67
// Entire app updates instantly
// Clicks "Export"
// Shares JSON with team

// Developer imports JSON
// Tests changes
// Commits to ui-core if approved
```

## Technical Considerations

### Re-rendering Strategy
- **Option A**: Invalidate theme context (cleanest)
- **Option B**: Force root component update
- **Option C**: Use MobX/Zustand for reactive tokens

### Performance
- Proxy overhead is minimal
- Only active in development
- Can be tree-shaken in production

### Persistence
- Store overrides in localStorage
- Survive page refreshes during development
- Clear with "Reset" button

This MVP could be built in ~200 lines of code and would provide immediate value without disrupting any existing functionality. The proxy approach makes it completely transparent to the rest of the application!