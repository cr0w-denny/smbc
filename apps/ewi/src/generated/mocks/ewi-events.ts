import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

// Set a consistent seed for reproducible mock data
faker.seed(12345);

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
    event_ref_id: faker.string.alphanumeric({"length":8,"casing":"upper","prefix":"EV"}),
    obligor: faker.company.name(),
    sun_id: faker.number.int({"min":100000,"max":999999}),
    plo: faker.string.alphanumeric({"length":6,"casing":"upper"}),
    exposure: faker.number.int({"min":10000,"max":10000000}),
    event_date: format(faker.date.between({ from: '-30d', to: '+30d' }), 'yyyy-MM-dd'),
    event_res_date: format(faker.date.between({ from: '+1d', to: '+60d' }), 'yyyy-MM-dd'),
    event_category: faker.helpers.arrayElement(["Mandatory","Discretionary"]),
    workflow_status: faker.helpers.arrayElement(["Subscribed","NotSubscribed","Review","Approval","Complete"]),
    lifecycle_status: faker.helpers.arrayElement(["on-course","almost-due","past-due","needs-attention"]),
    trigger_type: faker.helpers.arrayElement(["ExRatings","Stock","CDSSpreads","LoanPrices","Financials"]),
    trigger_shortname: faker.helpers.arrayElement(["RTNG_DOWN_1NOTCH","STCK_PRC_DOWN_L1","CDS_SPREAD_DOWN_10_PCT","SEC_LOAN_PRICE_DWN","NEG_CUM_EBIT","NEG_CUM_NI"]),
    trigger_values: faker.helpers.arrayElement(["MoodyLTRatingCurrent-MoodyLTRating1Day1\nORS&PLTRatingCurrent-S&PLTRating1Day1","(StockPriceCurrent-StockPrice3M)/StockPriceCurrent*100≤-50","CDSSpreadCurrent ≥ 10%","(SecLoanPriceCurrent-SecLoanPrice3M)/SecLoanPriceCurrent*100≥50","CumulativeEBIT<0","CumulativeNI<0"]),
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
  http.get(`${mockConfig.baseUrl}/events`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    
    const allItems = getAllEvents();
    let filteredItems = allItems;
    
    if (status !== null && status !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.lifecycle_status?.toString().toLowerCase() === status.toLowerCase()
      );
    }
    if (category !== null && category !== '') {
      filteredItems = filteredItems.filter((item: any) => 
        item.event_category?.toString().toLowerCase() === category.toLowerCase()
      );
    }


    const paginatedItems = filteredItems;

    
    return HttpResponse.json(paginatedItems);
  })
];

// Reset function to clear all data stores and initialization flags
export function resetMocks() {
  // Reset Event data
  eventDataStore.clear();
  eventDataInitialized = false;
  
  console.log('Mock data stores reset');
}