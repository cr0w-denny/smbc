# Project-Specific Instructions for Claude

## Generated Files Policy
- **NEVER modify generated files directly**
- Generated files include:
  - `src/generated/*` - OpenAPI TypeScript types
  - `src/mocks/index.ts` - Auto-generated mock handlers
  - `tsp-output/*` - TypeSpec compiler output
  - Any file with "generated" in the path or header comment
- If there are issues in generated files, fix the source/generator instead:
  - For mock generation issues: Update `scripts/mock-generation/generator.ts`
  - For TypeScript type issues: Update the TypeSpec API definitions
  - For other generated content: Find and update the source template or generator

## Build Commands
- Run `npm run lint` before committing
- Run `npm run type-check` to verify TypeScript compilation