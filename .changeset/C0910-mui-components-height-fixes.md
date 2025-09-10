---
"@smbc/mui-components": patch
---

Fix AppShell height calculation to prevent overflow with fixed headers. Changed from minHeight: 100% to height: calc(100vh - 104px). Move framer-motion and @mui/x-tree-view to peerDependencies for better bundle optimization.