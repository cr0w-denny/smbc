import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Function to generate TypeScript types from token JSON
function generateTypesFromTokens(tokensPath: string, outputPath: string) {
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

  function generateInterfaceFromObject(obj: any, depth = 0): string {
    const indent = '  '.repeat(depth);
    let result = '{\n';

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result += `${indent}  ${key}: string;\n`;
      } else if (typeof value === 'object' && value !== null) {
        result += `${indent}  ${key}: ${generateInterfaceFromObject(value, depth + 1)};\n`;
      }
    }

    result += `${indent}}`;
    return result;
  }

  const typeDefinition = `// Auto-generated types from tokens.json
export interface TokenStructure ${generateInterfaceFromObject(tokens)}

// Type to convert object structure to callable proxy structure
type TokenProxy<T> = {
  [K in keyof T]: T[K] extends string
    ? () => string
    : TokenProxy<T[K]>
}

export type UITokens = TokenProxy<TokenStructure['ui']>;
export type ColorTokens = TokenProxy<TokenStructure['color']>;
`;

  writeFileSync(outputPath, typeDefinition);
  console.log(`Types generated successfully at ${outputPath}`);
}

// Generate types if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypesFromTokens(
    join(process.cwd(), 'src/tokens.json'),
    join(process.cwd(), 'src/types-generated.ts')
  );
}