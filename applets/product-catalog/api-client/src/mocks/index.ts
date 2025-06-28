// Auto-generated enhanced MSW mocks for product-catalog
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
// Schema: CreateProductRequest
//   name: string - fullName [required]
//   description: string - description [required]
//   price: number (double) - price [required]
//   category: string - category [required]
//   sku: string - generic [required]
// Relationships:
//   No relationships detected

// Schema: ErrorResponse
//   code: string - generic [required]
//   message: string - generic [required]
//   details: string - generic
// Relationships:
//   No relationships detected

// Schema: Product
//   id: string - id [required]
//   name: string - fullName [required]
//   description: string - description [required]
//   price: number (double) - price [required]
//   category: string - category [required]
//   sku: string - generic [required]
//   inStock: boolean - flag [required]
//   createdAt: string (date-time) - timestamp [required]
//   updatedAt: string (date-time) - timestamp [required]
// Relationships:
//   No relationships detected

// Schema: ProductList
//   products: array - generic [required]
//   total: integer (int32) - amount [required]
//   page: integer (int32) - generic [required]
//   pageSize: integer (int32) - generic [required]
// Relationships:
//   No relationships detected

// =============================================================================
// MOCK DATA GENERATORS
// =============================================================================
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
  const items = Array.from({ length: totalItems }, (_, index) => generateProduct({ id: String(index + 1) }));
  
  items.forEach(item => {
    productDataStore.set(String(item.id), item);
  });
  
  productDataInitialized = true;
}

// Get all products from the data store
function getAllProducts(): any[] {
  initializeProductDataStore();
  return Array.from(productDataStore.values());
}

// =============================================================================
// REQUEST HANDLERS
// =============================================================================
export const handlers = [
  // GET /products - List products
  http.get(`${mockConfig.baseUrl}/products`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    
    // Get dataset from persistent store
    const allItems = getAllProducts();
    
    // Apply filters
    let filteredItems = allItems;
    
    // Apply search filter if provided
    if (search) {
      filteredItems = filteredItems.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply filters using OpenAPI extension metadata
    if (category !== null) {
      filteredItems = filteredItems.filter(item => {
        return item.category?.toString().toLowerCase().includes(category.toLowerCase());
      });
    }
    
    // Apply sorting (only if sortBy parameter exists)
    
    
    // Apply pagination to filtered results
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

  // POST /products - Create product
  http.post(`${mockConfig.baseUrl}/products`, async ({ request }) => {
    await delay();
    
    if (faker.number.float() < mockConfig.errorRate) {
      return HttpResponse.json(
        { error: 'Validation failed', message: 'Invalid product data' },
        { status: 400 }
      );
    }

    const requestBody = await request.json() as Record<string, any>;
    const createdProduct = generateProduct(requestBody || {});
    
    return HttpResponse.json(createdProduct, { status: 201 });
  }),

  // GET /products/{id} - Get single product
  http.get(`${mockConfig.baseUrl}/products/:id`, async ({ params }) => {
    await delay();
    
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

    return HttpResponse.json(item);
  }),

  // Health check endpoint
  http.get(`${mockConfig.baseUrl}/health`, async () => {
    await delay();
    return HttpResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'product-catalog',
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
