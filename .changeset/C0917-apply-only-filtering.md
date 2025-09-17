---
"@smbc/applet-core": minor
"@smbc/ewi-events-mui": minor
---

Implemented apply-only filter behavior to prevent automatic data fetching

- Created new `useHashNavigationWithApply` hook that wraps `useHashNavigation`
- Separates local UI state from URL state until explicitly applied
- Added change detection to enable/disable Apply Filters button
- Filter chips apply immediately while other filters require explicit apply
- Proper handling of CSV/array transformations for types and PLO fields
- Boolean to string conversion for "my" field URL persistence
- Auto-apply functionality for reset filters action