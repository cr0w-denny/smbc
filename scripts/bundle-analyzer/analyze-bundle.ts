#!/usr/bin/env tsx

/**
 * Bundle Size Analyzer
 * 
 * Analyzes build outputs to detect:
 * - Bundle size changes
 * - Accidental inclusion of external dependencies
 * - Unexpected large files
 * 
 * Usage: 
 *   ./analyze-bundle.ts <package-path>
 *   ./analyze-bundle.ts --all
 */

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '../..');

interface ThresholdConfig {
  raw: number;
  gzip: number;
}

interface Thresholds {
  applet: ThresholdConfig;
  package: ThresholdConfig;
  app: ThresholdConfig;
}

interface FileAnalysis {
  path: string;
  size: number;
  gzipSize: number;
  content: string;
}

interface PackageAnalysis {
  name: string;
  type: 'applet' | 'package' | 'app';
  path: string;
  mainFile: {
    path: string;
    size: string;
    gzipSize: string;
  };
  threshold: {
    raw: string;
    gzip: string;
  };
  issues: string[];
  status: 'PASS' | 'FAIL';
  error?: string;
}

// Configuration
const THRESHOLDS: Thresholds = {
  // Max sizes in KB
  applet: { raw: 150, gzip: 50 },
  package: { raw: 100, gzip: 30 },
  app: { raw: 500, gzip: 150 },
};

const SUSPICIOUS_PATTERNS = [
  /node_modules/,
  /react\/dist/,
  /react-dom\/dist/,
  /@mui\/material\/dist/,
  /@tanstack\/react-query\/dist/,
  /\.map$/,
];

const EXPECTED_EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@mui/material',
  '@mui/icons-material',
  '@emotion/react',
  '@emotion/styled',
  '@tanstack/react-query',
  '@smbc/applet-core',
  '@smbc/mui-applet-core',
  '@smbc/mui-components',
];

function formatBytes(bytes: number): string {
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB`;
}

function analyzeFile(filePath: string): FileAnalysis {
  const content = readFileSync(filePath, 'utf-8');
  const stats = statSync(filePath);
  const gzipped = gzipSync(content);
  
  return {
    path: filePath,
    size: stats.size,
    gzipSize: gzipped.length,
    content: content.substring(0, 5000), // First 5KB for analysis
  };
}

function checkForBundledDependencies(content: string, _filePath: string): string[] {
  const issues: string[] = [];
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`Suspicious pattern found: ${pattern}`);
    }
  }
  
  // Check for full library includes
  if (content.includes('React.createElement') && content.includes('React.Component')) {
    issues.push('React appears to be bundled instead of externalized');
  }
  
  if (content.includes('createTheme') && content.includes('ThemeProvider')) {
    issues.push('MUI appears to be bundled instead of externalized');
  }
  
  // Check for proper externalization
  const importStatements = content.match(/from\s+["']([^"']+)["']/g) || [];
  const externalImports = importStatements
    .map(stmt => stmt.match(/from\s+["']([^"']+)["']/)?.[1])
    .filter((imp): imp is string => Boolean(imp));
  
  for (const imp of externalImports) {
    const isExpectedExternal = EXPECTED_EXTERNALS.some(ext => imp.startsWith(ext));
    if (isExpectedExternal) {
      // Good - it's properly externalized
    } else if (imp.startsWith('.') || imp.startsWith('/')) {
      // Relative import - this is fine
    } else {
      issues.push(`Unexpected import that might be bundled: ${imp}`);
    }
  }
  
  return issues;
}

function analyzePackage(packagePath: string): PackageAnalysis {
  const packageJsonPath = join(packagePath, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    return {
      name: 'unknown',
      type: 'package',
      path: relative(ROOT, packagePath),
      mainFile: { path: '', size: '', gzipSize: '' },
      threshold: { raw: '', gzip: '' },
      issues: [],
      status: 'FAIL',
      error: 'No package.json found',
    };
  }
  
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const packageName: string = packageJson.name;
  const distPath = join(packagePath, 'dist');
  
  if (!existsSync(distPath)) {
    return {
      name: packageName,
      type: 'package',
      path: relative(ROOT, packagePath),
      mainFile: { path: '', size: '', gzipSize: '' },
      threshold: { raw: '', gzip: '' },
      issues: [],
      status: 'FAIL',
      error: 'No dist directory found',
    };
  }
  
  const files = readdirSync(distPath)
    .filter(f => f.endsWith('.js') && !f.endsWith('.map.js'))
    .map(f => analyzeFile(join(distPath, f)));
  
  const mainFile = files.find(f => f.path.endsWith('index.js')) || files[0];
  
  if (!mainFile) {
    return {
      name: packageName,
      type: 'package',
      path: relative(ROOT, packagePath),
      mainFile: { path: '', size: '', gzipSize: '' },
      threshold: { raw: '', gzip: '' },
      issues: [],
      status: 'FAIL',
      error: 'No JavaScript files found in dist',
    };
  }
  
  // Determine package type
  let type: 'applet' | 'package' | 'app' = 'package';
  if (packagePath.includes('/applets/')) type = 'applet';
  if (packagePath.includes('/apps/')) type = 'app';
  
  const threshold = THRESHOLDS[type];
  const issues: string[] = [];
  
  // Check size
  if (mainFile.size > threshold.raw * 1024) {
    issues.push(`Bundle size (${formatBytes(mainFile.size)}) exceeds threshold (${threshold.raw} KB)`);
  }
  
  if (mainFile.gzipSize > threshold.gzip * 1024) {
    issues.push(`Gzipped size (${formatBytes(mainFile.gzipSize)}) exceeds threshold (${threshold.gzip} KB)`);
  }
  
  // Check for bundled dependencies
  const bundleIssues = checkForBundledDependencies(mainFile.content, mainFile.path);
  issues.push(...bundleIssues);
  
  return {
    name: packageName,
    type,
    path: relative(ROOT, packagePath),
    mainFile: {
      path: relative(packagePath, mainFile.path),
      size: formatBytes(mainFile.size),
      gzipSize: formatBytes(mainFile.gzipSize),
    },
    threshold: {
      raw: `${threshold.raw} KB`,
      gzip: `${threshold.gzip} KB`,
    },
    issues,
    status: issues.length === 0 ? 'PASS' : 'FAIL',
  };
}

function findAllPackages(): string[] {
  const packages: string[] = [];
  
  // Find packages
  const packagesDir = join(ROOT, 'packages');
  if (existsSync(packagesDir)) {
    for (const pkg of readdirSync(packagesDir)) {
      const pkgPath = join(packagesDir, pkg);
      if (statSync(pkgPath).isDirectory() && existsSync(join(pkgPath, 'package.json'))) {
        packages.push(pkgPath);
      }
    }
  }
  
  // Find applets
  const appletsDir = join(ROOT, 'applets');
  if (existsSync(appletsDir)) {
    for (const applet of readdirSync(appletsDir)) {
      const appletPath = join(appletsDir, applet);
      if (statSync(appletPath).isDirectory()) {
        for (const variant of readdirSync(appletPath)) {
          const variantPath = join(appletPath, variant);
          if (statSync(variantPath).isDirectory() && existsSync(join(variantPath, 'package.json'))) {
            packages.push(variantPath);
          }
        }
      }
    }
  }
  
  // Find apps
  const appsDir = join(ROOT, 'apps');
  if (existsSync(appsDir)) {
    for (const app of readdirSync(appsDir)) {
      const appPath = join(appsDir, app);
      if (statSync(appPath).isDirectory() && existsSync(join(appPath, 'package.json'))) {
        packages.push(appPath);
      }
    }
  }
  
  return packages;
}

function generateReport(results: PackageAnalysis[]): string {
  const timestamp = new Date().toISOString();
  let report = `# Bundle Analysis Report\n\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.error).length;
  
  report += `## Summary\n\n`;
  report += `- Total packages: ${results.length}\n`;
  report += `- Passed: ${passed}\n`;
  report += `- Failed: ${failed}\n`;
  report += `- Errors: ${errors}\n\n`;
  
  // Details by status
  if (failed > 0) {
    report += `## Failed Packages\n\n`;
    for (const result of results.filter(r => r.status === 'FAIL')) {
      report += `### ${result.name}\n\n`;
      report += `- Type: ${result.type}\n`;
      report += `- Path: ${result.path}\n`;
      if (!result.error) {
        report += `- Size: ${result.mainFile.size} (gzipped: ${result.mainFile.gzipSize})\n`;
        report += `- Threshold: ${result.threshold.raw} (gzipped: ${result.threshold.gzip})\n`;
      }
      if (result.error) {
        report += `- Error: ${result.error}\n`;
      } else if (result.issues.length > 0) {
        report += `- Issues:\n`;
        for (const issue of result.issues) {
          report += `  - ${issue}\n`;
        }
      }
      report += '\n';
    }
  }
  
  // All results table
  report += `## All Results\n\n`;
  report += `| Package | Type | Size | Gzipped | Status |\n`;
  report += `|---------|------|------|---------|--------|\n`;
  
  for (const result of results) {
    if (result.error) {
      report += `| ${result.name} | - | ERROR | ERROR | ❌ |\n`;
    } else {
      const emoji = result.status === 'PASS' ? '✅' : '❌';
      report += `| ${result.name} | ${result.type} | ${result.mainFile.size} | ${result.mainFile.gzipSize} | ${emoji} |\n`;
    }
  }
  
  return report;
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage:');
    console.log('  analyze-bundle.ts <package-path>   Analyze a specific package');
    console.log('  analyze-bundle.ts --all            Analyze all packages');
    console.log('  analyze-bundle.ts --report         Generate full report');
    return;
  }
  
  let packages: string[] = [];
  
  if (args[0] === '--all' || args[0] === '--report') {
    packages = findAllPackages();
  } else {
    const packagePath = join(ROOT, args[0]);
    if (!existsSync(packagePath)) {
      console.error(`Package not found: ${packagePath}`);
      process.exit(1);
    }
    packages = [packagePath];
  }
  
  const results = packages.map(analyzePackage);
  
  if (args[0] === '--report') {
    const report = generateReport(results);
    const reportPath = join(ROOT, 'bundle-analysis-report.md');
    writeFileSync(reportPath, report);
    console.log(`Report generated: ${reportPath}`);
  }
  
  // Console output
  for (const result of results) {
    if (result.error) {
      console.log(`\n❌ ${result.name}: ${result.error}`);
      continue;
    }
    
    const emoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`\n${emoji} ${result.name}`);
    console.log(`   Type: ${result.type}`);
    console.log(`   Size: ${result.mainFile.size} (gzipped: ${result.mainFile.gzipSize})`);
    
    if (result.issues.length > 0) {
      console.log('   Issues:');
      for (const issue of result.issues) {
        console.log(`   - ${issue}`);
      }
    }
  }
  
  // Exit with error if any failures
  const hasFailures = results.some(r => r.status === 'FAIL' || r.error);
  process.exit(hasFailures ? 1 : 0);
}

main().catch(console.error);