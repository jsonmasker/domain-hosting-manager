import { databaseManager } from '@shared/database/connection';
import { 
  ClientRepository, 
  DomainRepository, 
  HostingRepository, 
  PaymentRepository 
} from '@shared/database/repositories';
import type { 
  Client, Domain, Hosting, Payment,
  CreateClientDTO, CreateDomainDTO, CreateHostingDTO, CreatePaymentDTO,
  DatabaseQueryOptions, APIResponse, DashboardStats
} from '@shared/types/database';

class DatabaseService {
  private clientRepo: ClientRepository | null = null;
  private domainRepo: DomainRepository | null = null;
  private hostingRepo: HostingRepository | null = null;
  private paymentRepo: PaymentRepository | null = null;
  private isInitialized = false;

  async initialize(): Promise<APIResponse<void>> {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'Database service already initialized' };
      }

      // Check if we're in a browser environment
      const isBrowser = typeof window !== 'undefined';

      if (isBrowser) {
        console.log('Initializing database service for browser environment...');
      }

      // Initialize database
      const dbResult = await databaseManager.initialize();
      if (!dbResult.success) {
        return dbResult;
      }

      // Get database connection
      const connection = await databaseManager.getConnection();

      // Initialize repositories
      this.clientRepo = new ClientRepository(connection);
      this.domainRepo = new DomainRepository(connection);
      this.hostingRepo = new HostingRepository(connection);
      this.paymentRepo = new PaymentRepository(connection);

      this.isInitialized = true;

      return {
        success: true,
        message: `Database service initialized successfully${isBrowser ? ' (browser mode)' : ''}`
      };
    } catch (error) {
      console.error('Database service initialization error:', error);
      return {
        success: false,
        error: `Failed to initialize database service: ${error.message}`
      };
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      const result = await this.initialize();
      if (!result.success) {
        throw new Error(result.error);
      }
    }
  }

  // Client operations
  async getClients(options?: DatabaseQueryOptions): Promise<APIResponse<Client[]>> {
    await this.ensureInitialized();
    return this.clientRepo!.getAll(options);
  }

  async getClientById(id: string): Promise<APIResponse<Client>> {
    await this.ensureInitialized();
    return this.clientRepo!.getById(id);
  }

  async createClient(data: CreateClientDTO): Promise<APIResponse<Client>> {
    await this.ensureInitialized();
    return this.clientRepo!.create(data);
  }

  async updateClient(id: string, data: Partial<Client>): Promise<APIResponse<Client>> {
    await this.ensureInitialized();
    return this.clientRepo!.update(id, data);
  }

  async deleteClient(id: string): Promise<APIResponse<void>> {
    await this.ensureInitialized();
    return this.clientRepo!.delete(id);
  }

  async getClientsWithServices(): Promise<APIResponse<Client[]>> {
    await this.ensureInitialized();
    return this.clientRepo!.getClientsWithServices();
  }

  // Domain operations
  async getDomains(options?: DatabaseQueryOptions): Promise<APIResponse<Domain[]>> {
    await this.ensureInitialized();
    return this.domainRepo!.getAll(options);
  }

  async getDomainById(id: string): Promise<APIResponse<Domain>> {
    await this.ensureInitialized();
    return this.domainRepo!.getById(id);
  }

  async createDomain(data: CreateDomainDTO): Promise<APIResponse<Domain>> {
    await this.ensureInitialized();
    return this.domainRepo!.create(data);
  }

  async updateDomain(id: string, data: Partial<Domain>): Promise<APIResponse<Domain>> {
    await this.ensureInitialized();
    return this.domainRepo!.update(id, data);
  }

  async deleteDomain(id: string): Promise<APIResponse<void>> {
    await this.ensureInitialized();
    return this.domainRepo!.delete(id);
  }

  async getDomainsForClient(clientId: string): Promise<Domain[]> {
    await this.ensureInitialized();
    const result = await this.domainRepo!.getByClientId(clientId);
    return result.success ? result.data! : [];
  }

  async getExpiringDomains(days: number = 30): Promise<APIResponse<Domain[]>> {
    await this.ensureInitialized();
    return this.domainRepo!.getExpiringDomains(days);
  }

  // Hosting operations
  async getHosting(options?: DatabaseQueryOptions): Promise<APIResponse<Hosting[]>> {
    await this.ensureInitialized();
    return this.hostingRepo!.getAll(options);
  }

  async getHostingById(id: string): Promise<APIResponse<Hosting>> {
    await this.ensureInitialized();
    return this.hostingRepo!.getById(id);
  }

  async createHosting(data: CreateHostingDTO): Promise<APIResponse<Hosting>> {
    await this.ensureInitialized();
    return this.hostingRepo!.create(data);
  }

  async updateHosting(id: string, data: Partial<Hosting>): Promise<APIResponse<Hosting>> {
    await this.ensureInitialized();
    return this.hostingRepo!.update(id, data);
  }

  async deleteHosting(id: string): Promise<APIResponse<void>> {
    await this.ensureInitialized();
    return this.hostingRepo!.delete(id);
  }

  async getHostingForClient(clientId: string): Promise<Hosting[]> {
    await this.ensureInitialized();
    const result = await this.hostingRepo!.getByClientId(clientId);
    return result.success ? result.data! : [];
  }

  // Payment operations
  async getPayments(options?: DatabaseQueryOptions): Promise<APIResponse<Payment[]>> {
    await this.ensureInitialized();
    return this.paymentRepo!.getAll(options);
  }

  async getPaymentById(id: string): Promise<APIResponse<Payment>> {
    await this.ensureInitialized();
    return this.paymentRepo!.getById(id);
  }

  async createPayment(data: CreatePaymentDTO): Promise<APIResponse<Payment>> {
    await this.ensureInitialized();
    return this.paymentRepo!.create(data);
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<APIResponse<Payment>> {
    await this.ensureInitialized();
    return this.paymentRepo!.update(id, data);
  }

  async deletePayment(id: string): Promise<APIResponse<void>> {
    await this.ensureInitialized();
    return this.paymentRepo!.delete(id);
  }

  async getPaymentsForClient(clientId: string): Promise<Payment[]> {
    await this.ensureInitialized();
    const result = await this.paymentRepo!.getByClientId(clientId);
    return result.success ? result.data! : [];
  }

  async getOverduePayments(): Promise<APIResponse<Payment[]>> {
    await this.ensureInitialized();
    return this.paymentRepo!.getOverduePayments();
  }

  // Dashboard and statistics
  async getDashboardStats(): Promise<APIResponse<DashboardStats>> {
    await this.ensureInitialized();
    
    try {
      const [
        clientsResult,
        domainsResult,
        hostingResult,
        paymentsResult,
        expiringDomainsResult,
        overduePaymentsResult
      ] = await Promise.all([
        this.getClients(),
        this.getDomains(),
        this.getHosting(),
        this.getPayments(),
        this.getExpiringDomains(30),
        this.getOverduePayments()
      ]);

      if (!clientsResult.success || !domainsResult.success || !hostingResult.success || !paymentsResult.success) {
        return { success: false, error: 'Failed to fetch dashboard data' };
      }

      const clients = clientsResult.data!;
      const domains = domainsResult.data!;
      const hosting = hostingResult.data!;
      const payments = paymentsResult.data!;
      const expiringDomains = expiringDomainsResult.success ? expiringDomainsResult.data! : [];
      const overduePayments = overduePaymentsResult.success ? overduePaymentsResult.data! : [];

      // Calculate revenue totals
      const totalRevenueUSD = payments
        .filter(p => p.currency === 'USD' && p.payment_status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const totalRevenueBDT = payments
        .filter(p => p.currency === 'BDT' && p.payment_status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      // Calculate service status counts
      const allServices = [...domains, ...hosting];
      const activeServices = allServices.filter(s => s.status === 'active').length;
      const criticalServices = allServices.filter(s => s.days_until_expiry <= 7 && s.days_until_expiry > 0).length;
      const warningServices = allServices.filter(s => s.days_until_expiry <= 30 && s.days_until_expiry > 7).length;
      const expiredServices = allServices.filter(s => s.status === 'expired' || s.days_until_expiry <= 0).length;

      const stats: DashboardStats = {
        totalClients: clients.length,
        totalDomains: domains.length,
        totalHosting: hosting.length,
        upcomingRenewals: expiringDomains.length,
        unpaidInvoices: payments.filter(p => p.payment_status === 'unpaid').length,
        totalRevenueUSD,
        totalRevenueBDT,
        expiredServices,
        criticalServices,
        warningServices,
        activeServices
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: `Failed to calculate dashboard stats: ${error.message}` };
    }
  }

  // Backup operations
  async createBackup(type: 'full' | 'incremental' = 'full'): Promise<APIResponse<string>> {
    await this.ensureInitialized();
    return databaseManager.backup(type);
  }

  async getBackupHistory(): Promise<APIResponse<any[]>> {
    await this.ensureInitialized();
    return databaseManager.getBackupHistory();
  }

  // Data export operations
  async exportData(
    tables: ('clients' | 'domains' | 'hosting' | 'payments')[],
    format: 'json' | 'csv' | 'sql' = 'json'
  ): Promise<APIResponse<string>> {
    await this.ensureInitialized();
    
    try {
      const exportData: any = {};
      
      for (const table of tables) {
        switch (table) {
          case 'clients':
            const clientsResult = await this.getClients();
            exportData.clients = clientsResult.success ? clientsResult.data : [];
            break;
          case 'domains':
            const domainsResult = await this.getDomains();
            exportData.domains = domainsResult.success ? domainsResult.data : [];
            break;
          case 'hosting':
            const hostingResult = await this.getHosting();
            exportData.hosting = hostingResult.success ? hostingResult.data : [];
            break;
          case 'payments':
            const paymentsResult = await this.getPayments();
            exportData.payments = paymentsResult.success ? paymentsResult.data : [];
            break;
        }
      }

      let exportContent: string;
      
      switch (format) {
        case 'json':
          exportContent = JSON.stringify(exportData, null, 2);
          break;
        case 'csv':
          exportContent = this.convertToCSV(exportData);
          break;
        case 'sql':
          exportContent = this.convertToSQL(exportData);
          break;
        default:
          exportContent = JSON.stringify(exportData, null, 2);
      }

      return {
        success: true,
        data: exportContent,
        message: `Data exported successfully in ${format.toUpperCase()} format`
      };
    } catch (error) {
      return { success: false, error: `Export failed: ${error.message}` };
    }
  }

  private convertToCSV(data: any): string {
    let csv = '';
    
    Object.entries(data).forEach(([tableName, rows]: [string, any]) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      
      csv += `\n# ${tableName.toUpperCase()}\n`;
      
      // Headers
      const headers = Object.keys(rows[0]);
      csv += headers.join(',') + '\n';
      
      // Rows
      rows.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csv += values.join(',') + '\n';
      });
    });
    
    return csv;
  }

  private convertToSQL(data: any): string {
    let sql = `-- DomainHub Data Export\n-- Generated: ${new Date().toISOString()}\n\n`;
    
    Object.entries(data).forEach(([tableName, rows]: [string, any]) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      
      sql += `-- Table: ${tableName}\n`;
      
      const columns = Object.keys(rows[0]);
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
      
      const valueRows = rows.map(row => {
        const values = columns.map(col => {
          const value = row[col];
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          return value || 'NULL';
        });
        return `(${values.join(', ')})`;
      });
      
      sql += valueRows.join(',\n') + ';\n\n';
    });
    
    return sql;
  }

  // Utility functions for compatibility with existing code
  async getClientOptions(): Promise<Client[]> {
    const result = await this.getClients();
    return result.success ? result.data! : [];
  }

  // Clean shutdown
  async close(): Promise<void> {
    await databaseManager.close();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Helper functions for backward compatibility
export const getClientOptions = async (): Promise<Client[]> => {
  return databaseService.getClientOptions();
};

export const getDomainsForClient = async (clientId: string): Promise<Domain[]> => {
  return databaseService.getDomainsForClient(clientId);
};

export const getHostingForClient = async (clientId: string): Promise<Hosting[]> => {
  return databaseService.getHostingForClient(clientId);
};

// Export the database service as default
export { databaseService as dataService };
export default databaseService;
