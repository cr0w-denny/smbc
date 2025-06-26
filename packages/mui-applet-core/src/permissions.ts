// Utility for applets to declare their permissions
export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category?: string;
}

export interface AppletPermissionSet {
  [key: string]: PermissionDefinition;
}

// Helper to create type-safe permission declarations with preserved autocomplete
export const definePermissions = <T extends Record<string, string>>(
  appletId: string,
  permissions: T
): { [K in keyof T]: PermissionDefinition } => {
  const result = {} as { [K in keyof T]: PermissionDefinition };
  
  for (const [key, description] of Object.entries(permissions)) {
    (result as any)[key] = {
      id: `${appletId}:${key.toLowerCase()}`,
      name: key,
      description,
    };
  }
  
  return result;
};