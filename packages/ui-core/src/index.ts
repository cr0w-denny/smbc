// Framework-agnostic design tokens for SMBC applications
// These tokens can be used by any frontend framework (React, Vue, Angular, etc.)

// Re-export all tokens from generated file
export * from "./tokens.generated";

// Re-export core UI types
export * from "./filter-types";

// Import all tokens to create organized structure
import * as tokens from "./tokens.generated";

function groupTokensByPrefix(tokenObj: Record<string, any>) {
  const groups: Record<string, any> = {};

  Object.entries(tokenObj).forEach(([key, value]) => {
    // Skip complex objects, only process simple string values
    if (typeof value !== 'string') {
      return;
    }

    // Handle different token naming patterns
    let parts: string[];

    if (key.match(/^[A-Z][a-z]+[A-Z]/)) {
      // Pattern like "ColorPrimary300" -> ["Color", "Primary", "300"]
      parts = key
        .split(/(?=[A-Z][a-z])|(?<=[a-z])(?=[A-Z])|(?<=[a-zA-Z])(?=\d)/)
        .filter((p) => p.length > 0);
    } else {
      // Fallback to original camelCase splitting
      parts = key.split(/(?=[A-Z])/).filter((p) => p.length > 0);
    }

    let current = groups;

    // Navigate/create nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].toLowerCase();
      if (!current[part]) current[part] = {};
      current = current[part];
    }

    const finalKey = parts[parts.length - 1];

    // Convert value to number if it's a pure numeric string
    const numeric = Number(value);
    current[finalKey] =
      !isNaN(numeric) && /^\d+(\.\d+)?$/.test(value) ? numeric : value;
  });

  return groups;
}

// Create organized token structure
const organizedTokens = groupTokensByPrefix(tokens);

// Export clean, indexable structures
export const colors = organizedTokens.color || {};
export const shadows = organizedTokens.shadow || {};
export const sizes = organizedTokens.size || {};
export const typography = organizedTokens.typography || {};
export const zIndex = organizedTokens.z || {};
export const semantic = organizedTokens.semantic || {};

// Convenience aliases
export const spacing = sizes.spacing || {};
export const borderRadius = sizes.borderradius || {};
export const breakpoints = sizes.breakpoint || {};

// All semantic functions removed - use direct token imports instead
