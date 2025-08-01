# Claude Development Notes

## IMPORTANT: NO TEMP FIXES!
- Never implement temporary workarounds
- Always implement proper, permanent solutions
- If something doesn't work, fix the root cause

## Commands to Run

### Development
- **NEVER run `npm run dev`** - User will handle this manually
- Use `npm run build` to test builds
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