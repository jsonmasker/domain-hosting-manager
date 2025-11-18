// Import the new database service
import { 
  databaseService, 
  getClientOptions, 
  getDomainsForClient, 
  getHostingForClient 
} from './databaseService';

// Re-export all types for backward compatibility
export type { 
  Client, Domain, Hosting, Payment, ExpiryEvent,
  CreateClientDTO, CreateDomainDTO, CreateHostingDTO, CreatePaymentDTO,
  ClientWithServices, DomainWithRelations, HostingWithRelations,
  DatabaseQueryOptions, APIResponse, DashboardStats
} from '@shared/types/database';

// Re-export the database service as dataService for backward compatibility
export { databaseService as dataService };

// Legacy exports for backward compatibility
export { getClientOptions, getDomainsForClient, getHostingForClient };

// For any remaining legacy code, re-export the database service as default
export default databaseService;
