# Scripts

Development and build tools that run with `tsx` (no compilation needed).

## Structure

- `mock-generation/` - MSW mock generation from OpenAPI specs
  - `cli.ts` - Main CLI entry point
  - `generator.ts` - Mock generator logic
  - `schema-analyzer.ts` - OpenAPI schema analysis
  - `__tests__/` - Test files

## Usage

```bash
# Generate MSW mocks from OpenAPI spec
pnpm generate-mocks ./api.json ./src/mocks.ts --verbose

# Run tests
pnpm test
```