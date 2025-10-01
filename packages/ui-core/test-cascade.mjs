#!/usr/bin/env node

// Test the cascade resolution system
import { ui, modal, card } from './dist/index.js';

console.log('🧪 Testing cascade resolution system with scope overrides...\n');

// Test 1: Basic UI access (should work as before)
console.log('Test 1: Basic UI access');
console.log('ui.input.padding:', ui.input.padding.toString());
console.log('ui.input.borderColor:', ui.input.borderColor.toString());
console.log('ui.button.borderRadius:', ui.button.borderRadius.toString());
console.log();

// Test 2: Modal scope access - demonstrating overrides and fallbacks
console.log('Test 2: Modal scope access (with overrides)');
console.log('modal.input.padding:', modal.input.padding.toString()); // Should be "12px" (overridden)
console.log('modal.input.borderColor:', modal.input.borderColor.toString()); // Should fallback to UI
console.log('modal.button.borderRadius:', modal.button.borderRadius.toString()); // Should be "8px" (overridden)
console.log('modal.button.background:', modal.button.background.toString()); // Should fallback to UI
console.log();

// Test 3: Modal secondary variant cascade
console.log('Test 3: Modal secondary variant cascade');
const lightTheme = { palette: { mode: 'light' } };
const darkTheme = { palette: { mode: 'dark' } };

console.log('Debug: modal.input.secondary:', modal.input.secondary);
console.log('Debug: modal.input.secondary.borderColor:', modal.input.secondary.borderColor);

if (modal.input.secondary.borderColor) {
  console.log('modal.input.secondary.borderColor (light):', modal.input.secondary.borderColor(lightTheme)); // Should be "#000000"
  console.log('modal.input.secondary.borderColor (dark):', modal.input.secondary.borderColor(darkTheme)); // Should be "#ffffff"
} else {
  console.log('modal.input.secondary.borderColor: undefined');
}

if (modal.input.secondary.hover?.borderColor) {
  console.log('modal.input.secondary.hover.borderColor (light):', modal.input.secondary.hover.borderColor(lightTheme)); // Should be "#333333"
} else {
  console.log('modal.input.secondary.hover.borderColor: undefined');
}

if (modal.input.secondary.padding) {
  console.log('modal.input.secondary.padding:', modal.input.secondary.padding.toString()); // Should fallback to modal.input.padding = "12px"
} else {
  console.log('modal.input.secondary.padding: undefined');
}
console.log();

// Test 4: Card scope access
console.log('Test 4: Card scope access');
console.log('card.input.padding:', card.input.padding.toString()); // Should be "6px 8px"
console.log('card.input.fontSize:', card.input.fontSize.toString()); // Should be "12px"
console.log('card.input.borderColor:', card.input.borderColor.toString()); // Should fallback to UI
console.log();

// Test 5: Demonstrating full cascade hierarchy
console.log('Test 5: Cascade hierarchy demonstration');
console.log('UI has no fontSize for input, checking fallback behavior...');
console.log('ui.input.fontSize:', ui.input.fontSize?.toString() || 'undefined');
console.log('modal.input.fontSize:', modal.input.fontSize?.toString() || 'undefined'); // Should fallback to undefined
console.log('card.input.fontSize:', card.input.fontSize.toString()); // Should be "12px" (card override)
console.log();

console.log('✅ Cascade resolution system test completed!');