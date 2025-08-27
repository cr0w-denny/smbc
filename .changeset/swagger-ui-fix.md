---
"@smbc/mui-applet-devtools": patch
---

Fix swagger-ui-react and reselect dependency resolution issues

- Bundle swagger-ui-react and reselect to avoid module resolution errors
- Ensure proper dependency availability for swagger-ui components
- Fix Vite chunking strategy for swagger-ui dependencies