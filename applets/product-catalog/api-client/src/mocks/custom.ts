// Custom MSW handlers for product-catalog
// Override auto-generated handlers or add custom endpoints

// Uncomment imports when adding custom handlers:
// import { http, HttpResponse } from 'msw';
// import { faker } from '@faker-js/faker';

// Custom configuration updates
export function updateConfig(_defaultConfig: any) {
  return {
    delay: { min: 0, max: 0 }, // Instant responses for development
    // Uncomment to override other settings:
    // errorRate: 0.1, // 10% error rate
    // dataSetSize: { min: 50, max: 100 }, // Larger datasets
  };
}

// Custom handlers (these override auto-generated ones)
export const customHandlers = [
  // Example: Override existing endpoint with custom logic
  // http.get('/api/v1/products', ({ request }) => {
  //   const url = new URL(request.url);
  //   const search = url.searchParams.get('search');
  //   
  //   // Custom filtering logic here
  //   const items = Array.from({ length: 10 }, () => ({
  //     // Add your custom Product properties here
  //   }));
  //   
  //   return HttpResponse.json({
  //     products: items,
  //     pagination: { page: 1, pageSize: 10, total: items.length }
  //   });
  // }),

  // Example: Add custom endpoint
  // http.get('/api/v1/products/featured', () => {
  //   return HttpResponse.json({
  //     featuredProduct: {
  //       // Add featured product properties
  //     }
  //   });
  // }),

  // Example: Simulate specific error scenario
  // http.post('/api/v1/products', () => {
  //   return HttpResponse.json(
  //     { error: 'Validation failed', details: 'Custom error message' },
  //     { status: 400 }
  //   );
  // }),
];
