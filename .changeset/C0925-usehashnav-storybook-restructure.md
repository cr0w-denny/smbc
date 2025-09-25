---
"@smbc/mui-storybook": patch
---

## useHashNavigation Storybook Documentation Restructure

Completely restructured the useHashNavigation Storybook documentation for better developer experience:

### Documentation Changes
- **Separated Overview and Demo**: Split comprehensive documentation into separate "Overview" and "Demo" stories
- **Combined Interactive Testing**: Merged Interactive Demo and Initialization Testing into a single story with toggle
- **Removed Marketing Language**: Eliminated sales-y terms like "seamlessly", "powerful", "smart" for more professional tone
- **Improved Key Messaging**: Added prominent warning about unidirectional data flow (URL reflects state, never drives it)
- **Organized Content**: Broke Key Features into separate card with better visual hierarchy

### Content Improvements
- Added explanation of why unidirectional flow prevents render loops and simplifies programming
- Clarified stream isolation benefits (auto-applied changes don't reset draft state)
- Added comprehensive architecture documentation focused on current capabilities
- Included technical implementation details with "Don't Cross the Streams" Ghostbusters reference
- Fixed field transformation examples and behaviors list

### Structure Changes
- Overview story: Pure documentation without interactive elements
- Demo story: Combined interactive demonstration with initialization testing modes
- Better visual organization with color-coded cards (info, warning, success, grey themes)
- Removed redundant Usage Patterns section in favor of more focused content

This provides developers with cleaner, more focused documentation that explains how the hook works without dwelling on implementation challenges that were overcome during development.