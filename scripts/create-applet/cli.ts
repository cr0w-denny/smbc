#!/usr/bin/env tsx

import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import validatePackageName from "validate-npm-package-name";
import { execSync } from "child_process";
import { updatePackageJsonDependencies } from "../template-deps.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AppletConfig {
  name: string;
  displayName: string;
  description: string;
  template: "basic" | "full";
  withApi: boolean;
  installDeps: boolean;
}

const program = new Command();

program
  .name("create-applet")
  .description("Create a new SMBC MUI applet in the monorepo")
  .version("1.0.0")
  .argument("[applet-name]", "name of the applet")
  .option("-t, --template <template>", "template to use (basic|full)", "basic")
  .option("--with-api", "include API package structure", true)
  .option("--no-install", "skip installing dependencies")
  .action(async (appletName?: string, options = {}) => {
    const config = await gatherAppletConfig(appletName, options);
    await createApplet(config);
  });

async function gatherAppletConfig(
  appletName?: string,
  options: any = {},
): Promise<AppletConfig> {
  const questions: prompts.PromptObject[] = [];

  // Applet name
  if (!appletName) {
    questions.push({
      type: "text",
      name: "name",
      message: "What is your applet name? (kebab-case)",
      initial: "my-applet",
      validate: (value: string) => {
        if (!value.match(/^[a-z][a-z0-9-]*$/)) {
          return "Applet name must be kebab-case (lowercase letters, numbers, and hyphens only)";
        }
        const validation = validatePackageName(`@smbc/${value}-mui`);
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
    message: "What is the display name for your applet?",
    initial: (_prev, values) => {
      const name = appletName || values.name;
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
    message: "Brief description of your applet:",
    initial: (_prev, values) => {
      const displayName = values.displayName;
      return `${displayName} applet for SMBC applications`;
    },
  });

  // Template selection
  if (!options.template) {
    questions.push({
      type: "select",
      name: "template",
      message: "Which template would you like to use?",
      choices: [
        {
          title: "Basic - Simple applet with one component",
          description: "Minimal setup for simple applets",
          value: "basic",
        },
        {
          title: "Full - Complete applet with routing and examples",
          description:
            "Includes multiple components, routing, and best practices",
          value: "full",
        },
      ],
      initial: 0,
    });
  }

  // Install dependencies
  questions.push({
    type: "confirm",
    name: "installDeps",
    message: "Install dependencies?",
    initial: options.install !== false,
  });

  const answers = questions.length > 0 ? await prompts(questions) : {};

  return {
    name: appletName || answers.name,
    displayName: answers.displayName,
    description: answers.description,
    template: options.template || answers.template || "basic",
    withApi: true,
    installDeps: answers.installDeps !== false,
  };
}

async function createApplet(config: AppletConfig) {
  const appletPath = path.resolve(process.cwd(), "applets", config.name);

  // Check if directory already exists
  if (await fs.pathExists(appletPath)) {
    process.exit(1);
  }

  const spinner = ora("Creating applet...").start();

  try {
    // Create applet directory structure
    await fs.ensureDir(appletPath);

    // Create MUI package
    await createMuiPackage(config, appletPath);

    // Create API packages if requested
    if (config.withApi) {
      await createApiPackages(config, appletPath);
    }

    spinner.succeed(chalk.green("Applet created successfully!"));

    // Install dependencies
    if (config.installDeps) {
      await installDependencies(config, appletPath, spinner);
    }

    // Success message

    if (!config.installDeps) {
    }
  } catch (error) {
    spinner.fail(chalk.red("Failed to create applet"));
    console.error(error);
    process.exit(1);
  }
}

async function createMuiPackage(config: AppletConfig, appletPath: string) {
  const muiPath = path.join(appletPath, "mui");
  await fs.ensureDir(muiPath);

  // Copy template files
  const templatePath = path.join(__dirname, "templates", config.template);
  await fs.copy(templatePath, muiPath);

  // Update package.json
  const packageJsonPath = path.join(muiPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.name = `@smbc/${config.name}-mui`;
  packageJson.description = config.description;

  // Determine dependency type based on template
  const dependencyType = config.template === "full" ? "full-applet" : "basic-applet";
  
  // Update dependencies to use shared definitions
  const updatedPackageJson = updatePackageJsonDependencies(packageJson, dependencyType);

  // Add API dependency if API package will be included
  if (config.withApi) {
    updatedPackageJson.dependencies = updatedPackageJson.dependencies || {};
    updatedPackageJson.dependencies[`@smbc/${config.name}-api`] = "*";
  }

  await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });

  // Replace template placeholders in source files
  await replaceTemplatePlaceholders(muiPath, config);
}

async function createApiPackages(config: AppletConfig, appletPath: string) {
  // Create API package (TypeSpec)
  const apiPath = path.join(appletPath, "api");
  await fs.ensureDir(apiPath);
  await fs.copy(path.join(__dirname, "templates/api"), apiPath);

  // Create Django package
  const djangoPath = path.join(appletPath, "django");
  await fs.ensureDir(djangoPath);
  await fs.copy(path.join(__dirname, "templates/django"), djangoPath);

  // Update package.json files
  const packages = ["api", "django"];
  for (const pkg of packages) {
    const pkgPath = path.join(appletPath, pkg, "package.json");
    if (await fs.pathExists(pkgPath)) {
      const packageJson = await fs.readJson(pkgPath);
      packageJson.name = `@smbc/${config.name}-${pkg}`;
      packageJson.description = `${config.description} - ${pkg}`;
      
      // Update dependencies to use shared definitions for API packages
      const updatedPackageJson = updatePackageJsonDependencies(packageJson, "api");
      
      await fs.writeJson(pkgPath, updatedPackageJson, { spaces: 2 });
    }
  }

  // Replace placeholders in API files
  await replaceTemplatePlaceholders(apiPath, config);
  await replaceTemplatePlaceholders(djangoPath, config);
}

async function replaceTemplatePlaceholders(
  dirPath: string,
  config: AppletConfig,
) {
  await processDirectory(dirPath, config);
}

async function processDirectory(dirPath: string, config: AppletConfig) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, config);
    } else if (
      entry.isFile() &&
      entry.name.match(/\.(ts|tsx|js|jsx|json|md|tsp)$/)
    ) {
      let content = await fs.readFile(fullPath, "utf8");

      // Replace placeholders
      content = content.replace(/{{APPLET_NAME}}/g, config.name);
      content = content.replace(/{{APPLET_DISPLAY_NAME}}/g, config.displayName);
      content = content.replace(/{{APPLET_DESCRIPTION}}/g, config.description);
      content = content.replace(
        /{{APPLET_CAMEL_CASE}}/g,
        toCamelCase(config.name),
      );
      content = content.replace(
        /{{APPLET_PASCAL_CASE}}/g,
        toPascalCase(config.name),
      );
      content = content.replace(
        /{{APPLET_UPPER_CASE}}/g,
        config.name.toUpperCase().replace(/-/g, "_"),
      );

      await fs.writeFile(fullPath, content);
    }
  }

  // Handle file renames with placeholders
  const entriesAfter = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entriesAfter) {
    if (entry.isFile() && entry.name.includes("{{APPLET_PASCAL_CASE}}")) {
      const oldPath = path.join(dirPath, entry.name);
      const newName = entry.name.replace(
        /{{APPLET_PASCAL_CASE}}/g,
        toPascalCase(config.name),
      );
      const newPath = path.join(dirPath, newName);
      await fs.rename(oldPath, newPath);
    }
  }
}

async function installDependencies(
  config: AppletConfig,
  appletPath: string,
  spinner: any,
) {
  spinner.start("Installing dependencies...");

  try {
    // Install MUI package dependencies
    execSync("pnpm install", {
      cwd: path.join(appletPath, "mui"),
      stdio: "ignore",
    });

    if (config.withApi) {
      // Install API dependencies
      execSync("pnpm install", {
        cwd: path.join(appletPath, "api"),
        stdio: "ignore",
      });
    }

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
