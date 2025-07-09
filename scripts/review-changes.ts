#!/usr/bin/env tsx

/**
 * Review Changes Utility
 *
 * Compare your repo against a target repo and apply changes using VS Code as a diff tool
 *
 * Usage:
 *   ./scripts/review-changes.ts ../target-repo
 *   ./scripts/review-changes.ts ../target-repo --branch integration-branch
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const WATCHED_FOLDERS = ["applets", "apps", "docs", "packages", "scripts"];

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
};

interface FileChange {
  status: string;
  file: string;
  folder: string;
  sourceFile: string;
  targetFile: string;
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function execCommand(command: string, cwd?: string): string {
  try {
    return execSync(command, { encoding: "utf-8", cwd }).trim();
  } catch (error) {
    return "";
  }
}

function checkVSCodeAvailable(): boolean {
  try {
    execSync("code --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function getRepoComparisonFiles(targetRepoPath: string): FileChange[] {
  const changes: FileChange[] = [];

  function scanFolder(folderName: string) {
    const sourcePath = folderName;
    const targetPath = join(targetRepoPath, folderName);

    if (!existsSync(sourcePath)) return;

    function scanDirectory(dir: string, relativePath: string = "") {
      if (!existsSync(dir)) return;
      
      const items = readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name.startsWith(".")) continue; // Skip hidden files
        if (item.name === "node_modules") continue; // Skip node_modules
        
        const itemPath = join(dir, item.name);
        const relativeItemPath = join(relativePath, item.name);
        const fullRelativePath = join(folderName, relativeItemPath);
        
        if (item.isDirectory()) {
          scanDirectory(itemPath, relativeItemPath);
        } else if (item.isFile()) {
          const sourceFile = itemPath;
          const targetFile = join(targetPath, relativeItemPath);
          
          let status = "M"; // Default to modified
          
          if (!existsSync(targetFile)) {
            status = "A"; // New file
          } else {
            // Compare file contents
            try {
              const sourceContent = readFileSync(sourceFile, "utf8");
              const targetContent = readFileSync(targetFile, "utf8");
              
              if (sourceContent === targetContent) {
                continue; // Skip identical files
              }
            } catch (error) {
              // If we can't read files, assume they're different
            }
          }
          
          changes.push({
            status,
            file: fullRelativePath,
            folder: folderName,
            sourceFile,
            targetFile
          });
        }
      }
    }
    
    scanDirectory(sourcePath);
    
    // Also check for deleted files in target
    if (existsSync(targetPath)) {
      function scanForDeleted(dir: string, relativePath: string = "") {
        if (!existsSync(dir)) return;
        
        const items = readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.name.startsWith(".")) continue;
          if (item.name === "node_modules") continue;
          
          const itemPath = join(dir, item.name);
          const relativeItemPath = join(relativePath, item.name);
          const fullRelativePath = join(folderName, relativeItemPath);
          const sourceFile = join(sourcePath, relativeItemPath);
          
          if (item.isDirectory()) {
            scanForDeleted(itemPath, relativeItemPath);
          } else if (item.isFile() && !existsSync(sourceFile)) {
            changes.push({
              status: "D",
              file: fullRelativePath,
              folder: folderName,
              sourceFile: "",
              targetFile: itemPath
            });
          }
        }
      }
      
      scanForDeleted(targetPath);
    }
  }

  // Scan all watched folders
  for (const folder of WATCHED_FOLDERS) {
    scanFolder(folder);
  }

  return changes;
}

function getStatusSymbol(status: string): string {
  switch (status.toUpperCase()) {
    case "M":
      return `${colors.yellow}●${colors.reset} Modified`;
    case "A":
      return `${colors.green}+${colors.reset} Added`;
    case "D":
      return `${colors.red}×${colors.reset} Deleted`;
    default:
      return `${colors.dim}${status}${colors.reset}`;
  }
}

function openDiffInVSCode(change: FileChange) {
  if (change.status === "D") {
    log(`Opening deleted file: ${change.targetFile}`, colors.blue);
    execSync(`code "${change.targetFile}"`, { stdio: "inherit" });
    return;
  }

  if (change.status === "A") {
    log(`Opening new file: ${change.sourceFile}`, colors.blue);
    execSync(`code "${change.sourceFile}"`, { stdio: "inherit" });
    return;
  }

  try {
    log(`Opening diff: ${change.file}`, colors.blue);
    execSync(`code --diff "${change.targetFile}" "${change.sourceFile}"`, {
      stdio: "inherit",
    });
  } catch (error) {
    log(`Failed to open VS Code diff for ${change.file}`, colors.red);
    log(`Source: ${change.sourceFile}`, colors.dim);
    log(`Target: ${change.targetFile}`, colors.dim);
  }
}

async function promptUser(question: string): Promise<string> {
  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function groupChangesByFolder(
  changes: FileChange[],
): Record<string, FileChange[]> {
  const grouped: Record<string, FileChange[]> = {};

  for (const change of changes) {
    if (!grouped[change.folder]) {
      grouped[change.folder] = [];
    }
    grouped[change.folder].push(change);
  }

  return grouped;
}

function displaySummary(changes: FileChange[], targetRepo: string) {
  const grouped = groupChangesByFolder(changes);

  log(`\n${colors.bold}📋 Changes Summary${colors.reset}`, colors.cyan);
  log(`Source: ${process.cwd()}`, colors.dim);
  log(`Target: ${targetRepo}`, colors.dim);
  log("═".repeat(50), colors.dim);

  for (const [folder, folderChanges] of Object.entries(grouped)) {
    log(
      `\n${colors.bold}${folder}/${colors.reset} (${folderChanges.length} files)`,
      colors.blue,
    );

    for (const change of folderChanges) {
      const statusSymbol = getStatusSymbol(change.status);
      const relativePath = change.file.substring(folder.length + 1);
      log(`  ${statusSymbol} ${relativePath}`, colors.reset);
    }
  }

  log(
    `\n${colors.bold}Total: ${changes.length} changed files${colors.reset}`,
    colors.green,
  );
}

function createIntegrationBranch(targetRepo: string, branchName: string) {
  try {
    const currentBranch = execCommand("git rev-parse --abbrev-ref HEAD", targetRepo);
    log(`Current branch in target repo: ${currentBranch}`, colors.dim);
    
    // Check if branch already exists
    const branchExists = execCommand(`git show-ref --verify --quiet refs/heads/${branchName}`, targetRepo);
    
    if (branchExists === "") {
      // Branch doesn't exist, create it
      execCommand(`git checkout -b ${branchName}`, targetRepo);
      log(`✓ Created and switched to branch: ${branchName}`, colors.green);
    } else {
      // Branch exists, switch to it
      execCommand(`git checkout ${branchName}`, targetRepo);
      log(`✓ Switched to existing branch: ${branchName}`, colors.green);
    }
  } catch (error) {
    log(`⚠ Failed to create/switch to branch ${branchName}`, colors.yellow);
    log(`You may need to manually create the integration branch`, colors.dim);
  }
}

async function reviewChanges(changes: FileChange[]) {
  log(`\n${colors.bold}🔍 Interactive Review Mode${colors.reset}`, colors.cyan);
  log("Commands: [enter]=diff, s=skip, q=quit, a=all remaining\n", colors.dim);

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const statusSymbol = getStatusSymbol(change.status);
    const progress = `[${i + 1}/${changes.length}]`;

    log(
      `${colors.bold}${progress}${colors.reset} ${statusSymbol} ${change.file}`,
      colors.cyan,
    );

    const answer = await promptUser(
      "  Review? [enter=yes, s=skip, q=quit, a=all]: ",
    );

    switch (answer.toLowerCase()) {
      case "q":
      case "quit":
        log("Review cancelled.", colors.yellow);
        return;

      case "a":
      case "all":
        log("Opening all remaining files...", colors.green);
        for (let j = i; j < changes.length; j++) {
          const remainingChange = changes[j];
          openDiffInVSCode(remainingChange);
        }
        return;

      case "s":
      case "skip":
        continue;

      default:
        openDiffInVSCode(change);
        break;
    }
  }

  log("\n✅ Review complete!", colors.green);
}

async function main() {
  const args = process.argv.slice(2);
  const help = args.includes("--help") || args.includes("-h");

  if (help || args.length === 0) {
    log(`${colors.bold}Review Changes Utility${colors.reset}`, colors.cyan);
    log(
      "\nCompare your repo against a target repo and apply changes using VS Code.\n",
    );
    log("Usage:", colors.yellow);
    log("  ./scripts/review-changes.ts ../target-repo");
    log("  ./scripts/review-changes.ts ../target-repo --branch integration-branch");
    log("\nOptions:", colors.yellow);
    log("  --branch <name>  Create/switch to integration branch in target repo");
    log("  --help, -h       Show this help message");
    return;
  }

  const targetRepo = args[0];
  const branchIndex = args.indexOf("--branch");
  const branchName = branchIndex !== -1 ? args[branchIndex + 1] : undefined;

  log(`${colors.bold}🔍 Review Changes Utility${colors.reset}`, colors.cyan);

  // Validate target repo
  if (!existsSync(targetRepo)) {
    log(`❌ Target repository not found: ${targetRepo}`, colors.red);
    process.exit(1);
  }

  if (!existsSync(join(targetRepo, ".git"))) {
    log(`❌ Target path is not a git repository: ${targetRepo}`, colors.red);
    process.exit(1);
  }

  // Check if we're in a git repository
  if (!existsSync(".git")) {
    log("❌ Not in a git repository", colors.red);
    process.exit(1);
  }

  // Check VS Code availability
  if (!checkVSCodeAvailable()) {
    log(
      "⚠ VS Code command not found. Install VS Code or add it to PATH.",
      colors.yellow,
    );
    process.exit(1);
  }

  // Create/switch to integration branch if specified
  if (branchName) {
    createIntegrationBranch(targetRepo, branchName);
  }

  // Get changed files
  log("📋 Comparing repositories...", colors.blue);
  const changes = getRepoComparisonFiles(targetRepo);

  if (changes.length === 0) {
    log("✨ No differences found between repositories.", colors.green);
    return;
  }

  // Display summary
  displaySummary(changes, targetRepo);

  // Ask user what to do
  const action = await promptUser(
    "\nWhat would you like to do? [r=review, s=summary only, q=quit]: ",
  );

  switch (action.toLowerCase()) {
    case "r":
    case "review":
      await reviewChanges(changes);
      break;

    case "s":
    case "summary":
      log("Summary complete.", colors.green);
      break;

    default:
      log("Cancelled.", colors.yellow);
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}