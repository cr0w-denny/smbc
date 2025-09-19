---
"@smbc/mui-storybook": patch
---

# Storybook Dark Mode and Theme Improvements

Fixed dark mode rendering issues and improved theme consistency across Storybook documentation and component previews.

## Dark Mode Documentation Fixes
- Fixed unreadable docs pages in dark mode
- Applied theme-aware styling to component preview areas only
- Maintained light background for documentation content
- Improved visual separation between docs and component previews

## Theme-Aware Component Fixes
- **DesignTokens Story**: Fixed usage section with theme-aware background colors
- **Filter Stories**: Replaced hardcoded `#f5f5f5` backgrounds with theme-aware styling
- **TreeMenu Stories**: Fixed icon rendering (React components vs string identifiers)
- Consistent use of `background.default` and `divider` theme colors

## Visual Improvements
- Better contrast and readability in both light and dark modes
- Professional appearance matching design tool standards
- Clean separation between documentation and component preview areas
- Consistent styling across all story components

## Technical Implementation
- CSS custom properties for dynamic theme switching
- Targeted styling for component canvases only
- Proper Material-UI theme integration
- Cleanup of hardcoded color values throughout stories

## User Experience
- Seamless theme switching without readability issues
- Professional documentation appearance
- Better component testing in dark environments
- Consistent visual hierarchy between content areas