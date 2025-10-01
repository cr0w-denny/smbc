#!/usr/bin/env node

// Test script to verify ui-core proxy system works as expected
import { ui, color, shadow, zIndex, typography, breakpoints, size } from '../dist/index.js';

console.log('🔬 Testing ui-core proxy system...\n');

// Test 1: Basic CSS variable generation
console.log('--- Test 1: CSS Variable Generation ---');
try {
  const brandPrimary = ui.color.brand.primary;
  const expectedCssVar = 'var(--ui-color-brand-primary)';

  console.log(`ui.color.brand.primary = "${brandPrimary}"`);
  console.log(`Expected: "${expectedCssVar}"`);
  console.log(`brandPrimary type: ${typeof brandPrimary}`);
  console.log(`expectedCssVar type: ${typeof expectedCssVar}`);
  console.log(`brandPrimary.length: ${brandPrimary.length}`);
  console.log(`expectedCssVar.length: ${expectedCssVar.length}`);
  console.log(`Match: ${brandPrimary === expectedCssVar}`);
  console.log(`String match: ${String(brandPrimary) === String(expectedCssVar)}`);
  console.log(`✓ CSS Variable Generation: ${String(brandPrimary) === String(expectedCssVar) ? 'PASS' : 'FAIL'}`);
} catch (error) {
  console.log(`❌ CSS Variable Generation: FAIL - ${error.message}`);
}

// Test 2: Automatic string conversion
console.log('\n--- Test 2: Automatic String Conversion ---');
try {
  const cardBackground = ui.card.base.default.background;
  const templateResult = `background-color: ${cardBackground};`;
  const expectedTemplate = 'background-color: var(--ui-card-base-default-background);';

  console.log(`Template literal: "${templateResult}"`);
  console.log(`Expected: "${expectedTemplate}"`);
  console.log(`✓ String Conversion: ${templateResult === expectedTemplate ? 'PASS' : 'FAIL'}`);
} catch (error) {
  console.log(`❌ String Conversion: FAIL - ${error.message}`);
}

// Test 3: Function call returns value (mock)
console.log('\n--- Test 3: Function Call Behavior ---');
try {
  const funcResult = ui.color.brand.primary();
  const isString = typeof funcResult === 'string';

  console.log(`ui.color.brand.primary() = "${funcResult}"`);
  console.log(`Type: ${typeof funcResult}`);
  console.log(`✓ Function Call: ${isString ? 'PASS' : 'FAIL'}`);
} catch (error) {
  console.log(`❌ Function Call: FAIL - ${error.message}`);
}

// Test 4: All top-level proxies exist
console.log('\n--- Test 4: All Top-Level Proxies ---');
const proxies = { ui, color, shadow, zIndex, typography, breakpoints, size };
let allProxiesExist = true;

for (const [name, proxy] of Object.entries(proxies)) {
  const exists = proxy !== undefined;
  const type = typeof proxy;
  console.log(`${name}: ${exists ? '✓' : '❌'} (type: ${type})`);
  if (!exists) allProxiesExist = false;
}
console.log(`✓ All Proxies Exist: ${allProxiesExist ? 'PASS' : 'FAIL'}`);

// Test 5: Color proxy paths
console.log('\n--- Test 5: Color Proxy Paths ---');
try {
  const colorTests = [
    { path: 'brand.tradGreen', expected: 'var(--color-brand-tradGreen)' },
    { path: 'neutral.gray500', expected: 'var(--color-neutral-gray500)' },
    { path: 'status.success', expected: 'var(--color-status-success)' }
  ];

  let colorTestsPassed = 0;
  for (const test of colorTests) {
    try {
      const result = String(eval(`color.${test.path}`));
      const passed = result === test.expected;
      console.log(`color.${test.path} = "${result}" ${passed ? '✓' : '❌'}`);
      if (passed) colorTestsPassed++;
    } catch (error) {
      console.log(`color.${test.path} = ERROR: ${error.message} ❌`);
    }
  }
  console.log(`✓ Color Paths: ${colorTestsPassed}/${colorTests.length} PASS`);
} catch (error) {
  console.log(`❌ Color Paths: FAIL - ${error.message}`);
}

// Test 6: UI component paths
console.log('\n--- Test 6: UI Component Paths ---');
try {
  const uiTests = [
    { path: 'button.primary.default.background', expected: 'var(--ui-button-primary-default-background)' },
    { path: 'input.base.default.borderColor', expected: 'var(--ui-input-base-default-borderColor)' },
    { path: 'tooltip.base.default.background', expected: 'var(--ui-tooltip-base-default-background)' },
    { path: 'switch.base.default.width', expected: 'var(--ui-switch-base-default-width)' },
    { path: 'switchThumb.base.default.background', expected: 'var(--ui-switchThumb-base-default-background)' }
  ];

  let uiTestsPassed = 0;
  for (const test of uiTests) {
    try {
      const result = String(eval(`ui.${test.path}`));
      const passed = result === test.expected;
      console.log(`ui.${test.path} = "${result}" ${passed ? '✓' : '❌'}`);
      if (passed) uiTestsPassed++;
    } catch (error) {
      console.log(`ui.${test.path} = ERROR: ${error.message} ❌`);
    }
  }
  console.log(`✓ UI Component Paths: ${uiTestsPassed}/${uiTests.length} PASS`);
} catch (error) {
  console.log(`❌ UI Component Paths: FAIL - ${error.message}`);
}

// Test 7: Other proxy types
console.log('\n--- Test 7: Other Proxy Types ---');
try {
  const otherTests = [
    { proxy: 'shadow', path: 'base', expected: 'var(--shadow-base)' },
    { proxy: 'zIndex', path: 'modal', expected: 'var(--zIndex-modal)' },
    { proxy: 'typography', path: 'fontFamily.primary', expected: 'var(--typography-fontFamily-primary)' },
    { proxy: 'breakpoints', path: 'md', expected: 'var(--breakpoints-md)' },
    { proxy: 'size', path: 'spacing["4"]', expected: 'var(--size-spacing-4)' }
  ];

  let otherTestsPassed = 0;
  for (const test of otherTests) {
    try {
      const result = String(eval(`${test.proxy}.${test.path}`));
      const passed = result === test.expected;
      console.log(`${test.proxy}.${test.path} = "${result}" ${passed ? '✓' : '❌'}`);
      if (passed) otherTestsPassed++;
    } catch (error) {
      console.log(`${test.proxy}.${test.path} = ERROR: ${error.message} ❌`);
    }
  }
  console.log(`✓ Other Proxies: ${otherTestsPassed}/${otherTests.length} PASS`);
} catch (error) {
  console.log(`❌ Other Proxies: FAIL - ${error.message}`);
}

console.log('\n🏁 Test completed!');