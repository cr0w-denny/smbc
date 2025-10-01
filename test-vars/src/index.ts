import { ui, color, setOutputMode, getAllTokenPaths, generateCssVars } from './tokens.js';

console.log('=== Testing Token Proxy System ===\n');

// Test CSS variable mode (no args)
console.log('--- CSS VARIABLE MODE (no args) ---');
console.log('ui.input.base.default.background():', ui.input.base.default.background());
console.log('ui.input.base.hover.borderColor():', ui.input.base.hover.borderColor());
console.log('color.text.primary():', color.text.primary());
console.log('color.action.hover():', color.action.hover());

console.log('\n--- VALUE MODE (with params) ---');
console.log('ui.input.base.default.background(false):', ui.input.base.default.background(false));
console.log('ui.input.base.hover.borderColor(true):', ui.input.base.hover.borderColor(true));
console.log('color.text.primary(false):', color.text.primary(false));
console.log('color.action.hover(true):', color.action.hover(true));

console.log('\n--- PATH MODE (with "path" param) ---');
console.log('ui.input.base.default.background("path"):', ui.input.base.default.background('path'));
console.log('ui.input.base.hover.borderColor("path"):', ui.input.base.hover.borderColor('path'));
console.log('color.text.primary("path"):', color.text.primary('path'));
console.log('color.action.hover("path"):', color.action.hover('path'));

console.log('\n--- ALL TOKEN PATHS ---');
const paths = getAllTokenPaths();
paths.forEach(path => console.log(path));

console.log('\n--- CSS VARIABLES ---');
const cssVars = generateCssVars();
cssVars.forEach(cssVar => console.log(cssVar));