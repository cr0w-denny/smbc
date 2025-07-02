// Generated mock handlers for User Management API
// Generated at: 2025-07-02T14:39:19.087Z

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

// Configuration for mock responses
const mockConfig = {
  baseUrl: '/api/v1',
  delay: { min: 0, max: 200 },
  errorRate: 0.05,
  dataSetSize: { min: 10, max: 50 },
};

// Utility: Configurable delay for realistic API responses
async function delay() {
  const delayMs = typeof mockConfig.delay === 'number' 
    ? mockConfig.delay 
    : faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

// ============================================================================
// CreateUserRequest Schema & Data Management
// ============================================================================

// Persistent data store for CreateUserRequest
let createuserrequestDataStore: Map<string, any> = new Map();
let createuserrequestDataInitialized = false;

// Mock generator for CreateUserRequest
function generateCreateUserRequest(overrides = {}) {
  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeCreateUserRequestDataStore() {
  if (createuserrequestDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, () => 
    generateCreateUserRequest({})
  );
  
  items.forEach((item, index) => {
    createuserrequestDataStore.set(String(index), item);
  });
  
  createuserrequestDataInitialized = true;
}

// Get all createuserrequests from the data store
// @ts-ignore - May not be used by all operations
function getAllCreateUserRequests(): any[] {
  initializeCreateUserRequestDataStore();
  return Array.from(createuserrequestDataStore.values());
}


// ============================================================================
// ErrorResponse Schema & Data Management
// ============================================================================

// Persistent data store for ErrorResponse
let errorresponseDataStore: Map<string, any> = new Map();
let errorresponseDataInitialized = false;

// Mock generator for ErrorResponse
function generateErrorResponse(overrides = {}) {
  return {
    code: faker.lorem.word(),
    message: faker.lorem.word(),
    details: faker.lorem.word(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeErrorResponseDataStore() {
  if (errorresponseDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, () => 
    generateErrorResponse({})
  );
  
  items.forEach((item, index) => {
    errorresponseDataStore.set(String(index), item);
  });
  
  errorresponseDataInitialized = true;
}

// Get all errorresponses from the data store
// @ts-ignore - May not be used by all operations
function getAllErrorResponses(): any[] {
  initializeErrorResponseDataStore();
  return Array.from(errorresponseDataStore.values());
}


// ============================================================================
// UpdateUserRequest Schema & Data Management
// ============================================================================

// Persistent data store for UpdateUserRequest
let updateuserrequestDataStore: Map<string, any> = new Map();
let updateuserrequestDataInitialized = false;

// Mock generator for UpdateUserRequest
function generateUpdateUserRequest(overrides = {}) {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    isActive: faker.datatype.boolean(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeUpdateUserRequestDataStore() {
  if (updateuserrequestDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, () => 
    generateUpdateUserRequest({})
  );
  
  items.forEach((item, index) => {
    updateuserrequestDataStore.set(String(index), item);
  });
  
  updateuserrequestDataInitialized = true;
}

// Get all updateuserrequests from the data store
// @ts-ignore - May not be used by all operations
function getAllUpdateUserRequests(): any[] {
  initializeUpdateUserRequestDataStore();
  return Array.from(updateuserrequestDataStore.values());
}


// ============================================================================
// User Schema & Data Management
// ============================================================================

// Persistent data store for User
let userDataStore: Map<string, any> = new Map();
let userDataInitialized = false;

// Mock generator for User
function generateUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.helpers.unique(() => faker.internet.email()),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: format(faker.date.recent({ days: 30 }), 'MMMM dd, yyyy'),
    updatedAt: format(faker.date.recent({ days: 7 }), 'yyyy-MM-dd'),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    isAdmin: faker.datatype.boolean({ probability: 0.1 }),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeUserDataStore() {
  if (userDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, (_, i) => 
    generateUser({ id: String(i + 1) })
  );
  
  items.forEach((item) => {
    userDataStore.set(String(item.id), item);
  });
  
  userDataInitialized = true;
}

// Get all users from the data store
// @ts-ignore - May not be used by all operations
function getAllUsers(): any[] {
  initializeUserDataStore();
  return Array.from(userDataStore.values());
}

// Transform User to different response schemas
function transformUserToSchema(item: any, targetSchema: string): any {
  switch (targetSchema) {
    case 'UserSummary': {
      // Generate fresh data for target schema and merge with mapped fields
      const generatedUserSummary = generateUserSummary({ id: item.id });
      return {
        ...generatedUserSummary,
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
        email: item.email,
        status: item.isActive ? "active" : "inactive",
      };
    }
    case 'UserDetailed': {
      // Generate fresh data for target schema and merge with mapped fields
      const generatedUserDetailed = generateUserDetailed({ id: item.id });
      return {
        ...generatedUserDetailed,
        fullName: `${item.firstName} ${item.lastName}`,
      };
    }
    default:
      return item;
  }
}

// ============================================================================
// UserDetailed Schema & Data Management
// ============================================================================

// Persistent data store for UserDetailed
let userdetailedDataStore: Map<string, any> = new Map();
let userdetailedDataInitialized = false;

// Mock generator for UserDetailed
function generateUserDetailed(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.helpers.unique(() => faker.internet.email()),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: format(faker.date.recent({ days: 30 }), 'MMMM dd, yyyy'),
    updatedAt: format(faker.date.recent({ days: 7 }), 'yyyy-MM-dd'),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    isAdmin: faker.datatype.boolean({ probability: 0.1 }),
    fullName: faker.person.fullName(),
    memberSince: format(faker.date.recent({ days: 300 }), 'yyyy-MM-dd'),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeUserDetailedDataStore() {
  if (userdetailedDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, (_, i) => 
    generateUserDetailed({ id: String(i + 1) })
  );
  
  items.forEach((item) => {
    userdetailedDataStore.set(String(item.id), item);
  });
  
  userdetailedDataInitialized = true;
}

// Get all userdetaileds from the data store
// @ts-ignore - May not be used by all operations
function getAllUserDetaileds(): any[] {
  initializeUserDetailedDataStore();
  return Array.from(userdetailedDataStore.values());
}


// ============================================================================
// UserList Schema & Data Management
// ============================================================================

// Persistent data store for UserList
let userlistDataStore: Map<string, any> = new Map();
let userlistDataInitialized = false;

// Mock generator for UserList
function generateUserList(overrides = {}) {
  return {
    users: faker.lorem.word(),
    total: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    page: faker.number.int(),
    pageSize: faker.number.int(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeUserListDataStore() {
  if (userlistDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, () => 
    generateUserList({})
  );
  
  items.forEach((item, index) => {
    userlistDataStore.set(String(index), item);
  });
  
  userlistDataInitialized = true;
}

// Get all userlists from the data store
// @ts-ignore - May not be used by all operations
function getAllUserLists(): any[] {
  initializeUserListDataStore();
  return Array.from(userlistDataStore.values());
}


// ============================================================================
// UserSummary Schema & Data Management
// ============================================================================

// Persistent data store for UserSummary
let usersummaryDataStore: Map<string, any> = new Map();
let usersummaryDataInitialized = false;

// Mock generator for UserSummary
function generateUserSummary(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 100000 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(["active", "inactive", "pending"]),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeUserSummaryDataStore() {
  if (usersummaryDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, (_, i) => 
    generateUserSummary({ id: String(i + 1) })
  );
  
  items.forEach((item) => {
    usersummaryDataStore.set(String(item.id), item);
  });
  
  usersummaryDataInitialized = true;
}

// Get all usersummarys from the data store
// @ts-ignore - May not be used by all operations
function getAllUserSummarys(): any[] {
  initializeUserSummaryDataStore();
  return Array.from(usersummaryDataStore.values());
}



// Export MSW handlers
export const handlers = [
  // get /users - Get all users with pagination
  http.get(`${mockConfig.baseUrl}/users`, async ({ request }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
    
        const url = new URL(request.url);
        
        // Extract query parameters
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
        const sortBy = url.searchParams.get('sortBy');
        const sortOrder = url.searchParams.get('sortOrder') || 'asc';
        const search = url.searchParams.get('search');
        const isAdmin = url.searchParams.get('isAdmin');
        const email = url.searchParams.get('email');
        const status = url.searchParams.get('status');
        
        // Get dataset from persistent store
        const allItems = getAllUsers();
        
        // Apply filters
        let filteredItems = allItems;
        
        // Apply search filter
        if (search) {
          filteredItems = filteredItems.filter((item: any) => 
            ['email', 'firstName', 'lastName']
              .some(field => item[field]?.toString().toLowerCase().includes(search.toLowerCase()))
          );
        }
    
        // Apply isAdmin filter
        if (isAdmin !== null) {
          filteredItems = filteredItems.filter((item: any) => {
            if (isAdmin === 'true' || isAdmin === 'false') {
              return item.isAdmin === (isAdmin === 'true');
            }
            return item.isAdmin?.toString() === isAdmin;
          });
        }
        // Apply email filter
        if (email !== null) {
          filteredItems = filteredItems.filter((item: any) => {
            return item.email?.toString().toLowerCase().includes(email.toLowerCase());
          });
        }
        // Apply status filter
        if (status !== null) {
          filteredItems = filteredItems.filter((item: any) => {
            const fieldValue = item.isActive;
            return (status === 'active' && fieldValue) || (status === 'inactive' && !fieldValue);
          });
        }
    
        // Apply sorting
        if (sortBy && filteredItems.length > 0) {
          filteredItems.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            
            // Handle different data types for sorting
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              const comparison = aVal.localeCompare(bVal);
              return sortOrder === 'desc' ? -comparison : comparison;
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
              return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
            } else if (aVal instanceof Date && bVal instanceof Date) {
              return sortOrder === 'desc' ? bVal.getTime() - aVal.getTime() : aVal.getTime() - bVal.getTime();
            } else {
              // Fallback to string comparison
              const comparison = String(aVal).localeCompare(String(bVal));
              return sortOrder === 'desc' ? -comparison : comparison;
            }      });
        }
        
        // Apply pagination
        const total = filteredItems.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
        // Handle discriminated responses
        const discriminatorValue = url.searchParams.get('format');
        let responseSchema = 'User';
        
        const schemaMapping: Record<string, string> = {"summary":"UserSummary","detailed":"UserDetailed"};
        if (discriminatorValue && schemaMapping[discriminatorValue]) {
          responseSchema = schemaMapping[discriminatorValue];
        }
        
        // Transform data based on selected schema
        let transformedItems = paginatedItems;
        if (responseSchema !== 'User') {
          transformedItems = paginatedItems.map(item => 
            transformUserToSchema(item, responseSchema)
          );
        }
        
        return HttpResponse.json({
          users: transformedItems,
          total,
          page,
          pageSize
        });
  }),
  // post /users - Create a new user
  http.post(`${mockConfig.baseUrl}/users`, async ({ request }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Validation failed', message: 'Invalid user data' },
            { status: 400 }
          );
        }
    
        const requestBody = await request.json() as Record<string, any>;
        const createdUser = generateUser(requestBody || {});
        
        // Add to persistent store so it appears in subsequent GET requests
        userDataStore.set(String(createdUser.id), createdUser);
        
        return HttpResponse.json(createdUser, { status: 201 });  }),
  // get /users/{id} - Get a user by ID
  http.get(`${mockConfig.baseUrl}/users/:id`, async ({ params }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
    
        const entityId = params.id as string;
        const item = userDataStore.get(entityId);
        
        if (!item) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
    
        return HttpResponse.json(item);  }),
  // patch /users/{id} - Update a user
  http.patch(`${mockConfig.baseUrl}/users/:id`, async ({ request, params }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
    
        const requestBody = await request.json() as Record<string, any>;
        const entityId = params.id as string;
        
        // Get existing item from store
        const existingItem = userDataStore.get(entityId);
        if (!existingItem) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
        
        // Update item in store
        const updatedUser = { ...existingItem, ...requestBody, id: entityId };
        userDataStore.set(entityId, updatedUser);
        
        return HttpResponse.json(updatedUser);  }),
  // delete /users/{id} - Delete a user
  http.delete(`${mockConfig.baseUrl}/users/:id`, async ({ params }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
    
        const entityId = params.id as string;
        
        // Check if item exists
        if (!userDataStore.has(entityId)) {
          return HttpResponse.json(
            { error: 'Not found', message: 'User not found' },
            { status: 404 }
          );
        }
        
        // Remove from store
        userDataStore.delete(entityId);
        
        return HttpResponse.json({ 
          message: `User ${entityId} deleted successfully` 
        });  }),
];