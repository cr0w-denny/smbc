/**
 * Registry of available applets for create-host command
 * Only whitelisted applets will be offered during host creation
 */

export interface AppletRegistryEntry {
  id: string;
  name: string;
  description: string;
  importPath: string;
  permissions: string[]; // List of permission keys available in this applet
  category?: 'core' | 'business' | 'utility' | 'demo';
  icon?: string;
}

/**
 * Whitelisted applets available for selection during host creation
 */
export const AVAILABLE_APPLETS: AppletRegistryEntry[] = [
  {
    id: "user-management",
    name: "User Management",
    description: "Manage users, roles, and permissions",
    importPath: "@smbc/user-management-mui",
    permissions: ["VIEW_USERS", "CREATE_USERS", "EDIT_USERS", "DELETE_USERS", "MANAGE_ROLES"],
    category: "core",
    icon: "People"
  },
  {
    id: "product-catalog",
    name: "Product Catalog",
    description: "Browse and manage product catalog",
    importPath: "@smbc/product-catalog-mui",
    permissions: ["VIEW_PRODUCTS", "CREATE_PRODUCTS", "EDIT_PRODUCTS", "DELETE_PRODUCTS"],
    category: "business",
    icon: "Inventory"
  },
  {
    id: "hello",
    name: "Hello World",
    description: "Simple greeting applet for testing",
    importPath: "@smbc/hello-mui",
    permissions: ["VIEW_ROUTE_ONE", "VIEW_ROUTE_TWO", "VIEW_ROUTE_THREE"],
    category: "demo",
    icon: "EmojiEmotions"
  },
];

/**
 * Get applet registry entry by ID
 */
export function getAppletById(id: string): AppletRegistryEntry | undefined {
  return AVAILABLE_APPLETS.find(applet => applet.id === id);
}

/**
 * Get applets by category
 */
export function getAppletsByCategory(category: AppletRegistryEntry['category']): AppletRegistryEntry[] {
  return AVAILABLE_APPLETS.filter(applet => applet.category === category);
}

/**
 * Generate import statement for an applet
 */
export function generateAppletImport(applet: AppletRegistryEntry): string {
  const varName = applet.id.replace(/-/g, '') + 'Applet';
  return `import ${varName} from "${applet.importPath}";`;
}

/**
 * Generate unified applet configuration for createPermissionRequirements() call
 * Maps all applet permissions to "User" role by default - hosts should customize this
 */
export function generateAppletConfig(applet: AppletRegistryEntry): string {
  const varName = applet.id.replace(/-/g, '') + 'Applet';
  
  // Default all permissions to "User" role - hosts should customize these mappings
  const permissions = applet.permissions
    .map(perm => `      ${perm}: "User"`)
    .join(',\n');
    
  return `  "${applet.id}": {
    applet: ${varName},
    permissions: {
${permissions}
    },
  }`;
}

/**
 * Generate mountApplet call for APPLETS array
 */
export function generateMountedApplet(applet: AppletRegistryEntry): string {
  const varName = applet.id.replace(/-/g, '') + 'Applet';
  const iconImport = applet.icon ? `${applet.icon}Icon` : 'undefined';
  
  return `  mountApplet(${varName}, {
    id: "${applet.id}",
    label: "${applet.name}",
    path: "/${applet.id}",
    icon: ${iconImport},
    permissions: [${varName}.permissions.${applet.permissions[0]}],
  })`;
}