# Build Strategy: Dev vs Prod Entry Points

## Overview

This application uses a dual entry point strategy to completely exclude development tools from production builds while maintaining a seamless development experience.

## Architecture

### Entry Points

```
Development Build:
main.dev.tsx → App.dev.tsx → <DevProvider><App /></DevProvider>

Production Build:
main.prod.tsx → App.tsx (direct)
```

### Why This Matters

**Production Requirements:**
- Zero development code in production bundle
- Minimal bundle size
- No debug tools or development dependencies
- Clean, optimized build

**Development Requirements:**
- Full debugging capabilities
- Development tools UI (DevToolsMenu, Console, etc.)
- Hot module replacement for dev dependencies
- Rich development experience

## Key Implementation Details

### 1. Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const entryPoint = isProduction ? "src/main.prod.tsx" : "src/main.dev.tsx";

  // Different HTML files and builds based on mode
  rollupOptions: {
    input: isProduction ? "index.prod.html" : "index.html"
  }
});
```

### 2. Development Context (`DevContext.tsx`)

**Critical Pattern: Dynamic Import**
```typescript
// DON'T DO THIS - includes devtools in all builds:
import { DevToolsMenu } from "@smbc/mui-applet-devtools";

// DO THIS - excludes devtools from production:
React.useEffect(() => {
  import("@smbc/mui-applet-devtools").then((imports) => {
    setDevToolsImports(imports);
  });
}, []);
```

**Why Dynamic Import is Essential:**
- **Bundle Splitting**: Keeps `@smbc/mui-applet-devtools` out of production bundle entirely
- **Conditional Loading**: Only loads when `DevProvider` is present (dev builds only)
- **Tree Shaking**: Bundler can completely eliminate dev dependencies in prod

### 3. Component Strategy

**Development Tools Pattern:**
```typescript
// All development UI components check environment
if (process.env.NODE_ENV !== 'development') {
  return null;
}
```

**Runtime vs Build-time Exclusion:**
- `process.env.NODE_ENV` check = runtime exclusion (still in bundle)
- Dynamic import + separate entry = build-time exclusion (not in bundle)

## File Structure

```
src/
├── main.dev.tsx          # Development entry point
├── main.prod.tsx         # Production entry point
├── App.dev.tsx           # Wraps App with DevProvider
├── App.tsx               # Main application (shared)
└── context/
    └── DevContext.tsx    # Dynamic import strategy
```

## Bundle Analysis

**Development Build:**
- Includes all devtools dependencies
- Larger bundle size acceptable
- Full debugging capabilities

**Production Build:**
- Zero devtools code
- Minimal bundle size
- Clean, optimized output

## Best Practices

### ✅ Do
- Use dynamic imports for dev-only dependencies
- Separate entry points for different environments
- Runtime guards as secondary protection
- Build-time exclusion as primary strategy

### ❌ Don't
- Direct import dev tools in shared code
- Rely only on runtime environment checks
- Include debug tools in production builds
- Mix development and production concerns

## Verification

To verify the strategy is working:

```bash
# Build production bundle
npm run build

# Analyze bundle (should not contain devtools)
npx vite-bundle-analyzer dist

# Check for devtools imports
grep -r "mui-applet-devtools" dist/ # Should find nothing
```

## Why Not Simpler Approaches?

**Option 1: Runtime-only checks**
```typescript
// ❌ Still includes code in production bundle
const DevTools = process.env.NODE_ENV === 'development' ? DevToolsMenu : null;
```

**Option 2: Build flags with bundler**
```typescript
// ❌ More complex, harder to maintain
if (VITE_INCLUDE_DEVTOOLS) { ... }
```

**Option 3: Separate repositories**
```typescript
// ❌ Development friction, deployment complexity
```

## Conclusion

The dual entry point + dynamic import strategy provides:
- **Complete separation** of development and production code
- **Zero runtime overhead** in production
- **Seamless development experience** with full tooling
- **Maintainable codebase** with clear boundaries

This approach ensures that production builds are as clean and optimized as possible while maintaining rich development capabilities.