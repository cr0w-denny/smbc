import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

const mockConfig = {
  baseUrl: '/api/v1/employee-directory',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
  dataSetSize: { min: 10, max: 50 },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function generateEmployee(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.helpers.uniqueArray(() => faker.internet.email(), 1)[0],
    department: faker.helpers.arrayElement(["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Legal", "IT", "Customer Support"]),
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
    employeeDataStore.set(String(index), item);
  });
  
  employeeDataInitialized = true;
}

function getAllEmployees(): any[] {
  initializeEmployeeDataStore();
  return Array.from(employeeDataStore.values());
}



export const handlers = [
  http.get(`${mockConfig.baseUrl}/employees`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllEmployees();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json({ employees: paginatedItems });
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
    
    const body = await request.json() as any;
    const updatedItem = generateEmployee({ ...(params as any), ...body });
    
    return HttpResponse.json(updatedItem);
  }),
  http.delete(`${mockConfig.baseUrl}/employees/:id`, async ({ request: _request, params: _params }) => {
    await delay();
    
    if (Math.random() < mockConfig.errorRate) {
      return HttpResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
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