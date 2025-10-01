// Framework-agnostic design tokens for SMBC applications with proxy system
export * from "./tokenResolver.js";
export * from "./proxy.js";
export * from "./cssGenerator.js";
export * from "./filter-types.js";
export * from "./fieldTransformers.js";

// Export tokens
import { tokens } from "./tokens.js";
export { tokens };

// Export ALL top-level token nodes as proxies (following test-vars pattern)
export { ui, color, shadow, zIndex, typography, breakpoints, size, layout } from "./proxy.js";