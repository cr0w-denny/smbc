# Token Context Migration Plan

## Executive Summary

This document outlines a comprehensive migration from component-specific tokens to context-based styling. The new approach reduces cognitive burden by distinguishing between **primitive components** (that get styled) and **layout/container components** (that provide styling contexts).

## Current State Analysis

### Token Structure Clarification

**CRITICAL UNDERSTANDING**:
- Contexts are **namespaces** (like `ui` is now)
- Tokens are **components** (like `input`, `button`, `track`, `thumb`)
- Properties are **styling attributes** (like `background`, `color`, `border`)

**Current Structure**:
```typescript
ui.input.background({ theme })    // namespace.token.property
ui.button.color({ theme })        // namespace.token.property
ui.thumb.shadow({ theme })        // namespace.token.property
```

**New Context Structure**:
```typescript
default.input.background({ theme })      // context.token.property
headerModal.input.background({ theme })  // context.token.property
drawer.button.color({ theme })           // context.token.property
```

**Context Naming Convention**:
Each context will have a **short name** used for computing composite context names:
- `AppHeader` → short name: `hd`
- `Modal` → short name: `modal`
- `Card` → short name: `card`
- `Drawer` → short name: `drawer`
- `Tooltip` → short name: `tip`

**Composite Context Examples**:
```typescript
// AppHeader > Modal > Card becomes:
hdModalCard.input.background({ theme })

// Drawer > Tooltip becomes:
drawerTip.button.color({ theme })

// AppHeader > Modal becomes:
hdModal.input.background({ theme })
```

### Primitive Tokens (Keep & Enhance)
These are the actual styled components that appear within various contexts:

#### ✅ `ui.input.*` → `context.input.*`
- **Justification**: Inputs appear in toolbars, cards, modals, forms, etc.
- **Context Examples**:
  - Toolbar: White background for visibility
  - Card: Subtle background to blend
  - Modal: High contrast for focus
- **Migration**: Same token structure, different context namespaces

#### ✅ `ui.button.*` → `context.button.*`
- **Justification**: Buttons appear everywhere and need context adaptation
- **Context Examples**:
  - Toolbar: Compact, minimal styling
  - Card: Standard sizing
  - Modal: Prominent action styling
- **Migration**: Same token structure, different context namespaces

#### ✅ `ui.chip.*`
- **Justification**: Small interactive elements that need context adaptation
- **Context Examples**:
  - Header: Minimal styling
  - Content: Standard styling
- **Migration**: Add context variants

#### ✅ `ui.track.*`, `ui.thumb.*` & `ui.fill.*` (New Primitive Patterns)
- **Justification**: Track-based components share common patterns but need semantic distinction
- **Track Pattern (Universal)**:
  - Used by: Switch, Scrollbar, Slider, Progress, Range Input
  - Properties: background, border-radius, width, height
- **Thumb Pattern (Interactive)**:
  - Used by: Switch, Scrollbar, Slider, Range Input
  - Properties: background, shadow, size, hover/focus states
- **Fill Pattern (Progress)**:
  - Used by: Progress bar, Loading bar, Battery indicator
  - Properties: background, transition, animation
- **Context Examples**:
  - Switch in header: minimal track styling, subtle thumb
  - Scrollbar in modal: high contrast track, elevated thumb
  - Progress in card: branded fill color
- **Migration**: Create `ui.track.*`, `ui.thumb.*`, and `ui.fill.*` primitives

#### ✅ `ui.tooltip.*`
- **Justification**: Overlays that need context-aware styling
- **Migration**: Enhance with context variants

### Container/Context Components (Deprecate)
These components ARE contexts, not styled content:

#### ❌ `ui.card.*`
- **Problem**: Cards are containers that provide context for other components
- **Migration Path**:
  - Move `ui.card.background` → CSS context `.card { --ui-surface-background: ... }`
  - Move `ui.card.borderColor` → CSS context `.card { --ui-border-color: ... }`
- **Timeline**: Phase 2

#### ❌ `ui.cardHeader.*`
- **Problem**: Card headers are layout elements, not styled components
- **Migration Path**: Convert to context-specific typography and surface tokens
- **Timeline**: Phase 2

#### ❌ `ui.modal.*`
- **Problem**: Modals are contexts that contain other components
- **Migration Path**:
  - Convert to CSS context `.modal { ... }`
  - Use portal data attributes for context inheritance
- **Timeline**: Phase 3

#### ❌ `ui.navigation.*`
- **Problem**: Navigation is a layout container
- **Migration Path**: Convert to `.app-header` context
- **Timeline**: Phase 2

#### ❌ `ui.popover.*`
- **Problem**: Popovers are contexts (via portals)
- **Migration Path**: Convert to data-attribute based context system
- **Timeline**: Phase 3

### Table Components (Special Case)
#### ⚠️ `ui.table.*`, `ui.tableHeader.*`, `ui.tableRow.*`
- **Analysis**: Tables are complex - they're both containers AND components
- **Decision**: Keep as hybrid - tables can contain inputs/buttons that need context styling
- **Migration**: Enhance with context awareness
- **Timeline**: Phase 4

### Color System (Restructure)
#### ⚠️ `ui.color.*`
- **Analysis**: Current structure mixes semantic and contextual colors
- **Migration Path**:
  - Keep semantic colors (brand, status, neutral)
  - Move contextual colors to CSS contexts
  - Simplify to primitive color tokens
- **Timeline**: Phase 1

### Component Contexts (New Approach)
#### ✅ Switch Context: `.switch { }`
- **Uses**: `ui.track.*` and `ui.thumb.*` primitives
- **Context-specific**: Track width, thumb size, animation timing

#### ✅ Scrollbar Context: `.scrollbar { }`
- **Uses**: `ui.track.*` and `ui.thumb.*` primitives
- **Context-specific**: Track visibility, thumb border radius

#### ✅ Slider Context: `.slider { }`
- **Uses**: `ui.track.*` and `ui.thumb.*` primitives
- **Context-specific**: Track height, thumb shadow

#### ✅ Progress Context: `.progress { }`
- **Uses**: `ui.track.*` and `ui.fill.*` primitives
- **Context-specific**: Track height, fill animation speed, completion styling

## Migration Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Establish context system and migrate color tokens

1. **Implement Context Detection System**
   - Create `useContextDetection()` hook
   - Add data-attribute tagging for portals
   - Update CSS selectors to support both class and data contexts

2. **Restructure Color System**
   - Simplify `ui.color` to semantic tokens only
   - Move contextual colors to CSS context rules
   - Create color token migration guide

3. **Enhance Primitive Components**
   - Expand `ui.input` with context variants
   - Expand `ui.button` with context variants
   - Add context support to existing components

### Phase 2: Container Migration (Weeks 3-4)
**Goal**: Migrate obvious container components

1. **Deprecate Card Tokens**
   - Create deprecation warnings for `ui.card.*`
   - Implement CSS context equivalents
   - Update documentation with migration examples

2. **Deprecate Navigation Tokens**
   - Move `ui.navigation.*` to `.app-header` context
   - Update all usage sites
   - Create compatibility layer

3. **Migration Tooling**
   - Create automated migration script
   - Add ESLint rules for deprecated tokens
   - Create migration validation tests

### Phase 3: Portal/Modal Migration (Weeks 5-6)
**Goal**: Handle complex portal-based components

1. **Portal Context System**
   - Implement data-attribute context inheritance
   - Update Modal, Popover, Tooltip components
   - Create portal context documentation

2. **Deprecate Modal/Popover Tokens**
   - Move to context-based styling
   - Implement backward compatibility
   - Update all usage sites

### Phase 4: Complex Components (Weeks 7-8)
**Goal**: Handle hybrid components like tables

1. **Table System Redesign**
   - Analyze table usage patterns
   - Implement hybrid approach (component + context)
   - Create table context documentation

2. **Final Cleanup**
   - Remove deprecated tokens
   - Update all documentation
   - Create final migration guide

## Context System Design

### CSS Context Selectors
```css
/* Primitive tokens */
:root {
  --ui-input-background: #ffffff;
  --ui-button-background: #primary;
  --ui-track-background: #f0f0f0;
  --ui-track-border-radius: 12px;
  --ui-thumb-background: #ffffff;
  --ui-thumb-shadow: 0 2px 4px rgba(0,0,0,0.1);
  --ui-fill-background: #007bff;
  --ui-fill-transition: width 0.3s ease;
}

/* Layout context overrides */
.app-header {
  --ui-input-background: rgba(255, 255, 255, 0.9);
  --ui-button-background: transparent;
}

.card {
  --ui-input-background: #f8f9fa;
  --ui-button-padding: 12px 16px;
}

.modal {
  --ui-input-border-color: #primary;
  --ui-button-background: #primary;
}

/* Component context overrides */
.switch {
  --ui-track-width: 44px;
  --ui-track-height: 24px;
  --ui-thumb-size: 20px;
  --ui-thumb-offset: 2px;
}

.scrollbar {
  --ui-track-background: transparent;
  --ui-track-width: 8px;
  --ui-thumb-border-radius: 4px;
  --ui-thumb-min-height: 20px;
}

.slider {
  --ui-track-height: 4px;
  --ui-thumb-size: 16px;
  --ui-thumb-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.progress {
  --ui-track-height: 8px;
  --ui-fill-background: var(--color-brand-primary);
  --ui-fill-transition: width 0.5s ease-out;
}

/* Portal contexts via data attributes */
[data-context="app-header"] {
  --ui-input-background: rgba(255, 255, 255, 0.9);
}

[data-context="card"] {
  --ui-input-background: #f8f9fa;
}
```

### Hook Usage
```typescript
// Component automatically detects and applies context
const MyModal = () => {
  const context = useContextDetection(); // Returns "modal"

  return (
    <Portal data-context={context}>
      <Input /> {/* Gets modal-specific styling */}
      <Button /> {/* Gets modal-specific styling */}
    </Portal>
  );
};
```

## Benefits

1. **Reduced Cognitive Load**: Developers think "how should this input look in a toolbar?" instead of managing card-specific input tokens
2. **Fewer Tokens**: ~60% reduction in token surface area
3. **Better Composability**: Any component works in any context automatically
4. **Clearer Mental Model**: Containers provide context, primitives get styled
5. **Portal Support**: Automatic context inheritance for modals/popovers
6. **Easier Maintenance**: One place to define how components look in each context

## Migration Tools

### ESLint Rules
```json
{
  "rules": {
    "design-system/no-deprecated-tokens": "error",
    "design-system/prefer-context-styling": "warn"
  }
}
```

### Migration Script
```bash
npm run migrate-tokens --component=card --dry-run
npm run migrate-tokens --component=card --apply
```

### Validation
```bash
npm run validate-token-migration
npm run test-context-inheritance
```

## Risk Mitigation

1. **Backward Compatibility**: Maintain deprecated tokens with warnings during transition
2. **Gradual Migration**: Phase-based approach allows testing at each step
3. **Automated Testing**: Validate visual consistency during migration
4. **Documentation**: Comprehensive guides for each migration phase
5. **Team Training**: Workshop sessions on new context mental model

## Success Metrics

- [ ] Token count reduced by 60%
- [ ] Portal context inheritance working 100%
- [ ] Zero deprecated token usage in codebase
- [ ] Developer satisfaction survey shows improved DX
- [ ] Performance: No regression in bundle size or runtime
- [ ] Visual consistency: All components render correctly in all contexts

## Timeline

**Total Duration**: 8 weeks
**Resources Required**: 1-2 developers
**Milestone Reviews**: End of each phase
**Final Review**: Week 8

## Complete Token & Context Reference

### Primitive Tokens (New System)

#### Input Primitives
```
ui.input.background
ui.input.borderColor
ui.input.borderWidth
ui.input.borderStyle
ui.input.padding
ui.input.color
ui.input.placeholder
ui.input.fontSize
ui.input.fontFamily
ui.input.borderRadius

ui.input.on.hover.background
ui.input.on.hover.borderColor
ui.input.on.focus.background
ui.input.on.focus.borderColor
ui.input.on.focus.ring.color
ui.input.on.focus.ring.width
ui.input.on.disabled.background
ui.input.on.disabled.borderColor
ui.input.on.disabled.color
ui.input.on.error.background
ui.input.on.error.borderColor
ui.input.on.error.color
```

#### Button Primitives
```
ui.button.background
ui.button.color
ui.button.borderColor
ui.button.borderWidth
ui.button.borderStyle
ui.button.borderRadius
ui.button.padding
ui.button.fontSize
ui.button.fontWeight
ui.button.fontFamily

ui.button.on.hover.background
ui.button.on.hover.color
ui.button.on.hover.borderColor
ui.button.on.active.background
ui.button.on.active.color
ui.button.on.active.transform
ui.button.on.disabled.background
ui.button.on.disabled.color
ui.button.on.disabled.opacity

ui.button.classes.secondary.background
ui.button.classes.secondary.color
ui.button.classes.secondary.borderColor
ui.button.classes.ghost.background
ui.button.classes.ghost.color
ui.button.classes.ghost.borderColor
```

#### Track Primitives (Universal)
```
ui.track.background
ui.track.borderColor
ui.track.borderWidth
ui.track.borderRadius
ui.track.width
ui.track.height
ui.track.opacity
```

#### Thumb Primitives (Interactive)
```
ui.thumb.background
ui.thumb.borderColor
ui.thumb.borderWidth
ui.thumb.borderRadius
ui.thumb.size
ui.thumb.shadow
ui.thumb.transition

ui.thumb.on.hover.background
ui.thumb.on.hover.shadow
ui.thumb.on.hover.transform
ui.thumb.on.active.background
ui.thumb.on.active.shadow
ui.thumb.on.disabled.background
ui.thumb.on.disabled.opacity
```

#### Fill Primitives (Progress)
```
ui.fill.background
ui.fill.borderRadius
ui.fill.transition
ui.fill.animation
ui.fill.opacity

ui.fill.on.complete.background
ui.fill.on.error.background
ui.fill.on.warning.background
```

#### Chip Primitives
```
ui.chip.background
ui.chip.color
ui.chip.borderColor
ui.chip.borderWidth
ui.chip.borderRadius
ui.chip.padding
ui.chip.fontSize
ui.chip.fontWeight

ui.chip.on.hover.background
ui.chip.on.active.background
ui.chip.on.disabled.background
ui.chip.on.disabled.color

ui.chip.classes.default.background
ui.chip.classes.default.color
ui.chip.classes.outlined.borderColor
ui.chip.classes.filled.background
```

#### Tooltip Primitives
```
ui.tooltip.background
ui.tooltip.color
ui.tooltip.borderRadius
ui.tooltip.padding
ui.tooltip.fontSize
ui.tooltip.fontFamily
ui.tooltip.boxShadow
ui.tooltip.maxWidth
ui.tooltip.zIndex
```

### Layout Contexts

#### Global Context (`:root`)
- Base values for all primitive tokens
- Default light/dark theme values
- Global CSS custom properties

#### App Context (`#app`)
```css
#app {
  /* Override primitives for main application area */
  --ui-input-background: ...;
  --ui-button-padding: ...;
}
```

#### App Header Context (`#app-header`)
```css
#app-header {
  /* Navigation/header specific overrides */
  --ui-input-background: rgba(255, 255, 255, 0.9);
  --ui-button-background: transparent;
  --ui-button-borderColor: transparent;
}
```

#### App Toolbar Context (`.AppShell-toolbar`)
```css
.AppShell-toolbar {
  /* Toolbar specific overrides */
  --ui-input-background: #f5f5f5;
  --ui-button-padding: 6px 12px;
  --ui-button-fontSize: 13px;
}
```

#### App Content Context (`#app-content`)
```css
#app-content {
  /* Main content area overrides */
  --ui-input-borderColor: #d1d5db;
  --ui-button-borderRadius: 6px;
}
```

#### Modal Context (`.modal`)
```css
.modal {
  /* Modal dialog overrides */
  --ui-input-borderColor: var(--color-brand-primary);
  --ui-button-background: var(--color-brand-primary);
  --ui-tooltip-zIndex: 9999;
}
```

#### Card Context (`.card`)
```css
.card {
  /* Card container overrides */
  --ui-input-background: #f8f9fa;
  --ui-button-padding: 8px 16px;
  --ui-track-background: #e9ecef;
}
```

### Component Contexts

#### Switch Context (`.switch`)
```css
.switch {
  /* Switch-specific track/thumb sizing */
  --ui-track-width: 44px;
  --ui-track-height: 24px;
  --ui-thumb-size: 20px;
  --ui-thumb-offset: 2px;
  --ui-thumb-transition: transform 0.2s ease;
}
```

#### Scrollbar Context (`.scrollbar`)
```css
.scrollbar {
  /* Scrollbar-specific track/thumb styling */
  --ui-track-background: transparent;
  --ui-track-width: 8px;
  --ui-thumb-borderRadius: 4px;
  --ui-thumb-minHeight: 20px;
  --ui-thumb-background: rgba(0, 0, 0, 0.2);
}
```

#### Slider Context (`.slider`)
```css
.slider {
  /* Slider-specific track/thumb styling */
  --ui-track-height: 4px;
  --ui-thumb-size: 16px;
  --ui-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  --ui-thumb-borderWidth: 2px;
}
```

#### Progress Context (`.progress`)
```css
.progress {
  /* Progress bar specific track/fill styling */
  --ui-track-height: 8px;
  --ui-fill-background: var(--color-brand-primary);
  --ui-fill-transition: width 0.5s ease-out;
  --ui-fill-borderRadius: inherit;
}
```

### Portal Context Inheritance

#### Data Attribute Contexts
For components rendered via React Portal (modals, popovers, tooltips):

```css
[data-context="app-header"] {
  /* Inherit header context for portaled content */
  --ui-input-background: rgba(255, 255, 255, 0.9);
  --ui-tooltip-background: rgba(0, 0, 0, 0.9);
}

[data-context="card"] {
  /* Inherit card context for portaled content */
  --ui-input-background: #f8f9fa;
  --ui-tooltip-background: #1a1a1a;
}

[data-context="modal"] {
  /* Modal-specific portal styling */
  --ui-input-borderColor: var(--color-brand-primary);
  --ui-button-background: var(--color-brand-primary);
}
```

### Token Count Comparison

#### Before (Current System)
- `ui.input.*`: ~15 tokens
- `ui.button.*`: ~25 tokens
- `ui.switch.*` + `ui.switchThumb.*`: ~12 tokens
- `ui.scrollbar.*` + `ui.scrollbarTrack.*` + `ui.scrollbarThumb.*`: ~15 tokens
- `ui.card.*`: ~8 tokens
- `ui.modal.*`: ~10 tokens
- `ui.navigation.*`: ~8 tokens
- `ui.tooltip.*`: ~8 tokens
- `ui.chip.*`: ~12 tokens
- **Total: ~113 tokens**

#### After (New System)
- `ui.input.*`: ~15 tokens (same, but context-aware)
- `ui.button.*`: ~20 tokens (streamlined)
- `ui.track.*`: ~7 tokens (universal)
- `ui.thumb.*`: ~10 tokens (universal)
- `ui.fill.*`: ~5 tokens (universal)
- `ui.chip.*`: ~12 tokens (context-aware)
- `ui.tooltip.*`: ~8 tokens (context-aware)
- **Total: ~77 tokens** (32% reduction)

#### Contexts
- Layout contexts: 6 (global, app, header, toolbar, content, modal, card)
- Component contexts: 4 (switch, scrollbar, slider, progress)
- Portal contexts: Via data attributes (unlimited scalability)

---

*This migration plan transforms our design system from component-centric to context-aware, significantly reducing complexity while improving flexibility and maintainability.*