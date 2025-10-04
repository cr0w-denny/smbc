# Input Styling System Refactor

## Problem Statement

Current input styling is scattered across:
- Individual component files (CustomSelect.tsx with inline style objects)
- Theme components.ts (global MUI overrides)
- Inconsistent patterns between TDK, DK, and LM modes
- Difficult to maintain and extend
- Hard to ensure consistency across input types

## Goals

1. **Centralized style definitions** - All mode-specific styles in one place
2. **Type-safe and exhaustive** - Cover all states and elements systematically
3. **Reusable across input types** - Share styles between Select, TextField, DatePicker, etc.
4. **Easy to swap/extend** - Simple to add new modes or modify existing ones
5. **DRY principle** - Define once, apply everywhere

## Proposed Structure

### 1. Input Style Specification Type

```typescript
/**
 * Comprehensive style specification for form inputs
 * Covers all visual states and elements of an input component
 */
interface InputStyleSpec {
  label?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    focus?: CSSProperties;
    disabled?: CSSProperties;
  };

  icon?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    focus?: CSSProperties;
    disabled?: CSSProperties;
  };

  border?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    focus?: CSSProperties;
    disabled?: CSSProperties;
  };

  background?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    focus?: CSSProperties;
    disabled?: CSSProperties;
  };

  text?: {
    base?: CSSProperties;
    hover?: CSSProperties;
    focus?: CSSProperties;
    disabled?: CSSProperties;
  };

  menu?: {
    border?: CSSProperties;
    background?: CSSProperties;
    text?: CSSProperties;
  };
}
```

### 2. Style Application Functions

Each input type gets its own application function that knows how to map the spec to MUI overrides:

```typescript
/**
 * Apply style spec to MUI Select component overrides
 */
function applySelectStyles(
  spec: InputStyleSpec,
  theme: Theme
): ComponentsOverrides['MuiSelect'] {
  return {
    root: {
      ...(spec.background?.base || {}),
      '&:hover': spec.background?.hover || {},
      '&.Mui-focused': spec.background?.focus || {},
      '&.Mui-disabled': spec.background?.disabled || {},

      '& .MuiOutlinedInput-notchedOutline': {
        ...(spec.border?.base || {}),
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        ...(spec.border?.hover || {}),
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        ...(spec.border?.focus || {}),
      },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
        ...(spec.border?.disabled || {}),
      },

      '& .MuiSelect-select': {
        ...(spec.text?.base || {}),
      },
      '&:hover .MuiSelect-select': {
        ...(spec.text?.hover || {}),
      },
      '&.Mui-focused .MuiSelect-select': {
        ...(spec.text?.focus || {}),
      },
      '&.Mui-disabled .MuiSelect-select': {
        ...(spec.text?.disabled || {}),
      },

      '& .MuiSvgIcon-root': {
        ...(spec.icon?.base || {}),
      },
      '&:hover .MuiSvgIcon-root': {
        ...(spec.icon?.hover || {}),
      },
      '&.Mui-focused .MuiSvgIcon-root': {
        ...(spec.icon?.focus || {}),
      },
      '&.Mui-disabled .MuiSvgIcon-root': {
        ...(spec.icon?.disabled || {}),
      },
    },
  };
}

/**
 * Apply style spec to MUI TextField component overrides
 */
function applyTextFieldStyles(
  spec: InputStyleSpec,
  theme: Theme
): ComponentsOverrides['MuiTextField'] {
  return {
    root: {
      '& .MuiOutlinedInput-root': {
        ...(spec.background?.base || {}),
        '&:hover': spec.background?.hover || {},
        '&.Mui-focused': spec.background?.focus || {},
        '&.Mui-disabled': spec.background?.disabled || {},

        '& fieldset': spec.border?.base || {},
        '&:hover fieldset': spec.border?.hover || {},
        '&.Mui-focused fieldset': spec.border?.focus || {},
        '&.Mui-disabled fieldset': spec.border?.disabled || {},
      },

      '& .MuiInputBase-input': {
        ...(spec.text?.base || {}),
      },

      '& .MuiInputLabel-root': {
        ...(spec.label?.base || {}),
        '&:hover': spec.label?.hover || {},
        '&.Mui-focused': spec.label?.focus || {},
        '&.Mui-disabled': spec.label?.disabled || {},
      },
    },
  };
}

/**
 * Apply style spec to menu/dropdown papers
 */
function applyMenuStyles(
  spec: InputStyleSpec,
  theme: Theme
): Partial<ComponentsOverrides['MuiPaper']> {
  return {
    root: {
      '&.MuiMenu-paper': {
        ...(spec.menu?.background || {}),
        ...(spec.menu?.border || {}),
      },
      '&.MuiPopover-paper': {
        ...(spec.menu?.background || {}),
        ...(spec.menu?.border || {}),
      },

      '& .MuiMenuItem-root': {
        ...(spec.menu?.text || {}),
      },
    },
  };
}
```

### 3. Style Composition and Merging

Generic recursive composition function that can both merge layers and fan out to modes:

```typescript
/**
 * Recursive style composition function with automatic nested array handling
 *
 * Merges all arguments except the last, then fans out to the last argument:
 * - If last arg is array: fans out to each element, returns array
 * - If last arg is single spec: merges with it, returns single spec
 * - Nested arrays are automatically processed recursively
 *
 * @param args - Style specs/arrays to merge, with last arg being the fan-out target
 * @returns Single merged spec, or array of specs (based on last arg)
 *
 * @example
 * // Merge all into one
 * const merged = applyStyles(base, common, specific);
 *
 * @example
 * // Merge base + common, then fan out to modes
 * const [lm, dk, tdk] = applyStyles(base, common, [light, dark, toolbarDark]);
 *
 * @example
 * // Single base, fan out to modes with nested merging
 * const [lm, dk, tdk] = applyStyles(
 *   base,
 *   [
 *     light,
 *     [darkCommon, darkOverrides],        // Automatically merged
 *     [darkCommon, toolbarDarkOverrides]  // Automatically merged
 *   ]
 * );
 */
function applyStyles(
  ...args: (Partial<InputStyleSpec> | Partial<InputStyleSpec>[])[]
): InputStyleSpec | InputStyleSpec[] {
  if (args.length === 0) {
    return {} as InputStyleSpec;
  }

  // Deep merge helper
  const merge = (...specs: Partial<InputStyleSpec>[]): InputStyleSpec => {
    return specs.reduce((acc, spec) => {
      return {
        label: { ...acc.label, ...spec.label },
        icon: { ...acc.icon, ...spec.icon },
        border: { ...acc.border, ...spec.border },
        background: { ...acc.background, ...spec.background },
        text: { ...acc.text, ...spec.text },
        menu: { ...acc.menu, ...spec.menu },
      };
    }, {} as InputStyleSpec);
  };

  // Process layer: if array, recursively apply; otherwise return as-is
  const processLayer = (
    layer: Partial<InputStyleSpec> | Partial<InputStyleSpec>[]
  ): Partial<InputStyleSpec> => {
    return Array.isArray(layer)
      ? applyStyles(...layer) as Partial<InputStyleSpec>
      : layer;
  };

  // Last arg is the fan-out target
  const fanOutTarget = args[args.length - 1];
  const mergeLayers = args.slice(0, -1);

  // Merge all layers except last
  const processedMergeLayers = mergeLayers.map(processLayer);
  const mergedBase = processedMergeLayers.length > 0
    ? merge(...processedMergeLayers)
    : {} as Partial<InputStyleSpec>;

  // If last arg is array, fan out; otherwise merge with it
  if (Array.isArray(fanOutTarget)) {
    return fanOutTarget.map(mode => {
      const processedMode = processLayer(mode);
      return merge(mergedBase, processedMode);
    });
  } else {
    const processedTarget = processLayer(fanOutTarget);
    return merge(mergedBase, processedTarget);
  }
}
```

### 4. Mode-Specific Style Definitions

Define styles using the composition approach:

```typescript
/**
 * Base styles - shared across ALL modes
 */
const baseInputStyles: Partial<InputStyleSpec> = {
  border: {
    focus: { borderWidth: '2px' },
  },
  menu: {
    background: { marginTop: '8px' },
  },
};

/**
 * Dark common styles - shared between DK and TDK
 */
const darkCommonStyles: Partial<InputStyleSpec> = {
  menu: {
    background: { backgroundColor: '#0A111B' },
  },
};

/**
 * Light Mode specific overrides
 */
const lightModeStyles: Partial<InputStyleSpec> = {
  label: {
    base: { color: 'token or color' },
    focus: { color: 'token or color' },
    disabled: { color: 'token or color' },
  },
  icon: {
    base: { color: 'token or color' },
    focus: { color: 'token or color' },
    disabled: { color: 'token or color' },
  },
  border: {
    base: { borderColor: 'token or color', borderRadius: '24px' },
    hover: { borderColor: 'token or color' },
    focus: { borderColor: 'token or color' },
    disabled: { borderColor: 'token or color' },
  },
  background: {
    base: { backgroundColor: 'token or color' },
    hover: { backgroundColor: 'token or color' },
    focus: { backgroundColor: 'token or color' },
    disabled: { backgroundColor: 'token or color' },
  },
  text: {
    base: { color: 'token or color' },
    disabled: { color: 'token or color' },
  },
  menu: {
    background: { backgroundColor: 'token or color' },
    text: { color: 'token or color' },
  },
};

/**
 * Dark Mode (DK) specific overrides
 */
const darkModeStyles: Partial<InputStyleSpec> = {
  label: {
    base: { color: 'TBD' },
    focus: { color: 'TBD' },
    disabled: { color: 'TBD' },
  },
  icon: {
    base: { color: 'TBD' },
    focus: { color: 'TBD' },
    disabled: { color: 'TBD' },
  },
  border: {
    base: { borderColor: 'TBD', borderRadius: 'TBD' },
    hover: { borderColor: 'TBD' },
    focus: { borderColor: 'TBD' },
    disabled: { borderColor: 'TBD' },
  },
  background: {
    base: { backgroundColor: 'TBD' },
    hover: { backgroundColor: 'TBD' },
    focus: { backgroundColor: 'TBD' },
    disabled: { backgroundColor: 'TBD' },
  },
  text: {
    base: { color: 'TBD' },
    disabled: { color: 'TBD' },
  },
  menu: {
    text: { color: 'TBD' },
  },
};

/**
 * Toolbar Dark Mode (TDK) specific overrides
 */
const toolbarDarkStyles: Partial<InputStyleSpec> = {
  label: {
    base: { color: '#9CA3AF' },
    focus: { color: '#73ABFB' },
    disabled: { color: '#6B7280' },
  },
  icon: {
    base: { color: '#73ABFB' },
    focus: { color: '#73ABFB' },
    disabled: { color: '#6B7280' },
  },
  border: {
    base: { borderColor: '#000000', borderRadius: '100px' },
    hover: { borderColor: '#000000' },
    focus: { borderColor: '#73ABFB' },
    disabled: { borderColor: '#374151' },
  },
  background: {
    base: { backgroundColor: '#1D2427' },
    hover: { backgroundColor: '#1D2427' },
    focus: { backgroundColor: '#1D2427' },
    disabled: { backgroundColor: '#111827' },
  },
  text: {
    base: { color: '#FFFFFF' },
    disabled: { color: '#6B7280' },
  },
  menu: {
    background: { backgroundColor: 'TBD' },
    text: { color: 'TBD' },
  },
};

/**
 * Generate final style specs using automatic nested array composition
 *
 * LM = base + lightModeStyles
 * DK = base + (darkCommon + darkModeStyles)
 * TDK = base + (darkCommon + toolbarDarkStyles)
 *
 * Nested arrays are automatically processed by applyStyles
 */
const [lightModeInputStyles, darkModeInputStyles, toolbarDarkInputStyles] =
  applyStyles(
    baseInputStyles,
    [
      lightModeStyles,
      [darkCommonStyles, darkModeStyles],
      [darkCommonStyles, toolbarDarkStyles],
    ]
  ) as InputStyleSpec[];
```

### 5. Integration with Theme

In `theme/components.ts`:

```typescript
export const createCssVarComponents = (
  theme: Theme,
): Components<Omit<Theme, "components">> => {
  // Determine which style spec to use based on theme mode
  const isDarkMode = theme.palette.mode === "dark";

  // Note: TDK is detected at component level via useConfig hook
  // Theme-level overrides only need LM and DK
  const inputStyles = isDarkMode ? darkModeInputStyles : lightModeInputStyles;

  return {
    MuiCssBaseline: { /* ... */ },

    MuiSelect: {
      styleOverrides: {
        ...applySelectStyles(inputStyles, theme),
        // Additional #app scoping if needed
      },
    },

    MuiTextField: {
      styleOverrides: applyTextFieldStyles(inputStyles, theme),
    },

    MuiFormControl: {
      styleOverrides: applyDatePickerStyles(inputStyles, theme),
    },

    MuiPaper: {
      styleOverrides: applyMenuStyles(inputStyles, theme),
    },

    // ... other components
  };
};
```

### 6. Component-Level TDK Override

For components like CustomSelect that need TDK support:

```typescript
export const CustomSelect: React.FC<CustomSelectProps> = ({
  // ...
}) => {
  const { toolbar } = useConfig();
  const theme = useTheme();

  const isDarkToolbar = toolbar?.mode === "dark";
  const isDarkMode = theme.palette.mode === "dark";

  // Destructure the three style specs
  const [lmStyles, dkStyles, tdkStyles] = [
    lightModeInputStyles,
    darkModeInputStyles,
    toolbarDarkInputStyles,
  ];

  // Select appropriate styles
  const componentStyles = isDarkMode
    ? dkStyles
    : isDarkToolbar
      ? tdkStyles
      : lmStyles;

  // Apply directly to component using the spec
  // (Can create helper to convert spec to sx props)
  const sxStyles = inputSpecToSx(componentStyles);

  return (
    <Select
      sx={{
        ...sxStyles.background.base,
        '&:hover': sxStyles.background.hover,
        // ... etc
      }}
    />
  );
};
```

## File Structure

```
packages/mui-components/src/
├── theme/
│   ├── components.ts                    # MUI theme overrides
│   ├── inputStyles/
│   │   ├── types.ts                     # InputStyleSpec interface
│   │   ├── specs/
│   │   │   ├── lightMode.ts            # lightModeInputStyles
│   │   │   ├── toolbarDark.ts          # tdkInputStyles
│   │   │   └── darkMode.ts             # dkInputStyles
│   │   ├── applicators/
│   │   │   ├── applySelectStyles.ts
│   │   │   ├── applyTextFieldStyles.ts
│   │   │   ├── applyDatePickerStyles.ts
│   │   │   └── applyMenuStyles.ts
│   │   ├── utils/
│   │   │   └── inputSpecToSx.ts        # Convert spec to sx props
│   │   └── index.ts                     # Exports
```

## Benefits

1. **Single Source of Truth** - All mode styles defined in one spec file per mode
2. **Type Safety** - TypeScript ensures all states are covered
3. **Consistency** - Same structure ensures consistent behavior across inputs
4. **Maintainability** - Easy to find and update styles
5. **Testability** - Can unit test applicator functions
6. **Flexibility** - Easy to add new modes or input types
7. **Reusability** - Share styles between different input components
8. **Documentation** - Self-documenting through type structure

## Migration Plan

1. **Phase 1: Setup Structure**
   - Create types.ts with InputStyleSpec
   - Create directory structure

2. **Phase 2: Define Specs**
   - Port existing TDK styles to tdkInputStyles
   - Port existing LM styles to lightModeInputStyles
   - Define DK styles in dkInputStyles

3. **Phase 3: Create Applicators**
   - Build applySelectStyles
   - Build applyTextFieldStyles
   - Build applyMenuStyles
   - Build inputSpecToSx utility

4. **Phase 4: Refactor Theme**
   - Update components.ts to use applicators
   - Test all inputs in all modes

5. **Phase 5: Refactor Components**
   - Update CustomSelect to use specs
   - Update other custom components
   - Remove inline style objects

6. **Phase 6: Validation**
   - Visual regression testing
   - Ensure all modes work correctly
   - Remove old/unused code

## Open Questions

1. Should we support style composition/merging for edge cases?
2. How to handle component-specific overrides that don't fit the spec?
3. Do we need separate specs for different label modes (contain vs overlap)?
4. How to handle transitions/animations in the spec?

## Next Steps

1. Review this plan and structure
2. Refine InputStyleSpec based on actual requirements
3. Start with a proof-of-concept for one input type (Select)
4. Validate approach before full migration
