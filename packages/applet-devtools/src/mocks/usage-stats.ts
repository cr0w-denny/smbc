import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

const mockConfig = {
  baseUrl: '/api/v1',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
  dataSetSize: { min: 10, max: 50 },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function generateUsageStatsExceptionObj(overrides = {}) {
  return {
    component: faker.helpers.arrayElement(["UserManager","ProductCatalog","EmployeeDirectory","Dashboard","Reports","Settings"]),
    email: faker.helpers.unique(() => faker.internet.email()),
    name: faker.person.fullName(),
    resp_cd: faker.helpers.arrayElement(["500","404","403","400","503"]),
    resp_msg: faker.helpers.arrayElement(["Internal Server Error","Not Found","Forbidden","Bad Request","Service Unavailable"]),
    count: faker.number.int({"min":1,"max":50}),
    ...overrides
  };
}

let usagestatsexceptionobjDataStore: Map<string, any> = new Map();
let usagestatsexceptionobjDataInitialized = false;

function initializeUsageStatsExceptionObjDataStore() {
  if (usagestatsexceptionobjDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateUsageStatsExceptionObj({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    const itemWithId = item as any;
    if (!itemWithId.id) itemWithId.id = String(index + 1);
    usagestatsexceptionobjDataStore.set(itemWithId.id, itemWithId);
  });
  
  usagestatsexceptionobjDataInitialized = true;
}

function getAllUsageStatsExceptionObjs(): any[] {
  initializeUsageStatsExceptionObjDataStore();
  return Array.from(usagestatsexceptionobjDataStore.values());
}

function generateUsageStatsComponentObj(overrides = {}) {
  return {
    component: faker.helpers.arrayElement(["UserManager","ProductCatalog","EmployeeDirectory","Dashboard","Reports","Settings","Navigation","SearchBox","DataTable","Charts"]),
    count: faker.number.int({"min":5,"max":1000}),
    ...overrides
  };
}

let usagestatscomponentobjDataStore: Map<string, any> = new Map();
let usagestatscomponentobjDataInitialized = false;

function initializeUsageStatsComponentObjDataStore() {
  if (usagestatscomponentobjDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateUsageStatsComponentObj({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    const itemWithId = item as any;
    if (!itemWithId.id) itemWithId.id = String(index + 1);
    usagestatscomponentobjDataStore.set(itemWithId.id, itemWithId);
  });
  
  usagestatscomponentobjDataInitialized = true;
}

function getAllUsageStatsComponentObjs(): any[] {
  initializeUsageStatsComponentObjDataStore();
  return Array.from(usagestatscomponentobjDataStore.values());
}

function generateUsageStatsUserObj(overrides = {}) {
  return {
    email: faker.helpers.unique(() => faker.internet.email()),
    name: faker.person.fullName(),
    count: faker.number.int({"min":1,"max":500}),
    ...overrides
  };
}

let usagestatsuserobjDataStore: Map<string, any> = new Map();
let usagestatsuserobjDataInitialized = false;

function initializeUsageStatsUserObjDataStore() {
  if (usagestatsuserobjDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateUsageStatsUserObj({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    const itemWithId = item as any;
    if (!itemWithId.id) itemWithId.id = String(index + 1);
    usagestatsuserobjDataStore.set(itemWithId.id, itemWithId);
  });
  
  usagestatsuserobjDataInitialized = true;
}

function getAllUsageStatsUserObjs(): any[] {
  initializeUsageStatsUserObjDataStore();
  return Array.from(usagestatsuserobjDataStore.values());
}



export const handlers = [
  http.get(`${mockConfig.baseUrl}/usage-stats/exceptions/`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllUsageStatsExceptionObjs();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json({
      "component_map": {},
      "records": paginatedItems
    });
  }),
  http.get(`${mockConfig.baseUrl}/usage-stats/ui-usage/`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllUsageStatsComponentObjs();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json({
      "component_map": {},
      "records": paginatedItems
    });
  }),
  http.get(`${mockConfig.baseUrl}/usage-stats/users-usage/`, async ({ request: _request }) => {
    await delay();
    
    

    
    const allItems = getAllUsageStatsUserObjs();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json({
      "component_map": {},
      "records": paginatedItems
    });
  })
];

// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset UsageStatsExceptionObj data
  usagestatsexceptionobjDataStore.clear();
  usagestatsexceptionobjDataInitialized = false;
  // Reset UsageStatsComponentObj data
  usagestatscomponentobjDataStore.clear();
  usagestatscomponentobjDataInitialized = false;
  // Reset UsageStatsUserObj data
  usagestatsuserobjDataStore.clear();
  usagestatsuserobjDataInitialized = false;
  
  console.log('Mock data stores reset');
}