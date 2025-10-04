# Input Styling Implementation Plan

**Goal:** Get all input types working correctly in all modes (LM, DK, TDK) with all states.

## Strategy

1. Start with a clean slate in `components.ts`
2. Build one input type at a time
3. Test each mode before moving on
4. Use the existing inputStyles infrastructure

---

## Phase 1: Clean Slate

### Step 1.1: Backup and Clear
- [ ] Create backup of current `components.ts` (save as `components.backup.ts`)
- [ ] Clear all input-related overrides from `components.ts`
- [ ] Keep only: MuiCssBaseline (scrollbar styles), MuiPaper (menu background)
- [ ] Verify app still runs (inputs will look wrong - that's fine)

---

## Phase 2: TextField (Simplest Input)

### Step 2.1: Apply TextField base styles
- [ ] In `components.ts`, add MuiTextField override using `applyTextFieldStyles(inputStyles, theme)`
- [ ] Test in **LM**: background white, border #d4d4d4, label #525252
- [ ] Test **hover**: background #fafafa, border #a3a3a3
- [ ] Test **focus**: border blue 2px, label blue
- [ ] Test **disabled**: grayed out appropriately

### Step 2.2: TextField in DK mode
- [ ] Switch theme to dark mode
- [ ] Test all states (base, hover, focus, disabled)
- [ ] Verify colors from darkCommon are applied

### Step 2.3: TextField in TDK mode
- [ ] Set theme to light, toolbar to dark
- [ ] Verify TextField still uses light mode colors (NOT dark)
- [ ] TextField should ignore toolbar mode

**Checkpoint:** TextField working in all 3 modes? → Continue

---

## Phase 3: Select (CustomSelect Component)

### Step 3.1: Verify CustomSelect styles
- [ ] Check `customSelectLight`, `customSelectDark`, `customSelectToolbarDark` are imported
- [ ] CustomSelect component correctly picks mode based on `isDarkMode` and `isDarkToolbar`
- [ ] Test CustomSelect in **LM**: border #d4d4d4, background white, label #525252
- [ ] Test **hover**: icon color, border hover
- [ ] Test **focus**: icon focus color, border focus color
- [ ] Test **menu**: margin-top 8px, border radius 8px, items hover/selected

### Step 3.2: CustomSelect in DK mode
- [ ] Switch to dark mode
- [ ] Test all states
- [ ] Verify **menu** uses dark colors: background #0A111B, border #1F3359

### Step 3.3: CustomSelect in TDK mode
- [ ] Set theme light, toolbar dark
- [ ] Test select shows dark toolbar colors (border black, icon #73ABFB, etc.)
- [ ] Verify **menu stays light** (background white, not #0A111B)

**Checkpoint:** CustomSelect working in all 3 modes? → Continue

---

## Phase 4: MUI Select (Native MUI Component)

### Step 4.1: Add MuiSelect override
- [ ] In `components.ts`, add MuiSelect styleOverrides
- [ ] Use same approach as CustomSelect but applied at theme level
- [ ] Test in **LM**: border radius 24px, colors from lightMode
- [ ] Test hover and focus states

### Step 4.2: MuiSelect in DK
- [ ] Switch to dark mode
- [ ] Test all states with darkCommon colors

### Step 4.3: MuiSelect menu styling
- [ ] Override MuiMenu to apply menu.border, menu.background from inputStyles
- [ ] Override MuiMenuItem to apply menu.item.base/hover/selected from inputStyles
- [ ] Test menu in LM and DK

**Checkpoint:** MuiSelect working? → Continue

---

## Phase 5: Date Pickers

### Step 5.1: Basic date picker styles
- [ ] Add MuiPickersTextField override using inputStyles
- [ ] Add MuiFormControl override for `.MuiPickersTextField-root`
- [ ] Test date picker input field in **LM**
- [ ] Test hover, focus states

### Step 5.2: Date picker icons
- [ ] Add MuiIconButton override for `.MuiPickersTextField-root .MuiIconButton-root`
- [ ] Use inputStyles.icon.base color
- [ ] Test icon colors in all modes

### Step 5.3: Date picker in DK
- [ ] Switch to dark mode
- [ ] Test all states
- [ ] Verify icon colors from darkCommon

### Step 5.4: Date picker popover
- [ ] Add MuiDateCalendar override if needed
- [ ] Test calendar popup styling
- [ ] Verify matches overall theme

**Checkpoint:** Date pickers working? → Continue

---

## Phase 6: Other Input Components

### Step 6.1: MuiInputBase
- [ ] Add override using inputStyles background and border
- [ ] Test in all modes

### Step 6.2: MuiInputLabel
- [ ] Add override using inputStyles label
- [ ] Test in all modes
- [ ] Verify focus state changes color

### Step 6.3: MuiOutlinedInput
- [ ] Add override for fieldset using inputStyles border
- [ ] Test in all modes

**Checkpoint:** All base input components working? → Continue

---

## Phase 7: Special Cases

### Step 7.1: Switch
- [ ] Review current MuiSwitch override
- [ ] Test checked/unchecked in LM and DK
- [ ] Adjust colors if needed using tokens

### Step 7.2: FormControlLabel
- [ ] Review current override
- [ ] Test in LM and DK
- [ ] Fix text color if needed

### Step 7.3: Checkboxes/Radio
- [ ] Add overrides if needed
- [ ] Test in all modes

**Checkpoint:** All special inputs working? → Continue

---

## Phase 8: Final Verification

### Step 8.1: Visual testing in LM
- [ ] Open app in LM
- [ ] Test all inputs on all pages
- [ ] Check FilterBar, forms, dialogs
- [ ] Verify no broken styles

### Step 8.2: Visual testing in DK
- [ ] Switch to dark mode
- [ ] Test all inputs on all pages
- [ ] Verify dark colors applied correctly
- [ ] Check menus are dark

### Step 8.3: Visual testing in TDK
- [ ] Switch to light theme, dark toolbar
- [ ] Test all inputs on all pages
- [ ] Verify toolbar inputs dark, menus light
- [ ] Check form inputs stay light

### Step 8.4: State testing
- [ ] Test hover states across all inputs
- [ ] Test focus states across all inputs
- [ ] Test disabled states across all inputs
- [ ] Test error states if applicable

**Final Checkpoint:** Everything working? → Done!

---

## Rollback Plan

If things break:
1. Restore `components.backup.ts` → `components.ts`
2. Identify which step broke things
3. Review that specific input type only
4. Fix and continue

---

## Key Principles

1. **One thing at a time** - Don't add multiple overrides at once
2. **Test immediately** - After each override, test it
3. **Verify modes** - LM, DK, TDK for each component
4. **Document issues** - If something doesn't work, note it before moving on
5. **Keep it simple** - Use inputStyles, don't create new color values

---

## Quick Reference

### Modes
- **LM (Light Mode)**: `theme.palette.mode === "light"` && `toolbar.mode !== "dark"`
- **DK (Dark Mode)**: `theme.palette.mode === "dark"`
- **TDK (Toolbar Dark)**: `theme.palette.mode === "light"` && `toolbar.mode === "dark"`

### Style Selection in components.ts
```typescript
const isDarkMode = theme.palette.mode === "dark";
const inputStyles = (
  applyStyles(base, [isDarkMode ? darkCommon : lightMode]) as InputStyleSpec[]
)[0];
```

### Style Selection in components (like CustomSelect)
```typescript
const isDarkToolbar = toolbar?.mode === "dark";
const isDarkMode = theme.palette.mode === "dark";

const styles = isDarkMode
  ? customSelectDark
  : isDarkToolbar
    ? customSelectToolbarDark
    : customSelectLight;
```
