/**
 * MSW setup utilities for SMBC applets
 * This module provides the core MSW setup without any pre-generated mocks
 */

import { setupWorker } from 'msw/browser';

export interface MockConfig {
  baseUrl?: string;
  enabled?: boolean;
  verbose?: boolean;
}

let worker: ReturnType<typeof setupWorker> | null = null;

/**
 * Setup MSW with user-provided handlers
 * Apps should generate their own handlers using the CLI tool
 */
export async function setupMSW(handlers: any[], config: MockConfig = {}) {
  const { enabled = true, verbose = false } = config;
  
  if (!enabled) {
    if (verbose) console.log('🔇 MSW disabled');
    return;
  }

  try {
    // Create worker with user-provided handlers
    worker = setupWorker(...handlers);
    
    // Start the worker
    await worker.start({
      onUnhandledRequest: verbose ? 'warn' : 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    
    // Add request logging for debugging
    if (verbose) {
      worker.events.on('request:start', ({ request }) => {
        console.log(`🌐 MSW intercepting: ${request.method} ${request.url}`);
      });
      
      worker.events.on('request:match', ({ request }) => {
        console.log(`✅ MSW matched: ${request.method} ${request.url}`);
      });
      
      worker.events.on('request:unhandled', ({ request }) => {
        console.log(`❌ MSW unhandled: ${request.method} ${request.url}`);
      });
    }
    
    if (verbose) {
      console.log('🚀 MSW started with', handlers.length, 'handlers');
    }
  } catch (error) {
    console.error('Failed to start MSW:', error);
  }
}

/**
 * Stop MSW
 */
export async function stopMSW() {
  if (worker) {
    await worker.stop();
    worker = null;
    console.log('🛑 MSW stopped');
  }
}

/**
 * Reset MSW handlers
 */
export function resetMSW() {
  if (worker) {
    worker.resetHandlers();
    console.log('🔄 MSW handlers reset');
  }
}

/**
 * Add runtime handlers to MSW
 */
export function addHandlers(handlers: any[]) {
  if (worker) {
    worker.use(...handlers);
    console.log('➕ Added', handlers.length, 'MSW handlers');
  }
}