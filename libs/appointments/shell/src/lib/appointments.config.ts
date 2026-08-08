export type AppointmentsDataSource = 'api' | 'memory';

// Which data source the product reads from is a deployment decision, so it is
// stated once at bootstrap and handed to the route rather than defaulted
// somewhere a reader has to go looking for.
export type AppointmentsConfig = {
  dataSource: AppointmentsDataSource;
  apiBaseUrl: string;
};
