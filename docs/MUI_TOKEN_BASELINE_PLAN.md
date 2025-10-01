# MUI Theme Token Baseline Plan

## Overview
This document outlines a comprehensive set of baseline tokens that would enable the token editor to modify most MUI components out of the box. The tokens follow our established `ui.$component.$variant.$state.{...props}.light/dark` schema.

## Priority Levels
- **P0 (Critical)**: Essential components used in almost every app
- **P1 (High)**: Common components that significantly impact user experience
- **P2 (Medium)**: Useful components for enhanced functionality
- **P3 (Low)**: Specialized components for specific use cases

## Token Structure Template
```
ui.$component.$variant.$state: {
  background: { light: string, dark: string },
  color: { light: string, dark: string },
  borderColor: { light: string, dark: string },
  // Additional properties as needed
}
```

## P0 Components (Critical - Implement First)

### Button
**Rationale**: Core interaction element, most frequently customized
```
ui.button.primary.default/hover/active/disabled/focus
ui.button.secondary.default/hover/active/disabled/focus
ui.button.outlined.default/hover/active/disabled/focus
ui.button.text.default/hover/active/disabled/focus
ui.button.contained.default/hover/active/disabled/focus
```
**Properties**: `background`, `color`, `borderColor`, `boxShadow`

### Input/TextField
**Rationale**: Essential for forms, complex styling requirements
```
ui.input.outlined.default/hover/focus/disabled/error
ui.input.filled.default/hover/focus/disabled/error
ui.input.standard.default/hover/focus/disabled/error
```
**Properties**: `background`, `color`, `borderColor`, `labelColor`, `helperTextColor`

### Paper/Card
**Rationale**: Foundation for layouts and content containers
```
ui.paper.elevated.default/hover
ui.paper.outlined.default/hover
ui.paper.flat.default/hover
```
**Properties**: `background`, `borderColor`, `boxShadow`

### Typography
**Rationale**: Text styling affects entire application
```
ui.typography.h1/h2/h3/h4/h5/h6.default
ui.typography.body1/body2.default
ui.typography.caption/overline.default
```
**Properties**: `color`, `fontWeight`, `fontSize`, `lineHeight`

## P1 Components (High Priority)

### AppBar/Toolbar
**Rationale**: Primary navigation, highly visible
```
ui.appbar.primary.default
ui.appbar.secondary.default
ui.appbar.transparent.default
```
**Properties**: `background`, `color`, `boxShadow`

### Chip
**Rationale**: Common for tags, filters, status indicators
```
ui.chip.filled.default/hover/active/disabled
ui.chip.outlined.default/hover/active/disabled
ui.chip.deletable.default/hover/active
```
**Properties**: `background`, `color`, `borderColor`, `deleteIconColor`

### List/ListItem
**Rationale**: Navigation menus, data display
```
ui.listitem.default.default/hover/selected/disabled
ui.listitem.dense.default/hover/selected/disabled
```
**Properties**: `background`, `color`, `dividerColor`

### Dialog/Modal
**Rationale**: Critical for user interactions
```
ui.dialog.default.default
ui.dialog.fullscreen.default
```
**Properties**: `background`, `overlayColor`, `borderColor`

### Alert
**Rationale**: User feedback, error states
```
ui.alert.success.default
ui.alert.warning.default
ui.alert.error.default
ui.alert.info.default
```
**Properties**: `background`, `color`, `borderColor`, `iconColor`

### Checkbox/Radio
**Rationale**: Form controls, selection states
```
ui.checkbox.default.default/hover/checked/disabled
ui.radio.default.default/hover/checked/disabled
```
**Properties**: `background`, `borderColor`, `checkColor`

## P2 Components (Medium Priority)

### Tabs
**Rationale**: Content organization
```
ui.tabs.default.default/hover/selected/disabled
ui.tabs.scrollable.default/hover/selected/disabled
```
**Properties**: `background`, `color`, `indicatorColor`, `borderColor`

### Menu/MenuItem
**Rationale**: Contextual actions
```
ui.menuitem.default.default/hover/selected/disabled
```
**Properties**: `background`, `color`, `dividerColor`

### Switch
**Rationale**: Toggle controls
```
ui.switch.default.default/hover/checked/disabled
```
**Properties**: `trackColor`, `thumbColor`, `borderColor`

### Select
**Rationale**: Dropdown selection
```
ui.select.outlined.default/hover/focus/disabled/error
ui.select.filled.default/hover/focus/disabled/error
```
**Properties**: `background`, `color`, `borderColor`, `arrowColor`

### Accordion
**Rationale**: Content organization
```
ui.accordion.default.default/hover/expanded/disabled
```
**Properties**: `background`, `color`, `borderColor`, `iconColor`

### Breadcrumbs
**Rationale**: Navigation aid
```
ui.breadcrumbs.default.default/hover/current
```
**Properties**: `color`, `separatorColor`

## P3 Components (Lower Priority)

### Stepper
```
ui.stepper.horizontal.default/active/completed/disabled
ui.stepper.vertical.default/active/completed/disabled
```

### Rating
```
ui.rating.default.default/hover/filled/empty
```

### Slider
```
ui.slider.default.default/hover/active/disabled
```

### Badge
```
ui.badge.default.default
ui.badge.dot.default
```

### Avatar
```
ui.avatar.default.default
ui.avatar.colorful.default
```

### Fab (Floating Action Button)
```
ui.fab.primary.default/hover/active/disabled
ui.fab.secondary.default/hover/active/disabled
```

## Cross-Component System Tokens

### Status Colors
```
ui.status.success/warning/error/info.background/color/borderColor
```

### Action States
```
ui.action.hover/selected/disabled/focus.background/color
```

### Border System
```
ui.border.primary/secondary/disabled.color/width/radius
```

### Shadow System
```
ui.shadow.sm/md/lg/xl.value
```

## Implementation Strategy

### Phase 1: Foundation (P0)
1. Implement Button, Input, Paper, Typography tokens
2. Create token generation utilities
3. Test integration with MUI theme system
4. Validate token editor functionality

### Phase 2: Core UI (P1)
1. Add AppBar, Chip, List, Dialog, Alert tokens
2. Implement form control tokens (Checkbox, Radio)
3. Test comprehensive theme switching

### Phase 3: Enhanced UI (P2)
1. Add Tabs, Menu, Switch, Select tokens
2. Implement navigation components
3. Test complex interaction patterns

### Phase 4: Specialized (P3)
1. Add remaining specialized components
2. Optimize token structure based on usage patterns
3. Final validation and documentation

## Token Editor Integration

### Component Discovery
- Automatically detect available components from token structure
- Group components by category (Forms, Navigation, Feedback, etc.)
- Show component hierarchy in expandable tree

### Variant Management
- Auto-populate variant dropdown based on available tokens
- Show variant preview in component selector
- Support custom variant addition

### State Visualization
- Color-coded state indicators (default, hover, active, etc.)
- Live preview of state changes
- Batch state editing capabilities

### Export Capabilities
- Generate MUI theme object from token overrides
- Export CSS custom properties
- Generate TypeScript theme interfaces

## Benefits of This Approach

1. **Comprehensive Coverage**: Covers 80%+ of common MUI usage patterns
2. **Consistent Schema**: All tokens follow the same structure for predictability
3. **Incremental Implementation**: Can be built and released in phases
4. **Extensible**: Easy to add new components following established patterns
5. **Type Safe**: TypeScript support for all token paths
6. **Theme Integration**: Direct mapping to MUI theme structure

## Next Steps

1. Review and approve this token structure
2. Create token generation scripts for Phase 1 components
3. Update token editor to handle new component discovery
4. Implement Phase 1 tokens and test integration
5. Gather feedback and iterate on the approach

## Success Metrics

- **Coverage**: Percentage of MUI components themeable through token editor
- **Usage**: Adoption rate of token editor for theme customization
- **Efficiency**: Time reduction in theme development vs manual MUI theme creation
- **Flexibility**: Number of successful custom themes created using the system