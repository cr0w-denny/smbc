---
"@smbc/ewi-events": patch
---

## Events Reset Filters Functionality Fix

Fixed the "Reset Filters" functionality in the Events Workflow card menu to properly reset to applied parameters instead of blanking fields:

### Changes
- **Fixed Date Reset**: Now resets date fields to their proper default values (30 days ago to today) instead of empty strings
- **Improved Reset Logic**: Uses applied parameters as baseline when available, falling back to initial defaults
- **Cleaner Implementation**: Defined defaults once at component level and reused for both hook initialization and reset functionality
- **Better UX**: Reset now goes back to last applied state rather than original page defaults

### Technical Details
- Extracted `autoDefaults` and `draftDefaults` objects for single source of truth
- Modified reset handler to check `appliedParams` first, then fall back to `draftDefaults`
- Ensures reset behavior matches user expectations (reset to last committed state)
- Eliminated duplicate date calculations and hardcoded empty values

This provides a more intuitive user experience where "Reset Filters" means "reset my current draft changes back to my last applied state" rather than clearing everything.