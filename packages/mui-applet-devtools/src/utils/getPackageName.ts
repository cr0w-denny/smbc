/**
 * Utility function to derive package name from applet ID and framework
 * 
 * @param appletId - The applet ID (e.g., "hello", "user-management")
 * @param framework - The framework (defaults to "mui")
 * @returns The package name (e.g., "@smbc/hello-mui", "@smbc/user-management-mui")
 */
export function getPackageName(appletId: string, framework: string = 'mui'): string {
  return `@smbc/${appletId}-${framework}`;
}