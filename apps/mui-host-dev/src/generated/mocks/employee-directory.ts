import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

const mockConfig = {
  baseUrl: '/api/v1/employee-directory',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
  dataSetSize: { min: 100, max: 250 },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function generateEmployee(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.helpers.unique(() => faker.internet.email()),
    department: faker.helpers.arrayElement(["Engineering","Marketing","Sales","HR","Finance","Operations","Legal","IT","Customer Support"]),
    role: faker.person.jobTitle(),
    active: faker.datatype.boolean({ probability: 0.9 }),
    ...overrides
  };
}

let employeeDataStore: Map<string, any> = new Map();
let employeeDataInitialized = false;

function initializeEmployeeDataStore() {
  if (employeeDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateEmployee({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    if (!item.id) item.id = String(index + 1);
    employeeDataStore.set(item.id, item);
  });
  
  employeeDataInitialized = true;
}

function getAllEmployees(): any[] {
  initializeEmployeeDataStore();
  return Array.from(employeeDataStore.values());
}



export const handlers = [
  http.get(`${mockConfig.baseUrl}/employees`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    
    const page = url.searchParams.get('page');
    const pageSize = url.searchParams.get('pageSize');
    const sortBy = url.searchParams.get('sortBy');
    const sortOrder = url.searchParams.get('sortOrder');
    const department = url.searchParams.get('department');
    const active = url.searchParams.get('active');
    const search = url.searchParams.get('search');
    
    const allItems = getAllEmployees();
    let filteredItems = allItems;
    
    if (department !== null && department !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.department?.toString().toLowerCase() === department.toLowerCase()
      );
    }
    if (active !== null && active !== '' && active === 'true') {
      filteredItems = filteredItems.filter((item: any) => item.active === true);
    }
    if (search !== null && search !== '') {
      filteredItems = filteredItems.filter((item: any) => item.name?.toString().toLowerCase().includes(search.toLowerCase()) || item.email?.toString().toLowerCase().includes(search.toLowerCase()));
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

    
    return HttpResponse.json({
      "employees": paginatedItems,
      "total": filteredItems.length,
      "page": pageNum,
      "pageSize": pageSizeNum
    });
  }),
  http.post(`${mockConfig.baseUrl}/employees`, async ({ request }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Creation failed' }, { status: 400 });
    }
    
    const body = await request.json() as any;
    const newItem = generateEmployee({ ...body, id: faker.string.uuid() });
    
    return HttpResponse.json(newItem, { status: 201 });
  }),
  http.get(`${mockConfig.baseUrl}/employees/:id`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllEmployees();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json(paginatedItems[0] || {});
  }),
  http.patch(`${mockConfig.baseUrl}/employees/:id`, async ({ request, params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    const entityId = params.id as string;
    const body = await request.json() as any;
    
    console.log(`🔧 PATCH /employees/${entityId}`, { body });
    
    // Get existing item from data store
    initializeEmployeeDataStore();
    const existingItem = employeeDataStore.get(entityId);
    
    if (!existingItem) {
      console.log(`❌ Employee ${entityId} not found in data store`);
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    console.log(`📦 Found existing employee:`, { 
      id: existingItem.id
    });
    
    // Update existing item with PATCH data
    const updatedItem = { ...existingItem, ...body };
    employeeDataStore.set(entityId, updatedItem);
    
    console.log(`✅ Updated employee:`, { 
      id: updatedItem.id,
      changes: body 
    });
    console.log(`🗄️ Data store now has ${employeeDataStore.size} employees`);
    
    return HttpResponse.json(updatedItem);
  }),
  http.delete(`${mockConfig.baseUrl}/employees/:id`, async ({ request: _request, params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    const entityId = params.id as string;
    console.log(`🗑️ DELETE /employees/${entityId}`);
    
    // Get existing item from data store
    initializeEmployeeDataStore();
    const existingItem = employeeDataStore.get(entityId);
    
    if (!existingItem) {
      console.log(`❌ Employee ${entityId} not found in data store for deletion`);
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    console.log(`📦 Found employee to delete:`, { 
      id: existingItem.id
    });
    
    // Actually delete the item from data store
    employeeDataStore.delete(entityId);
    
    console.log(`✅ Employee deleted from data store`);
    console.log(`🗄️ Data store now has ${employeeDataStore.size} employees`);
    
    return new HttpResponse(null, { status: 204 });
  })
];

// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset Employee data
  employeeDataStore.clear();
  employeeDataInitialized = false;
  
  console.log('Mock data stores reset');
}