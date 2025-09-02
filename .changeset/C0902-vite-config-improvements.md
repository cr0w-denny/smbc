---
"@smbc/vite-config": minor
"@smbc/mui-components": minor
"@smbc/usage-stats-mui": patch
"@smbc/mui-host-dev": patch
---

Improve vite config flexibility and fix AgGridTheme integration

- Add `enableCoreAliases` option to vite config (defaults to false) for better external monorepo support
- Update AgGridTheme to use `useTheme()` instead of requiring theme prop for simpler integration
- Fix usage-stats applet to work without explicit theme prop
- Enable core aliases in mui-host-dev app for proper HMR during development
- Improve alias resolution to work correctly in different monorepo structures