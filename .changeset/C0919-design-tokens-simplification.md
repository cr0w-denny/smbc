---
"@smbc/ui-core": minor
"@smbc/mui-components": patch
---

# Design Token Naming Simplification

Dramatically simplified design token naming conventions for better developer experience:

## Token Name Changes
- `ColorBrandPrimaryTradGreen` → `TradGreen`
- `ColorBrandPrimaryFreshGreen` → `FreshGreen`
- `ColorSemanticSuccess500` → `Success500`
- `ColorSemanticError500` → `Error500`
- `ColorSemanticWarning500` → `Warning500`
- `ColorSemanticInfo500` → `Info500`
- `ColorGray100` → `Gray100` (and all gray variants)
- `ColorSecondaryHoneyBeige100` → `HoneyBeige100`
- Chart colors: `ColorChartData1` → `Data1`

## Implementation
- Updated Style Dictionary transform with custom naming rules
- All semantic, gray, brand, secondary, tertiary, and chart colors now use simplified names
- Updated MUI theme files (light/dark palettes) to use new token names
- Maintained backwards compatibility during transition

## Benefits
- 50-70% shorter token names
- More intuitive and memorable
- Faster development workflow
- Consistent naming patterns across all token types