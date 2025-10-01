#!/usr/bin/env node

// Debug script to test the actual theme creation
import { ui, color } from '@smbc/ui-core';
import { createCssVarPalette } from './dist/index.js';

console.log('🔍 Debugging MUI theme creation...\n');

console.log('--- ui-core imports ---');
console.log('ui:', typeof ui);
console.log('color:', typeof color);

console.log('\n--- Testing ui.color.brand.primary ---');
try {
  const brandPrimary = ui.color.brand.primary;
  console.log('ui.color.brand.primary:', brandPrimary);
  console.log('Type:', typeof brandPrimary);
  console.log('String value:', String(brandPrimary));
  console.log('Is undefined?:', brandPrimary === undefined);
  console.log('Is null?:', brandPrimary === null);
} catch (error) {
  console.error('Error accessing ui.color.brand.primary:', error.message);
}

console.log('\n--- Testing createCssVarPalette ---');
try {
  const palette = createCssVarPalette();
  console.log('Palette created successfully');
  console.log('Primary main:', palette.primary.main);
  console.log('Primary main type:', typeof palette.primary.main);
  console.log('Primary main string:', String(palette.primary.main));
} catch (error) {
  console.error('Error creating palette:', error.message);
  console.error('Stack:', error.stack);
}