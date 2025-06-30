#!/usr/bin/env tsx

// CLI tool for generating mocks using the template-based approach
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { TemplateMockGenerator, type TemplateConfig } from './template-generator.js';

interface CLIOptions {
  input: string;
  output: string;
  config?: string;
  baseUrl?: string;
  errorRate?: number;
  verbose?: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    input: '',
    output: '',
  };

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--input':
      case '-i':
        options.input = value;
        break;
      case '--output':
      case '-o':
        options.output = value;
        break;
      case '--config':
      case '-c':
        options.config = value;
        break;
      case '--base-url':
        options.baseUrl = value;
        break;
      case '--error-rate':
        options.errorRate = parseFloat(value);
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        i--; // No value for verbose flag
        break;
      default:
        console.warn(`Unknown flag: ${flag}`);
    }
  }

  return options;
}

function loadConfig(configPath?: string): TemplateConfig {
  const defaultConfig: TemplateConfig = {
    baseUrl: '',
    delay: { min: 0, max: 200 },
    errorRate: 0.05,
    dataSetSize: { min: 10, max: 50 },
    generateRelationships: true,
  };

  if (!configPath) {
    return defaultConfig;
  }

  try {
    const configFile = readFileSync(resolve(configPath), 'utf-8');
    const userConfig = JSON.parse(configFile);
    return { ...defaultConfig, ...userConfig };
  } catch (error) {
    console.warn(`Could not load config from ${configPath}:`, error);
    return defaultConfig;
  }
}

function loadOpenAPISpec(inputPath: string): any {
  try {
    const specContent = readFileSync(resolve(inputPath), 'utf-8');
    return JSON.parse(specContent);
  } catch (error) {
    console.error(`Failed to load OpenAPI spec from ${inputPath}:`, error);
    process.exit(1);
  }
}

function ensureDirectoryExists(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    const { mkdirSync } = require('fs');
    mkdirSync(dir, { recursive: true });
  }
}

function main(): void {
  const options = parseArgs();

  if (!options.input || !options.output) {
    console.error(`
Usage: generate --input <spec.json> --output <handlers.ts> [options]

Options:
  --input, -i       Path to OpenAPI specification file (required)
  --output, -o      Path to output TypeScript file (required)
  --config, -c      Path to configuration JSON file
  --base-url        Base URL for mock endpoints
  --error-rate      Error rate for mock responses (0.0-1.0)
  --verbose, -v     Enable verbose logging

Examples:
  # Basic usage
  generate -i api.json -o src/mocks/handlers.ts

  # With custom config
  generate -i api.json -o src/mocks/handlers.ts -c mock-config.json

  # With inline options
  generate -i api.json -o src/mocks/handlers.ts --base-url /api/v1 --error-rate 0.1
`);
    process.exit(1);
  }

  if (options.verbose) {
    console.log('🚀 Starting template-based mock generation...');
    console.log(`📖 Input spec: ${options.input}`);
    console.log(`📝 Output file: ${options.output}`);
  }

  // Load configuration
  let config = loadConfig(options.config);
  
  // Override with CLI options
  if (options.baseUrl) config.baseUrl = options.baseUrl;
  if (options.errorRate !== undefined) config.errorRate = options.errorRate;

  if (options.verbose) {
    console.log('⚙️ Configuration:', JSON.stringify(config, null, 2));
  }

  // Load OpenAPI spec
  const spec = loadOpenAPISpec(options.input);

  if (options.verbose) {
    console.log(`📋 Loaded spec: ${spec.info?.title || 'Unknown'} v${spec.info?.version || 'Unknown'}`);
  }

  // Generate mocks
  const generator = new TemplateMockGenerator(spec, config);
  const mockCode = generator.generateMockHandlers();

  // Ensure output directory exists
  ensureDirectoryExists(options.output);

  // Write output
  writeFileSync(resolve(options.output), mockCode, 'utf-8');

  console.log(`✅ Mock handlers generated successfully!`);
  console.log(`📂 Output written to: ${resolve(options.output)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}