#!/usr/bin/env node
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, resolve, dirname } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { CORE_DEPS, SMBC_PACKAGE_VERSIONS } from "@smbc/applet-meta";
import prompts from "prompts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get package versions (now pre-generated at build time)
function getPackageVersions() {
  return SMBC_PACKAGE_VERSIONS;
}

// Function to get overrides from monorepo root
async function getMonorepoOverrides() {
  try {
    // Try to find root package.json by going up directories
    let currentDir = __dirname;
    let rootPackageJsonPath = null;

    for (let i = 0; i < 5; i++) {
      const testPath = join(currentDir, "package.json");
      if (existsSync(testPath)) {
        const content = JSON.parse(await readFile(testPath, "utf8"));
        // Check if this is the monorepo root by looking for workspaces
        if (content.workspaces) {
          rootPackageJsonPath = testPath;
          break;
        }
      }
      currentDir = dirname(currentDir);
    }

    if (!rootPackageJsonPath) {
      return null;
    }

    const rootPackage = JSON.parse(await readFile(rootPackageJsonPath, "utf8"));
    return rootPackage.overrides || null;
  } catch (error) {
    console.warn("Could not read overrides from monorepo root");
    return null;
  }
}

const TEMPLATES = {
  basic: {
    description: "Basic host app with minimal setup",
    dependencies: [
      "@smbc/applet-core",
      "@smbc/applet-host",
      "@smbc/applet-meta",
      "@smbc/ui-core",
      "@smbc/dataview",
      "@mui/material",
      "@emotion/react",
      "@emotion/styled",
      "@tanstack/react-query",
      "react",
      "react-dom",
    ],
    devDependencies: [
      "@smbc/applet-cli",
      "@types/react",
      "@types/react-dom",
      "@vitejs/plugin-react",
      "typescript",
      "vite",
    ],
  },
  "mui-devtools": {
    description:
      "Full-featured host app with MUI dev tools and mock generation",
    dependencies: [
      "@smbc/applet-core",
      "@smbc/applet-host",
      "@smbc/applet-meta",
      "@smbc/mui-applet-core",
      "@smbc/mui-applet-devtools",
      "@smbc/mui-components",
      "@smbc/ui-core",
      "@smbc/dataview",
      "@smbc/openapi-msw",
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "react",
      "react-dom",
      "msw",
    ],
    devDependencies: [
      "@smbc/applet-cli",
      "@smbc/vite-config",
      "@types/react",
      "@types/react-dom",
      "@vitejs/plugin-react",
      "typescript",
      "vite",
      "tsx",
    ],
  },
};
const BASIC_APP_TSX = `import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppletHost, AppletRouter } from "@smbc/applet-host";
import { APPLETS, ROLE_CONFIG, DEMO_USER } from "./applet.config";

const queryClient = new QueryClient();
const theme = createTheme();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppletHost applets={APPLETS} roleConfig={ROLE_CONFIG} user={DEMO_USER}>
          <AppletRouter />
        </AppletHost>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
`;
const MUI_DEVTOOLS_APP_TSX = `import { MuiHostApp } from "@smbc/mui-applet-devtools";
import { APPLETS, ROLE_CONFIG } from "./applet.config";
import { allHandlers } from "./generated/mocks";

const DEMO_USER = {
  id: "1",
  email: "staff@example.com",
  name: "Demo Staff",
  roles: ["Admin"],
  preferences: {
    theme: "light" as const,
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
  },
};

// Global constant injected by Vite at build time
declare const __APPLET_VERSIONS__: Record<string, string>;

export function App() {
  // Add version info to all applets based on their packageName
  const appletsWithVersions = APPLETS.map((applet) => {
    const version = applet.packageName && __APPLET_VERSIONS__[applet.packageName] 
      ? __APPLET_VERSIONS__[applet.packageName]
      : (applet.version || "");
    
    return {
      ...applet,
      version,
    };
  });

  return (
    <MuiHostApp
      applets={appletsWithVersions}
      roleConfig={ROLE_CONFIG}
      demoUser={DEMO_USER}
      appName="My Host App"
      drawerWidth={320}
      mswHandlers={allHandlers}
      permissionMapping={{}}
      disableMSW={import.meta.env.VITE_DISABLE_MSW === "true"}
    />
  );
}
`;
const BASIC_CONFIG_TS = `import type { RoleConfig, AppletMount } from "@smbc/applet-core";
import {
  generatePermissionMappings,
  createPermissionRequirements,
} from "@smbc/applet-core";
import { mountApplet } from "@smbc/applet-host";

// =============================================================================
// DEMO USER CONFIGURATION
// =============================================================================

export const DEMO_USER = {
  id: "1",
  email: "user@example.com",
  name: "Demo User",
  roles: ["User"] as const,
  preferences: {
    theme: "light" as const,
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      desktop: true,
    },
  },
};

// =============================================================================
// HOST CONFIGURATION
// =============================================================================

export const HOST_ROLES = ["Guest", "User", "Admin"] as const;
export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// APPLET CONFIGURATION
// =============================================================================

// TODO: Import your applets here
// import usageStatsApplet from "@smbc/usage-stats-mui";

export const APPLETS: AppletMount[] = [
  // TODO: Mount your applets here
  // mountApplet(usageStatsApplet, {
  //   id: "usage-stats",
  //   label: "Usage Stats",
  //   path: "/usage-stats",
  //   icon: BarChart,
  //   permissions: [],
  //   version: "1.0.0",
  // }),
];

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

const permissionRequirements = createPermissionRequirements({
  // TODO: Configure your permission requirements here
});

export const ROLE_CONFIG: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements
  ),
};
`;
const MUI_DEVTOOLS_CONFIG_TS = `import type { RoleConfig, AppletMount, User } from "@smbc/applet-core";
import {
  createPermissionRequirements,
  generatePermissionMappings,
  createMinRole,
} from "@smbc/applet-core";
import { mountApplet } from "@smbc/applet-host";

// TODO: Import your applets here
// import usageStatsApplet from "@smbc/usage-stats-mui";
// import { Analytics as AnalyticsIcon } from "@mui/icons-material";

// =============================================================================
// HOST APPLICATION ROLES
// =============================================================================

export const HOST_ROLES = [
  "Guest",
  "Customer", 
  "Staff",
  "Manager",
  "Admin",
  "SuperAdmin",
] as const;

export type HostRole = (typeof HOST_ROLES)[number];

// =============================================================================
// PERMISSION CONFIGURATION
// =============================================================================

const minRole = createMinRole(HOST_ROLES);

// Define minimum required roles for each permission
const permissionRequirements = createPermissionRequirements({
  // TODO: Configure your permission requirements here
  // "usage-stats": minRole(usageStatsApplet, {
  //   VIEW_USAGE_STATS: "Manager",
  //   EXPORT_USAGE_DATA: "Admin",
  // }),
});

// Auto-generate the verbose permission mappings
export const ROLE_CONFIG: RoleConfig = {
  roles: [...HOST_ROLES],
  permissionMappings: generatePermissionMappings(
    HOST_ROLES,
    permissionRequirements,
  ),
};

// =============================================================================
// APPLET DEFINITIONS
// =============================================================================

export const APPLETS: AppletMount[] = [
  // TODO: Mount your applets here
  // mountApplet(usageStatsApplet, {
  //   id: "usage-stats",
  //   label: "Usage Analytics", 
  //   path: "/usage-stats",
  //   icon: AnalyticsIcon,
  //   permissions: [usageStatsApplet.permissions.VIEW_USAGE_STATS],
  //   version: "1.0.0",
  // }),
];
`;
const PACKAGE_JSON_TEMPLATE = (name, template, overrides, versions) => ({
  name,
  private: true,
  version: "0.0.0",
  type: "module",
  smbc: {
    host: true,
  },
  scripts: {
    dev: "vite",
    build: "tsc -b && vite build",
    lint: "eslint .",
    preview: "vite preview",
    ...(template === "mui-devtools"
      ? {
          setup: "applet-setup && generate-mocks",
          "generate-mocks": "generate-mocks",
        }
      : {}),
  },
  dependencies: Object.fromEntries(
    TEMPLATES[template].dependencies.map((dep) => [
      dep,
      dep.startsWith("@smbc/")
        ? versions[dep] || "latest"
        : CORE_DEPS[dep] || "latest",
    ]),
  ),
  devDependencies: Object.fromEntries(
    TEMPLATES[template].devDependencies.map((dep) => [
      dep,
      dep.startsWith("@smbc/")
        ? versions[dep] || "latest"
        : CORE_DEPS[dep] || "latest",
    ]),
  ),
  ...(template === "mui-devtools"
    ? {
        msw: {
          workerDirectory: ["public"],
        },
      }
    : {}),
  // Add explicit overrides to help npm resolve peer dependencies on Windows
  overrides: {
    ...(overrides || {}),
    "@tanstack/react-query": CORE_DEPS["@tanstack/react-query"] || "^5.0.0"
  },
});
const VITE_CONFIG_BASIC = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;
const VITE_CONFIG_MUI_DEVTOOLS = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { suppressUseClientWarnings, injectAppletVersions } from "@smbc/vite-config";

export default defineConfig({
  plugins: [react(), suppressUseClientWarnings()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },
  define: {
    ...injectAppletVersions(),
    // Allow disabling MSW via environment variable
    "import.meta.env.VITE_DISABLE_MSW": process.env.VITE_DISABLE_MSW
      ? JSON.stringify(process.env.VITE_DISABLE_MSW)
      : JSON.stringify("false"),
  },
});
`;
const MAIN_TSX = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;
const MAIN_TSX_MUI_DEVTOOLS = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import "swagger-ui-react/swagger-ui.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;
const INDEX_HTML = (title) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
const TSCONFIG_JSON = {
  compilerOptions: {
    target: "ES2020",
    useDefineForClassFields: true,
    lib: ["ES2020", "DOM", "DOM.Iterable"],
    module: "ESNext",
    skipLibCheck: true,
    moduleResolution: "bundler",
    allowImportingTsExtensions: true,
    isolatedModules: true,
    moduleDetection: "force",
    noEmit: true,
    jsx: "react-jsx",
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedSideEffectImports: true,
  },
  include: ["src"],
};
const VITE_ENV_D_TS = `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly MODE: string
  readonly PROD: boolean
  readonly SSR: boolean
  readonly VITE_DISABLE_MSW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`;
async function createHostApp(options) {
  const { name, directory = name, template = "mui-devtools" } = options;
  const targetDir = resolve(process.cwd(), directory);
  console.log(`🚀 Creating host app "${name}" with ${template} template...`);

  // Get and display package versions
  const versions = getPackageVersions();
  const templateDeps = [
    ...TEMPLATES[template].dependencies,
    ...TEMPLATES[template].devDependencies,
  ].filter((dep) => dep.startsWith("@smbc/"));

  if (Object.keys(versions).length > 0) {
    console.log("\n📦 Using @smbc package versions:");

    const foundVersions = [];
    const missingVersions = [];

    for (const pkg of templateDeps) {
      if (versions[pkg]) {
        foundVersions.push(`  ${pkg}: ${versions[pkg]}`);
      } else {
        missingVersions.push(`  ${pkg}: latest (version not found)`);
      }
    }

    foundVersions.forEach((line) => console.log(line));
    if (missingVersions.length > 0) {
      console.log('  Missing versions (will use "latest"):');
      missingVersions.forEach((line) => console.log(line));
    }
    console.log("");
  } else if (templateDeps.length > 0) {
    console.log(
      '\n⚠️  No @smbc package versions found - all will use "latest"',
    );
    templateDeps.forEach((pkg) => console.log(`  ${pkg}: latest`));
    console.log("");
  }

  // Check if directory exists
  if (existsSync(targetDir)) {
    throw new Error(`Directory ${targetDir} already exists`);
  }
  // Get overrides from monorepo root
  const overrides = await getMonorepoOverrides();
  if (overrides && Object.keys(overrides).length > 0) {
    console.log("\n📌 Copying overrides from monorepo:");
    Object.entries(overrides).forEach(([pkg, version]) => {
      console.log(`  ${pkg}: ${version}`);
    });
  }

  // Create directory structure
  await mkdir(targetDir, { recursive: true });
  await mkdir(join(targetDir, "src"), { recursive: true });
  await mkdir(join(targetDir, "public"), { recursive: true });
  // Write package.json
  await writeFile(
    join(targetDir, "package.json"),
    JSON.stringify(
      PACKAGE_JSON_TEMPLATE(name, template, overrides, versions),
      null,
      2,
    ),
  );
  // Write configuration files
  await writeFile(
    join(targetDir, "tsconfig.json"),
    JSON.stringify(TSCONFIG_JSON, null, 2),
  );
  await writeFile(
    join(targetDir, "vite.config.ts"),
    template === "basic" ? VITE_CONFIG_BASIC : VITE_CONFIG_MUI_DEVTOOLS,
  );
  // Write index.html
  await writeFile(join(targetDir, "index.html"), INDEX_HTML(name));
  // Write source files
  await writeFile(join(targetDir, "src", "vite-env.d.ts"), VITE_ENV_D_TS);
  await writeFile(
    join(targetDir, "src", "main.tsx"),
    template === "basic" ? MAIN_TSX : MAIN_TSX_MUI_DEVTOOLS,
  );
  await writeFile(
    join(targetDir, "src", "App.tsx"),
    template === "basic" ? BASIC_APP_TSX : MUI_DEVTOOLS_APP_TSX,
  );
  await writeFile(
    join(targetDir, "src", "applet.config.ts"),
    template === "basic" ? BASIC_CONFIG_TS : MUI_DEVTOOLS_CONFIG_TS,
  );
  // Create generated directory for mui-devtools template
  if (template === "mui-devtools") {
    await mkdir(join(targetDir, "src", "generated"), { recursive: true });
  }
  console.log(`✅ Host app "${name}" created successfully!`);
  console.log(``);
  console.log(`Next steps:`);
  console.log(`  cd ${directory}`);
  console.log(`  npm install`);
  if (template === "mui-devtools") {
    console.log(`  npm run setup    # Install applets and generate mocks`);
  }
  console.log(`  npm run dev      # Start development server`);
  console.log(``);
  console.log(`To add applets:`);
  console.log(
    `  1. Install applet packages: npm install @smbc/usage-stats-mui`,
  );
  console.log(`  2. Update src/applet.config.ts to mount your applets`);
  if (template === "mui-devtools") {
    console.log(`  3. Run: npm run generate-mocks`);
  }
}
// Configure prompts to handle Ctrl+C gracefully
prompts.override({
  onCancel: () => {
    console.log("\n❌ Host app creation cancelled");
    process.exit(0);
  },
});

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let name = args[0];

  // If no name provided, prompt for it
  if (!name) {
    console.log("🚀 SMBC Host App Creator");
    console.log("========================");
    console.log("");

    const response = await prompts({
      type: "text",
      name: "name",
      message: "📝 What is your host app name?",
      validate: (value) =>
        value.trim().length > 0 ? true : "Name cannot be empty",
    });

    name = response.name;
    if (!name) process.exit(0);
  }

  // Check for CLI args, otherwise prompt
  const templateIndex = args.indexOf("--template");
  const dirIndex = args.indexOf("--dir");

  let template = templateIndex !== -1 ? args[templateIndex + 1] : null;
  let directory = dirIndex !== -1 ? args[dirIndex + 1] : name;

  // If template not specified via CLI, prompt for it
  if (!template) {
    const response = await prompts({
      type: "select",
      name: "template",
      message: "🎨 Select a template:",
      choices: [
        {
          title: "MUI DevTools (Recommended)",
          description:
            "Full-featured host with MUI, dev tools, and mock generation",
          value: "mui-devtools",
        },
        {
          title: "Basic",
          description: "Minimal host app with basic setup",
          value: "basic",
        },
      ],
      initial: 0,
    });

    template = response.template;
    if (!template) process.exit(0);
  }

  // Confirm directory if different from name
  if (directory !== name) {
    const response = await prompts({
      type: "confirm",
      name: "confirmDir",
      message: `📁 Create in directory "${directory}"?`,
      initial: true,
    });

    if (!response.confirmDir) {
      const dirResponse = await prompts({
        type: "text",
        name: "directory",
        message: "📁 Enter directory name:",
        initial: name,
        validate: (value) =>
          value.trim().length > 0 ? true : "Directory cannot be empty",
      });
      directory = dirResponse.directory || name;
    }
  }

  try {
    await createHostApp({ name, directory, template });
  } catch (error) {
    console.error(
      "❌ Error creating host app:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}
export { createHostApp };
