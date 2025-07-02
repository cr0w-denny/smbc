// Generated mock handlers for Product Catalog API
// Generated at: 2025-07-02T16:22:45.121Z

import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

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
// CreateProductRequest Schema & Data Management
// ============================================================================

// Persistent data store for CreateProductRequest
let createproductrequestDataStore: Map<string, any> = new Map();
let createproductrequestDataInitialized = false;

// Mock generator for CreateProductRequest
function generateCreateProductRequest(overrides = {}) {
  return {
    name: faker.person.fullName(),
    description: faker.lorem.paragraph(),
    price: parseFloat(faker.commerce.price()),
    category: faker.commerce.department(),
    sku: faker.lorem.word(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeCreateProductRequestDataStore() {
  if (createproductrequestDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, () => 
    generateCreateProductRequest({})
  );
  
  items.forEach((item, index) => {
    createproductrequestDataStore.set(String(index), item);
  });
  
  createproductrequestDataInitialized = true;
}

// Get all createproductrequests from the data store
// @ts-ignore - May not be used by all operations
function getAllCreateProductRequests(): any[] {
  initializeCreateProductRequestDataStore();
  return Array.from(createproductrequestDataStore.values());
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
// Product Schema & Data Management
// ============================================================================

// Persistent data store for Product
let productDataStore: Map<string, any> = new Map();
let productDataInitialized = false;

// Mock generator for Product
function generateProduct(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 100000 }),
    name: faker.person.fullName(),
    description: faker.lorem.paragraph(),
    price: parseFloat(faker.commerce.price()),
    category: faker.commerce.department(),
    sku: faker.lorem.word(),
    inStock: faker.datatype.boolean(),
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeProductDataStore() {
  if (productDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, (_, i) => 
    generateProduct({ id: String(i + 1) })
  );
  
  items.forEach((item) => {
    productDataStore.set(String(item.id), item);
  });
  
  productDataInitialized = true;
}

// Get all products from the data store
// @ts-ignore - May not be used by all operations
function getAllProducts(): any[] {
  initializeProductDataStore();
  return Array.from(productDataStore.values());
}


// ============================================================================
// ProductList Schema & Data Management
// ============================================================================

// Persistent data store for ProductList
let productlistDataStore: Map<string, any> = new Map();
let productlistDataInitialized = false;

// Mock generator for ProductList
function generateProductList(overrides = {}) {
  return {
    products: faker.lorem.word(),
    total: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    page: faker.number.int(),
    pageSize: faker.number.int(),
    ...overrides
  };
}

// Initialize data store with consistent data
function initializeProductListDataStore() {
  if (productlistDataInitialized) return;
  
  const totalItems = faker.number.int(mockConfig.dataSetSize);
  const items = Array.from({ length: totalItems }, () => 
    generateProductList({})
  );
  
  items.forEach((item, index) => {
    productlistDataStore.set(String(index), item);
  });
  
  productlistDataInitialized = true;
}

// Get all productlists from the data store
// @ts-ignore - May not be used by all operations
function getAllProductLists(): any[] {
  initializeProductListDataStore();
  return Array.from(productlistDataStore.values());
}



// Export MSW handlers
export const handlers = [
  // get /products - GET /products
  http.get(`${mockConfig.baseUrl}/products`, async ({ request }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Product not found' },
            { status: 404 }
          );
        }
    
        const url = new URL(request.url);
        
        // Extract query parameters
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        
        // Get dataset from persistent store
        const allItems = getAllProducts();
        
        // Apply filters
        let filteredItems = allItems;
        
        // Apply search filter
        if (search) {
          filteredItems = filteredItems.filter((item: any) => 
            JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
          );
        }
    
        // Apply category filter
        if (category !== null) {
          filteredItems = filteredItems.filter((item: any) => {
            return item.category?.toString().toLowerCase().includes(category.toLowerCase());
          });
        }
    
        
        // Apply pagination
        const total = filteredItems.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, total);
        const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
        return HttpResponse.json({
          products: paginatedItems,
          total,
          page,
          pageSize
        });
  }),
  // post /products - POST /products
  http.post(`${mockConfig.baseUrl}/products`, async ({ request }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Validation failed', message: 'Invalid product data' },
            { status: 400 }
          );
        }
    
        const requestBody = await request.json() as Record<string, any>;
        const createdProduct = generateProduct(requestBody || {});
        
        // Add to persistent store so it appears in subsequent GET requests
        productDataStore.set(String(createdProduct.id), createdProduct);
        
        return HttpResponse.json(createdProduct, { status: 201 });  }),
  // get /products/{id} - GET /products/{id}
  http.get(`${mockConfig.baseUrl}/products/:id`, async ({ params }) => {
    await delay();
    
        // Error simulation based on configuration
        if (faker.number.float() < mockConfig.errorRate) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Product not found' },
            { status: 404 }
          );
        }
    
        const entityId = params.id as string;
        const item = productDataStore.get(entityId);
        
        if (!item) {
          return HttpResponse.json(
            { error: 'Not found', message: 'Product not found' },
            { status: 404 }
          );
        }
    
        return HttpResponse.json(item);  }),
];