// Custom mock overrides
// This file is optional and can be used to override or extend generated mocks
//
// Example usage:
// export const customHandlers = [
//   // Add your custom MSW handlers here
// ];
//
// export function updateConfig(config) {
//   // Modify configuration if needed
//   return {
//     ...config,
//     // your custom config overrides
//   };
// }

// Currently no custom overrides - this is a placeholder file
export const customHandlers: any[] = [];
export function updateConfig(config: any) {
  return config;
}
