# Component Style Isolation Plan
## Moving from Global MUI Theme Overrides to Self-Contained Components

**Goal**: Eliminate all global MUI theme.components overrides and make every component in `@smbc/mui-components` fully self-styled via inline styles, sx props, or internal component logic.

---

## Executive Summary

Currently, the MUI theme configuration in `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/theme/components.ts` contains extensive global overrides for MUI components (MuiButton, MuiCard, MuiTextField, etc.). These overrides create:
- **Implicit dependencies**: Components rely on global styles being present
- **Testing complexity**: Hard to test components in isolation
- **Maintenance burden**: Theme changes affect all components globally
- **Context coupling**: Components can't be used outside the theme context

The goal is to make the theme configuration nearly empty, with all styling internalized within the components themselves.

---

## Current State Analysis

### Global Theme Overrides (components.ts)

The theme currently overrides **26 MUI component types** with custom styles:

1. **MuiAppBar** - Navigation background, border, color
2. **MuiButton** - Gradient backgrounds, border radius, sizing, disabled states
3. **MuiCard** - Border radius, background, borders, shadows
4. **MuiChip** - Border radius, sizing, colors
5. **MuiDivider** - Border colors
6. **MuiDrawer** - Border colors
7. **MuiFormControl** - Date picker specific overrides
8. **MuiIconButton** - Border radius, padding, colors, hover states
9. **MuiInputBase** - Background, border radius, hover/focus states
10. **MuiInputLabel** - Colors, focus states
11. **MuiListItem** - Padding, hover states
12. **MuiListItemButton** - Border radius, margin, hover/selected states
13. **MuiMenuItem** - Selected/hover states
14. **MuiPaper** - Menu/popover specific, elevation shadows
15. **MuiPickersInputBase** - Date picker backgrounds
16. **MuiPickersOutlinedInput** - Date picker backgrounds
17. **MuiSelect** - Border radius, border colors, hover/focus states
18. **MuiSwitch** - Thumb/track colors, checked states
19. **MuiTab** - Colors, selected states
20. **MuiTable** - Root styles
21. **MuiTableCell** - Padding, font size, border colors, header styles
22. **MuiTableHead** - Background colors
23. **MuiTableRow** - Hover/selected backgrounds
24. **MuiTabs** - Background, indicator colors
25. **MuiTextField** - Border radius, sizing, borders, hover/focus states
26. **MuiTooltip** - Background, color, font size, border radius, shadow
27. **MuiToolbar** - Min height, background, color
28. **MuiTypography** - Text colors
29. **MuiCssBaseline** - Body background/color, scrollbar styles

**Critical Issue**: The file has TWO competing implementations:
- `createCssVarComponents()` function (lines 11-296)
- Main return object (lines 298-742)

This creates confusion about which styles are actually being applied.

---

## Component Inventory

### @smbc/mui-components Package Components

All custom components in the package:

| Component | File | Uses Global Theme? | MUI Components Used |
|-----------|------|-------------------|---------------------|
| **ActionMenu** | ActionMenu.tsx | ✅ YES | IconButton, Menu, MenuItem, ListItemIcon, Divider |
| **AgGridTheme** | ag-grid/AgGridTheme.tsx | ✅ YES | Box |
| **Card** | Card.tsx | ✅ YES | Card (MuiCard), CardContent, Box, Typography |
| **ChipToggleGroup** | ChipToggleGroup.tsx | ⚠️ PARTIAL | Chip, Box |
| **ConfirmationDialog** | ConfirmationDialog.tsx | ✅ YES | Dialog, DialogTitle, DialogContent, DialogActions, Button |
| **Console** | Console.tsx | ✅ YES | Box, Paper, Typography |
| **CustomSelect** | CustomSelect.tsx | ✅ YES | FormControl, InputLabel, Select, MenuItem |
| **DarkModeSwitch** | DarkModeSwitch.tsx | ✅ YES | Switch |
| **Divider** | Divider.tsx | ✅ YES | Divider (MuiDivider) |
| **EmptyState** | EmptyState.tsx | ✅ YES | Box, Typography |
| **Filter** | Filter/Filter.tsx | ✅ YES | Multiple form components |
| **FilterContainer** | Filter/FilterContainer.tsx | ✅ YES | Box, IconButton |
| **FilterField** | Filter/FilterField.tsx | ✅ YES | TextField, Select, Checkbox, DatePicker |
| **FilterFieldGroup** | Filter/FilterFieldGroup.tsx | ✅ YES | Box |
| **KeyValueTable** | KeyValueTable.tsx | ✅ YES | Table, TableBody, TableCell, TableRow |
| **LoadingTable** | LoadingTable.tsx | ✅ YES | Table, TableHead, TableBody, TableRow, TableCell, Skeleton |
| **Logo** | Logo.tsx | ❌ NO | None (pure SVG) |
| **RelatedNews** | RelatedNews.tsx | ✅ YES | Box, Card, Typography, LinearProgress |
| **SearchInput** | SearchInput.tsx | ✅ YES | TextField, InputAdornment, IconButton |
| **StatusChip** | StatusChip.tsx | ⚠️ SELF-STYLED | Chip (but heavily customized) |
| **TabBar** | TabBar.tsx | ⚠️ SELF-STYLED | Box, Typography (uses styled-components) |
| **Table** | Table.tsx | ✅ YES | Table, TableHead, TableBody, TableRow, TableCell |
| **TreeMenu** | TreeMenu.tsx | ✅ YES | List, ListItem, ListItemButton, ListItemText, Collapse |
| **UserMenu** | UserMenu.tsx | ✅ YES | Menu, MenuItem, Avatar, ListItemIcon |
| **Width** | Width.tsx | ❌ NO | Box (container only) |
| **AppShell.Layout** | AppShell/components/Layout.tsx | ❌ NO | None (div wrapper) |
| **AppShell.Page** | AppShell/components/Page.tsx | ✅ YES | Box |
| **AppShell.Toolbar** | AppShell/components/Toolbar.tsx | ✅ YES | Box |
| **AppShell.Content** | AppShell/components/Content.tsx | ✅ YES | Box |
| **AppShell.TopNav** | AppShell/components/TopNav.tsx | ✅ YES | AppBar, Toolbar, Box, Button, Menu |

**Legend**:
- ✅ YES: Relies heavily on global theme overrides
- ⚠️ PARTIAL: Uses some theme but has significant inline styles
- ⚠️ SELF-STYLED: Already mostly self-contained
- ❌ NO: No theme dependencies

---

## Usage Analysis: EWI Applets

### ewi-obligor

**Location**: `/Users/developer/ws-cr0w/zzz/applets/ewi-obligor/mui/src/`

**Components Used**:
- `@smbc/mui-components`: Card, Filter, RelatedNews, AppShell, Width, KeyValueTable, AgGridTheme, ChipToggleGroup
- Native MUI: Box, Typography

**Theme Dependencies**:
- **Card**: Relies on MuiCard global styles for border-radius, background, border
- **Filter**: Relies on MuiTextField, MuiSelect global styles
- **KeyValueTable**: Relies on MuiTable, MuiTableCell global styles
- **ChipToggleGroup**: Mostly self-styled but uses theme.palette.mode

### ewi-events

**Location**: `/Users/developer/ws-cr0w/zzz/applets/ewi-events/mui/src/`

**Components Used**:
- `@smbc/mui-components`: AgGridTheme, AppShell, Card, StatusChip, Width, ActionMenu, Filter
- Native MUI: Box, Typography, Button, useTheme

**Theme Dependencies**:
- **Button**: Relies on MuiButton global styles for gradient, border-radius, colors
- **Card**: Relies on MuiCard global styles
- **Filter**: Relies on MuiTextField, MuiSelect, date picker overrides
- **ActionMenu**: Relies on MuiMenu, MuiMenuItem, MuiIconButton global styles
- **StatusChip**: Already self-styled ✅

### ewi-event-details

**Location**: `/Users/developer/ws-cr0w/zzz/applets/ewi-event-details/mui/src/`

**Components Used**:
- `@smbc/mui-components`: Card, StatusChip, KeyValueTable, TabBar, AppShell, Width, ActionMenu
- Native MUI: Box, Button, IconButton, Link, Typography, Chip, LinearProgress, Tooltip, useTheme, useMediaQuery

**Theme Dependencies**:
- **Card**: Relies on MuiCard global styles
- **Button**: Relies on MuiButton global styles
- **IconButton**: Relies on MuiIconButton global styles
- **TabBar**: Already self-styled ✅
- **Chip** (native): Relies on MuiChip global styles
- **Tooltip**: Relies on MuiTooltip global styles

---

## Migration Strategy

### Phase 1: Foundation (High Priority)

**Goal**: Internalize styles for the most commonly used components

#### 1.1 Card Component
**Current Dependencies**:
```typescript
// Global theme override
MuiCard: {
  styleOverrides: {
    root: {
      borderRadius: "16px",
      backgroundColor: ui.card.background,
      border: `1px solid ${ui.card.borderColor}`,
      boxShadow: shadow.base,
    }
  }
}
```

**Action Items**:
- [ ] Move all Card-specific styles from theme/components.ts into Card.tsx
- [ ] Update Card.tsx sx prop to include all styling
- [ ] Remove hover transform (already present in Card.tsx)
- [ ] Test across all three ewi-* applets

**Before**:
```tsx
// Relies on global theme
<MuiCard elevation={1}>
  <CardContent>...</CardContent>
</MuiCard>
```

**After**:
```tsx
// Self-contained
<MuiCard
  elevation={elevation}
  sx={{
    borderRadius: "16px",
    backgroundColor: ui.card.background,
    border: `1px solid ${ui.card.borderColor}`,
    boxShadow: shadow.base,
    backgroundImage: "none !important",
    "&:hover": {
      boxShadow: elevation,
    },
    ...sx
  }}
>
  <CardContent>...</CardContent>
</MuiCard>
```

#### 1.2 Button Styles
**Current Dependencies**:
```typescript
// Global theme override with complex gradient and state management
MuiButton: {
  styleOverrides: {
    root: { /* gradient, sizing, states */ }
  }
}
```

**Action Items**:
- [ ] Create a styled Button component wrapper in mui-components
- [ ] Move all button styles (gradient, border-radius, sizing) into the wrapper
- [ ] Handle disabled state styling
- [ ] Export as default Button from mui-components
- [ ] Update all usages in ewi-* applets to use @smbc/mui-components Button

**Before**:
```tsx
import { Button } from "@mui/material";
// Relies on global MuiButton theme override
```

**After**:
```tsx
import { Button } from "@smbc/mui-components";
// Button component has internalized all styles
```

#### 1.3 TextField/Input Components
**Current Dependencies**:
```typescript
// Multiple overrides
MuiTextField, MuiInputBase, MuiInputLabel, MuiSelect, MuiFormControl
```

**Action Items**:
- [ ] Create TextField wrapper component in mui-components
- [ ] Create Select wrapper component in mui-components
- [ ] Move border-radius, colors, hover/focus states into components
- [ ] Handle date picker specific styling within components
- [ ] Update Filter component to use new wrappers
- [ ] Update all direct usages in ewi-* applets

### Phase 2: Tables and Data Display (High Priority)

#### 2.1 Table Components
**Current Dependencies**:
```typescript
MuiTable, MuiTableHead, MuiTableRow, MuiTableCell
```

**Action Items**:
- [ ] Enhance existing Table.tsx component with all theme styles
- [ ] Add hover/selected row state styling
- [ ] Add header background/color styling
- [ ] Remove global MuiTable* overrides
- [ ] Update KeyValueTable to be fully self-styled

#### 2.2 KeyValueTable
**Current Dependencies**: Inherits from MuiTable* overrides

**Action Items**:
- [ ] Internalize all table cell styling
- [ ] Add border colors directly
- [ ] Handle vertical alignment internally

### Phase 3: Navigation and Layout (Medium Priority)

#### 3.1 AppBar/Toolbar
**Current Dependencies**:
```typescript
MuiAppBar, MuiToolbar
```

**Action Items**:
- [ ] Move AppBar styles into AppShell.TopNav component
- [ ] Move Toolbar styles into AppShell.Toolbar component
- [ ] Handle navigation background/color/border internally
- [ ] Remove global overrides

#### 3.2 Menu Components
**Current Dependencies**:
```typescript
MuiMenu, MuiMenuItem, MuiPaper (for menus/popovers)
```

**Action Items**:
- [ ] Enhance ActionMenu with all menu-specific styling
- [ ] Add Paper override styles directly to Menu slotProps
- [ ] Update UserMenu similarly
- [ ] Handle menu item selected/hover states internally

### Phase 4: Form Controls (Medium Priority)

#### 4.1 Date Pickers
**Current Dependencies**:
```typescript
MuiFormControl, MuiPickersInputBase, MuiPickersOutlinedInput
```

**Action Items**:
- [ ] Create DatePicker wrapper component
- [ ] Internalize all picker-specific styling
- [ ] Update Filter component to use wrapper
- [ ] Remove global picker overrides

#### 4.2 Switch Component
**Current Dependencies**:
```typescript
MuiSwitch
```

**Action Items**:
- [ ] Enhance DarkModeSwitch or create generic Switch wrapper
- [ ] Internalize thumb/track colors and checked states
- [ ] Update all usages

### Phase 5: Misc Components (Low Priority)

#### 5.1 Small Components
**Components**: Divider, IconButton, Tooltip, Chip, ListItem, ListItemButton

**Action Items**:
- [ ] Create or enhance wrapper components for each
- [ ] Internalize all styling
- [ ] Update usages across codebase

#### 5.2 Typography
**Current Dependencies**:
```typescript
MuiTypography: { styleOverrides: { root: { color: ui.color.text.primary } } }
```

**Action Items**:
- [ ] Evaluate if Typography needs wrapper or if default is acceptable
- [ ] Consider providing a styled Typography export if needed
- [ ] May be able to rely on CSS baseline instead

---

## Component-by-Component Action Plan

### HIGH IMPACT - Do First

#### 1. Card Component ⭐⭐⭐
**Usage**: ewi-obligor (4×), ewi-events (2×), ewi-event-details (12×)

**Files to Modify**:
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Card.tsx`
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/theme/components.ts` (remove MuiCard)

**Specific Changes**:
```typescript
// Card.tsx - Add to sx prop
sx={{
  borderRadius: "16px",
  backgroundColor: ui.card.background,
  border: `1px solid ${ui.card.borderColor}`,
  boxShadow: shadow.base,
  backgroundImage: "none !important",
  "&:hover": {
    boxShadow: elevation,
    backgroundColor: ui.card.background,
    backgroundImage: "none !important",
    transform: "none",
  },
  transition: "none",
  ...sx,
}}
```

**Testing**: Verify all cards render correctly in all three applets

---

#### 2. Button Component ⭐⭐⭐
**Usage**: ewi-events (FilterBar, multiple), ewi-event-details (Applet, multiple)

**Files to Create/Modify**:
- Create `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Button.tsx`
- Modify `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/index.ts` (export Button)
- Remove MuiButton from theme/components.ts

**Implementation**:
```typescript
import { Button as MuiButton, ButtonProps } from "@mui/material";
import { ui, color, shadow } from "@smbc/ui-core";

export const Button: React.FC<ButtonProps> = ({ sx, variant = "contained", ...props }) => {
  const baseStyles = {
    background: ui.button.background,
    borderRadius: ui.button.borderRadius,
    padding: "6px 16px",
    fontSize: "0.875rem",
    fontWeight: 500,
    textTransform: "none",
    boxShadow: "none",
    "&:hover": {
      boxShadow: shadow.sm,
    },
    "&.Mui-disabled": {
      backgroundColor: "transparent !important",
      color: `${ui.color.text.disabled} !important`,
    },
  };

  const containedStyles = variant === "contained" ? {
    background: ui.button.background,
    border: "1px solid #2C88F3",
    color: "#ffffff",
    "&:hover": {
      background: ui.button.background,
      border: "1px solid #2472d9",
      boxShadow: shadow.md,
    },
    "&.Mui-disabled": {
      background: `${ui.color.action.disabled} !important`,
      color: `${ui.color.text.disabled} !important`,
    },
  } : {};

  return (
    <MuiButton
      variant={variant}
      sx={{
        ...baseStyles,
        ...containedStyles,
        ...sx,
      }}
      {...props}
    />
  );
};
```

**Testing**: Replace all Button imports in ewi-events and ewi-event-details

---

#### 3. TextField Component ⭐⭐⭐
**Usage**: Filter component (heavily used across all applets)

**Files to Create/Modify**:
- Create `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/TextField.tsx`
- Update Filter components to use new TextField
- Remove MuiTextField, MuiInputBase, MuiInputLabel from theme

**Implementation**:
```typescript
import { TextField as MuiTextField, TextFieldProps } from "@mui/material";
import { ui } from "@smbc/ui-core";

export const TextField: React.FC<TextFieldProps> = ({ sx, ...props }) => {
  return (
    <MuiTextField
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          fontSize: "0.875rem",
          backgroundColor: ui.input.background,
          "& fieldset": {
            borderColor: ui.input.borderColor,
          },
          "&:hover": {
            backgroundColor: ui.input.on.hover.background,
          },
          "&:hover fieldset": {
            borderColor: ui.input.on.hover.borderColor,
          },
          "&.Mui-focused fieldset": {
            borderColor: ui.input.on.focus.borderColor,
            borderWidth: 2,
          },
          "&.Mui-focused": {
            backgroundColor: ui.input.on.focus.background,
          },
        },
        "& .MuiInputBase-input": {
          padding: "9px 12px",
          color: ui.input.color,
          "&::placeholder": {
            color: ui.input.placeholder,
            opacity: 1,
            fontSize: "1rem",
          },
        },
        "& .MuiInputLabel-root": {
          color: ui.input.color,
          "&.Mui-focused": {
            color: `${ui.input.on.focus.borderColor} !important`,
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
};
```

---

#### 4. Select Component ⭐⭐⭐
**Usage**: Filter component, CustomSelect

**Files to Modify**:
- Create `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Select.tsx`
- Update CustomSelect.tsx to use new wrapper
- Update Filter components

**Similar implementation to TextField with Select-specific styles**

---

### MEDIUM IMPACT

#### 5. ActionMenu Component ⭐⭐
**Current State**: Already a wrapper but relies on theme for MenuItem, Menu styles

**Action Items**:
- Internalize Menu paper styles (background, border)
- Internalize MenuItem selected/hover colors
- Update slotProps.paper.sx in ActionMenu.tsx

---

#### 6. Table Components ⭐⭐
**Usage**: KeyValueTable (heavily used), LoadingTable, Table

**Action Items**:
- Add all table styles directly to Table.tsx
- Update KeyValueTable to use self-styled cells
- Handle header background/colors
- Handle row hover/selected states

---

#### 7. AppShell Components ⭐⭐
**Components**: TopNav, Toolbar, Content, Page

**Action Items**:
- Move MuiAppBar styles into TopNav
- Move toolbar background extension into Toolbar
- Ensure all AppShell components are self-styled

---

### LOW IMPACT

#### 8. IconButton Wrapper
**Usage**: Various places, especially ActionMenu

**Action Items**:
- Create wrapper with border-radius, padding, colors
- Or add to existing components that use IconButton

---

#### 9. Tooltip Wrapper
**Usage**: Limited usage in applets

**Action Items**:
- Create wrapper with background, color, styling
- Export from mui-components

---

#### 10. Other Small Components
- Divider (wrapper)
- Chip (wrapper - note native Chip used in ewi-event-details)
- ListItem/ListItemButton (wrappers)
- Switch (enhance DarkModeSwitch or create generic)

---

## Testing Strategy

### Unit Testing
For each component migration:
1. Test component renders with expected styles
2. Test hover states
3. Test disabled states
4. Test dark mode (if applicable)
5. Test without ThemeProvider to ensure no theme dependency

### Integration Testing
For each applet:
1. Visual regression testing (screenshot comparison)
2. Verify all interactive states (hover, focus, click)
3. Check responsiveness
4. Test dark mode toggle

### Test Checklist per Component
- [ ] Component renders without ThemeProvider
- [ ] All visual states match original (hover, focus, disabled)
- [ ] Dark mode works correctly
- [ ] No console warnings about missing theme
- [ ] Used in all three ewi-* applets renders identically

---

## Priority Ranking

### 🔴 Critical (Do First)
1. **Card** - Most heavily used component
2. **Button** - Core interaction element
3. **TextField** - Used in all filters
4. **Select** - Used in all filters

### 🟡 High Priority (Do Second)
5. **Table components** - Data display is critical
6. **ActionMenu** - Used throughout
7. **AppShell components** - Layout foundation

### 🟢 Medium Priority (Do Third)
8. **Date Pickers**
9. **IconButton**
10. **Menu/MenuItem**

### ⚪ Low Priority (Nice to Have)
11. **Tooltip**
12. **Divider**
13. **Chip** (native)
14. **ListItem/ListItemButton**
15. **Switch**
16. **Typography**

---

## Implementation Phases

### Week 1: Foundation
- [ ] Card component migration
- [ ] Button component migration
- [ ] Test in all ewi-* applets

### Week 2: Forms
- [ ] TextField wrapper
- [ ] Select wrapper
- [ ] Update Filter components
- [ ] Test filters across applets

### Week 3: Data Display
- [ ] Table component enhancement
- [ ] KeyValueTable self-styling
- [ ] ActionMenu enhancement
- [ ] Test data grids and tables

### Week 4: Layout & Polish
- [ ] AppShell components
- [ ] Date pickers
- [ ] Remaining small components
- [ ] Full integration testing

### Week 5: Cleanup
- [ ] Remove all global theme overrides
- [ ] Verify theme/components.ts is minimal
- [ ] Final testing across all applets
- [ ] Documentation updates

---

## Success Metrics

### Technical Goals
- [ ] theme/components.ts contains < 50 lines (currently ~743 lines)
- [ ] All components work without ThemeProvider
- [ ] Zero global MUI component overrides
- [ ] All tests pass without theme context

### Quality Goals
- [ ] Visual parity with current implementation
- [ ] No regression in functionality
- [ ] Improved component isolation
- [ ] Better testability

---

## Final Theme Configuration Goal

**Target State for components.ts**:
```typescript
export const createCssVarComponents = (theme: Theme) => {
  return {
    // Only CSS baseline for document-level defaults
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: ui.color.background.primary,
          color: ui.color.text.primary,
        },
      },
    },
  };
};
```

Everything else should be internalized in component files.

---

## Notes and Considerations

### Context-Aware Tokens
- The recent work on context-aware tokenization (see CONTEXT_AWARE_MUI_TOKENIZATION.md) should be integrated
- Components should use theme-aware tokens from ui-core
- Some components may need `useTheme()` to access dark mode state

### Backward Compatibility
- Maintain existing component APIs
- Don't break existing usage in applets
- Migration should be transparent to consumers

### Performance
- Inline styles may have slight performance impact vs theme overrides
- Use `styled()` API for static styles where appropriate
- Consider memoization for complex style calculations

### Documentation
- Update component documentation with styling details
- Create migration guide for other teams
- Document pattern for creating new self-styled components

---

## Appendix A: Complete Component Override List

**Current Global Overrides** (26 components):
1. MuiAppBar
2. MuiButton
3. MuiCard
4. MuiChip
5. MuiCssBaseline
6. MuiDivider
7. MuiDrawer
8. MuiFormControl
9. MuiIconButton
10. MuiInputBase
11. MuiInputLabel
12. MuiListItem
13. MuiListItemButton
14. MuiMenuItem
15. MuiPaper
16. MuiPickersInputBase
17. MuiPickersOutlinedInput
18. MuiSelect
19. MuiSwitch
20. MuiTab
21. MuiTable
22. MuiTableCell
23. MuiTableHead
24. MuiTableRow
25. MuiTabs
26. MuiTextField
27. MuiToolbar
28. MuiTooltip
29. MuiTypography

**Target**: Only MuiCssBaseline (for body-level defaults)

---

## Appendix B: File Locations Reference

### Theme Files
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/theme/components.ts` - Main theme overrides (TO BE MINIMIZED)
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/theme/index.ts` - Theme factory
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/theme/palette.ts` - Color palette
- `/Users/developer/ws-cr0w/zzz/packages/ui-core/src/tokens.ts` - Design tokens

### Component Files (to be modified)
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Card.tsx`
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/ActionMenu.tsx`
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Table.tsx`
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/KeyValueTable.tsx`
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/Filter/*`
- `/Users/developer/ws-cr0w/zzz/packages/mui-components/src/AppShell/components/*`

### Applet Usage
- `/Users/developer/ws-cr0w/zzz/applets/ewi-obligor/mui/src/`
- `/Users/developer/ws-cr0w/zzz/applets/ewi-events/mui/src/`
- `/Users/developer/ws-cr0w/zzz/applets/ewi-event-details/mui/src/`
