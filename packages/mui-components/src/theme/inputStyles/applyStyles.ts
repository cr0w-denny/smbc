import type { InputStyleSpec } from "./types";

/**
 * Recursive type for style layers that can be nested
 */
type StyleLayer = Partial<InputStyleSpec> | StyleLayer[];

/**
 * Recursive style composition function with automatic nested array handling
 *
 * Merges all arguments except the last, then fans out to the last argument:
 * - If last arg is array: fans out to each element, returns array
 * - If last arg is single spec: merges with it, returns single spec
 * - Nested arrays are automatically processed recursively
 *
 * @param args - Style specs/arrays to merge, with last arg being the fan-out target
 * @returns Single merged spec, or array of specs (based on last arg)
 */
export function applyStyles(
  ...args: StyleLayer[]
): InputStyleSpec | InputStyleSpec[] {
  if (args.length === 0) {
    return {} as InputStyleSpec;
  }

  // Deep merge utility
  const deepMerge = (target: any, source: any): any => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    return output;
  };

  const isObject = (item: any): boolean => {
    return item && typeof item === "object" && !Array.isArray(item);
  };

  // Deep merge helper
  const merge = (...specs: Partial<InputStyleSpec>[]): InputStyleSpec => {
    return specs.reduce((acc, spec) => deepMerge(acc, spec), {} as InputStyleSpec);
  };

  // Process layer: if array, recursively apply; otherwise return as-is
  const processLayer = (layer: StyleLayer): Partial<InputStyleSpec> => {
    return Array.isArray(layer)
      ? (applyStyles(...layer) as Partial<InputStyleSpec>)
      : layer;
  };

  // Last arg is the fan-out target
  const fanOutTarget = args[args.length - 1];
  const mergeLayers = args.slice(0, -1);

  // Merge all layers except last
  const processedMergeLayers = mergeLayers.map(processLayer);
  const mergedBase =
    processedMergeLayers.length > 0
      ? merge(...processedMergeLayers)
      : ({} as Partial<InputStyleSpec>);

  // If last arg is array, fan out; otherwise merge with it
  if (Array.isArray(fanOutTarget)) {
    return fanOutTarget.map((mode) => {
      const processedMode = processLayer(mode);
      return merge(mergedBase, processedMode);
    });
  } else {
    const processedTarget = processLayer(fanOutTarget);
    return merge(mergedBase, processedTarget);
  }
}
