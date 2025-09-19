import { http, HttpResponse } from "msw";

/**
 * These are combined with the generated handlers in manager.ts
 */

// Simple auth state management for dev
let isAuthenticated = true;

export const handlers = [
  // Health check endpoint for service worker monitoring
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: Date.now(),
      service: "msw",
    });
  }),

  // Auth check endpoint
  http.get("/api/v1/auth/check", async () => {
    if (!isAuthenticated) {
      return new HttpResponse(null, {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Return success with user info
    return HttpResponse.json({
      authenticated: true,
      user: {
        id: "12345",
        email: "demo.user@smbcgroup.com",
        name: "Demo User",
        roles: ["user", "admin"],
      },
      timestamp: new Date().toISOString(),
    });
  }),
];

// Export functions for console access in development
export const authControl = {
  setAuthenticated: (value: boolean) => {
    isAuthenticated = value;
    console.log(`🔐 Auth state set to: ${value}`);
  },
  getAuthenticated: () => isAuthenticated,
};

// Make available globally for development
// Works in both service worker and browser contexts
(globalThis as any).__AUTH__ = authControl;
