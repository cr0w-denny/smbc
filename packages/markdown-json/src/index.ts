import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { glob } from 'glob';
import { marked } from 'marked';

export interface MarkdownDocument {
  markdown: string;
  html: string;
}

export interface MarkdownCollection {
  docs: Record<string, MarkdownDocument>;
  generatedAt: string;
}

/**
 * Find and process markdown files
 */
async function findMarkdownFiles(searchPatterns: string[]): Promise<Record<string, MarkdownDocument>> {
  const docs: Record<string, MarkdownDocument> = {};
  
  for (const pattern of searchPatterns) {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    for (const file of files) {
      const fullPath = resolve(process.cwd(), file);
      
      if (existsSync(fullPath)) {
        try {
          const markdown = readFileSync(fullPath, 'utf-8');
          
          // Use the file path as the key (without extension)
          const key = file.replace(/\.md$/, '').replace(/\//g, '_');
          
          docs[key] = {
            markdown,
            html: await marked(markdown),
          };
          
          console.log(`Processed: ${file} -> ${key}`);
        } catch (error) {
          console.warn(`Could not read ${fullPath}:`, error);
        }
      }
    }
  }
  
  return docs;
}

/**
 * Generate markdown JSON from files matching the given patterns
 */
export async function generateMarkdownJson(
  searchPatterns: string[],
  outputDir: string = 'src/generated'
): Promise<void> {
  console.log('📚 Converting markdown files to JSON...');
  
  // Find and process markdown files
  const docs = await findMarkdownFiles(searchPatterns);
  console.log(`Processed ${Object.keys(docs).length} markdown files`);
  
  // Prepare output data
  const collection: MarkdownCollection = {
    docs,
    generatedAt: new Date().toISOString(),
  };
  
  // Ensure output directory exists
  const outputPath = resolve(process.cwd(), outputDir);
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath, { recursive: true });
  }
  
  // Write the generated docs
  const outputFile = join(outputPath, 'docs.js');
  const fileContent = `/**
 * Generated markdown documentation
 * Generated at: ${collection.generatedAt}
 * 
 * This file contains markdown files converted to JSON format
 * for static consumption by browser applications.
 */

export const DOCS = ${JSON.stringify(collection.docs, null, 2)};

export function getDoc(key) {
  return DOCS[key];
}

export function hasDoc(key) {
  return !!DOCS[key];
}

export const GENERATED_AT = "${collection.generatedAt}";
`;
  
  writeFileSync(outputFile, fileContent);
  console.log(`✅ Generated documentation file: ${outputFile}`);
}