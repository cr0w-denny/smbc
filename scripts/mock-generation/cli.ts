#!/usr/bin/env tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import fs from "fs";
import path from "path";
import yaml from "yaml";
import { MockGenerator, type MockConfig } from "./generator";

interface GenerateOptions {
  input: string;
  output: string;
  config?: MockConfig;
  packageName?: string;
  verbose?: boolean;
}

function parseOpenAPISpec(filePath: string): any {
  const content = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(content);
  } catch (error) {
    // Try YAML parsing if JSON fails
    try {
      return yaml.parse(content);
    } catch (yamlError) {
      throw new Error(`Failed to parse OpenAPI spec: ${error}`);
    }
  }
}

function generateMockFile(options: GenerateOptions) {
  const {
    input,
    output,
    config = {},
    packageName = "api",
    verbose = false,
  } = options;

  // Parse OpenAPI spec
  const specPath = path.resolve(input);
  if (!fs.existsSync(specPath)) {
    throw new Error(`OpenAPI spec not found at: ${specPath}`);
  }

  if (verbose) {
    console.log(`📖 Reading OpenAPI spec from: ${specPath}`);
  }

  const spec = parseOpenAPISpec(specPath);
  const generator = new MockGenerator(spec, config);

  if (verbose) {
    console.log(`🔍 Analyzing ${generator.getAllAnalyses().size} schemas...`);

    // Log analysis summary
    for (const [schemaName, analysis] of generator.getAllAnalyses()) {
      console.log(`  📋 ${schemaName}:`);
      console.log(`     - ${analysis.properties.length} properties`);
      console.log(`     - ${analysis.relationships.length} relationships`);
      console.log(
        `     - Patterns: ${analysis.patterns.map((p: any) => p.type).join(", ")}`,
      );
    }
  }

  // Generate mock functions only for schemas used in handlers
  const usedSchemas = new Set<string>();

  // Analyze which schemas are actually used in endpoints
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_method, operation] of Object.entries(pathItem as any)) {
      if (
        typeof operation === "object" &&
        operation &&
        "operationId" in operation
      ) {
        // Detect the main entity from the path
        const pathSegments = path.split("/").filter(Boolean);
        const entitySegment = pathSegments.find(
          (segment) => !segment.startsWith("{"),
        );

        if (entitySegment) {
          const entityName = generator.capitalize(
            generator.singularize(entitySegment),
          );
          const analysis = generator.getSchemaAnalysis(entityName);
          if (analysis) {
            usedSchemas.add(entityName);
          }
        }
      }
    }
  }

  // Generate only used mock functions
  const mockFunctions = Array.from(usedSchemas)
    .map((schemaName) => generator.generateMockFunction(schemaName))
    .join("\n\n");

  // Generate handlers for all operations
  const handlers: string[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem as any)) {
      if (
        typeof operation === "object" &&
        operation &&
        "operationId" in operation
      ) {
        const handler = generator.generateHandlersForOperation(
          path,
          method,
          operation,
        );
        if (handler) {
          handlers.push(handler);
        }
      }
    }
  }

  // Generate utility functions
  const utilityFunctions = `
// Utility functions
function delay(ms?: number) {
  if (ms !== undefined) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // If delay config is {min: 0, max: 0}, return immediately
  if (mockConfig.delay.min === 0 && mockConfig.delay.max === 0) {
    return Promise.resolve();
  }
  
  const delayTime = faker.number.int(mockConfig.delay);
  return new Promise(resolve => setTimeout(resolve, delayTime));
}`;

  // Generate configuration section
  const configSection = `// Enhanced mock configuration
export const mockConfig = {
  baseUrl: '${config.baseUrl || ""}',
  delay: ${JSON.stringify(config.delay || { min: 0, max: 0 })},
  errorRate: ${config.errorRate || 0},
  locale: '${config.locale || "en"}',
  dataSetSize: ${JSON.stringify(config.dataSetSize || { min: 10, max: 50 })},
  generateRelationships: ${config.generateRelationships !== false}
};

// Note: Faker locale configuration removed - use faker.locale directly if needed

// Seed faker for consistent results in tests
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  faker.seed(12345);
}`;

  // Generate import statements
  const imports = `// Auto-generated enhanced MSW mocks for ${packageName}
// Generated from: ${path.relative(process.cwd(), specPath)}
// 
// This file includes:
// - Schema-driven mock data generation
// - Intelligent field detection and faker mapping
// - Relationship handling
// - Advanced filtering and pagination
// - Comprehensive error simulation
//
// Generated with SMBC enhanced mock generator

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';`;

  // Generate schema documentation
  const schemaDocs = Array.from(generator.getAllAnalyses().entries())
    .map(([schemaName, analysis]) => {
      const props = analysis.properties
        .map(
          (p: any) =>
            `//   ${p.name}: ${p.type}${p.format ? ` (${p.format})` : ""} - ${p.semanticType}${p.isRequired ? " [required]" : ""}`,
        )
        .join("\n");

      const relationships =
        analysis.relationships.length > 0
          ? analysis.relationships
              .map(
                (r: any) =>
                  `//   ${r.type}: ${r.foreignKey} -> ${r.targetEntity}`,
              )
              .join("\n")
          : "//   No relationships detected";

      return `// Schema: ${schemaName}
${props}
// Relationships:
${relationships}`;
    })
    .join("\n\n");

  // Combine everything
  const mockFileContent = `${imports}

${configSection}

${utilityFunctions}

// =============================================================================
// SCHEMA ANALYSIS
// =============================================================================
${schemaDocs}

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================
${mockFunctions}

// =============================================================================
// REQUEST HANDLERS
// =============================================================================
export const handlers = [
${handlers.join(",\n\n")},

  // Health check endpoint
  http.get(\`\${mockConfig.baseUrl}/health\`, async () => {
    await delay();
    return HttpResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: '${packageName}',
      mockMode: true
    });
  }),

];

// Apply custom overrides if available
async function loadCustomOverrides() {
  try {
    const customModule = await import('./custom.js');
    if (customModule.customHandlers) {
      // Prepend custom handlers so they take precedence
      handlers.unshift(...customModule.customHandlers);
    }
    if (customModule.updateConfig) {
      Object.assign(mockConfig, customModule.updateConfig(mockConfig));
    }
  } catch {
    // No custom overrides available
  }
}

// Load custom overrides (non-blocking)
loadCustomOverrides().catch(() => {
  // Silently ignore if custom overrides fail to load
});

export default handlers;
`;

  // Ensure output directory exists
  const outputDir = path.dirname(output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the enhanced mock file
  fs.writeFileSync(output, mockFileContent);

  console.log(`✅ Mocks generated at: ${output}`);
  console.log(`📈 Generated ${handlers.length} handlers from schema analysis`);
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Enhanced MSW Mock Generator

Usage: tsx scripts/generate-mocks.ts <input> <output> [options]

Arguments:
  input     Path to OpenAPI specification (JSON or YAML)
  output    Output path for generated mock file

Options:
  --base-url <url>       Base URL for API endpoints (default: '')
  --package-name <name>  Package name for documentation (default: 'api')
  --error-rate <rate>    Error simulation rate 0-1 (default: 0)
  --locale <locale>      Faker locale (default: 'en')
  --verbose, -v          Verbose output with analysis details
  --help, -h             Show this help message

Examples:
  tsx scripts/generate-mocks.ts ./api.json ./mocks/generated.ts
  tsx scripts/generate-mocks.ts ./openapi.yaml ./src/mocks.ts --verbose
  tsx scripts/generate-mocks.ts ./spec.json ./mocks.ts --base-url "/api/v1" --error-rate 0.1
  `);
  process.exit(0);
}

if (args.length < 2) {
  console.error("Error: Input and output paths are required");
  console.log("Use --help for usage information");
  process.exit(1);
}

// Parse arguments
const [input, output] = args;
const options: GenerateOptions = { input, output };

// Parse options
for (let i = 2; i < args.length; i++) {
  const arg = args[i];
  const nextArg = args[i + 1];

  switch (arg) {
    case "--base-url":
      options.config = { ...options.config, baseUrl: nextArg };
      i++;
      break;
    case "--package-name":
      options.packageName = nextArg;
      i++;
      break;
    case "--error-rate":
      options.config = { ...options.config, errorRate: parseFloat(nextArg) };
      i++;
      break;
    case "--locale":
      options.config = { ...options.config, locale: nextArg };
      i++;
      break;
    case "--verbose":
    case "-v":
      options.verbose = true;
      break;
  }
}

try {
  generateMockFile(options);
} catch (error) {
  console.error("❌ Error generating mocks:", error);
  process.exit(1);
}