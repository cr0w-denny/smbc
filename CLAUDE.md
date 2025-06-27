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

## Project Philosophy
- There is no legacy. Don't keep things around for backwards compatibility. This is version zero.

## Script Conventions

### Standard Scripts (Every package should have)
- `build` - Production build
- `dev` - Development with watch mode
- `clean` - Clean build artifacts
- `lint` - Code linting
- `type-check` - TypeScript type checking
- `test` - Run tests

### Development Workflow
- **`npm run dev`** - Start complete development environment with hot reload
  - Watches all dependencies and rebuilds automatically
  - Runs API servers, builds libraries, and starts mui-host-dev
  - Uses concurrently with colored output for each process
- **`npm run dev:libs`** - Watch core libraries only
- **`npm run dev:apis`** - Watch API packages and clients only
- **`npm run dev:host`** - Run just the host app
- **`npm run dev:all`** - Simple parallel execution of all dev scripts

### Build Commands
- `npm run build` - Build all packages
- `npm run build:libs` - Build only packages/*
- `npm run build:apps` - Build only apps/*
- `npm run build:applets` - Build only applets/*/*

### Quality Assurance
- `npm run lint` - Lint all packages
- `npm run type-check` - TypeScript check all packages
- `npm run test` - Run all tests
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run validate` - Run type-check + lint + test

### Package-Specific Scripts
- **API packages**: `generate:api` for TypeSpec compilation
- **API clients**: `generate:api`, `generate-mocks` for OpenAPI types and MSW mocks
- **MUI packages**: Standard build/dev with Vite