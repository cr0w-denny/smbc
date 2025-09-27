# API Server Override System

## Overview

The API server override system allows developers to automatically override API server URLs across all applets using pattern-based environment variable mapping. This provides a simple way to redirect API calls to different environments without modifying individual applet configurations or API specifications.

## How It Works

### 1. Pattern-Based Environment Variable Mapping

Configure URL patterns that should be replaced with environment variable values:

```typescript
// applet.config.ts
import { createapiOverrides } from "@smbc/applet-host";

// Configure api override mappings
const apiOverrides = createapiOverrides([
  {
    pattern: "*/api/*",
    envVar: "VITE_API_BASE",
  },
]);
```

### 2. Automatic Application to All Applets

Apply the override function to all applet definitions:

```typescript
// Applet definitions
const appletDefinitions = [
  {
    applet: ewiEventsApplet,
    config: {
      id: "ewi-events",
      label: "EWI Events",
      path: "/events",
      icon: Dashboard,
      permissions: [ewiEventsApplet.permissions.VIEW_EVENTS],
    },
  },
  // ... more applets
];

// Apply overrides to all applets
export const APPLETS: AppletMount[] = appletDefinitions.map((def) =>
  mountApplet(
    def.applet,
    def.config,
    apiOverrides((def.applet as any).apiSpec?.spec?.servers || []),
  ),
);
```

### 3. Environment Configuration

Set environment variables to control API endpoints:

```bash
# .env.local
VITE_API_BASE=http://localhost:3001/api/test-mapped

# .env.development
VITE_API_BASE=https://dev.example.com/api

# .env.production
VITE_API_BASE=https://api.example.com/api
```

### 4. Override Mechanism

The system works by:
1. `createapiOverrides()` creates a pattern-matching function based on your configurations
2. At module load time, the function is called for each applet's servers
3. URLs matching the patterns are replaced with environment variable values
4. The resulting server arrays are passed to `mountApplet()`
5. If no environment variables are set, no overrides are applied

**Before Override (original applet API spec):**
```json
{
  "servers": [
    { "url": "https://api.production.com/api/v1", "description": "production" },
    { "url": "http://localhost:3000/api/v1", "description": "development" }
  ]
}
```

**After Override (with VITE_API_BASE=http://localhost:3001/api/test-mapped):**
```json
{
  "servers": [
    { "url": "http://localhost:3001/api/test-mapped", "description": "production" },
    { "url": "http://localhost:3001/api/test-mapped", "description": "development" }
  ]
}
```

### 5. Implementation Details

The pattern matching is implemented in `createapiOverrides`:

```typescript
// packages/applet-host/src/utils/createServerOverrideFunction.ts
export function createapiOverrides(
  mappings: ServerOverrideMapping[]
): ServerOverrideFunction {
  // Check if any env vars are set - if not, skip processing
  const hasAnyEnvVars = mappings.some(mapping => getEnvVar(mapping.envVar));
  if (!hasAnyEnvVars) {
    return () => undefined;
  }

  return (servers: Array<{ url: string; description?: string }>) => {
    const overrides: Array<{ url: string; description?: string }> = [];

    for (const server of servers) {
      for (const mapping of mappings) {
        if (matchesPattern(server.url, mapping.pattern)) {
          const envValue = getEnvVar(mapping.envVar);
          if (envValue) {
            overrides.push({
              url: envValue,
              description: server.description,
            });
            break; // Use first matching pattern
          }
        }
      }
    }

    return overrides.length > 0 ? overrides : undefined;
  };
}
```

## Configuration Examples

### Single Pattern Mapping

Override all API URLs that match a pattern:

```typescript
const apiOverrides = createapiOverrides([
  {
    pattern: "*/api/*",
    envVar: "VITE_API_BASE",
  },
]);
```

### Multiple Pattern Mappings

Handle different services with different environment variables:

```typescript
const apiOverrides = createapiOverrides([
  {
    pattern: "*/api/v1/*",
    envVar: "VITE_MAIN_API",
  },
  {
    pattern: "*/analytics/*",
    envVar: "VITE_ANALYTICS_API",
  },
  {
    pattern: "*/auth/*",
    envVar: "VITE_AUTH_SERVICE",
  },
]);
```

### Pattern Syntax

The system supports wildcard patterns for flexible URL matching:

```typescript
// Match any URL ending with /api
"*/api"

// Match any URL containing /api/
"*/api/*"

// Match specific domain
"https://specific.domain.com/*"

// Match everything (use as fallback)
"*"
```

## Use Cases

### 1. Local Development

Point applets to your local development servers:

```typescript
mountApplet(userManagementApplet, config, [
  { url: "http://localhost:3001/api", description: "development" }
]),
```

### 2. Testing Different Environments

Quickly switch an applet to different backend environments:

```typescript
// Test against staging backend
mountApplet(applet, config, [
  { url: "https://staging-backend.example.com/api", description: "production" }
]),
```

### 3. Microservice Development

Override specific services during development:

```typescript
// Only override the events service, leave others unchanged
mountApplet(eventsApplet, config, [
  { url: "http://localhost:8080/events", description: "development" }
]),
```

### 4. API Versioning

Test against different API versions:

```typescript
mountApplet(applet, config, [
  { url: "https://api.example.com/v2", description: "production" }
]),
```

## Benefits

1. **Global Configuration** - Configure once, applies to all applets automatically
2. **Pattern-Based Matching** - Flexible wildcard patterns for URL matching
3. **Environment Variable Driven** - Uses standard Vite environment variables
4. **No Render Loops** - Stable configuration prevents runtime issues
5. **Efficient** - Skips processing entirely when no env vars are set
6. **Non-Destructive** - Original applet API specs remain unchanged

## Key Features

1. **Automatic Application** - No need to configure each applet individually
2. **Module Load Time** - Overrides calculated once at startup
3. **Conditional Processing** - Only processes when environment variables exist
4. **Pattern Priority** - First matching pattern wins
5. **Browser Compatible** - Safe environment variable access

## Best Practices

1. **Simple Patterns** - Use `*/api/*` for most common cases
2. **Environment Variables** - Keep `.env.example` file for documentation
3. **Test Locally** - Verify overrides work with `.env.local`
4. **One Function Per App** - Create one `apiOverrides` function per host application
5. **Stable Configuration** - Define patterns at module level, not in components

## Migration Guide

### From Manual Server Overrides

**Before (manual overrides per applet):**
```typescript
export const APPLETS = [
  mountApplet(applet1, config1, [{ url: "http://localhost:3001/api", description: "dev" }]),
  mountApplet(applet2, config2, [{ url: "http://localhost:3001/api", description: "dev" }]),
  // ... repeat for each applet
];
```

**After (pattern-based global overrides):**
```typescript
const apiOverrides = createapiOverrides([
  { pattern: "*/api/*", envVar: "VITE_API_BASE" }
]);

export const APPLETS = appletDefinitions.map((def) =>
  mountApplet(def.applet, def.config, apiOverrides(def.applet.apiSpec?.spec?.servers || []))
);
```

### Environment Setup

```bash
# .env.local (for local development)
VITE_API_BASE=http://localhost:3001/api/test-mapped

# .env.example (documentation)
VITE_API_BASE=https://your-api-server.com/api
```

This approach provides centralized, pattern-based API URL management with environment variable control while maintaining stability and performance.