import { DatabaseConnection } from './connection';
import type { 
  Client, Domain, Hosting, Payment, 
  CreateClientDTO, CreateDomainDTO, CreateHostingDTO, CreatePaymentDTO,
  DatabaseQueryOptions, APIResponse 
} from '../types/database';

export abstract class BaseRepository<T, CreateDTO> {
  constructor(
    protected connection: DatabaseConnection,
    protected tableName: string
  ) {}

  protected generateId(prefix: string = ''): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected buildWhereClause(filters: Record<string, any>): { clause: string; params: any[] } {
    if (!filters || Object.keys(filters).length === 0) {
      return { clause: '', params: [] };
    }

    const conditions: string[] = [];
    const params: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    });

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params
    };
  }

  protected buildOrderClause(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
    if (!sortBy) return '';
    return `ORDER BY ${sortBy} ${sortOrder || 'asc'}`;
  }

  protected buildLimitClause(page?: number, limit?: number): string {
    if (!page || !limit) return '';
    const offset = (page - 1) * limit;
    return `LIMIT ${limit} OFFSET ${offset}`;
  }

  abstract create(data: CreateDTO): Promise<APIResponse<T>>;
  abstract getById(id: string): Promise<APIResponse<T>>;
  abstract getAll(options?: DatabaseQueryOptions): Promise<APIResponse<T[]>>;
  abstract update(id: string, data: Partial<T>): Promise<APIResponse<T>>;
  abstract delete(id: string): Promise<APIResponse<void>>;
}

export class ClientRepository extends BaseRepository<Client, CreateClientDTO> {
  constructor(connection: DatabaseConnection) {
    super(connection, 'clients');
  }

  async create(data: CreateClientDTO): Promise<APIResponse<Client>> {
    try {
      const id = this.generateId('CL_');
      const now = new Date().toISOString();
      
      await this.connection.execute(`
        INSERT INTO clients (
          id, full_name, company_name, email, phone_number, address,
          country, timezone, preferred_contact, join_date, account_status,
          notes, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, data.fullName, data.companyName, data.email, data.phoneNumber,
        data.address, data.country, data.timezone, data.preferredContact,
        data.joinDate, data.accountStatus, data.notes, now, now, 'admin'
      ]);

      const client = await this.getById(id);
      return client;
    } catch (error) {
      return { success: false, error: `Failed to create client: ${error.message}` };
    }
  }

  async getById(id: string): Promise<APIResponse<Client>> {
    try {
      const result = await this.connection.queryOne<Client>(
        'SELECT * FROM clients WHERE id = ?',
        [id]
      );
      
      if (!result) {
        return { success: false, error: 'Client not found' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to get client: ${error.message}` };
    }
  }

  async getAll(options?: DatabaseQueryOptions): Promise<APIResponse<Client[]>> {
    try {
      let sql = 'SELECT * FROM clients';
      let params: any[] = [];

      if (options?.filters) {
        const { clause, params: whereParams } = this.buildWhereClause(options.filters);
        sql += ` ${clause}`;
        params = whereParams;
      }

      if (options?.sortBy) {
        sql += ` ${this.buildOrderClause(options.sortBy, options.sortOrder)}`;
      }

      if (options?.page && options?.limit) {
        sql += ` ${this.buildLimitClause(options.page, options.limit)}`;
      }

      const results = await this.connection.query<Client>(sql, params);
      
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: `Failed to get clients: ${error.message}` };
    }
  }

  async update(id: string, data: Partial<Client>): Promise<APIResponse<Client>> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await this.connection.execute(`
        UPDATE clients SET ${updateFields.join(', ')} WHERE id = ?
      `, params);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to update client: ${error.message}` };
    }
  }

  async delete(id: string): Promise<APIResponse<void>> {
    try {
      const result = await this.connection.execute(
        'DELETE FROM clients WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        return { success: false, error: 'Client not found' };
      }

      return { success: true, message: 'Client deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete client: ${error.message}` };
    }
  }

  async getClientsWithServices(): Promise<APIResponse<Client[]>> {
    try {
      // Get clients with their service counts
      const results = await this.connection.query(`
        SELECT 
          c.*,
          COUNT(DISTINCT d.id) as domain_count,
          COUNT(DISTINCT h.id) as hosting_count,
          COUNT(DISTINCT p.id) as payment_count
        FROM clients c
        LEFT JOIN domains d ON c.id = d.client_id
        LEFT JOIN hosting h ON c.id = h.client_id
        LEFT JOIN payments p ON c.id = p.client_id
        GROUP BY c.id
        ORDER BY c.full_name
      `);

      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: `Failed to get clients with services: ${error.message}` };
    }
  }
}

export class DomainRepository extends BaseRepository<Domain, CreateDomainDTO> {
  constructor(connection: DatabaseConnection) {
    super(connection, 'domains');
  }

  async create(data: CreateDomainDTO): Promise<APIResponse<Domain>> {
    try {
      const id = this.generateId('DOM_');
      const now = new Date().toISOString();
      
      // Calculate days until expiry
      const expiryDate = new Date(data.expirationDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      await this.connection.execute(`
        INSERT INTO domains (
          id, client_id, name, registrar, registration_date, expiration_date,
          status, primary_ns, secondary_ns, price, currency, payment_status,
          invoice_number, notes, auto_renewal, days_until_expiry,
          created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, data.clientId, data.name, data.registrar, data.registrationDate,
        data.expirationDate, data.status, data.primaryNS, data.secondaryNS,
        data.price, data.currency, data.paymentStatus, data.invoiceNumber,
        data.notes, data.autoRenewal, daysUntilExpiry, now, now, 'admin'
      ]);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to create domain: ${error.message}` };
    }
  }

  async getById(id: string): Promise<APIResponse<Domain>> {
    try {
      const result = await this.connection.queryOne(`
        SELECT d.*, c.full_name as client_name, c.email as client_email
        FROM domains d
        JOIN clients c ON d.client_id = c.id
        WHERE d.id = ?
      `, [id]);
      
      if (!result) {
        return { success: false, error: 'Domain not found' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to get domain: ${error.message}` };
    }
  }

  async getAll(options?: DatabaseQueryOptions): Promise<APIResponse<Domain[]>> {
    try {
      let sql = `
        SELECT d.*, c.full_name as client_name, c.email as client_email, c.company_name as client_company
        FROM domains d
        JOIN clients c ON d.client_id = c.id
      `;
      let params: any[] = [];

      if (options?.filters) {
        const { clause, params: whereParams } = this.buildWhereClause(options.filters);
        sql += ` ${clause}`;
        params = whereParams;
      }

      if (options?.sortBy) {
        sql += ` ${this.buildOrderClause(options.sortBy, options.sortOrder)}`;
      } else {
        sql += ' ORDER BY d.expiration_date ASC';
      }

      if (options?.page && options?.limit) {
        sql += ` ${this.buildLimitClause(options.page, options.limit)}`;
      }

      const results = await this.connection.query(sql, params);

      // Map the results to include client object for frontend compatibility
      const mappedResults = results.map(domain => ({
        ...domain,
        customerName: domain.client_name,
        contactEmail: domain.client_email,
        client: {
          fullName: domain.client_name,
          email: domain.client_email,
          companyName: domain.client_company
        }
      }));

      return { success: true, data: mappedResults };
    } catch (error) {
      return { success: false, error: `Failed to get domains: ${error.message}` };
    }
  }

  async update(id: string, data: Partial<Domain>): Promise<APIResponse<Domain>> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await this.connection.execute(`
        UPDATE domains SET ${updateFields.join(', ')} WHERE id = ?
      `, params);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to update domain: ${error.message}` };
    }
  }

  async delete(id: string): Promise<APIResponse<void>> {
    try {
      const result = await this.connection.execute(
        'DELETE FROM domains WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        return { success: false, error: 'Domain not found' };
      }

      return { success: true, message: 'Domain deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete domain: ${error.message}` };
    }
  }

  async getByClientId(clientId: string): Promise<APIResponse<Domain[]>> {
    return this.getAll({ filters: { client_id: clientId } });
  }

  async getExpiringDomains(days: number = 30): Promise<APIResponse<Domain[]>> {
    try {
      const results = await this.connection.query(`
        SELECT d.*, c.full_name as client_name, c.email as client_email
        FROM domains d
        JOIN clients c ON d.client_id = c.id
        WHERE d.days_until_expiry <= ? AND d.days_until_expiry > 0
        ORDER BY d.days_until_expiry ASC
      `, [days]);

      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: `Failed to get expiring domains: ${error.message}` };
    }
  }
}

export class HostingRepository extends BaseRepository<Hosting, CreateHostingDTO> {
  constructor(connection: DatabaseConnection) {
    super(connection, 'hosting');
  }

  async create(data: CreateHostingDTO): Promise<APIResponse<Hosting>> {
    try {
      const id = this.generateId('HOST_');
      const now = new Date().toISOString();
      
      // Calculate days until expiry
      const expiryDate = new Date(data.expirationDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      await this.connection.execute(`
        INSERT INTO hosting (
          id, client_id, associated_domain_id, package_name, hosting_type,
          provider_name, account_username, account_password, control_panel_url,
          storage_space, bandwidth_limit, ip_address, server_location,
          purchase_date, expiration_date, status, price, currency,
          payment_status, invoice_number, usage_percent, last_backup,
          backup_status, notes, auto_renewal, support_contact,
          days_until_expiry, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, data.clientId, data.associatedDomainId, data.packageName,
        data.hostingType, data.providerName, data.accountUsername,
        data.accountPassword, data.controlPanelUrl, data.storageSpace,
        data.bandwidthLimit, data.ipAddress, data.serverLocation,
        data.purchaseDate, data.expirationDate, data.status, data.price,
        data.currency, data.paymentStatus, data.invoiceNumber,
        data.usagePercent, data.lastBackup, data.backupStatus, data.notes,
        data.autoRenewal, data.supportContact, daysUntilExpiry,
        now, now, 'admin'
      ]);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to create hosting: ${error.message}` };
    }
  }

  async getById(id: string): Promise<APIResponse<Hosting>> {
    try {
      const result = await this.connection.queryOne(`
        SELECT h.*, c.full_name as client_name, c.email as client_email,
               d.name as domain_name
        FROM hosting h
        JOIN clients c ON h.client_id = c.id
        LEFT JOIN domains d ON h.associated_domain_id = d.id
        WHERE h.id = ?
      `, [id]);
      
      if (!result) {
        return { success: false, error: 'Hosting not found' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to get hosting: ${error.message}` };
    }
  }

  async getAll(options?: DatabaseQueryOptions): Promise<APIResponse<Hosting[]>> {
    try {
      let sql = `
        SELECT h.*, c.full_name as client_name, c.email as client_email, c.company_name as client_company,
               d.name as domain_name
        FROM hosting h
        JOIN clients c ON h.client_id = c.id
        LEFT JOIN domains d ON h.associated_domain_id = d.id
      `;
      let params: any[] = [];

      if (options?.filters) {
        const { clause, params: whereParams } = this.buildWhereClause(options.filters);
        sql += ` ${clause}`;
        params = whereParams;
      }

      if (options?.sortBy) {
        sql += ` ${this.buildOrderClause(options.sortBy, options.sortOrder)}`;
      } else {
        sql += ' ORDER BY h.expiration_date ASC';
      }

      if (options?.page && options?.limit) {
        sql += ` ${this.buildLimitClause(options.page, options.limit)}`;
      }

      const results = await this.connection.query(sql, params);

      // Map the results to include client object for frontend compatibility
      const mappedResults = results.map(hosting => ({
        ...hosting,
        client: {
          fullName: hosting.client_name,
          email: hosting.client_email,
          companyName: hosting.client_company
        },
        associatedDomain: hosting.domain_name ? {
          name: hosting.domain_name
        } : null
      }));

      return { success: true, data: mappedResults };
    } catch (error) {
      return { success: false, error: `Failed to get hosting: ${error.message}` };
    }
  }

  async update(id: string, data: Partial<Hosting>): Promise<APIResponse<Hosting>> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await this.connection.execute(`
        UPDATE hosting SET ${updateFields.join(', ')} WHERE id = ?
      `, params);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to update hosting: ${error.message}` };
    }
  }

  async delete(id: string): Promise<APIResponse<void>> {
    try {
      const result = await this.connection.execute(
        'DELETE FROM hosting WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        return { success: false, error: 'Hosting not found' };
      }

      return { success: true, message: 'Hosting deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete hosting: ${error.message}` };
    }
  }

  async getByClientId(clientId: string): Promise<APIResponse<Hosting[]>> {
    return this.getAll({ filters: { client_id: clientId } });
  }
}

export class PaymentRepository extends BaseRepository<Payment, CreatePaymentDTO> {
  constructor(connection: DatabaseConnection) {
    super(connection, 'payments');
  }

  async create(data: CreatePaymentDTO): Promise<APIResponse<Payment>> {
    try {
      const id = this.generateId('PAY_');
      const now = new Date().toISOString();
      
      // Calculate converted amount and overdue status
      const convertedAmount = data.exchangeRate ? 
        (data.currency === 'USD' ? data.amount * data.exchangeRate : data.amount / data.exchangeRate) : 
        data.amount;
      
      const dueDate = new Date(data.dueDate);
      const today = new Date();
      const isOverdue = today > dueDate;
      const daysOverdue = isOverdue ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      await this.connection.execute(`
        INSERT INTO payments (
          id, client_id, service_id, service_type, amount, currency,
          exchange_rate, converted_amount, payment_date, due_date,
          payment_method, invoice_number, payment_status, notes,
          is_overdue, days_overdue, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, data.clientId, data.serviceId, data.serviceType, data.amount,
        data.currency, data.exchangeRate, convertedAmount, data.paymentDate,
        data.dueDate, data.paymentMethod, data.invoiceNumber,
        data.paymentStatus, data.notes, isOverdue, daysOverdue,
        now, now, 'admin'
      ]);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to create payment: ${error.message}` };
    }
  }

  async getById(id: string): Promise<APIResponse<Payment>> {
    try {
      const result = await this.connection.queryOne(`
        SELECT p.*, c.full_name as client_name, c.email as client_email,
               CASE 
                 WHEN p.service_type = 'domain' THEN d.name
                 WHEN p.service_type = 'hosting' THEN h.package_name
                 ELSE 'Other Service'
               END as service_name
        FROM payments p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN domains d ON p.service_id = d.id AND p.service_type = 'domain'
        LEFT JOIN hosting h ON p.service_id = h.id AND p.service_type = 'hosting'
        WHERE p.id = ?
      `, [id]);
      
      if (!result) {
        return { success: false, error: 'Payment not found' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to get payment: ${error.message}` };
    }
  }

  async getAll(options?: DatabaseQueryOptions): Promise<APIResponse<Payment[]>> {
    try {
      let sql = `
        SELECT p.*, c.full_name as client_name, c.email as client_email,
               CASE 
                 WHEN p.service_type = 'domain' THEN d.name
                 WHEN p.service_type = 'hosting' THEN h.package_name
                 ELSE 'Other Service'
               END as service_name
        FROM payments p
        JOIN clients c ON p.client_id = c.id
        LEFT JOIN domains d ON p.service_id = d.id AND p.service_type = 'domain'
        LEFT JOIN hosting h ON p.service_id = h.id AND p.service_type = 'hosting'
      `;
      let params: any[] = [];

      if (options?.filters) {
        const { clause, params: whereParams } = this.buildWhereClause(options.filters);
        sql += ` ${clause}`;
        params = whereParams;
      }

      if (options?.sortBy) {
        sql += ` ${this.buildOrderClause(options.sortBy, options.sortOrder)}`;
      } else {
        sql += ' ORDER BY p.due_date ASC';
      }

      if (options?.page && options?.limit) {
        sql += ` ${this.buildLimitClause(options.page, options.limit)}`;
      }

      const results = await this.connection.query(sql, params);
      
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: `Failed to get payments: ${error.message}` };
    }
  }

  async update(id: string, data: Partial<Payment>): Promise<APIResponse<Payment>> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = ?`);
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      updateFields.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await this.connection.execute(`
        UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?
      `, params);

      return await this.getById(id);
    } catch (error) {
      return { success: false, error: `Failed to update payment: ${error.message}` };
    }
  }

  async delete(id: string): Promise<APIResponse<void>> {
    try {
      const result = await this.connection.execute(
        'DELETE FROM payments WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        return { success: false, error: 'Payment not found' };
      }

      return { success: true, message: 'Payment deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete payment: ${error.message}` };
    }
  }

  async getByClientId(clientId: string): Promise<APIResponse<Payment[]>> {
    return this.getAll({ filters: { client_id: clientId } });
  }

  async getOverduePayments(): Promise<APIResponse<Payment[]>> {
    return this.getAll({ 
      filters: { is_overdue: true },
      sortBy: 'days_overdue',
      sortOrder: 'desc'
    });
  }
}
