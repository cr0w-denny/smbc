import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

const mockConfig = {
  baseUrl: '/api/v1/user-management',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
  dataSetSize: { min: 100, max: 250 },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function generateUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    username: faker.helpers.unique(() => faker.internet.userName()),
    email: faker.helpers.unique(() => faker.internet.email()),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    createdAt: format(faker.date.between({ from: '-30d', to: 'now' }), 'MMMM dd, yyyy'),
    updatedAt: format(faker.date.between({ from: '-7d', to: 'now' }), 'yyyy-MM-dd'),
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    isAdmin: faker.datatype.boolean({ probability: 0.1 }),
    ...overrides
  };
}

let userDataStore: Map<string, any> = new Map();
let userDataInitialized = false;

function initializeUserDataStore() {
  if (userDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateUser({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    if (!item.id) item.id = String(index + 1);
    userDataStore.set(item.id, item);
  });
  
  userDataInitialized = true;
}

function getAllUsers(): any[] {
  initializeUserDataStore();
  return Array.from(userDataStore.values());
}

function transformItemsToUserSummary(items: any[]): any[] {
  // Return items as-is to preserve identity
  return items;
}

function transformItemsToUserDetailed(items: any[]): any[] {
  // Return items as-is to preserve identity
  return items;
}

function transformItemsToUser(items: any[]): any[] {
  // Return items as-is to preserve identity
  return items;
}

export const handlers = [
  http.get(`${mockConfig.baseUrl}/users`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    
    const page = url.searchParams.get('page');
    const pageSize = url.searchParams.get('pageSize');
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder');
    const username = url.searchParams.get('username');
    const isAdmin = url.searchParams.get('isAdmin');
    const email = url.searchParams.get('email');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const format = url.searchParams.get('format');
    
    const allItems = getAllUsers();
    let filteredItems = allItems;
    
    if (username !== null && username !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.username?.toString().toLowerCase().includes(username.toLowerCase())
      );
    }
    if (isAdmin !== null && isAdmin !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.isAdmin?.toString() === isAdmin
      );
    }
    if (email !== null && email !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.email?.toString().toLowerCase().includes(email.toLowerCase())
      );
    }
    if (status !== null && status !== '') {
      const boolValue = status === 'active';
      filteredItems = filteredItems.filter((item: any) => item.isActive === boolValue);
    }
    if (search !== null && search !== '') {
      filteredItems = filteredItems.filter((item: any) => item.firstName?.toString().toLowerCase().includes(search.toLowerCase()) || item.lastName?.toString().toLowerCase().includes(search.toLowerCase()) || item.email?.toString().toLowerCase().includes(search.toLowerCase()) || item.username?.toString().toLowerCase().includes(search.toLowerCase()));
    }
    if (sortBy) {
      filteredItems.sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }
    const pageNum = parseInt(page || '1');
    const pageSizeNum = parseInt(pageSize || '20');
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    // Response discrimination based on format
    switch (format) {
      case 'summary':
        return HttpResponse.json({
      "users": transformItemsToUserSummary(paginatedItems),
      "total": filteredItems.length,
      "page": pageNum,
      "pageSize": pageSizeNum
    });
      case 'detailed':
        return HttpResponse.json({
      "users": transformItemsToUserDetailed(paginatedItems),
      "total": filteredItems.length,
      "page": pageNum,
      "pageSize": pageSizeNum
    });
      default:
        return HttpResponse.json({
      "users": transformItemsToUser(paginatedItems),
      "total": filteredItems.length,
      "page": pageNum,
      "pageSize": pageSizeNum
    });
    }
    
  }),
  http.post(`${mockConfig.baseUrl}/users`, async ({ request }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Creation failed' }, { status: 400 });
    }
    
    const body = await request.json() as any;
    const newItem = generateUser({ ...body, id: faker.string.uuid() });
    
    return HttpResponse.json(newItem, { status: 201 });
  }),
  http.get(`${mockConfig.baseUrl}/users/:id`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllUsers();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json(paginatedItems[0] || {});
  }),
  http.patch(`${mockConfig.baseUrl}/users/:id`, async ({ request, params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const entityId = params.id as string;
    const body = await request.json() as any;
    
    console.log(`🔧 PATCH /users/${entityId}`, { body });
    
    // Get existing item from data store
    initializeUserDataStore();
    const existingItem = userDataStore.get(entityId);
    
    if (!existingItem) {
      console.log(`❌ User ${entityId} not found in data store`);
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`📦 Found existing user:`, { 
      id: existingItem.id
    });
    
    // Update existing item with PATCH data
    const updatedItem = { ...existingItem, ...body };
    userDataStore.set(entityId, updatedItem);
    
    console.log(`✅ Updated user:`, { 
      id: updatedItem.id,
      changes: body 
    });
    console.log(`🗄️ Data store now has ${userDataStore.size} users`);
    
    return HttpResponse.json(updatedItem);
  }),
  http.delete(`${mockConfig.baseUrl}/users/:id`, async ({ request: _request, params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const entityId = params.id as string;
    console.log(`🗑️ DELETE /users/${entityId}`);
    
    // Get existing item from data store
    initializeUserDataStore();
    const existingItem = userDataStore.get(entityId);
    
    if (!existingItem) {
      console.log(`❌ User ${entityId} not found in data store for deletion`);
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`📦 Found user to delete:`, { 
      id: existingItem.id
    });
    
    // Actually delete the item from data store
    userDataStore.delete(entityId);
    
    console.log(`✅ User deleted from data store`);
    console.log(`🗄️ Data store now has ${userDataStore.size} users`);
    
    return new HttpResponse(null, { status: 204 });
  })
];

// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset User data
  userDataStore.clear();
  userDataInitialized = false;
  
  console.log('Mock data stores reset');
}