import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

const mockConfig = {
  baseUrl: '/api/v1/product-catalog',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
  dataSetSize: { min: 10, max: 50 },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function generateProduct(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    category: faker.commerce.department(),
    sku: faker.string.alphanumeric(8),
    inStock: faker.datatype.boolean({ probability: 0.8 }),
    createdAt: format(faker.date.between({ from: '-90d', to: '-1d' }), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    updatedAt: format(faker.date.between({ from: '-7d', to: 'now' }), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    ...overrides
  };
}

let productDataStore: Map<string, any> = new Map();
let productDataInitialized = false;

function initializeProductDataStore() {
  if (productDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateProduct({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    if (!item.id) item.id = String(index + 1);
    productDataStore.set(item.id, item);
  });
  
  productDataInitialized = true;
}

function getAllProducts(): any[] {
  initializeProductDataStore();
  return Array.from(productDataStore.values());
}



export const handlers = [
  http.get(`${mockConfig.baseUrl}/products`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllProducts();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json({
      "products": paginatedItems,
      "total": 0,
      "page": 0,
      "pageSize": 0
    });
  }),
  http.post(`${mockConfig.baseUrl}/products`, async ({ request }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Creation failed' }, { status: 400 });
    }
    
    const body = await request.json() as any;
    const newItem = generateProduct({ ...body, id: faker.string.uuid() });
    
    return HttpResponse.json(newItem, { status: 201 });
  }),
  http.get(`${mockConfig.baseUrl}/products/:id`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllProducts();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json(paginatedItems[0] || {});
  }),
  http.patch(`${mockConfig.baseUrl}/products/:id`, async ({ request, params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const entityId = params.id as string;
    const body = await request.json() as any;
    
    console.log(`🔧 PATCH /products/${entityId}`, { body });
    
    // Get existing item from data store
    initializeProductDataStore();
    const existingItem = productDataStore.get(entityId);
    
    if (!existingItem) {
      console.log(`❌ Product ${entityId} not found in data store`);
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    console.log(`📦 Found existing product:`, { 
      id: existingItem.id
    });
    
    // Update existing item with PATCH data
    const updatedItem = { ...existingItem, ...body };
    productDataStore.set(entityId, updatedItem);
    
    console.log(`✅ Updated product:`, { 
      id: updatedItem.id,
      changes: body 
    });
    console.log(`🗄️ Data store now has ${productDataStore.size} products`);
    
    return HttpResponse.json(updatedItem);
  }),
  http.delete(`${mockConfig.baseUrl}/products/:id`, async ({ request: _request, params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const entityId = params.id as string;
    console.log(`🗑️ DELETE /products/${entityId}`);
    
    // Get existing item from data store
    initializeProductDataStore();
    const existingItem = productDataStore.get(entityId);
    
    if (!existingItem) {
      console.log(`❌ Product ${entityId} not found in data store for deletion`);
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    console.log(`📦 Found product to delete:`, { 
      id: existingItem.id
    });
    
    // Actually delete the item from data store
    productDataStore.delete(entityId);
    
    console.log(`✅ Product deleted from data store`);
    console.log(`🗄️ Data store now has ${productDataStore.size} products`);
    
    return HttpResponse.json(existingItem);
  })
];

// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset Product data
  productDataStore.clear();
  productDataInitialized = false;
  
  console.log('Mock data stores reset');
}