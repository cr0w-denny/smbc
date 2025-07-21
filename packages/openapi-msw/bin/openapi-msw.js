#!/usr/bin/env node

/**
 * CLI tool for generating MSW mock handlers from OpenAPI specifications
 */

import { program } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import to avoid ESM issues
async function generateMocks(options) {
  const { TypeScriptMockGenerator } = await import('../dist/generator.js');
  
  const { input, output, baseUrl = '', minSize = 100, maxSize = 250, errorRate = 0.15 } = options;
  
  // Read OpenAPI spec
  if (!existsSync(input)) {
    console.error(chalk.red(`Input file not found: ${input}`));
    process.exit(1);
  }
  
  let spec;
  try {
    const content = readFileSync(input, 'utf-8');
    spec = JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Failed to parse OpenAPI spec: ${error.message}`));
    process.exit(1);
  }
  
  // Create output directory if needed
  const outputDir = dirname(output);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate mocks
  const config = {
    baseUrl,
    dataSetSize: { min: minSize, max: maxSize },
    errorRate
  };
  
  try {
    const generator = new TypeScriptMockGenerator(spec, config);
    const code = generator.generate();
    
    writeFileSync(output, code);
    console.log(chalk.green(`✅ Generated mock handlers: ${output}`));
    
    // Copy MSW service worker if needed
    const serviceWorkerPath = join(outputDir, '../public/mockServiceWorker.js');
    if (!existsSync(serviceWorkerPath)) {
      console.log(chalk.yellow('\n⚠️  Don\'t forget to copy the MSW service worker to your public directory:'));
      console.log(chalk.cyan(`   npx msw init public/ --save`));
    }
    
    // Show usage instructions
    console.log(chalk.blue('\n📚 Usage instructions:'));
    console.log(chalk.gray('   1. Import the generated handlers in your app'));
    console.log(chalk.gray(`   2. Setup MSW with: setupMSW(handlers)`));
    console.log(chalk.gray('   3. Make sure mockServiceWorker.js is in your public directory'));
    
  } catch (error) {
    console.error(chalk.red(`Failed to generate mocks: ${error.message}`));
    process.exit(1);
  }
}

program
  .name('openapi-msw')
  .description('Generate MSW mock handlers from OpenAPI specifications')
  .version('0.0.1')
  .requiredOption('-i, --input <path>', 'Path to OpenAPI spec file (JSON)')
  .requiredOption('-o, --output <path>', 'Output path for generated TypeScript file')
  .option('-b, --base-url <url>', 'Base URL for API endpoints', '')
  .option('--min-size <number>', 'Minimum dataset size', '100')
  .option('--max-size <number>', 'Maximum dataset size', '250')
  .option('--error-rate <number>', 'Error rate (0-1)', '0.15')
  .action(async (options) => {
    await generateMocks({
      ...options,
      minSize: parseInt(options.minSize),
      maxSize: parseInt(options.maxSize),
      errorRate: parseFloat(options.errorRate)
    });
  });

program.parse();