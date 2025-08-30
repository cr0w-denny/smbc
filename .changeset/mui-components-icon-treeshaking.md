---
"@smbc/mui-components": minor
---

Add tree-shaking support for MUI icons via barrel export

- **Icon optimization**: Created barrel export at `@smbc/mui-components` for tree-shaking
- **Bundle reduction**: Reduced icon bundle from 300KB+ to 7.77KB (97% reduction)
- **Selective imports**: Only ~70 actually used icons included instead of 2000+ full library
- **Import consistency**: Single import source `@smbc/mui-components` for both components and icons
- **Performance**: Icons now bundled in stable vendor chunk for optimal caching
- Updated all components to use barrel export instead of direct MUI icon imports