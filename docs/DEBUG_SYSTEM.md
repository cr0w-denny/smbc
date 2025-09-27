# Debug System Documentation

This project includes a comprehensive debug logging system that captures structured logs during development and writes them to a file for analysis.

## Components

### 1. Debug Utility (`src/utils/debug.ts`)
- **Purpose**: Provides structured logging with automatic file output
- **Features**:
  - Session-based logging with unique IDs
  - Automatic JSON serialization and timestamping
  - Call stack capture for debugging
  - Window global access for console inspection
  - Fails silently to avoid breaking the app

### 2. Vite Plugin (`vite-debug-plugin.js`)
- **Purpose**: Captures debug logs via HTTP and writes to JSON file
- **Features**:
  - HTTP middleware at `/api/debug-log` for log submission
  - HTTP endpoint at `/api/debug-logs` for reading logs
  - Automatic file management with timestamps
  - Structured JSON output organized by session

### 3. Debug Output Component (`src/components/DebugOutput.tsx`)
- **Purpose**: Optional UI component for viewing logs in-browser
- **Features**:
  - Real-time log display with filtering
  - Session grouping and event timeline
  - Export functionality for log analysis
  - Auto-refresh capabilities

## Usage

### Basic Logging
```typescript
import { debugComponent } from '../utils/debug';

const MyComponent = () => {
  const debug = debugComponent('MyComponent');

  // Log events with structured data
  debug.log('user-action', {
    action: 'click',
    target: 'submit-button',
    timestamp: Date.now()
  });

  return <div>...</div>;
};
```

### Session-based Logging
```typescript
// Create a persistent session for tracking a flow
const debug = debugComponent('UserFlow', 'checkout-session-123');

debug.log('step-1', { step: 'cart-review' });
debug.log('step-2', { step: 'payment-info' });
debug.log('step-3', { step: 'confirmation' });
```

### Console Access
```javascript
// Available in browser console during development
__debug.logs()              // View all logs
__debug.sequence('session-id')  // View specific session
__debug.export('session-id')    // Export session as JSON
__debug.clear()             // Clear all logs
```

## File Output

Debug logs are automatically written to `debug-logs.json` in the project root:

```json
{
  "sessions": {
    "MyComponent-1234567890": [
      {
        "timestamp": "2025-01-15T10:30:00.000Z",
        "component": "MyComponent",
        "event": "user-action",
        "data": { "action": "click", "target": "submit-button" }
      }
    ]
  },
  "lastUpdate": "2025-01-15T10:30:00.000Z"
}
```

## Configuration

The system is automatically enabled in development mode (`NODE_ENV === 'development'`) and disabled in production.

### Vite Integration
The plugin is included in `vite.config.ts`:
```typescript
import { debugLoggerPlugin } from './vite-debug-plugin.js';

export default defineConfig({
  plugins: [
    // ... other plugins
    debugLoggerPlugin(),
  ],
});
```

## Best Practices

1. **Use descriptive event names**: `user-login`, `data-fetch`, `navigation-change`
2. **Include relevant context**: Always provide useful data for debugging
3. **Create session IDs for flows**: Track multi-step processes with consistent IDs
4. **Clean up regularly**: The system limits to 100 entries to prevent memory issues
5. **Use for development only**: Never ship debug logging to production

## Troubleshooting

- **Logs not appearing**: Check that `NODE_ENV === 'development'`
- **Network errors**: Debug log submission failures are silently ignored
- **File permissions**: Ensure Vite can write to the project directory
- **Memory usage**: Logs are automatically limited and cleaned up

This system was created to eliminate back-and-forth debugging and provide structured, persistent logs for complex issue analysis.