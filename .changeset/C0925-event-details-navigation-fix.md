---
"@smbc/ewi-events": patch
"@smbc/ewi-event-details": patch
---

## Event Details Navigation and Tab Rendering Fixes

Fixed two critical issues with event details navigation and rendering:

### Navigation Parameter Cleanup
- **Problem**: Detail links were passing unwanted URL parameters from the events list page
- **Solution**:
  - Modified ewi-event-details to only accept `id` parameter: `useHashNavigation({}, { id: "" }, { mountPath })`
  - Updated navigation to use direct hash assignment to bypass parameter preservation
  - Fixed URLs from `#/events/detail?id=17?start_date=2025-08-26&end_date=2025-09-25` to clean `#/events/detail?id=17`

### Tab Content Rendering
- **Problem**: Event details tabs were not rendering, showing only the editor panel
- **Solution**:
  - Added proper loading states in `renderTabContent()` - shows "Loading event data..." or "No event ID provided"
  - Added debug logging to track parameter extraction and data loading
  - Improved error handling for missing event data

### Technical Implementation
- Used `window.location.hash` for clean navigation that doesn't inherit current page parameters
- Fixed hook configuration to filter out unwanted parameters from URL
- Added comprehensive debugging and loading state management

This ensures clean navigation between events list and event details with proper tab rendering and no parameter pollution.