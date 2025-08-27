import { http, HttpResponse } from 'msw';

/**
 * Health check endpoint for service worker monitoring
 */
export const healthHandler = http.get('/api/health', () => {
  return HttpResponse.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    service: 'msw'
  });
});