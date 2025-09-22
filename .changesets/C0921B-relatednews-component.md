# C0921B: RelatedNews Component Implementation

## Summary
Created a new RelatedNews component for displaying news feeds with progress indicators, external links, and comprehensive theming support.

## Changes

### New Component: RelatedNews
- **File**: `packages/mui-components/src/RelatedNews.tsx`
- **Features**:
  - 56px height news items with 38x38 images
  - Progress rings showing reading completion (24px x 24px with #12A187 color)
  - External link icons inline with titles
  - Support for both light and dark modes
  - Typography: 15px titles, 12px metadata and Google percentages
  - Hover states and click handlers

### Component Export
- **File**: `packages/mui-components/src/index.ts`
- Added RelatedNews and NewsItem type exports

### Storybook Integration
- **File**: `apps/mui-storybook/stories/RelatedNews.stories.tsx`
- Created comprehensive stories: Default, WithoutProgress, WithoutExternalLinks
- **File**: `apps/mui-storybook/.storybook/preview-head.html`
- Added Roboto and Montserrat font loading for proper typography rendering

## Design Specifications Implemented
- **Item Height**: 56px with proper vertical centering
- **Image**: 38x38 avatar with fallback to first letter
- **Typography**:
  - Title: 15px Roboto Medium (#486C94 light, theme secondary dark)
  - Metadata: 12px (#1F3359 light, theme secondary dark)
  - Google percentage: 12px (#474747 light, theme secondary dark)
- **Progress Ring**: 24px diameter, 3px stroke, #12A187 fill, theme-aware background
- **External Icon**: 14px, #486C94 color, positioned 2px up from baseline
- **Spacing**: 20px left/right padding, 1px gaps between items

## Technical Implementation
- Styled components with theme integration
- SVG progress rings with stroke-dasharray animations
- Responsive image handling with placeholder support
- Event handling for clicks and external links
- Comprehensive TypeScript interfaces