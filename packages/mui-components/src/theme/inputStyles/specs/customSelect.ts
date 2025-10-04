import type { InputStyleSpec } from "../types";
import { applyStyles } from "../applyStyles";
import { base, lightMode, darkCommon } from "./base";

/**
 * CustomSelect-specific overrides for light mode
 */
const selectLightOverrides: Partial<InputStyleSpec> = {
  // Currently using all base styles - add overrides here if needed
};

/**
 * CustomSelect-specific overrides for dark mode (DK)
 */
const selectDarkOverrides: Partial<InputStyleSpec> = {
  // TODO: Add DK-specific CustomSelect overrides if needed
};

/**
 * CustomSelect-specific overrides for toolbar dark mode (TDK)
 */
const selectToolbarDarkOverrides: Partial<InputStyleSpec> = {
  label: {
    base: { color: "#9CA3AF" },
    focus: { color: "#73ABFB" },
  },
  icon: {
    base: { color: "#73ABFB" },
    focus: { color: "#73ABFB" },
  },
  border: {
    base: { borderColor: "#000000" },
    hover: { borderColor: "#000000" },
    focus: { borderColor: "#73ABFB" },
  },
  background: {
    base: { backgroundColor: "#1D2427" },
    hover: { backgroundColor: "#1D2427" },
    focus: { backgroundColor: "#1D2427" },
  },
  text: {
    base: { color: "#FFFFFF" },
  },
};

/**
 * Generate final CustomSelect style specs
 *
 * Hierarchy:
 * - base (universal input defaults)
 * - LM: base + lightMode + selectLightOverrides
 * - DK: base + darkCommon + selectDarkOverrides
 * - TDK: base + lightMode + selectToolbarDarkOverrides (no darkCommon - menu stays light!)
 */
const specs = applyStyles(base, [
  [lightMode, selectLightOverrides],
  [darkCommon, selectDarkOverrides],
  [lightMode, selectToolbarDarkOverrides],
]) as InputStyleSpec[];

export const [customSelectLight, customSelectDark, customSelectToolbarDark] =
  specs;
