# C0921B: Font Loading and Component Styling Fixes

## Summary
Fixed font loading issues in Storybook and refined component styling based on design feedback.

## Changes

### Storybook Font Loading
- **File**: `apps/mui-storybook/.storybook/preview-head.html`
- **Issue**: RelatedNews component fonts not displaying correctly in Storybook
- **Solution**: Added Google Fonts preload and link tags for Roboto and Montserrat
- **Impact**: Proper typography rendering in Storybook stories

### RelatedNews Component Refinements
- **Typography Adjustments**:
  - Title font size: 12px → 15px
  - Metadata font size: 10px → 12px
- **Progress Ring Optimizations**:
  - Size: 40px → 24px diameter
  - Stroke width: 2px → 3px (thicker)
  - Color: #2E8B57 → #12A187
- **External Link Icon**:
  - Size: small → 14px (smaller)
  - Color: theme.action.active → #486C94 (light mode)
  - Position: Added 2px translateY offset
- **Google Text**: Added 12px text next to progress ring with percentage
- **Dark Mode Support**: Enhanced color schemes for all text elements

### Progress Ring Background
- **Light Mode**: #E3EBF2 (blue tint)
- **Dark Mode**: #2A3A4A (dark blue instead of generic disabled state)

### AG Grid Integration Fixes
- **Status Column Width**: Increased minWidth from 140px to 155px
- **Popup Parent**: Proper implementation matching ewi-events pattern
- **Mixed Case Labels**: Status chips display "Almost Due" instead of "ALMOST DUE"