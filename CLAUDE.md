# Claude Development Notes

## IMPORTANT: NO TEMP FIXES!
- Never implement temporary workarounds
- Always implement proper, permanent solutions
- If something doesn't work, fix the root cause

## Commands to Run

### Development
- **NEVER run `npm run dev`** - User will handle this manually
- **STOP running `npm run build` after every change** - it takes way too long, only run when necessary
- Use `npm run lint` for linting
- Use `npm run typecheck` for type checking

## Project Structure
- Monorepo with multiple applets
- Hello-mui applet uses Material-UI components
- Style mixins in `applets/hello/mui/src/components/common/styles.ts`

## Recent Changes
- Renamed style mixins from "static" to "content" based names:
  - `staticCard` → `contentCard`
  - `staticCardWithBorder` → `contentCardWithBorder` 
  - `paperSection` → `contentPaper`
- Fixed all import statements to use new names
- Removed hover effects from content areas (cards/papers)

## Workflow Principles
- dont assume! always ask before removing stuff

## Meta Notes
- this is a real implementation. never use something and say "in a real implementation" because this IS A REAL IMPLEMENTATION
- **NEVER use `require()` - we are using ESM modules exclusively**
- **ALWAYS verify tests exercise actual functionality** - Before writing any test, ensure it will fail if the implementation logic is broken, not just if mocks change. Avoid tests that only verify mock data passthrough or trivial object existence.
- never put colors or specific values for size, shadow, etc, outside of ui-core. we only want to use tokens throughout the codebase
- never updated generated files, especially not in ui-core. edit source and regenerate outputs instead
- after editing tokens always run ui-core build
- keep suppressRowClickSelection. we need it