/**
 * @smbc/openapi-msw
 * 
 * Generate MSW mock handlers from OpenAPI specifications
 */

// Re-export MSW setup utilities (browser-safe)
export { setupMSW, stopMSW, resetMSW, addHandlers } from './setup.js';
export type { MockConfig } from './setup.js';

// Note: TypeScriptMockGenerator is Node.js only and not exported here
// It's available via the CLI or by importing directly from './generator.js'