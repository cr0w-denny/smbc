// Auto-generated enhanced MSW mocks for user-management
// Generated from: ../api/tsp-output/@typespec/openapi3/openapi.json
// 
// This file includes:
// - Schema-driven mock data generation
// - Intelligent field detection and faker mapping
// - Relationship handling
// - Advanced filtering and pagination
// - Comprehensive error simulation
//
// Generated with SMBC enhanced mock generator

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Enhanced mock configuration
export const mockConfig = {
  baseUrl: '/api/v1',
  delay: {"min":0,"max":0},
  errorRate: 0,
  locale: 'en',
  dataSetSize: {"min":10,"max":50},
  generateRelationships: true
};

// Note: Faker locale configuration removed - use faker.locale directly if needed

// Seed faker for consistent results in tests
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  faker.seed(12345);
}


// Utility functions
function delay(ms?: number) {
  if (ms !== undefined) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // If delay config is {min: 0, max: 0}, return immediately
  if (mockConfig.delay.min === 0 && mockConfig.delay.max === 0) {
    return Promise.resolve();
  }
  
  const delayTime = faker.number.int(mockConfig.delay);
  return new Promise(resolve => setTimeout(resolve, delayTime));
}

// =============================================================================
// SCHEMA ANALYSIS
// =============================================================================
// Schema: CreateUserRequest
//   email: string - email [required]
//   firstName: string - firstName [required]
//   lastName: string - lastName [required]
// Relationships:
//   No relationships detected

// Schema: ErrorResponse
//   code: string - generic [required]
//   message: string - generic [required]
//   details: string - generic
// Relationships:
//   No relationships detected

// Schema: UpdateUserRequest
//   firstName: string - firstName
//   lastName: string - lastName
//   isActive: boolean - isActive
// Relationships:
//   No relationships detected

// Schema: User
//   id: string - id [required]
//   email: string - email [required]
//   firstName: string - firstName [required]
//   lastName: string - lastName [required]
//   createdAt: string (date-time) - timestamp [required]
//   updatedAt: string (date-time) - timestamp [required]
//   isActive: boolean - isActive [required]
//   isAdmin: boolean - flag [required]
// Relationships:
//   No relationships detected

// Schema: UserList
//   users: array - generic [required]
//   total: integer (int32) - amount [required]
//   page: integer (int32) - generic [required]
//   pageSize: integer (int32) - generic [required]
// Relationships:
//   No relationships detected

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================
// Mock generator for User
function generateUser(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 100000 }),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    isActive: faker.datatype.boolean(),
    isAdmin: faker.datatype.boolean(),
    ...overrides
  };
}

// =============================================================================
// REQUEST HANDLERS
// =============================================================================
export const handlers = [
  // GET /users - List users
  http.get(`${mockConfig.baseUrl}/users`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search');
    const isAdmin = url.searchParams.get('isAdmin');
    
    // Generate dataset
    const totalItems = faker.number.int(mockConfig.dataSetSize);
    const allItems = Array.from({ length: totalItems }, () => generateUser());
    
    // Apply filters
    let filteredItems = allItems;
    
    // Apply search filter if provided
    if (search) {
      filteredItems = filteredItems.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply filters for query parameters that match entity fields
    if (isAdmin !== null) {
      filteredItems = filteredItems.filter(item => {
        if (isAdmin === 'true' || isAdmin === 'false') {
          return item.isAdmin === (isAdmin === 'true');
        }
        // Handle other boolean representations
        return false;
      });
    }
    
    // Apply pagination to filtered results
    const total = filteredItems.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return HttpResponse.json({
      users: paginatedItems,
      total,
      page,
      pageSize
    });
  }),

  // POST /users - Create user
  http.post(`${mockConfig.baseUrl}/users`, async ({ request }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Validation failed', message: 'Invalid user data' },
        { status: 400 }
      );
    }

    const requestBody = await request.json();
    const createdUser = generateUser(requestBody || {});
    
    return HttpResponse.json(createdUser, { status: 201 });
  }),

  // GET /users/{id} - Get single user
  http.get(`${mockConfig.baseUrl}/users/{id}`, async () => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(generateUser());
  }),

  // PATCH /users/{id} - Update user
  http.patch(`${mockConfig.baseUrl}/users/{id}`, async ({ request }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: 'User not found' },
        { status: 404 }
      );
    }

    const requestBody = await request.json();
    const updatedUser = generateUser(requestBody || {});
    
    return HttpResponse.json(updatedUser);
  }),

  // DELETE /users/{id} - Delete user
  http.delete(`${mockConfig.baseUrl}/users/{id}`, async () => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Not found', message: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ message: 'User deleted successfully' });
  }),

  // Health check endpoint
  http.get(`${mockConfig.baseUrl}/health`, async () => {
    await delay();
    return HttpResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'user-management',
      mockMode: true
    });
  }),

];

// Apply custom overrides if available
async function loadCustomOverrides() {
  try {
    // Dynamic import that won't be analyzed by TypeScript
    const customPath = './custom.js';
    const customModule = await import(/* @vite-ignore */ customPath);
    if (customModule.customHandlers) {
      // Prepend custom handlers so they take precedence
      handlers.unshift(...customModule.customHandlers);
    }
    if (customModule.updateConfig) {
      Object.assign(mockConfig, customModule.updateConfig(mockConfig));
    }
  } catch {
    // No custom overrides available
  }
}

// Load custom overrides (non-blocking)
loadCustomOverrides().catch(() => {
  // Silently ignore if custom overrides fail to load
});

export default handlers;
