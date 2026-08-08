// Swapped in by the `memory` build configuration so the app runs with no API.
export const environment = {
  appointments: {
    dataSource: 'memory',
    apiBaseUrl: 'http://localhost:3000',
  },
} as const;
