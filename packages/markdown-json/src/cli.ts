#!/usr/bin/env node

import { generateMarkdownJson } from './index.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: markdown-json <output-dir> <pattern1> [pattern2] ...');
    console.error('');
    console.error('Examples:');
    console.error('  markdown-json src/generated "README.md" "docs/**/*.md"');
    console.error('  markdown-json . "applets/*/*/README.md"');
    process.exit(1);
  }
  
  const outputDir = args[0];
  const searchPatterns = args.slice(1);
  
  if (searchPatterns.length === 0) {
    console.error('Error: At least one search pattern is required');
    process.exit(1);
  }
  
  try {
    await generateMarkdownJson(searchPatterns, outputDir);
  } catch (error) {
    console.error('Error generating markdown JSON:', error);
    process.exit(1);
  }
}

main();