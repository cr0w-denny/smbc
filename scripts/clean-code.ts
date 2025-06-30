#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { execSync } from 'child_process';
import chalk from 'chalk';

interface CleanOptions {
  dry?: boolean;
  verbose?: boolean;
  include?: string[];
  exclude?: string[];
}

function parseArgs(): CleanOptions {
  const args = process.argv.slice(2);
  const options: CleanOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
      case '-d':
        options.dry = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--include':
        options.include = args[++i]?.split(',') || [];
        break;
      case '--exclude':
        options.exclude = args[++i]?.split(',') || [];
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: clean-code [options]

Strip console.log statements and format code according to Prettier rules.

Options:
  --dry-run, -d     Show what would be changed without making changes
  --verbose, -v     Show detailed output
  --include         Comma-separated list of additional patterns to include
  --exclude         Comma-separated list of patterns to exclude
  --help, -h        Show this help message

Examples:
  # Clean all TypeScript/JavaScript files
  clean-code

  # Dry run to see what would be changed
  clean-code --dry-run

  # Verbose output with dry run
  clean-code --dry-run --verbose

  # Include additional patterns
  clean-code --include "*.jsx,*.vue"

  # Exclude specific directories
  clean-code --exclude "node_modules/**,dist/**"
`);
        process.exit(0);
    }
  }

  return options;
}

function stripConsoleLogs(content: string): { cleaned: string; removed: number } {
  let removed = 0;
  
  // Pattern to match console.log statements
  // Handles: console.log(), console.debug(), console.info(), console.warn()
  // But preserves console.error() as those might be important for error handling
  const consolePattern = /^\s*console\.(log|debug|info|warn)\s*\([^)]*\)\s*;?\s*$/gm;
  
  // Also handle multi-line console statements
  const multiLinePattern = /^\s*console\.(log|debug|info|warn)\s*\(\s*$/gm;
  
  let cleaned = content;
  
  // Remove single-line console statements
  cleaned = cleaned.replace(consolePattern, (match) => {
    removed++;
    return '';
  });
  
  // Handle multi-line console statements (more complex)
  const lines = cleaned.split('\n');
  const cleanedLines: string[] = [];
  let inConsoleStatement = false;
  let parenCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inConsoleStatement) {
      // Check if this line starts a console statement
      const match = line.match(/^\s*console\.(log|debug|info|warn)\s*\(/);
      if (match) {
        inConsoleStatement = true;
        parenCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
        
        // If the statement is complete on this line, skip it
        if (parenCount <= 0) {
          removed++;
          inConsoleStatement = false;
          continue;
        }
        // Otherwise, start tracking the multi-line statement
        continue;
      } else {
        cleanedLines.push(line);
      }
    } else {
      // We're in a multi-line console statement
      parenCount += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      
      if (parenCount <= 0) {
        // Statement is complete, skip this line and stop tracking
        removed++;
        inConsoleStatement = false;
      }
      // Continue skipping lines until statement is complete
    }
  }
  
  // Remove multiple consecutive empty lines
  cleaned = cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n');
  
  return { cleaned, removed };
}

async function getFilesToProcess(options: CleanOptions): Promise<string[]> {
  const defaultPatterns = [
    'packages/**/*.{ts,tsx,js,jsx}',
    'apps/**/*.{ts,tsx,js,jsx}',
    'applets/**/*.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,tsx,js,jsx}'
  ];
  
  const includePatterns = options.include ? [...defaultPatterns, ...options.include] : defaultPatterns;
  
  const defaultExcludes = [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.d.ts',
    'tsp-output/**',
    '**/*.generated.*',
    '**/generated/**'
  ];
  
  const excludePatterns = options.exclude ? [...defaultExcludes, ...options.exclude] : defaultExcludes;
  
  let allFiles: string[] = [];
  
  for (const pattern of includePatterns) {
    const files = await glob(pattern, { 
      ignore: excludePatterns,
      absolute: false 
    });
    allFiles = [...allFiles, ...files];
  }
  
  // Remove duplicates
  return [...new Set(allFiles)];
}

function formatWithPrettier(files: string[], verbose: boolean) {
  if (files.length === 0) return;
  
  try {
    if (verbose) {
      console.log(chalk.blue('🎨 Running Prettier...'));
    }
    
    execSync(`npx prettier --write ${files.map(f => `"${f}"`).join(' ')}`, {
      stdio: verbose ? 'inherit' : 'pipe'
    });
    
    if (verbose) {
      console.log(chalk.green('✅ Prettier formatting complete'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Prettier formatting failed:'), error);
  }
}

async function main() {
  const options = parseArgs();
  
  console.log(chalk.cyan('🧹 Cleaning codebase...'));
  if (options.dry) {
    console.log(chalk.yellow('🔍 DRY RUN MODE - No files will be modified'));
  }
  
  const files = await getFilesToProcess(options);
  console.log(chalk.blue(`📁 Found ${files.length} files to process`));
  
  let totalRemoved = 0;
  let filesChanged = 0;
  const changedFiles: string[] = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const { cleaned, removed } = stripConsoleLogs(content);
      
      if (removed > 0) {
        filesChanged++;
        totalRemoved += removed;
        changedFiles.push(file);
        
        if (options.verbose) {
          console.log(chalk.yellow(`🗑️  ${file}: removed ${removed} console statement(s)`));
        }
        
        if (!options.dry) {
          writeFileSync(file, cleaned, 'utf-8');
        }
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error processing ${file}:`), error);
    }
  }
  
  console.log(chalk.green(`\n✨ Console cleanup complete!`));
  console.log(chalk.white(`   Files processed: ${files.length}`));
  console.log(chalk.white(`   Files changed: ${filesChanged}`));
  console.log(chalk.white(`   Console statements removed: ${totalRemoved}`));
  
  if (totalRemoved > 0 && !options.dry) {
    console.log(chalk.blue('\n🎨 Formatting with Prettier...'));
    formatWithPrettier(changedFiles, options.verbose || false);
    console.log(chalk.green('✅ Code formatting complete!'));
  }
  
  if (options.dry && totalRemoved > 0) {
    console.log(chalk.yellow('\n💡 Run without --dry-run to apply these changes'));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}