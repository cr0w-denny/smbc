---
"@smbc/mui-applet-core": minor
---

Fix toolbar background rendering and light mode styling

- Added separate background element that extends below toolbar content in light mode
- Fixed z-index layering: background (1000), content (1001), toolbar (1002)
- Toolbar background now uses NavigationBackgroundLight token instead of hardcoded colors
- Dark mode toolbar uses same gradient as main page background for seamless alignment
- Background extension only renders in light mode for better performance
- Improved visual separation between toolbar and content areas