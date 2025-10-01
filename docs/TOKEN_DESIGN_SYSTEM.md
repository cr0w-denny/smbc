# Token Design System Architecture

## Overview

Our design token system provides a powerful, context-aware approach to managing design properties across components. It combines the flexibility of CSS cascade with the organization of design tokens, featuring DevTools-style visualization for intuitive UX designer workflows.

## Core Concepts

### 1. **Scopes (Contexts)**
Scopes define where styles are applied, similar to CSS selectors:
- `ui` - Global application styles (default scope)
- `modal` - Styles within modal dialogs
- `appbar` - Styles within top navigation
- `sidebar` - Styles within side navigation
- `card` - Styles within card components

### 2. **Components**
Design components that receive styling:
- `input` - Text input fields
- `button` - Button elements
- `card` - Card containers
- `navigation` - Navigation elements

### 3. **Variants**
Style variations of a component:
- **Primary variant**: Default styles stored at component root
- **Named variants**: `secondary`, `outlined`, `contained`, etc.

### 4. **States**
Interactive states for components:
- `hover` - Mouse hover state
- `focus` - Keyboard focus state
- `disabled` - Disabled state
- `selected` - Selected state

## Token Structure

```typescript
// Example token structure
{
  // Modal scope (context-specific overrides)
  modal: {
    input: {
      padding: "12px",           // Override global input padding in modals
      secondary: {               // Secondary variant in modal context
        borderColor: "#000",
        hover: {
          borderColor: "#333"
        }
      }
    }
  },

  // Global UI scope
  ui: {
    input: {
      // Primary variant (component root)
      padding: "8px",            // Global default
      borderColor: "#ccc",
      borderRadius: "4px",

      // States for primary variant
      hover: {
        borderColor: "#999"
      },
      focus: {
        borderColor: "#007bff",
        boxShadow: "0 0 4px rgba(0,123,255,0.25)"
      },

      // Secondary variant
      secondary: {
        borderColor: "#666",
        backgroundColor: "#f5f5f5",
        hover: {
          borderColor: "#333"
        }
      }
    }
  }
}
```

## Cascade Resolution

The system resolves tokens using CSS-like specificity, checking in order:

1. **Scope.Component.Variant.State** - `modal.input.secondary.hover`
2. **Scope.Component.Variant** - `modal.input.secondary`
3. **Scope.Component.State** - `modal.input.hover`
4. **Scope.Component** - `modal.input`
5. **UI.Component.Variant.State** - `ui.input.secondary.hover`
6. **UI.Component.Variant** - `ui.input.secondary`
7. **UI.Component.State** - `ui.input.hover`
8. **UI.Component** - `ui.input` (fallback)

### Example Resolution:
```javascript
// Looking for: modal.input.secondary.hover.borderColor
modal.input.secondary.hover.borderColor  // ✓ Found: "#333"

// Looking for: modal.input.secondary.padding
modal.input.secondary.padding            // ✗ Not found
modal.input.padding                      // ✓ Found: "12px"

// Looking for: modal.input.focus.borderColor
modal.input.focus.borderColor            // ✗ Not found
modal.input.borderColor                  // ✗ Not found
ui.input.focus.borderColor               // ✓ Found: "#007bff"
```

## Token Editor Interface

### DevTools-Style Cascade View

The token editor presents properties in cascade order, similar to Chrome DevTools:

```
┌─ ui.input ─────────────────────────────────┐
│                                            │
│ ▼ Modal Context                            │
│ ├ padding: 12px                           │
│ └ secondary                                │
│   ├ borderColor: #000                     │
│   └ hover                                  │
│     └ borderColor: #333                   │
│                                            │
│ ▼ Secondary Variant                        │
│ ├ borderColor: #666                       │
│ ├ backgroundColor: #f5f5f5                │
│ └ hover                                    │
│   └ borderColor: #333        [struck]     │
│                                            │
│ ▼ Global Properties                        │
│ ├ padding: 8px               [struck]     │
│ ├ borderRadius: 4px                       │
│ ├ borderColor: #ccc          [struck]     │
│ └ hover                                    │
│   └ borderColor: #999        [struck]     │
│ └ focus                                    │
│   └ borderColor: #007bff                  │
│                                            │
│ [+ Add Property] [+ Add Variant]          │
└────────────────────────────────────────────┘
```

### Visual Indicators

- **Context sections** appear at top with colored left border
- **Struck-through properties** show what's being overridden
- **Override count** displays in section headers
- **+ Context dropdown** allows creating scope-specific overrides
- **Add widgets** enable extending token vocabulary

## Usage in Components

### Proxy-Based Access
```typescript
import { ui, modal } from '@smbc/ui-core';

// Automatic cascade resolution
const inputStyles = {
  padding: ui.input.padding,                    // "8px"
  borderColor: ui.input.hover.borderColor,     // "#999"
  borderRadius: ui.input.secondary.borderRadius // Falls back to ui.input.borderRadius
};

// Context-specific access
const modalInputStyles = {
  padding: modal.input.padding,                 // "12px" (overridden)
  borderColor: modal.input.secondary.borderColor // "#000" (context-specific)
};
```

### CSS Variable Generation
```css
/* Global styles */
:root {
  --ui-input-padding: 8px;
  --ui-input-borderColor: #ccc;
  --ui-input-hover-borderColor: #999;
}

/* Context-specific overrides */
.MuiModal-root {
  --ui-input-padding: 12px !important;
  --ui-input-secondary-borderColor: #000 !important;
}
```

## UX Designer Workflow

1. **Browse Components**: Select component from sidebar (input, button, etc.)
2. **View Cascade**: See all active styles in DevTools-style hierarchy
3. **Create Overrides**: Use + Context dropdown to add scope-specific styles
4. **Add Properties**: Extend component vocabulary with + Add Property
5. **Manage Variants**: Create and modify component variants inline
6. **Export/Import**: Share token configurations between environments

## Developer Workflow

1. **Use Proxy Objects**: Access tokens via `ui.component.property` syntax
2. **Leverage Cascade**: Automatic fallback to less specific tokens
3. **Context Awareness**: Different scopes automatically resolve appropriate values
4. **Type Safety**: Full TypeScript support with auto-completion
5. **CSS Integration**: Automatic CSS variable generation for runtime theming

## Benefits

- **Intuitive Hierarchy**: Familiar CSS cascade mental model
- **Context Awareness**: Scope-specific styling without planning variants upfront
- **Visual Clarity**: DevTools-style interface shows override relationships
- **Flexible Vocabulary**: UX designers can extend token properties dynamically
- **Developer Friendly**: Proxy-based access with automatic resolution
- **Type Safe**: Full TypeScript support with intelligent auto-completion
- **Runtime Theming**: CSS variables enable dynamic theme switching

## Migration Notes

### From Previous System
- `base.default` structure eliminated - use component root for primary variant
- Context tabs replaced with cascade sections
- Global overrides now use scope prefixes instead of complex key structures

### Breaking Changes
- Token paths simplified: `ui.input.borderColor` instead of `ui.input.base.default.borderColor`
- Context system changed from `"context:path"` keys to scope-based hierarchy
- Variant tabs removed in favor of DevTools-style cascade view