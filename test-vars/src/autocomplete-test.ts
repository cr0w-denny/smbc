import { ui, color } from './tokens.js';

// This file demonstrates that TypeScript autocomplete works
// Try typing "ui." and you should see autocomplete suggestions

console.log('Testing autocomplete...');

// These should all have autocomplete and type checking:
const inputBg = ui.input.base.default.background();
const inputBorder = ui.input.base.default.borderColor();
const hoverBorder = ui.input.base.hover.borderColor();
const focusBg = ui.input.base.focus.background();

const textPrimary = color.text.primary();
const textSecondary = color.text.secondary();
const actionHover = color.action.hover();

console.log('All values:', {
  inputBg,
  inputBorder,
  hoverBorder,
  focusBg,
  textPrimary,
  textSecondary,
  actionHover
});

// This should cause a TypeScript error if uncommented:
// const invalid = ui.input.base.nonexistent.background();