---
"@smbc/ewi-events-mui": minor
---

Enhanced FilterBar and ActionBar with new filters and improved functionality

- Added PLO multi-select filter with predefined options (NYC001, LAX002, CHI003, etc.)
- Added "My Events" checkbox filter (renamed from "myEvents" to "my" for cleaner URLs)
- Updated filter chips order: Mandatory, Discretionary, On Course, Past Due, Almost Due
- Removed "Needs Attention" filter chip
- Set debounceMs to 0 to prevent auto-unchecking behavior
- Fixed Apply button styling for disabled state (removed primary color outline)
- Enhanced reset filters to include new fields and auto-apply changes