import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

const mockConfig = {
  baseUrl: '/api/v1/ewi-events',
  delay: { min: 0, max: 200 },
  errorRate: 0.15,
  dataSetSize: { min: 100, max: 250 },
};

async function delay() {
  const delayMs = faker.number.int({ min: mockConfig.delay.min, max: mockConfig.delay.max });
  await new Promise(resolve => setTimeout(resolve, delayMs));
}

function generateEvent(overrides = {}) {
  return {
    id: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    obligor: faker.company.name(),
    status: faker.helpers.arrayElement(['on-course', 'almost-due', 'past-due', 'needs-attention']),
    dueDate: format(faker.date.between({ from: '-30d', to: '+30d' }), 'yyyy-MM-dd'),
    analyst: faker.person.fullName(),
    ...overrides
  };
}

let eventDataStore: Map<string, any> = new Map();
let eventDataInitialized = false;

function initializeEventDataStore() {
  if (eventDataInitialized) return;
  
  const totalItems = faker.number.int({ min: mockConfig.dataSetSize.min, max: mockConfig.dataSetSize.max });
  const items = Array.from({ length: totalItems }, () => generateEvent({}));
  
  items.forEach((item, index) => {
    // Ensure each item has a consistent ID
    if (!(item as any).id) (item as any).id = String(index + 1);
    eventDataStore.set((item as any).id, item);
  });
  
  eventDataInitialized = true;
}

function getAllEvents(): any[] {
  initializeEventDataStore();
  return Array.from(eventDataStore.values());
}



export const handlers = [
  http.get(`${mockConfig.baseUrl}/api/events`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    
    const status = url.searchParams.get('status');
    // Date filtering parameters (not implemented yet)
    // const dateFrom = url.searchParams.get('dateFrom');
    // const dateTo = url.searchParams.get('dateTo');
    const workflow = url.searchParams.get('workflow');
    const exRatings = url.searchParams.get('exRatings');
    const search = url.searchParams.get('search');
    const page = url.searchParams.get('page');
    const pageSize = url.searchParams.get('pageSize');
    
    const allItems = getAllEvents();
    let filteredItems = allItems;
    
    if (status !== null && status !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.status?.toString().toLowerCase() === status.toLowerCase()
      );
    }
    if (workflow !== null && workflow !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.workflow?.toString().toLowerCase() === workflow.toLowerCase()
      );
    }
    if (exRatings !== null && exRatings !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.exRatings?.toString().toLowerCase().includes(exRatings.toLowerCase())
      );
    }
    if (search !== null && search !== '') {
      filteredItems = filteredItems.filter((item: any) => item.obligor?.toString().toLowerCase().includes(search.toLowerCase()) || item.analyst?.toString().toLowerCase().includes(search.toLowerCase()) || item.id?.toString().toLowerCase().includes(search.toLowerCase()));
    }

    // Pagination
    const pageNum = parseInt(page || '1');
    const pageSizeNum = parseInt(pageSize || '20');
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    
    return HttpResponse.json({
      "events": paginatedItems,
      "total": filteredItems.length,
      "page": pageNum,
      "pageSize": pageSizeNum
    });
  }),
  http.get(`${mockConfig.baseUrl}/api/events/:id`, async ({ request: _request, params }) => {
    await delay();
    
    

    
    // Handle single resource lookup by ID
    const entityId = params.id as string;
    if (entityId) {
      const item = eventDataStore.get(entityId);
      if (!item) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return HttpResponse.json(item);
    }
    
    const allItems = getAllEvents();
    let filteredItems = allItems;
    



    const paginatedItems = filteredItems;

    
    return HttpResponse.json(paginatedItems[0] || {});
  })
];

// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset Event data
  eventDataStore.clear();
  eventDataInitialized = false;
  
  console.log('Mock data stores reset');
}