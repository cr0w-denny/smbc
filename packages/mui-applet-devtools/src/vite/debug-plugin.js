import fs from 'fs';
import path from 'path';

/**
 * Vite plugin that captures debug logs and writes them to a file
 * for Claude to inspect during development
 *
 * This plugin should only be loaded in development mode
 */
export function debugLoggerPlugin() {
  const debugLogPath = path.resolve(process.cwd(), 'debug-logs.json');

  // Only enable file logging on localhost
  const isLocalhost = () => {
    const host = process.env.HOST || 'localhost';
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  };

  return {
    name: 'applet-devtools-debug-logger',
    configureServer(server) {
      // Only write files on localhost
      const shouldWriteFiles = isLocalhost();

      if (shouldWriteFiles) {
        // Clear log file on server start
        fs.writeFileSync(debugLogPath, JSON.stringify({ sessions: {}, lastUpdate: new Date().toISOString() }, null, 2));
        console.log('🐛 Debug logs will be written to:', debugLogPath);
      } else {
        console.log('🐛 Debug file logging disabled (not running on localhost)');
      }

      // Add middleware to capture debug logs
      server.middlewares.use('/__devtools/debug-log', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', () => {
            try {
              const logData = JSON.parse(body);

              // Only write to file if on localhost
              if (shouldWriteFiles) {
                // Read existing logs
                let logs = { sessions: {}, lastUpdate: new Date().toISOString() };
                if (fs.existsSync(debugLogPath)) {
                  logs = JSON.parse(fs.readFileSync(debugLogPath, 'utf8'));
                }

                // Add new log entry
                if (!logs.sessions[logData.sessionId]) {
                  logs.sessions[logData.sessionId] = [];
                }

                logs.sessions[logData.sessionId].push({
                  timestamp: new Date().toISOString(),
                  component: logData.component,
                  event: logData.event,
                  data: logData.data
                });

                logs.lastUpdate = new Date().toISOString();

                // Write back to file
                fs.writeFileSync(debugLogPath, JSON.stringify(logs, null, 2));
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, fileWritten: shouldWriteFiles }));
            } catch (error) {
              console.error('Debug log error:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } else {
          next();
        }
      });

      // Add endpoint to read logs
      server.middlewares.use('/__devtools/debug-logs', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            if (shouldWriteFiles && fs.existsSync(debugLogPath)) {
              const logs = fs.readFileSync(debugLogPath, 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(logs);
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                sessions: {},
                lastUpdate: new Date().toISOString(),
                fileLoggingEnabled: shouldWriteFiles
              }));
            }
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
          }
        } else {
          next();
        }
      });

      if (shouldWriteFiles) {
        console.log(`🐛 Debug logs endpoint: http://localhost:${server.config.server.port || 5173}/__devtools/debug-logs`);
      } else {
        console.log(`🐛 Debug logs endpoint: http://localhost:${server.config.server.port || 5173}/__devtools/debug-logs (file logging disabled)`);
      }
    },
  };
}

/**
 * Helper function to conditionally load the debug plugin only in development
 * Usage in vite.config.js:
 *
 * import { createDebugPlugin } from '@smbc/mui-applet-devtools/vite';
 *
 * export default defineConfig({
 *   plugins: [
 *     ...createDebugPlugin() // Only loads in development
 *   ]
 * });
 */
export function createDebugPlugin() {
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  return [debugLoggerPlugin()];
}