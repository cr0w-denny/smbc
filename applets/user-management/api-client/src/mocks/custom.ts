// Custom MSW mock handlers for user-management
// This file is for your custom mock handlers and will not be overwritten

// import { http, HttpResponse } from 'msw';

// Custom configuration updates
export function updateConfig(_defaultConfig: any) {
  return {
    delay: { min: 0, max: 0 }, // Instant responses
    // errorRate: 0.1, // 10% error rate
    // dataSetSize: { min: 50, max: 100 }, // Larger datasets
  };
}

export const customHandlers = [
  // Add your custom MSW handlers here
  // Example:
  // http.get('/api/v1/users/special', () => {
  //   return HttpResponse.json({
  //     users: [
  //       { id: 'special', email: 'special@example.com', firstName: 'Special', lastName: 'User' }
  //     ]
  //   });
  // }),
  
  // Override existing endpoints:
  // http.get('/api/v1/users', () => {
  //   return HttpResponse.json({
  //     users: [
  //       { id: '1', email: 'alice@company.com', firstName: 'Alice', lastName: 'Smith' },
  //       { id: '2', email: 'bob@company.com', firstName: 'Bob', lastName: 'Johnson' }
  //     ],
  //     pagination: { page: 1, pageSize: 10, total: 2 }
  //   });
  // }),
];
