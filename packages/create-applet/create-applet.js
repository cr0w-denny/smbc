#!/usr/bin/env node
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
// Core dependency versions
const CORE_DEPS = {
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/material": "^7.2.0",
  "@mui/icons-material": "^7.2.0",
  "@types/react": "^18.3.23",
  "@types/react-dom": "^18.3.7",
  "@vitejs/plugin-react": "^4.6.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "~5.8.3",
  "vite": "^7.0.4"
};
import prompts from 'prompts';

async function createApplet(options) {
  const { name, directory } = options;
  const kebabDirectory = directory || name.toLowerCase().replace(/\s+/g, '-');
  
  console.log(`🚀 Creating applet "${name}"...`);
  
  // Find project root and determine target directory
  const projectRoot = await findProjectRoot();
  const targetDir = projectRoot 
    ? resolve(projectRoot, 'applets', kebabDirectory)
    : resolve(process.cwd(), kebabDirectory);
    
  // Check if directory exists
  if (existsSync(targetDir)) {
    throw new Error(`Directory ${targetDir} already exists`);
  }
  
  // Set up workspace if we found a project root
  if (projectRoot) {
    await setupWorkspace(projectRoot);
  }
  
  // Create applet structure
  await createAppletStructure(targetDir, name);
  
  console.log(`✅ Applet "${name}" created successfully!`);
  console.log(``);
  console.log(`Next steps:`);
  if (projectRoot) {
    console.log(`  cd applets/${kebabDirectory}`);
    console.log(`  npm install                    # Install dependencies`);
    console.log(`  npm run build                  # Build all components`);
    console.log(`  cd ../..                       # Back to project root`);
    console.log(`  npm run setup                  # Re-run setup to include new applet`);
  } else {
    console.log(`  cd ${kebabDirectory}`);
    console.log(`  npm install`);
    console.log(`  npm run build`);
  }
  console.log(``);
  console.log(`Your applet structure:`);
  console.log(`  ${name}/api/          # TypeSpec API definitions`);
  console.log(`  ${name}/mui/          # React UI components`);
  console.log(`  ${name}/django/       # Backend implementation`);
}

async function findProjectRoot() {
  let currentDir = process.cwd();
  
  while (currentDir !== '/') {
    try {
      const packageJsonPath = join(currentDir, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        // Look for a package.json with workspaces (indicates project root)
        if (packageJson.workspaces) {
          return currentDir;
        }
      }
    } catch {
      // Continue searching if package.json can't be read
    }
    
    currentDir = resolve(currentDir, '..');
  }
  
  return null; // No project root found
}

async function askQuestion(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function setupWorkspace(projectRoot) {
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  
  // Check if workspaces already exists
  if (packageJson.workspaces) {
    console.log(`📦 Found existing workspaces configuration:`);
    console.log(`   ${JSON.stringify(packageJson.workspaces, null, 2)}`);
    console.log(``);
    
    const needsAppletPattern = !packageJson.workspaces.some(pattern => 
      pattern === 'applets/*/*' || pattern.includes('applets/')
    );
    
    if (needsAppletPattern) {
      const answer = await askQuestion(
        `Add "applets/*/*" to workspaces to support applet development? (y/n): `
      );
      
      if (answer === 'y' || answer === 'yes') {
        packageJson.workspaces.push('applets/*/*');
        await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ Added "applets/*/*" to workspaces`);
      } else {
        console.log(`⚠️  Skipping workspace modification. You may need to manually configure workspaces.`);
      }
    } else {
      console.log(`✅ Workspaces already configured for applets`);
    }
  } else {
    // No workspaces - add the standard configuration
    packageJson.workspaces = [
      "packages/*",
      "applets/*/*"
    ];
    
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`📦 Added workspace configuration to package.json`);
  }
  
  // Create applets directory if it doesn't exist
  const appletsDir = join(projectRoot, 'applets');
  if (!existsSync(appletsDir)) {
    await mkdir(appletsDir, { recursive: true });
  }
}

async function createAppletStructure(targetDir, name) {
  // Create main directories
  await mkdir(join(targetDir, 'api'), { recursive: true });
  await mkdir(join(targetDir, 'mui', 'src'), { recursive: true });
  await mkdir(join(targetDir, 'django'), { recursive: true });
  
  // Create API package
  await createApiPackage(join(targetDir, 'api'), name);
  
  // Create MUI package  
  await createMuiPackage(join(targetDir, 'mui'), name);
  
  // Create Django package
  await createDjangoPackage(join(targetDir, 'django'), name);
}

async function createApiPackage(apiDir, name) {
  const kebabName = name.toLowerCase().replace(/\s+/g, '-');
  const pascalName = name.replace(/(?:^|\s)\w/g, match => match.trim().toUpperCase()).replace(/\s+/g, '');
  
  // package.json
  const packageJson = {
    name: `@smbc/${kebabName}-api`,
    version: "0.0.0",
    description: `${name} API definitions`,
    type: "module",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    files: ["dist"],
    scripts: {
      build: "tsp compile .",
      clean: "rm -rf dist",
      watch: "tsp compile . --watch"
    },
    dependencies: {
      "@smbc/typespec-core": "*"
    },
    devDependencies: {
      "@typespec/compiler": "latest",
      "@typespec/http": "latest", 
      "@typespec/rest": "latest",
      "@typespec/openapi3": "latest"
    },
    publishConfig: {
      access: "public",
      registry: "http://localhost:4873"
    }
  };
  
  await writeFile(join(apiDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // tspconfig.yaml
  const tspConfig = `extends: "@smbc/typespec-core"
parameters:
  "service-name": "${kebabName}"
  "service-version": "1.0.0"
emit:
  - "@typespec/openapi3"
options:
  "@typespec/openapi3":
    "output-file": "{output-dir}/openapi.json"
`;
  
  await writeFile(join(apiDir, 'tspconfig.yaml'), tspConfig);
  
  // main.tsp
  const mainTsp = `import "@typespec/http";
import "@typespec/rest";
import "@smbc/typespec-core";

using TypeSpec.Http;
using TypeSpec.Rest;
using SMBC.Core;

@service({
  title: "${name} Service",
  version: "1.0.0",
})
namespace ${pascalName}Service;

@route("/${kebabName}")
interface ${pascalName} {
  @get
  @route("/health")
  health(): {
    @statusCode statusCode: 200;
    @body body: {
      status: "healthy";
      timestamp: string;
    };
  };
  
  // Add your API endpoints here
  @get
  @route("/items")
  listItems(): {
    @statusCode statusCode: 200;
    @body body: ${pascalName}Item[];
  };
  
  @post
  @route("/items")
  createItem(@body item: Create${pascalName}Item): {
    @statusCode statusCode: 201;
    @body body: ${pascalName}Item;
  };
}

model ${pascalName}Item {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

model Create${pascalName}Item {
  name: string;
  description?: string;
}
`;
  
  await writeFile(join(apiDir, 'main.tsp'), mainTsp);
}

async function createMuiPackage(muiDir, name) {
  const kebabName = name.toLowerCase().replace(/\s+/g, '-');
  const pascalName = name.replace(/(?:^|\s)\w/g, match => match.trim().toUpperCase()).replace(/\s+/g, '');
  
  // package.json
  const packageJson = {
    name: `@smbc/${kebabName}-mui`,
    version: "0.0.0", 
    description: `${name} MUI Applet`,
    type: "module",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    files: ["dist"],
    keywords: ["smbc-applet", "smbc-mui-applet"],
    scripts: {
      build: "vite build",
      dev: "vite build --watch",
      clean: "rm -rf dist",
      "type-check": "tsc --noEmit"
    },
    dependencies: {
      "@smbc/applet-core": "*",
      "@smbc/mui-applet-core": "*",
      "@smbc/mui-components": "*"
    },
    devDependencies: {
      "@types/react": CORE_DEPS["@types/react"],
      "@types/react-dom": CORE_DEPS["@types/react-dom"],
      "@vitejs/plugin-react": CORE_DEPS["@vitejs/plugin-react"],
      typescript: CORE_DEPS.typescript,
      vite: CORE_DEPS.vite,
      "vite-plugin-dts": "^4.5.4"
    },
    peerDependencies: {
      react: CORE_DEPS.react,
      "react-dom": CORE_DEPS["react-dom"],
      "@emotion/react": CORE_DEPS["@emotion/react"],
      "@emotion/styled": CORE_DEPS["@emotion/styled"],
      "@mui/icons-material": CORE_DEPS["@mui/icons-material"],
      "@mui/material": CORE_DEPS["@mui/material"]
    },
    publishConfig: {
      access: "public",
      registry: "http://localhost:4873"
    }
  };
  
  await writeFile(join(muiDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // Create source files
  await createMuiSourceFiles(join(muiDir, 'src'), name, kebabName, pascalName);
  
  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx']
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '${pascalName}Applet',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@emotion/react',
        '@emotion/styled', 
        '@mui/material',
        '@mui/icons-material',
        '@smbc/applet-core',
        '@smbc/mui-applet-core',
        '@smbc/mui-components'
      ]
    }
  }
});
`;
  
  await writeFile(join(muiDir, 'vite.config.ts'), viteConfig);
  
  // tsconfig.json - check if we're in a monorepo or standalone project
  const projectRoot = await findProjectRoot();
  const isMonorepo = projectRoot && projectRoot !== process.cwd();
  
  const tsConfig = {
    ...(isMonorepo ? { extends: "../../tsconfig.base.json" } : {}),
    compilerOptions: {
      target: "ES2020",
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      allowJs: false,
      skipLibCheck: true,
      esModuleInterop: false,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: "ESNext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: false,
      outDir: "./dist",
      rootDir: "./src", 
      declaration: true,
      declarationMap: false,
      sourceMap: false,
      jsx: "react-jsx"
    },
    include: ["src/**/*"],
    exclude: ["dist", "node_modules"]
  };
  
  await writeFile(join(muiDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
}

async function createMuiSourceFiles(srcDir, name, kebabName, pascalName) {
  // permissions.ts
  const permissions = `export const ${kebabName.replace(/-/g, '')}Permissions = {
  VIEW_${kebabName.toUpperCase().replace(/-/g, '_')}: {
    id: "VIEW_${kebabName.toUpperCase().replace(/-/g, '_')}",
    description: "View ${name.toLowerCase()} data",
  },
  MANAGE_${kebabName.toUpperCase().replace(/-/g, '_')}: {
    id: "MANAGE_${kebabName.toUpperCase().replace(/-/g, '_')}",
    description: "Manage ${name.toLowerCase()} data",
  },
} as const;
`;
  
  await writeFile(join(srcDir, 'permissions.ts'), permissions);
  
  // Applet.tsx
  const appletComponent = `import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import { usePermissions } from '@smbc/applet-core';
import { ${kebabName.replace(/-/g, '')}Permissions } from './permissions';

export interface ${pascalName}AppletProps {
  mountPath?: string;
}

export function ${pascalName}Applet({ mountPath = "/${kebabName}" }: ${pascalName}AppletProps) {
  const { hasPermission } = usePermissions();
  
  const canView = hasPermission(${kebabName.replace(/-/g, '')}Permissions.VIEW_${kebabName.toUpperCase().replace(/-/g, '_')}.id);
  const canManage = hasPermission(${kebabName.replace(/-/g, '')}Permissions.MANAGE_${kebabName.toUpperCase().replace(/-/g, '_')}.id);
  
  if (!canView) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You don't have permission to view ${name.toLowerCase()}.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <DashboardIcon sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          ${name}
        </Typography>
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Welcome to ${name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This is your new ${name.toLowerCase()} applet. Start building your features here!
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button variant="contained" disabled={!canManage}>
              Manage ${name}
            </Button>
            <Button variant="outlined">
              View Documentation
            </Button>
          </Box>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Development Info:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mount Path: {mountPath}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Can View: {canView ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Can Manage: {canManage ? 'Yes' : 'No'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
`;
  
  await writeFile(join(srcDir, 'Applet.tsx'), appletComponent);
  
  // index.ts
  const indexFile = `import { ${pascalName}Applet } from './Applet';
import { ${kebabName.replace(/-/g, '')}Permissions } from './permissions';

const ${kebabName.replace(/-/g, '')}Applet = {
  component: ${pascalName}Applet,
  permissions: ${kebabName.replace(/-/g, '')}Permissions,
  apiSpec: null, // Will be populated when API is built
};

export default ${kebabName.replace(/-/g, '')}Applet;
export { ${pascalName}Applet } from './Applet';
export { ${kebabName.replace(/-/g, '')}Permissions } from './permissions';
`;
  
  await writeFile(join(srcDir, 'index.ts'), indexFile);
}

async function createDjangoPackage(djangoDir, name) {
  const kebabName = name.toLowerCase().replace(/\s+/g, '-');
  
  // package.json (for tooling/scripts)
  const packageJson = {
    name: `@smbc/${kebabName}-django`,
    version: "0.0.0",
    description: `${name} Django Backend`,
    private: true,
    scripts: {
      start: "python manage.py runserver",
      migrate: "python manage.py migrate", 
      test: "python manage.py test",
      shell: "python manage.py shell"
    }
  };
  
  await writeFile(join(djangoDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // README.md
  const readme = `# ${name} Django Backend

Django backend implementation for the ${name} applet.

## Setup

1. Create virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Run migrations:
   \`\`\`bash
   python manage.py migrate
   \`\`\`

4. Start development server:
   \`\`\`bash
   python manage.py runserver
   \`\`\`

## API Endpoints

- \`GET /${kebabName}/health\` - Health check
- \`GET /${kebabName}/items\` - List items
- \`POST /${kebabName}/items\` - Create item

## Development

Add your Django models, views, and URLs to implement the API defined in \`../api/main.tsp\`.
`;
  
  await writeFile(join(djangoDir, 'README.md'), readme);
  
  // requirements.txt
  const requirements = `Django>=4.2.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
`;
  
  await writeFile(join(djangoDir, 'requirements.txt'), requirements);
}

// Configure prompts to handle Ctrl+C gracefully
prompts.override({
  onCancel: () => {
    console.log('\n❌ Applet creation cancelled');
    process.exit(0);
  }
});

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let name = args[0];
  
  // If no name provided, prompt for it
  if (!name) {
    console.log('🚀 SMBC Applet Creator');
    console.log('=====================');
    console.log('');
    
    const response = await prompts({
      type: 'text',
      name: 'name',
      message: '📝 What is your applet name?',
      validate: value => value.trim().length > 0 ? true : 'Name cannot be empty'
    });
    
    name = response.name;
    if (!name) process.exit(0);
  }
  
  const dirIndex = args.indexOf('--dir');
  let directory = dirIndex !== -1 ? args[dirIndex + 1] : undefined;
  
  // If directory not specified and name contains spaces/caps, suggest kebab case
  const suggestedDir = name.toLowerCase().replace(/\s+/g, '-');
  if (!directory && suggestedDir !== name) {
    const response = await prompts({
      type: 'confirm',
      name: 'useKebab',
      message: `📁 Create in directory "${suggestedDir}"?`,
      initial: true
    });
    
    if (response.useKebab) {
      directory = suggestedDir;
    } else {
      const dirResponse = await prompts({
        type: 'text',
        name: 'directory',
        message: '📁 Enter directory name:',
        initial: suggestedDir,
        validate: value => value.trim().length > 0 ? true : 'Directory cannot be empty'
      });
      directory = dirResponse.directory;
    }
  }
  
  try {
    await createApplet({ name, directory });
  } catch (error) {
    console.error('❌ Error creating applet:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export { createApplet };