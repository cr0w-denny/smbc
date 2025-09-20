---
"@smbc/mui-applet-core": minor
---

Add dynamic toolbar height support with new `toolbarHeight` prop

- Added `toolbarHeight` prop to AppletPage and PageLayout components
- Toolbar height now defaults to 94px (previously hardcoded 80px)
- Height calculations and padding now use dynamic `toolbarHeight` value
- Enables different pages to specify custom toolbar heights for varying content