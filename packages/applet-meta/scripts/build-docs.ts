import * as fs from 'node:fs';
import * as path from 'node:path';
import { marked } from 'marked';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../../');
const outputFile = path.resolve(__dirname, '../src/applet-docs.keep.js');

interface AppletDoc {
  markdown: string;
  html: string;
}

interface AppletDocs {
  [appletId: string]: {
    frontend?: AppletDoc;
    backend?: AppletDoc;
  };
}

async function collectAppletDocs(): Promise<AppletDocs> {
  const docs: AppletDocs = {};
  const appletsDir = path.join(rootDir, 'applets');
  
  // Get all applet directories
  const appletDirs = fs.readdirSync(appletsDir).filter(dir => {
    const stats = fs.statSync(path.join(appletsDir, dir));
    return stats.isDirectory();
  });

  for (const appletId of appletDirs) {
    docs[appletId] = {};

    // Check for frontend (MUI) README
    const muiReadmePath = path.join(appletsDir, appletId, 'mui', 'README.md');
    if (fs.existsSync(muiReadmePath)) {
      const markdown = fs.readFileSync(muiReadmePath, 'utf-8');
      const html = await marked(markdown);
      docs[appletId].frontend = { markdown, html };
    }

    // Check for backend (Django) README
    const djangoReadmePath = path.join(appletsDir, appletId, 'django', 'README.md');
    if (fs.existsSync(djangoReadmePath)) {
      const markdown = fs.readFileSync(djangoReadmePath, 'utf-8');
      const html = await marked(markdown);
      docs[appletId].backend = { markdown, html };
    }
  }

  return docs;
}

async function generateDocsModule() {
  console.log('Collecting applet documentation...');
  const docs = await collectAppletDocs();
  
  // Generate JavaScript module
  const content = `/**
 * Auto-generated applet documentation
 * Generated at: ${new Date().toISOString()}
 */

export const APPLET_DOCS = ${JSON.stringify(docs, null, 2)};

// Helper to get documentation for a specific applet
export function getAppletDocs(appletId) {
  return APPLET_DOCS[appletId];
}

// Helper to check if an applet has backend documentation
export function hasBackendDocs(appletId) {
  return !!APPLET_DOCS[appletId]?.backend;
}
`;

  fs.writeFileSync(outputFile, content);
  console.log(`Generated applet documentation at: ${outputFile}`);
  
  // Log summary
  const appletCount = Object.keys(docs).length;
  const frontendCount = Object.values(docs).filter(d => d.frontend).length;
  const backendCount = Object.values(docs).filter(d => d.backend).length;
  
  console.log(`Summary:`);
  console.log(`- Total applets: ${appletCount}`);
  console.log(`- Frontend docs: ${frontendCount}`);
  console.log(`- Backend docs: ${backendCount}`);
}

// Run the build
generateDocsModule().catch(error => {
  console.error('Error building documentation:', error);
  process.exit(1);
});