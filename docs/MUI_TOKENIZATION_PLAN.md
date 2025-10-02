# MUI Theme Tokenization Plan for EWI Applets

## Overview
This document outlines a comprehensive plan to tokenize all MUI components used across the EWI (Early Warning Indicators) applets, making them fully customizable through the token editor. The plan prioritizes smaller, foundational components and builds out to complete application themes.

## Scope Analysis

### EWI Applets Covered
- `ewi-events` - Main events dashboard with data grid
- `ewi-event-details` - Event detail views with tabs and forms
- `ewi-obligor` - Obligor management interface

### Components Excluded (As Requested)
- Workflow status cards
- Events dashboard AG Grid detail rows
- TipTap editor components

## Component Inventory

### Core MUI Components Used
Based on analysis of the ewi-* applets, the following MUI components are actively used:

#### **Foundation Level (Smallest/Simplest)**
1. **Icons** - `@mui/icons-material`
   - Used extensively across all applets
   - Components: 25+ different icons
   - Effort: **Low** (color/size tokens only)

2. **Typography** - `@mui/material/Typography`
   - Found in: All applets
   - Variants: body1, body2, h6, caption
   - Effort: **Low** (font, size, color, spacing tokens)

3. **Box** - `@mui/material/Box`
   - Most fundamental layout component
   - Found in: All applets extensively
   - Effort: **Low** (spacing, background tokens)

#### **Basic Interactive Level**
4. **IconButton** - `@mui/material/IconButton`
   - Found in: All applets
   - Usage: Menu triggers, actions
   - Effort: **Low-Medium** (color, size, hover states)

5. **Button** - `@mui/material/Button`
   - Found in: All applets
   - Variants: contained, outlined, text
   - Effort: **Medium** (colors, typography, spacing, states)

6. **Chip** - `@mui/material/Chip`
   - Found in: ewi-event-details (status chips)
   - Effort: **Medium** (background, text, border tokens)

7. **LinearProgress** - `@mui/material/LinearProgress`
   - Found in: ewi-event-details
   - Effort: **Medium** (color, height tokens)

8. **Link** - `@mui/material/Link`
   - Found in: ewi-event-details (AttachmentsCard)
   - Effort: **Low** (color, decoration tokens)

#### **Navigation & Structure Level**
9. **Menu/MenuItem** - `@mui/material`
   - Found in: All applets extensively
   - Usage: Context menus, dropdowns
   - Effort: **Medium** (background, text, hover, elevation)

10. **ListItemIcon/ListItemText** - `@mui/material`
    - Found in: ewi-event-details
    - Effort: **Medium** (spacing, color tokens)

11. **Popover** - `@mui/material/Popover`
    - Found in: ewi-events (FilterBar)
    - Effort: **Medium** (elevation, background tokens)

12. **MenuList** - `@mui/material/MenuList`
    - Found in: ewi-events (FilterBar)
    - Effort: **Medium** (padding, background tokens)

#### **Theme & Utility Level**
13. **useTheme** - `@mui/material/styles`
    - Found in: Multiple applets
    - Usage: Accessing theme values
    - Effort: **High** (Core theme structure tokens)

14. **useMediaQuery** - `@mui/material`
    - Found in: ewi-event-details
    - Usage: Responsive breakpoints
    - Effort: **Medium** (breakpoint tokens)

15. **ThemeProvider** - `@mui/material/styles`
    - Found in: mui-ewi app
    - Effort: **High** (Complete theme structure)

16. **CssBaseline** - `@mui/material`
    - Found in: mui-ewi app
    - Effort: **Medium** (Global CSS resets)

### Custom @smbc/mui-components Used
These are custom components that may need token integration:

- **AppShell** - Main layout wrapper
- **TabBar** - Navigation tabs
- **Card** - Content containers
- **StatusChip** - Status indicators
- **KeyValueTable** - Data display
- **Table** - Data tables
- **Filter** - Filter components
- **ChipToggleGroup** - Toggle controls
- **AgGridTheme** - Data grid styling
- **RelatedNews** - News components
- **Width** - Layout utilities

## Tokenization Implementation Plan

### Phase 1: Foundation (1-2 weeks)
**Priority: Critical - These enable all other components**

#### 1.1 Color System (2-3 days)
- **Primary/Secondary Color Palettes**
  - Light/dark mode variants for all palette colors
  - State colors (hover, active, disabled, focus)
  - Status colors (success, warning, error, info)

- **Semantic Color Tokens**
  - Text colors (primary, secondary, disabled)
  - Background colors (paper, default, divider)
  - Border colors (light, medium, strong)

- **Component-Specific Colors**
  - Button colors (background, text, border per variant)
  - Link colors (default, hover, visited)
  - Icon colors (primary, secondary, disabled)

#### 1.2 Typography System (2 days)
- **Font Family Tokens**
  - Primary font family
  - Monospace font family

- **Font Size & Weight Scale**
  - Complete scale (xs, sm, base, lg, xl, 2xl, etc.)
  - Font weights (light, normal, medium, semibold, bold)

- **Line Height & Letter Spacing**
  - Typography variants (h1-h6, body1, body2, caption, etc.)

#### 1.3 Spacing System (1 day)
- **Base Spacing Units**
  - 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px scales
  - Padding tokens (xs, sm, md, lg, xl)
  - Margin tokens (xs, sm, md, lg, xl)

- **Component-Specific Spacing**
  - Button padding (small, medium, large)
  - Card padding/margin
  - List item spacing

### Phase 2: Basic Components (2-3 weeks)
**Priority: High - Core interactive elements**

#### 2.1 Button System (3-4 days)
- **Variant Styling**
  - Contained: background, text, border, shadow
  - Outlined: border, text, hover background
  - Text: text color, hover background

- **Size Variants**
  - Small, medium, large padding and font sizes
  - Icon button specific sizing

- **State Management**
  - Default, hover, active, focus, disabled states
  - Light/dark mode for all states
  - Loading state styling

#### 2.2 Typography Component (2 days)
- **Variant Mapping**
  - Map typography tokens to MUI variants
  - Custom variant creation capability

- **Color Integration**
  - Text color inheritance from color system
  - Context-aware coloring (inherit, primary, secondary, etc.)

#### 2.3 Basic Icons & IconButton (2 days)
- **Icon Sizing**
  - Small (16px), medium (24px), large (32px)
  - Custom size tokens

- **Icon Colors**
  - Inherit, primary, secondary, action, disabled
  - Context-specific coloring

- **IconButton States**
  - Hover, focus, active backgrounds
  - Size variants (small, medium, large)

#### 2.4 Chip Component (2 days)
- **Chip Variants**
  - Filled, outlined styling
  - Color variants (default, primary, secondary, error, etc.)

- **Status Chip Styling**
  - Success, warning, error, info states
  - Custom status color mapping

#### 2.5 Link Component (1 day)
- **Link States**
  - Default, hover, visited, active
  - Underline behavior
  - Color inheritance from theme

### Phase 3: Navigation & Layout (2-3 weeks)
**Priority: High - Essential for app structure**

#### 3.1 Menu System (4-5 days)
- **Menu Container**
  - Background colors
  - Border radius and shadows
  - Elevation/depth styling

- **MenuItem Styling**
  - Padding and height
  - Text styling
  - Hover/focus states
  - Selected state styling

- **Menu Hierarchy**
  - Nested menu styling
  - Divider styling
  - Icon integration in menu items

#### 3.2 Navigation Components (3 days)
- **TabBar Integration**
  - Tab styling (active, inactive, hover)
  - Tab indicator styling
  - Tab container background

- **List Components**
  - ListItem padding and spacing
  - ListItemIcon sizing and spacing
  - ListItemText typography integration

#### 3.3 Layout Containers (2 days)
- **Box Component**
  - Background color tokens
  - Border radius tokens
  - Shadow/elevation tokens

- **Popover/Modal Containers**
  - Backdrop styling
  - Container backgrounds
  - Elevation and shadows

### Phase 4: Data Display (2-3 weeks)
**Priority: Medium-High - Important for EWI functionality**

#### 4.1 Table Components (4-5 days)
- **Table Structure**
  - Header background and text
  - Row backgrounds (default, hover, selected)
  - Border styling (cell borders, table borders)

- **KeyValueTable Styling**
  - Key/value text styling
  - Row padding and spacing
  - Alternate row backgrounds

#### 4.2 Card System (3 days)
- **Card Container**
  - Background colors
  - Border radius and shadows
  - Padding variations

- **Card Content**
  - Header styling
  - Content padding
  - Footer styling

#### 4.3 Progress & Feedback (2 days)
- **LinearProgress**
  - Track and bar colors
  - Height variations
  - Animation properties

- **Loading States**
  - Skeleton loading colors
  - Progress indicators

### Phase 5: Advanced Integration (3-4 weeks)
**Priority: Medium - Complex components and theme integration**

#### 5.1 Theme Provider Integration (1 week)
- **Theme Structure**
  - Complete MUI theme object generation from tokens
  - Palette integration
  - Typography theme integration
  - Component theme overrides

- **Context System**
  - Theme switching (light/dark)
  - Context-specific theme overrides
  - Runtime theme updates

#### 5.2 Responsive System (3-4 days)
- **Breakpoint Tokens**
  - xs, sm, md, lg, xl breakpoint values
  - Custom breakpoint definitions

- **useMediaQuery Integration**
  - Responsive behavior tokens
  - Mobile-first responsive patterns

#### 5.3 Advanced Components (1 week)
- **Complex State Management**
  - Multi-state component tokens
  - Conditional styling based on props

- **Custom Component Integration**
  - @smbc/mui-components token integration
  - Custom theme extension patterns

### Phase 6: Custom Components (2-3 weeks)
**Priority: Low-Medium - Custom components integration**

#### 6.1 @smbc/mui-components Tokenization (1-2 weeks)
- **AppShell Theming**
  - Header, sidebar, content area styling
  - Navigation styling

- **Data Components**
  - AgGridTheme integration
  - Filter component styling
  - StatusChip theming

#### 6.2 Application-Specific Styling (1 week)
- **EWI-Specific Styling**
  - Workflow-specific colors
  - Status indicators
  - Custom layouts

## Implementation Strategy

### Development Approach
1. **Token-First Development**
   - Define tokens before component implementation
   - Create comprehensive token documentation
   - Build token validation and testing

2. **Incremental Integration**
   - Component-by-component replacement
   - Maintain backwards compatibility during transition
   - Progressive enhancement approach

3. **Testing Strategy**
   - Visual regression testing for each component
   - Light/dark mode testing
   - Responsive behavior testing
   - Cross-browser compatibility testing

### Technical Implementation

#### Token Structure
```typescript
// Example token structure
const tokens = {
  color: {
    button: {
      primary: {
        background: { light: "#1976d2", dark: "#90caf9" },
        text: { light: "#ffffff", dark: "#000000" },
        border: { light: "#1976d2", dark: "#90caf9" },
        hover: {
          background: { light: "#1565c0", dark: "#81b4e6" }
        }
      }
    }
  },
  spacing: {
    button: {
      padding: { small: "4px 8px", medium: "8px 16px", large: "12px 24px" }
    }
  },
  typography: {
    button: {
      fontSize: { small: "0.875rem", medium: "1rem", large: "1.125rem" },
      fontWeight: "500"
    }
  }
}
```

#### Component Integration Pattern
```typescript
// Example component integration
const useButtonTokens = (variant: 'contained' | 'outlined' | 'text', size: 'small' | 'medium' | 'large') => {
  const tokens = useTokens();
  return {
    backgroundColor: tokens.color.button[variant].background,
    color: tokens.color.button[variant].text,
    padding: tokens.spacing.button.padding[size],
    fontSize: tokens.typography.button.fontSize[size],
    // ... other token mappings
  };
};
```

### Migration Strategy
1. **Parallel Development**
   - Build tokenized components alongside existing ones
   - Feature flag controlled rollout
   - Gradual migration per applet

2. **Validation Process**
   - Design review for each component
   - Accessibility compliance verification
   - Performance impact assessment

## Effort Estimation

### Time Investment by Phase
- **Phase 1 (Foundation): 1-2 weeks**
- **Phase 2 (Basic Components): 2-3 weeks**
- **Phase 3 (Navigation & Layout): 2-3 weeks**
- **Phase 4 (Data Display): 2-3 weeks**
- **Phase 5 (Advanced Integration): 3-4 weeks**
- **Phase 6 (Custom Components): 2-3 weeks**

**Total Estimated Time: 12-18 weeks**

### Resource Requirements
- **1 Senior Frontend Developer** (full-time)
- **1 Design System Specialist** (part-time for token definition)
- **1 QA Engineer** (part-time for testing)

### Risk Factors
- **Complexity of existing custom components**
- **Breaking changes in component APIs**
- **Performance impact of token resolution**
- **Learning curve for token editor usage**

## Success Metrics

### Technical Metrics
- 100% of MUI components tokenized
- <100ms theme switching performance
- Zero visual regressions in existing applications
- 95%+ token editor test coverage

### User Experience Metrics
- Complete light/dark mode support
- Consistent styling across all EWI applets
- Easy theme customization through token editor
- Improved development velocity for new features

### Maintenance Metrics
- Reduced CSS/styling code duplication
- Centralized theme management
- Simplified design system updates
- Clear component documentation

## Next Steps

1. **Review and approve this plan**
2. **Set up development environment for tokenization**
3. **Begin Phase 1: Foundation development**
4. **Establish design review process**
5. **Create token documentation standards**

This plan provides a systematic approach to fully tokenizing the MUI theme while maintaining development velocity and ensuring a high-quality user experience across all EWI applications.