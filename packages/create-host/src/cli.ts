#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import validatePackageName from "validate-npm-package-name";
import { execSync } from "child_process";
import { updatePackageJsonDependencies } from "./template-deps.js";
import { AVAILABLE_APPLETS, type AppletRegistryEntry, generateAppletImport, generateAppletConfig } from "./applet-registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface HostConfig {
  name: string;
  displayName: string;
  description: string;
  framework: "mui";
  installDeps: boolean;
  selectedApplets: AppletRegistryEntry[];
}

const program = new Command();

program
  .name("create-host")
  .description("Create a new SMBC applet host application in the monorepo")
  .version("1.0.0")
  .argument("[host-name]", "name of the host application")
  .option("-f, --framework <framework>", "framework to use (mui)", "mui")
  .option("--no-install", "skip installing dependencies")
  .action(async (hostName?: string, options = {}) => {
    const config = await gatherHostConfig(hostName, options);
    await createHost(config);
  });

async function gatherHostConfig(
  hostName?: string,
  options: any = {},
): Promise<HostConfig> {
  const questions: prompts.PromptObject[] = [];

  // Host name
  if (!hostName) {
    questions.push({
      type: "text",
      name: "name",
      message: "What is your host application name? (kebab-case)",
      initial: "my-host",
      validate: (value: string) => {
        if (!value.match(/^[a-z][a-z0-9-]*$/)) {
          return "Host name must be kebab-case (lowercase letters, numbers, and hyphens only)";
        }
        const validation = validatePackageName(`@smbc/${value}`);
        if (!validation.validForNewPackages) {
          return (
            validation.errors?.[0] ||
            validation.warnings?.[0] ||
            "Invalid package name"
          );
        }
        return true;
      },
    });
  }

  // Display name
  questions.push({
    type: "text",
    name: "displayName",
    message: "What is the display name for your host application?",
    initial: (_prev, values) => {
      const name = hostName || values.name;
      return name
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
  });

  // Description
  questions.push({
    type: "text",
    name: "description",
    message: "Brief description of your host application:",
    initial: (_prev, values) => {
      const displayName = values.displayName;
      return `${displayName} - SMBC applet host application`;
    },
  });

  // Applet selection
  questions.push({
    type: "multiselect",
    name: "selectedApplets",
    message: "Select applets to include (optional):",
    choices: AVAILABLE_APPLETS.map(applet => ({
      title: applet.name,
      description: applet.description,
      value: applet,
      selected: false,
    })),
    hint: "Space to select, Enter to confirm",
  });

  // Install dependencies
  questions.push({
    type: "confirm",
    name: "installDeps",
    message: "Install dependencies?",
    initial: options.install !== false,
  });

  const answers = questions.length > 0 ? await prompts(questions) : {};

  return {
    name: hostName || answers.name,
    displayName: answers.displayName,
    description: answers.description,
    framework: options.framework || "mui",
    installDeps: answers.installDeps !== false,
    selectedApplets: answers.selectedApplets || [],
  };
}

async function createHost(config: HostConfig) {
  const hostPath = path.resolve(process.cwd(), "apps", config.name);

  // Check if directory already exists
  if (await fs.pathExists(hostPath)) {
    console.error(chalk.red(`Directory already exists: ${hostPath}`));
    process.exit(1);
  }

  const spinner = ora("Creating host application...").start();

  try {
    // Create host directory structure
    await fs.ensureDir(hostPath);

    // Copy template files
    const templatePath = path.join(__dirname, "templates", config.framework);
    await fs.copy(templatePath, hostPath);

    // Update package.json
    const packageJsonPath = path.join(hostPath, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.name = `@smbc/${config.name}`;
    packageJson.description = config.description;

    // Update dependencies to use shared definitions
    const updatedPackageJson = updatePackageJsonDependencies(packageJson, 'host');

    await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });

    // Replace template placeholders in source files
    await replaceTemplatePlaceholders(hostPath, config);

    spinner.succeed(chalk.green("Host application created successfully!"));

    // Install dependencies
    if (config.installDeps) {
      await installDependencies(config, hostPath, spinner);
    }

    // Success message
    console.log(chalk.green(`\n🎉 Successfully created ${config.displayName}!`));
    console.log(chalk.dim(`\nLocation: ${hostPath}`));
    console.log(chalk.cyan(`\nTo get started:`));
    console.log(chalk.white(`  cd apps/${config.name}`));
    console.log(chalk.white(`  npm run dev`));
    
    if (!config.installDeps) {
      console.log(chalk.yellow(`\nDon't forget to install dependencies first!`));
    }
  } catch (error) {
    spinner.fail(chalk.red("Failed to create host application"));
    console.error(error);
    process.exit(1);
  }
}

async function replaceTemplatePlaceholders(
  dirPath: string,
  config: HostConfig,
) {
  await processDirectory(dirPath, config);
}

async function processDirectory(dirPath: string, config: HostConfig) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, config);
    } else if (
      entry.isFile() &&
      entry.name.match(/\.(ts|tsx|js|jsx|json|md|html)$/)
    ) {
      let content = await fs.readFile(fullPath, "utf8");

      // Replace basic placeholders
      content = content.replace(/{{HOST_NAME}}/g, config.name);
      content = content.replace(/{{HOST_DISPLAY_NAME}}/g, config.displayName);
      content = content.replace(/{{HOST_DESCRIPTION}}/g, config.description);
      content = content.replace(
        /{{HOST_CAMEL_CASE}}/g,
        toCamelCase(config.name),
      );
      content = content.replace(
        /{{HOST_PASCAL_CASE}}/g,
        toPascalCase(config.name),
      );
      content = content.replace(
        /{{HOST_UPPER_CASE}}/g,
        config.name.toUpperCase().replace(/-/g, "_"),
      );

      // Generate applet-specific content
      if (config.selectedApplets.length > 0) {
        // Generate imports
        const appletImports = config.selectedApplets
          .map(applet => generateAppletImport(applet))
          .join('\n');
        
        // Generate icon imports
        const iconImports = config.selectedApplets
          .filter(applet => applet.icon)
          .map(applet => `  ${applet.icon} as ${applet.icon}Icon`)
          .join(',\n');
        
        const iconImportStatement = iconImports
          ? `import {\n${iconImports}\n} from "@mui/icons-material";`
          : '';

        // Generate unified applet configs
        const appletConfigs = config.selectedApplets
          .map(applet => generateAppletConfig(applet))
          .join(',\n');

        // Replace applet placeholders
        content = content.replace(/{{APPLET_IMPORTS}}/g, appletImports);
        content = content.replace(/{{ICON_IMPORTS}}/g, iconImportStatement);
        content = content.replace(/{{APPLET_CONFIGS}}/g, appletConfigs);
      } else {
        // No applets selected - use empty placeholders
        content = content.replace(/{{APPLET_IMPORTS}}/g, '');
        content = content.replace(/{{ICON_IMPORTS}}/g, '');
        content = content.replace(/{{APPLET_CONFIGS}}/g, '');
      }

      await fs.writeFile(fullPath, content);
    }
  }
}

async function installDependencies(
  config: HostConfig,
  hostPath: string,
  spinner: any,
) {
  spinner.start("Installing dependencies...");

  try {
    execSync("npm install", {
      cwd: hostPath,
      stdio: "ignore",
    });

    spinner.succeed(chalk.green("Dependencies installed successfully!"));
  } catch (error) {
    spinner.warn(
      chalk.yellow(
        "Failed to install dependencies. You can install them manually.",
      ),
    );
  }
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Handle process termination
process.on("SIGINT", () => {
  process.exit(1);
});

program.parse();