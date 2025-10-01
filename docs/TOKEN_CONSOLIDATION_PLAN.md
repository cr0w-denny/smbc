# Token Consolidation Plan

## Overview
Consolidate tokens that unnecessarily duplicate identical values across light/dark themes into single direct values.

## Properties to Consolidate

### Layout Properties (Always Same)
- `borderRadius`: "4px", "16px", etc.
- `padding`: "8px 16px", "12px", etc.
- `margin`: values that don't change with theme
- `width`: "100%", "44px", etc.
- `height`: "24px", "20px", etc.

### Typography Properties (Theme-Agnostic)
- `fontSize`: "14px", "18px", etc.
- `fontWeight`: "500", "600", etc.
- `fontFamily`: Font stacks don't change with theme

### Border Properties
- `borderStyle`: "solid", "none"
- `borderCollapse`: "collapse"

### Animation Properties
- `transition`: "all 0.2s ease-in-out"

### Layout Values
- `maxWidth`: "200px", etc.
- Layout positioning values

## Examples of Consolidation

### Before:
```typescript
button: {
  base: {
    default: {
      borderRadius: {
        light: "4px",
        dark: "4px",
      },
      fontSize: {
        light: "14px",
        dark: "14px",
      },
      fontWeight: {
        light: "500",
        dark: "500",
      },
      padding: {
        light: "8px 16px",
        dark: "8px 16px",
      },
    }
  }
}
```

### After:
```typescript
button: {
  base: {
    default: {
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "500",
      padding: "8px 16px",
      background: {
        light: "#ffffff",
        dark: "#1D273A",
      },
      color: {
        light: "#000000",
        dark: "#ffffff",
      }
    }
  }
}
```

## Keep Light/Dark For:
- `background`: Colors that change with theme
- `color`: Text colors that adapt to theme
- `borderColor`: Border colors that change for contrast
- `boxShadow`: Shadows that need theme adaptation