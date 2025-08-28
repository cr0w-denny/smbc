---
"@smbc/mui-components": minor
"@smbc/ui-core": patch
---

Add multiselect support to Filter components

- Added `multiple?: boolean` property to FilterFieldConfig type
- Enhanced FilterField component to support multiselect with proper display
- Shows placeholder or "None selected" when no items selected
- Shows single item label when one item selected  
- Shows "X selected..." when multiple items selected
- Fixed array handling and CSV serialization for multiselect URL parameters
- Improved filter clearing logic for multiselect fields (resets to empty array)