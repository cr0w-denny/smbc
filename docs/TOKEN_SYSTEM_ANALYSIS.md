# Token System Analysis & Comprehensive Design System Proposal

## Current State Analysis

### What We Have Now
The current `@smbc/ui-core` token system provides basic tokens:
- `color.*` - Brand colors, semantic colors
- `ui.*` - Some basic UI colors
- `shadow.*` - Drop shadows
- `size.*` - Spacing, sizing
- `typography.*` - Font styles
- `breakpoints.*` - Responsive breakpoints

### The Problem
**Component state theming is nearly impossible** with the current flat token structure. For example, to theme an input field properly, we need:

- **Background colors**: default, hover, focus, disabled, error
- **Border colors**: default, hover, focus, disabled, error
- **Text colors**: default, placeholder, disabled, error
- **Border styles**: width, radius, style
- **Spacing**: padding, margins
- **Typography**: font size, weight, line height

Currently, there's no systematic way to define these component-state combinations.

## Proposed Comprehensive Token Architecture

### 1. Semantic UI Tokens

Instead of flat color tokens, organize by **component + state + property**:

```typescript
// Current problematic approach
ui.color.input.background // What state? What about borders?

// Proposed systematic approach
ui: {
  input: {
    default: {
      background: string,
      border: { color: string, width: string, style: string },
      text: string,
      placeholder: string,
    },
    hover: {
      background: string,
      border: { color: string, width: string, style: string },
      text: string,
    },
    focus: {
      background: string,
      border: { color: string, width: string, style: string },
      text: string,
      outline: { color: string, width: string, offset: string },
    },
    disabled: {
      background: string,
      border: { color: string, width: string, style: string },
      text: string,
      placeholder: string,
    },
    error: {
      background: string,
      border: { color: string, width: string, style: string },
      text: string,
      message: string,
    },
  },
  button: {
    primary: {
      default: { background: string, text: string, border?: string },
      hover: { background: string, text: string, border?: string },
      active: { background: string, text: string, border?: string },
      disabled: { background: string, text: string, border?: string },
      loading: { background: string, text: string, spinner: string },
    },
    secondary: { /* same states */ },
    ghost: { /* same states */ },
  },
  card: {
    default: {
      background: string,
      border: { color: string, width: string, radius: string },
      shadow: string,
    },
    hover: {
      background: string,
      border: { color: string, width: string, radius: string },
      shadow: string,
    },
    selected: { /* ... */ },
  }
}
```

### 2. Base Token Layer

Keep primitive tokens as the base:

```typescript
base: {
  color: {
    brand: {
      primary: { 50: string, 100: string, ..., 900: string },
      secondary: { 50: string, 100: string, ..., 900: string },
    },
    neutral: { 50: string, 100: string, ..., 900: string },
    semantic: {
      success: { 50: string, 100: string, ..., 900: string },
      warning: { 50: string, 100: string, ..., 900: string },
      error: { 50: string, 100: string, ..., 900: string },
      info: { 50: string, 100: string, ..., 900: string },
    }
  },
  spacing: { xs: string, sm: string, md: string, lg: string, xl: string },
  radius: { none: string, sm: string, md: string, lg: string, full: string },
  typography: {
    family: { sans: string, serif: string, mono: string },
    size: { xs: string, sm: string, md: string, lg: string, xl: string },
    weight: { light: number, normal: number, medium: number, bold: number },
    leading: { tight: string, normal: string, loose: string },
  },
  shadow: {
    sm: string, md: string, lg: string, xl: string,
    inner: string, none: string,
  },
  animation: {
    duration: { fast: string, normal: string, slow: string },
    easing: { linear: string, ease: string, easeIn: string, easeOut: string },
  }
}
```

### 3. Semantic Token Layer

Map base tokens to semantic meanings:

```typescript
semantic: {
  color: {
    background: {
      primary: base.color.neutral[50],
      secondary: base.color.neutral[100],
      tertiary: base.color.neutral[200],
      inverse: base.color.neutral[900],
    },
    text: {
      primary: base.color.neutral[900],
      secondary: base.color.neutral[600],
      tertiary: base.color.neutral[400],
      inverse: base.color.neutral[50],
      link: base.color.brand.primary[600],
    },
    border: {
      default: base.color.neutral[200],
      strong: base.color.neutral[300],
      subtle: base.color.neutral[100],
    }
  }
}
```

## Implementation Approaches

### Option A: Flat Structure with Naming Convention

Keep current flat structure but use systematic naming:

```typescript
// Pro: Familiar, easy to migrate
// Con: Very verbose, hard to maintain consistency

export const tokens = {
  'input-default-background': '#ffffff',
  'input-default-border-color': '#d1d5db',
  'input-default-border-width': '1px',
  'input-hover-background': '#f9fafb',
  'input-hover-border-color': '#9ca3af',
  'input-focus-background': '#ffffff',
  'input-focus-border-color': '#3b82f6',
  'input-focus-outline-color': '#93c5fd',
  'input-disabled-background': '#f3f4f6',
  'input-disabled-border-color': '#e5e7eb',
  'input-disabled-text': '#9ca3af',
  'input-error-border-color': '#ef4444',
  'input-error-text': '#dc2626',
  // ... hundreds more tokens
}
```

### Option B: Nested Object Structure with Theme Support

Organize tokens hierarchically with light/dark theme switching:

```typescript
// Pro: Organized, easier to understand relationships, theme switching built-in
// Con: Deeper nesting (but we already handle this with proxies!)

export const tokens = {
  ui: {
    input: {
      default: {
        background: {
          light: base.color.neutral[50],
          dark: base.color.neutral[800]
        },
        border: {
          color: {
            light: base.color.neutral[200],
            dark: base.color.neutral[600]
          },
          width: '1px',
          style: 'solid'
        },
        text: {
          light: base.color.text.primary.light,
          dark: base.color.text.primary.dark
        },
        placeholder: {
          light: base.color.text.tertiary.light,
          dark: base.color.text.tertiary.dark
        },
      },
      hover: {
        background: {
          light: base.color.neutral[100],
          dark: base.color.neutral[700]
        },
        border: {
          color: {
            light: base.color.neutral[300],
            dark: base.color.neutral[500]
          }
        }
      },
      focus: {
        background: {
          light: base.color.neutral[50],
          dark: base.color.neutral[800]
        },
        border: {
          color: {
            light: base.color.brand.primary[500],
            dark: base.color.brand.primary[400]
          }
        },
        ring: {
          color: {
            light: base.color.brand.primary[200],
            dark: base.color.brand.primary[800]
          }
        }
      }
    }
  }
}
```

### Option C: CSS Custom Properties with Semantic Classes

Generate CSS custom properties that components can reference:

```css
/* Generated automatically from token definitions */
:root {
  --input-default-bg: #ffffff;
  --input-default-border: #d1d5db;
  --input-hover-bg: #f9fafb;
  --input-hover-border: #9ca3af;
  --input-focus-bg: #ffffff;
  --input-focus-border: #3b82f6;
  --input-focus-ring: #93c5fd;
}

.input {
  background: var(--input-default-bg);
  border: 1px solid var(--input-default-border);
}

.input:hover {
  background: var(--input-hover-bg);
  border-color: var(--input-hover-border);
}

.input:focus {
  background: var(--input-focus-bg);
  border-color: var(--input-focus-border);
  outline: 2px solid var(--input-focus-ring);
}
```

### Option D: Function-Based Token System

~~Use functions to generate component tokens~~ **REJECTED**: This approach doesn't work with our existing proxy system and makes real-time token editing impossible since functions can't be proxied effectively.

## Components That Need Comprehensive Tokens

### High Priority
1. **Input/TextField** - background, border, text, placeholder, focus ring, error states
2. **Button** - primary, secondary, ghost variants with all interaction states
3. **Card** - background, border, shadow, hover states
4. **Navigation** - active, hover, focus states for nav items
5. **Table** - row backgrounds, borders, hover states, selection

### Medium Priority
6. **Modal/Dialog** - backdrop, container, borders
7. **Tabs** - active, inactive, hover states
8. **Breadcrumb** - separator, link states
9. **Badge/Chip** - various semantic colors and states
10. **Progress** - track, fill, text colors

### Lower Priority
11. **Dropdown/Select** - option hover, selected states
12. **Checkbox/Radio** - checked, unchecked, indeterminate, disabled
13. **Accordion** - expanded, collapsed, hover states
14. **Tooltip** - background, text, arrow colors
15. **Loading** - spinner colors, skeleton backgrounds

## Recommended Approach: Enhanced Nested Structure

### Why Option B + Theme-Aware Leaf Nodes?

1. **✅ Works with existing proxy system** - We already handle deep nesting perfectly
2. **✅ Consistent theme switching** - Every leaf node has `{ light: string, dark: string }`
3. **✅ Real-time editing support** - Proxy can intercept at any level
4. **✅ Type safety** - Full TypeScript support for deep structures
5. **✅ Logical organization** - `component.input.focus.border.color.dark`

### Theme Resolution Strategy

Components would access tokens through a theme-aware resolver:

```typescript
// In component code
const inputStyles = {
  backgroundColor: token(theme, tokens.ui.input.default.background),
  borderColor: token(theme, tokens.ui.input.default.border.color),
  '&:hover': {
    backgroundColor: token(theme, tokens.ui.input.hover.background),
    borderColor: token(theme, tokens.ui.input.hover.border.color),
  },
  '&:focus': {
    backgroundColor: token(theme, tokens.ui.input.focus.background),
    borderColor: token(theme, tokens.ui.input.focus.border.color),
    outlineColor: token(theme, tokens.ui.input.focus.ring.color),
  }
};

// token() function handles light/dark resolution
function token(theme: Theme, tokenValue: { light: string, dark: string }): string {
  return theme.palette.mode === 'dark' ? tokenValue.dark : tokenValue.light;
}
```

## Implementation Phases

### Phase 1: Foundation + Theme Structure
1. **Expand foundation tokens** with proper color scales and light/dark variants
2. **Update proxy system** to handle theme-aware leaf nodes
3. **Add theme resolution utility** (`token(theme, tokenValue)`)

### Phase 2: Component Token Architecture
1. **Start with 3 critical components** (Input, Button, Card)
2. **Define complete state coverage** (default, hover, focus, disabled, error)
3. **Ensure all leaf nodes are `{ light: string, dark: string }`**

### Phase 3: Token Editor Redesign

**New UX Approach**: Component-focused editor with theme toggle

```
┌─────────────────┬──────────────────────────────────────────────────────┐
│  Components     │  Input Properties                          [🌙 Dark] │
├─────────────────┼──────────────────────────────────────────────────────┤
│ > Input      ✓  │  Default State                                      │
│   Button        │    Background     [#ffffff] [color picker]          │
│   Card          │    Border Color   [#d1d5db] [color picker]          │
│   Navigation    │    Text Color     [#374151] [color picker]          │
│   Table         │    Placeholder    [#9ca3af] [color picker]          │
│                 │                                                     │
│                 │  Hover State                                        │
│                 │    Background     [#f9fafb] [color picker]          │
│                 │    Border Color   [#9ca3af] [color picker]          │
│                 │                                                     │
│                 │  Focus State                                        │
│                 │    Background     [#ffffff] [color picker]          │
│                 │    Border Color   [#3b82f6] [color picker]          │
│                 │    Ring Color     [#93c5fd] [color picker]          │
│                 │                                                     │
│                 │  Error State                                        │
│                 │    Border Color   [#ef4444] [color picker]          │
└─────────────────┴──────────────────────────────────────────────────────┘
```

**Key UX Improvements**:
1. **Left sidebar**: Component list (Input, Button, Card, etc.)
2. **Right panel**: Property grid for selected component
3. **Theme toggle**: Switch between light/dark mode editing
4. **Grouped by state**: Default, Hover, Focus, Disabled, Error
5. **Color pickers**: Direct color editing for each property
6. **Live preview**: Changes apply immediately to current theme

**Implementation Details**:
1. **Component detection**: Scan `ui.*` tokens to build component list
2. **State grouping**: Organize properties by interaction state
3. **Theme-aware editing**: Toggle switches between `.light` and `.dark` values
4. **Property types**: Auto-detect colors, spacing, typography, etc.
5. **Search/filter**: Quick find within selected component

### Phase 4: Rollout & Advanced Features
1. **Migrate existing components** one by one
2. **Add remaining component tokens** (navigation, table, modal, etc.)
3. **Advanced theme variants** (high contrast, colorblind-friendly)

### Phase 5: Developer Experience
1. **Auto-completion** for nested token paths
2. **Token documentation** generation
3. **Design-to-code** token mapping tools

## Key Design Decisions Made

✅ **Nested object structure** - We already have working proxies for this
✅ **Theme-aware leaf nodes** - Every color token ends with `{ light: string, dark: string }`
✅ **Component-based organization** - `ui.input.focus.border.color`
✅ **Incremental migration** - Start with 3 components, expand gradually

## Design Decisions Finalized

✅ **Migration Strategy**: Big bang redesign of Token Editor
✅ **Theme Toggle**: Global toggle - user views app in one mode at a time
✅ **Property Organization**: Group by state (Default, Hover, Focus, Disabled, Error)
✅ **Property Detection**: Auto-detect based on property names (simple pattern matching)

### Property Type Auto-Detection

```typescript
const detectPropertyType = (propertyName: string, value: any) => {
  const name = propertyName.toLowerCase();

  if (name.includes('color') || name.includes('text') || name.includes('background')) {
    return 'color';
  }
  if (name.includes('spacing') || name.includes('margin') || name.includes('padding')) {
    return 'spacing';
  }
  if (name.includes('size') || name.includes('width') || name.includes('height')) {
    return 'size';
  }
  if (name.includes('radius') || name.includes('border')) {
    return 'border';
  }
  if (name.includes('shadow')) {
    return 'shadow';
  }
  if (name.includes('font') || name.includes('weight') || name.includes('family')) {
    return 'typography';
  }

  // Fallback to string input
  return 'text';
};
```

## Remaining Questions

1. **Component Priority**: Which 3 components should we tackle first for the new token structure? (Input, Button, Card?)

## Implementation Roadmap

### Phase 1: Token Structure Foundation
1. **Expand base tokens** with light/dark variants
2. **Define first 3 components** (Input, Button, Card) with complete state coverage
3. **Update proxy system** to handle theme-aware leaf nodes

### Phase 2: Token Editor Redesign
1. **Big bang redesign** of existing Token Editor
2. **Component sidebar**: Auto-generated from `ui.*` structure
3. **Property grid**: State-grouped with auto-detected input types
4. **Global theme toggle**: Switch between light/dark editing mode
5. **Real-time preview**: Maintain existing auto-apply functionality

### Phase 3: Testing & Rollout
1. **Validate with real components** using new token structure
2. **Migrate existing components** to use new systematic tokens
3. **Documentation** and developer guides

### Phase 4: Scale & Polish
1. **Add remaining components** (Navigation, Table, Modal, etc.)
2. **Advanced features** (export/import, component token overrides)
3. **Performance optimization** and developer experience improvements

## Ready to Start

All major design decisions are locked in:
- ✅ Big bang Token Editor redesign
- ✅ Global theme toggle (matches app viewing mode)
- ✅ State-based property grouping
- ✅ Simple property name pattern matching for input types
- ✅ Component-centric UX (sidebar + property grid)

This systematic approach will enable proper component theming while maintaining the real-time editing experience!