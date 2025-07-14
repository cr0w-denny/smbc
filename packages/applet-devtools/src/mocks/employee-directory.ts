// Generated mock handlers for Employee Directory API
// Generated at: 2025-07-13T17:58:51.692Z

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Configuration for mock responses
const mockConfig = {
  baseUrl: '/api/v1/employee-directory',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
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
// Employee Schema & Data Management
// ============================================================================

// Persistent data store for Employee
let employeeDataStore: Map<string, any> = new Map();
let employeeDataInitialized = false;

// Mock generator for Employee
function generateEmployee(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 100000 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    department: faker.lorem.word(),
    role: faker.lorem.word(),
    active: faker.datatype.boolean(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeEmployeeDataStore() {
  if (employeeDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, (_, i) => 
    generateEmployee({ id: String(i + 1) })
  );
  
  items.forEach((item) => {
    employeeDataStore.set(String(item.id), item);
  });
  
  employeeDataInitialized = true;
}

// Get all employees from the data store
// @ts-ignore - May not be used by all operations
function getAllEmployees(): any[] {
  initializeEmployeeDataStore();
  return Array.from(employeeDataStore.values());
}


// ============================================================================
// UpdateEmployeeRequest Schema & Data Management
// ============================================================================

// Persistent data store for UpdateEmployeeRequest
let updateemployeerequestDataStore: Map<string, any> = new Map();
let updateemployeerequestDataInitialized = false;

// Mock generator for UpdateEmployeeRequest
function generateUpdateEmployeeRequest(overrides = {}) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    department: faker.lorem.word(),
    role: faker.lorem.word(),
    active: faker.datatype.boolean(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeUpdateEmployeeRequestDataStore() {
  if (updateemployeerequestDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => 
    generateUpdateEmployeeRequest({})
  );
  
  items.forEach((item, index) => {
    updateemployeerequestDataStore.set(String(index), item);
  });
  
  updateemployeerequestDataInitialized = true;
}

// Get all updateemployeerequests from the data store
// @ts-ignore - May not be used by all operations
function getAllUpdateEmployeeRequests(): any[] {
  initializeUpdateEmployeeRequestDataStore();
  return Array.from(updateemployeerequestDataStore.values());
}



// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset Employee data
  employeeDataStore.clear();
  employeeDataInitialized = false;
  // Reset UpdateEmployeeRequest data
  updateemployeerequestDataStore.clear();
  updateemployeerequestDataInitialized = false;
  
  console.log('Employee Directory API mock data stores reset');
}

// Export MSW handlers
export const handlers = [
  // get /employees - GET /employees
  http.get(`${mockConfig.baseUrl}/employees`, async ({ request }) => {
    await delay();
    
        // Error simulation based on configuration
        // Make errors predictable for demonstration purposes
        const shouldSimulateError = faker.number.float() < mockConfig.errorRate;
        
        if (shouldSimulateError) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Employee not found' },
            { status: 404 }
          );
        }
    
        const url = new URL(request.url);
        
        // Extract query parameters
        const search = url.searchParams.get('search');
        const department = url.searchParams.get('department');
        const active = url.searchParams.get('active');
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
        
        // Get dataset from persistent store
        const allItems = getAllEmployees();
        
        // Apply filters
        let filteredItems = allItems;
        
        // Apply search filter
        if (search && search !== '') {
          filteredItems = filteredItems.filter((item: any) => 
            JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
          );
        }
    
        // Apply department filter
        if (department !== null && department !== '') {
          filteredItems = filteredItems.filter((item: any) => {
            return item.department?.toString().toLowerCase().includes(department.toLowerCase());
          });
        }
        // Apply active filter
        if (active !== null && active !== '') {
          filteredItems = filteredItems.filter((item: any) => {
            if (active === 'true' || active === 'false') {
              return item.active === (active === 'true');
            }
            return false;
          });
        }
    
        
        // Apply pagination
        const total = filteredItems.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
        return HttpResponse.json({
          employees: paginatedItems,
          total,
          page,
          pageSize
        });
  }),
  // post /employees - POST /employees
  http.post(`${mockConfig.baseUrl}/employees`, async ({ request }) => {
    await delay();
    
        // Error simulation based on configuration
        // Make errors predictable for demonstration purposes
        const shouldSimulateError = faker.number.float() < mockConfig.errorRate;
        
        if (shouldSimulateError) {
          return HttpResponse.json(
            { error: 'Validation failed', message: 'Invalid employee data' },
            { status: 400 }
          );
        }
    
        const requestBody = await request.json() as Record<string, any>;
        const createdEmployee = generateEmployee(requestBody || {});
        
        // Add to persistent store so it appears in subsequent GET requests
        employeeDataStore.set(String(createdEmployee.id), createdEmployee);
        
        return HttpResponse.json(createdEmployee, { status: 201 });  }),
  // get /employees/{id} - GET /employees/{id}
  http.get(`${mockConfig.baseUrl}/employees/:id`, async ({ params }) => {
    await delay();
    
        // Error simulation based on configuration
        // Make errors predictable for demonstration purposes
        const shouldSimulateError = faker.number.float() < mockConfig.errorRate;
        
        if (shouldSimulateError) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Employee not found' },
            { status: 404 }
          );
        }
    
        const entityId = params.id as string;
        const item = employeeDataStore.get(entityId);
        
        if (!item) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Employee not found' },
            { status: 404 }
          );
        }
    
        return HttpResponse.json(item);  }),
  // patch /employees/{id} - PATCH /employees/{id}
  http.patch(`${mockConfig.baseUrl}/employees/:id`, async ({ request, params }) => {
    await delay();
    
        // Error simulation based on configuration
        // Make errors predictable for demonstration purposes
        const shouldSimulateError = faker.number.float() < mockConfig.errorRate;
        
        if (shouldSimulateError) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Employee not found' },
            { status: 404 }
          );
        }
    
        const requestBody = await request.json() as Record<string, any>;
        const entityId = params.id as string;
        
        // Get existing item from store
        const existingItem = employeeDataStore.get(entityId);
        if (!existingItem) {
          return HttpResponse.json(
            { error: 'Not found', message: `Employee with ID "${entityId}" not found` },
            { status: 404 }
          );
        }
        
        // Update item in store
        const updatedEmployee = { ...existingItem, ...requestBody, id: entityId };
        employeeDataStore.set(entityId, updatedEmployee);
        
        return HttpResponse.json(updatedEmployee);  }),
  // delete /employees/{id} - DELETE /employees/{id}
  http.delete(`${mockConfig.baseUrl}/employees/:id`, async ({ params }) => {
    await delay();
    
        // Error simulation based on configuration
        // Make errors predictable for demonstration purposes
        const shouldSimulateError = faker.number.float() < mockConfig.errorRate;
        
        if (shouldSimulateError) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Employee not found' },
            { status: 404 }
          );
        }
    
        const entityId = params.id as string;
        
        // Check if item exists
        if (!employeeDataStore.has(entityId)) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Employee not found' },
            { status: 404 }
          );
        }
        
        // Remove from store
        employeeDataStore.delete(entityId);
        
        return HttpResponse.json({ 
          message: `Employee ${entityId} deleted successfully` 
        });  }),
];