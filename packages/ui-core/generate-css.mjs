import { generateCSSVariables } from './dist/cssGenerator.js';
import fs from 'fs';

const css = generateCSSVariables();
fs.writeFileSync('./tokens.css', css);
console.log('Generated tokens.css');