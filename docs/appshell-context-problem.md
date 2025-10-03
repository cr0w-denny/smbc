# AppShell Context Problem & Solutions

## Problem
AppShell.Toolbar needs to access `toolbarMode` context, but:
- Context provider is in host app (mui-ewi)
- Context consumer is in applet (ewi-events)
- Both import from @smbc/mui-components
- In dev mode with Vite, mui-components may load twice (once in host, once in applet)
- This creates two different Context objects, so provider/consumer don't connect

## Current Architecture
```
mui-ewi (host)
  └─ AppShellProvider (from mui-components)
      └─ AppShell.Layout (from mui-components)
          └─ AppletRouter (from applet-host)
              └─ Events (from ewi-events applet)
                  └─ AppShell.Toolbar (from mui-components)
                      └─ useAppShell() ❌ returns undefined
```

## Existing Applet Context System
We just created an applet config system that works:
- `AppletMount` interface has `config?: Record<string, any>` field
- Host sets config in `applet.config.ts` when mounting applets
- Applets access via `useAppletCore().getConfig<T>()`
- Uses `getCurrentApplet()` to match path and return current applet's config
- **This already spans host/applet boundary successfully** via applet-core

Example usage:
```tsx
// Host (applet.config.ts)
export const APPLETS: AppletMount[] = [
  {
    id: "ewi-events",
    routes: [...],
    config: { toolbarMode: "dark" }
  }
];

// Applet (Events.tsx)
const { getConfig } = useAppletCore();
const { toolbarMode } = getConfig<{ toolbarMode?: "light" | "dark" }>();
```

## Why We Chose React Context Initially
- Wanted app-level control: "all applets in ewi will have this dark backdrop"
- But also per-applet override: "usage-stats won't have backdrop even in ewi app"
- Context seemed like the React-native way to handle this
- Host provides default, individual applets can override

## The Real Issue
We're trying to use React Context from mui-components across module boundaries.
The applet config system (via applet-core) already solves host→applet communication successfully.

## Solution Options

### Option A: Use Applet Config + Toolbar Prop
Applet reads config and passes to Toolbar as prop
```tsx
// Host (applet.config.ts)
config: { toolbarMode: "dark" }

// Applet (Events.tsx)
const { getConfig } = useAppletCore();
const { toolbarMode } = getConfig();
return <AppShell.Toolbar mode={toolbarMode} />  // prop instead of context
```
**Pro:**
- Explicit, no magic
- Uses existing working system
- No module boundary issues
- mui-components stays generic

**Con:**
- Every applet must wire it through
- Toolbar component needs mode prop again

### Option B: Toolbar Reads Config Directly
Toolbar component uses useAppletCore itself
```tsx
// In Toolbar.tsx
import { useAppletCore } from "@smbc/applet-core";

const { getConfig } = useAppletCore();
const { toolbarMode } = getConfig<{ toolbarMode?: string }>();
```
**Pro:**
- Automatic, no wiring needed per applet
- Uses existing working system

**Con:**
- mui-components now depends on applet-core
- Breaks generic reusability of mui-components
- Toolbar becomes applet-specific

### Option C: CSS Variable (Global State)
```tsx
// Host sets CSS var based on current route
React.useEffect(() => {
  const config = getCurrentApplet(path, applets)?.config;
  document.documentElement.style.setProperty(
    '--appshell-toolbar-mode',
    config?.toolbarMode || 'light'
  );
}, [path]);

// Toolbar reads CSS var
const mode = getComputedStyle(document.documentElement)
  .getPropertyValue('--appshell-toolbar-mode') || 'light';
```
**Pro:**
- Works across module boundaries
- Host controls it globally
- mui-components stays generic
- Automatic per-applet via route changes

**Con:**
- Not very React-y
- Harder to type-check
- Global mutable state

### Option D: Keep Context, Fix Module Deduplication
Fix Vite config to ensure single mui-components instance
**Pro:**
- Fixes root cause
- Context works as intended

**Con:**
- Build config complexity
- May not work in all build scenarios
- Fragile dependency on build setup

## Investigation: Is Module Duplication Real?

Checked `apps/mui-ewi/vite.config.ts`:
```ts
resolve: {
  alias: {
    // Only use source aliases in development for HMR
    ...(isProduction ? {} : {
      "@smbc/mui-components": path.resolve(__dirname, "../../packages/mui-components/src"),
      // ... more aliases
    }),
  },
}
```

**Finding:** Module duplication is **DEV-ONLY**
- Dev mode: Source aliases point to `/src` folders, Vite treats each import as separate module instance
- Prod mode: No source aliases, uses built dist files, proper deduplication via Rollup
- React Context from mui-components creates separate instances in dev, causing provider/consumer disconnect

**Implications:**
- Context would work fine in production
- Only broken during development (which is where we work!)
- Need a solution that works in both dev and prod

## Current Thinking
Given module duplication is dev-only but that's where we spend all our time:

1. **Option A (Explicit prop)** - Works in all scenarios, most straightforward
2. **Option C (CSS Variable)** - Works in all scenarios, no React Context issues
3. **Option D (Fix dev deduplication)** - Complex, would need to change Vite setup for all packages
