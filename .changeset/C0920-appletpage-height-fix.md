---
"@smbc/mui-applet-core": minor
---

Fix AppletPage height calculations for proper AG Grid rendering

- Changed content container from minHeight to height for definite sizing
- AG Grid now properly consumes available space instead of collapsing to 0
- Fixed layout issues where grid components weren't displaying correctly
- Improved height propagation through container hierarchy