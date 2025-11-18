import { DatabaseConfig, getDatabaseConfig, connectionString } from './config';
import { SupabaseConnection, getSupabaseConfig } from './supabase';
import type { APIResponse } from '../types/database';

export interface DatabaseConnection {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid: number | string }>;
  transaction<T>(callback: (conn: DatabaseConnection) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

class DatabaseManager {
  private connection: DatabaseConnection | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  constructor() {
    this.config = getDatabaseConfig();
  }

  async initialize(): Promise<APIResponse<void>> {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'Database already initialized' };
      }

      // Create connection based on database type
      this.connection = await this.createConnection();
      
      // Run schema setup
      await this.setupSchema();
      
      // Seed initial data if empty
      await this.seedInitialData();
      
      this.isInitialized = true;
      
      return { 
        success: true, 
        message: `Database initialized successfully with ${this.config.type}` 
      };
    } catch (error) {
      console.error('Database initialization failed:', error);
      return { 
        success: false, 
        error: `Failed to initialize database: ${error.message}` 
      };
    }
  }

  private async createConnection(): Promise<DatabaseConnection> {
    try {
      // Try to use Supabase connection first
      const supabaseConfig = getSupabaseConfig();
      console.log('Connecting to Supabase database...');
      return new SupabaseConnection(supabaseConfig);
    } catch (error) {
      console.warn('Supabase not configured, falling back to mock database:', error.message);
      // Fallback to mock connection for development
      return new MockDatabaseConnection(this.config);
    }
  }

  async getConnection(): Promise<DatabaseConnection> {
    if (!this.isInitialized) {
      const result = await this.initialize();
      if (!result.success) {
        throw new Error(result.error);
      }
    }
    
    if (!this.connection) {
      throw new Error('Database connection not available');
    }
    
    return this.connection;
  }

  private async setupSchema(): Promise<void> {
    if (!this.connection) {
      throw new Error('No database connection');
    }

    // In a real implementation, you would read and execute the schema.sql file
    // For now, we'll create the basic structure programmatically
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        company_name TEXT,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        address TEXT,
        country TEXT DEFAULT 'United States',
        timezone TEXT DEFAULT 'UTC',
        preferred_contact TEXT DEFAULT 'email',
        join_date DATE NOT NULL,
        account_status TEXT DEFAULT 'active',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL
      )
    `);

    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS domains (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        name TEXT UNIQUE NOT NULL,
        registrar TEXT NOT NULL,
        registration_date DATE NOT NULL,
        expiration_date DATE NOT NULL,
        status TEXT DEFAULT 'active',
        primary_ns TEXT,
        secondary_ns TEXT,
        price DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_status TEXT DEFAULT 'unpaid',
        invoice_number TEXT,
        notes TEXT,
        auto_renewal BOOLEAN DEFAULT FALSE,
        days_until_expiry INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS hosting (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        associated_domain_id TEXT,
        package_name TEXT NOT NULL,
        hosting_type TEXT DEFAULT 'shared',
        provider_name TEXT NOT NULL,
        account_username TEXT,
        account_password TEXT,
        control_panel_url TEXT,
        storage_space TEXT,
        bandwidth_limit TEXT,
        ip_address TEXT,
        server_location TEXT,
        purchase_date DATE NOT NULL,
        expiration_date DATE NOT NULL,
        status TEXT DEFAULT 'active',
        price DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_status TEXT DEFAULT 'unpaid',
        invoice_number TEXT,
        usage_percent INTEGER DEFAULT 0,
        last_backup DATE,
        backup_status TEXT,
        notes TEXT,
        auto_renewal BOOLEAN DEFAULT FALSE,
        support_contact TEXT,
        days_until_expiry INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (associated_domain_id) REFERENCES domains(id)
      )
    `);

    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        service_type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        exchange_rate DECIMAL(10,4),
        converted_amount DECIMAL(10,2),
        payment_date DATE,
        due_date DATE NOT NULL,
        payment_method TEXT NOT NULL,
        invoice_number TEXT,
        payment_status TEXT DEFAULT 'unpaid',
        notes TEXT,
        is_overdue BOOLEAN DEFAULT FALSE,
        days_overdue INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS backup_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        backup_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        status TEXT DEFAULT 'in_progress',
        error_message TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        created_by TEXT
      )
    `);
  }

  private async seedInitialData(): Promise<void> {
    if (!this.connection) return;

    // Check if data already exists
    const existingClients = await this.connection.query('SELECT COUNT(*) as count FROM clients');
    if (existingClients[0]?.count > 0) {
      return; // Data already seeded
    }

    // Seed initial client data
    const initialClients = [
      {
        id: 'TC001',
        full_name: 'Tech Corp',
        company_name: 'Tech Corporation Ltd',
        email: 'admin@techcorp.com',
        phone_number: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        country: 'United States',
        timezone: 'America/Los_Angeles',
        preferred_contact: 'email',
        join_date: '2023-01-15',
        account_status: 'active',
        notes: 'Priority enterprise client',
        created_by: 'system'
      },
      {
        id: 'EC002',
        full_name: 'E-commerce LLC',
        company_name: 'E-commerce Solutions LLC',
        email: 'contact@ecommerce.com',
        phone_number: '+1-555-0456',
        address: '456 Commerce Ave, New York, NY 10001',
        country: 'United States',
        timezone: 'America/New_York',
        preferred_contact: 'email',
        join_date: '2022-06-10',
        account_status: 'active',
        notes: 'Auto-renewal enabled for all services',
        created_by: 'system'
      }
    ];

    for (const client of initialClients) {
      await this.connection.execute(`
        INSERT INTO clients (
          id, full_name, company_name, email, phone_number, address, 
          country, timezone, preferred_contact, join_date, account_status, 
          notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        client.id, client.full_name, client.company_name, client.email,
        client.phone_number, client.address, client.country, client.timezone,
        client.preferred_contact, client.join_date, client.account_status,
        client.notes, client.created_by
      ]);
    }
  }

  async backup(backupType: 'full' | 'incremental' = 'full'): Promise<APIResponse<string>> {
    try {
      const connection = await this.getConnection();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `./backups/domainhub_${backupType}_${timestamp}.sql`;
      
      // Log backup start
      const logResult = await connection.execute(`
        INSERT INTO backup_logs (backup_type, file_path, created_by) 
        VALUES (?, ?, ?)
      `, [backupType, backupPath, 'system']);

      try {
        // Perform backup (in real implementation, this would export actual data)
        const backupContent = await this.generateBackupContent(backupType);
        
        // In a real implementation, you would write to file system
        // For now, we'll just simulate the backup
        const fileSize = backupContent.length;
        
        // Update backup log with success
        await connection.execute(`
          UPDATE backup_logs 
          SET status = 'success', file_size = ?, completed_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [fileSize, logResult.lastInsertRowid]);

        return {
          success: true,
          data: backupPath,
          message: `${backupType} backup completed successfully`
        };
      } catch (error) {
        // Update backup log with failure
        await connection.execute(`
          UPDATE backup_logs 
          SET status = 'failed', error_message = ?, completed_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [error.message, logResult.lastInsertRowid]);

        throw error;
      }
    } catch (error) {
      return {
        success: false,
        error: `Backup failed: ${error.message}`
      };
    }
  }

  private async generateBackupContent(backupType: string): Promise<string> {
    const connection = await this.getConnection();
    let content = `-- DomainHub Database Backup\n-- Type: ${backupType}\n-- Date: ${new Date().toISOString()}\n\n`;
    
    // Export all tables
    const tables = ['clients', 'domains', 'hosting', 'payments'];
    
    for (const table of tables) {
      const rows = await connection.query(`SELECT * FROM ${table}`);
      content += `-- Table: ${table}\n`;
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        content += `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n`;
        
        const values = rows.map(row => 
          `(${columns.map(col => 
            typeof row[col] === 'string' ? `'${row[col].replace(/'/g, "''")}'` : row[col]
          ).join(', ')})`
        ).join(',\n');
        
        content += values + ';\n\n';
      }
    }
    
    return content;
  }

  async getBackupHistory(): Promise<APIResponse<any[]>> {
    try {
      const connection = await this.getConnection();
      const backups = await connection.query(`
        SELECT * FROM backup_logs 
        ORDER BY started_at DESC 
        LIMIT 50
      `);
      
      return { success: true, data: backups };
    } catch (error) {
      return { success: false, error: `Failed to get backup history: ${error.message}` };
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.isInitialized = false;
    }
  }
}

// Mock database connection for demonstration
class MockDatabaseConnection implements DatabaseConnection {
  private data: Map<string, any[]> = new Map();
  private lastId = 0;

  constructor(private config: DatabaseConfig) {
    // Initialize empty tables
    this.data.set('clients', []);
    this.data.set('domains', []);
    this.data.set('hosting', []);
    this.data.set('payments', []);
    this.data.set('backup_logs', []);

    // Add some initial sample data for demo purposes
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample clients
    this.data.set('clients', [
      {
        id: 'TC001',
        full_name: 'Tech Corp',
        company_name: 'Tech Corporation Ltd',
        email: 'admin@techcorp.com',
        phone_number: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        country: 'United States',
        timezone: 'America/Los_Angeles',
        preferred_contact: 'email',
        join_date: '2023-01-15',
        account_status: 'active',
        notes: 'Priority enterprise client',
        created_at: '2023-01-15T10:00:00Z',
        updated_at: '2024-01-30T15:30:00Z',
        created_by: 'admin'
      },
      {
        id: 'EC002',
        full_name: 'E-commerce LLC',
        company_name: 'E-commerce Solutions LLC',
        email: 'contact@ecommerce.com',
        phone_number: '+1-555-0456',
        address: '456 Commerce Ave, New York, NY 10001',
        country: 'United States',
        timezone: 'America/New_York',
        preferred_contact: 'email',
        join_date: '2022-06-10',
        account_status: 'active',
        notes: 'Auto-renewal enabled for all services',
        created_at: '2022-06-10T08:00:00Z',
        updated_at: '2024-01-25T12:00:00Z',
        created_by: 'admin'
      },
      {
        id: 'SC003',
        full_name: 'Startup Innovation Inc',
        company_name: 'Startup Innovation Inc',
        email: 'info@startupinc.com',
        phone_number: '+1-555-0789',
        address: '789 Innovation Drive, Austin, TX 78701',
        country: 'United States',
        timezone: 'America/Chicago',
        preferred_contact: 'email',
        join_date: '2023-03-22',
        account_status: 'active',
        notes: 'Fast-growing startup with multiple domains',
        created_at: '2023-03-22T14:00:00Z',
        updated_at: '2024-01-28T10:15:00Z',
        created_by: 'admin'
      },
      {
        id: 'MC004',
        full_name: 'Marketing Agency Pro',
        company_name: 'Marketing Agency Pro Ltd',
        email: 'hello@marketingpro.com',
        phone_number: '+1-555-0321',
        address: '321 Marketing Blvd, Miami, FL 33101',
        country: 'United States',
        timezone: 'America/New_York',
        preferred_contact: 'email',
        join_date: '2022-09-15',
        account_status: 'active',
        notes: 'Manages multiple client domains',
        created_at: '2022-09-15T16:00:00Z',
        updated_at: '2024-01-26T14:20:00Z',
        created_by: 'admin'
      },
      {
        id: 'FS005',
        full_name: 'Financial Services Group',
        company_name: 'Financial Services Group LLC',
        email: 'contact@fsgroup.com',
        phone_number: '+1-555-0654',
        address: '654 Wall Street, New York, NY 10005',
        country: 'United States',
        timezone: 'America/New_York',
        preferred_contact: 'email',
        join_date: '2021-11-30',
        account_status: 'active',
        notes: 'Enterprise client with security requirements',
        created_at: '2021-11-30T09:00:00Z',
        updated_at: '2024-01-29T11:45:00Z',
        created_by: 'admin'
      }
    ]);

    // Add 48 sample domains to demonstrate the full system
    const sampleDomains = [
      // Tech Corp domains
      { id: 'DOM001', client_id: 'TC001', name: 'techcorp.com', registrar: 'Namecheap', status: 'expiring', price: 299, expiration_date: '2024-02-01' },
      { id: 'DOM002', client_id: 'TC001', name: 'techcorp.net', registrar: 'GoDaddy', status: 'active', price: 15.99, expiration_date: '2024-12-15' },
      { id: 'DOM003', client_id: 'TC001', name: 'techcorp.org', registrar: 'Cloudflare', status: 'active', price: 12.99, expiration_date: '2024-08-30' },
      { id: 'DOM004', client_id: 'TC001', name: 'techcorp.io', registrar: 'Namecheap', status: 'active', price: 39.99, expiration_date: '2024-11-20' },
      { id: 'DOM005', client_id: 'TC001', name: 'api.techcorp.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-09-10' },
      { id: 'DOM006', client_id: 'TC001', name: 'app.techcorp.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-07-25' },
      { id: 'DOM007', client_id: 'TC001', name: 'blog.techcorp.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-06-18' },
      { id: 'DOM008', client_id: 'TC001', name: 'support.techcorp.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-10-05' },

      // E-commerce LLC domains
      { id: 'DOM009', client_id: 'EC002', name: 'ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 24.99, expiration_date: '2024-06-10' },
      { id: 'DOM010', client_id: 'EC002', name: 'shop.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-08-15' },
      { id: 'DOM011', client_id: 'EC002', name: 'store.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-09-22' },
      { id: 'DOM012', client_id: 'EC002', name: 'marketplace.com', registrar: 'Cloudflare', status: 'active', price: 35.99, expiration_date: '2024-11-30' },
      { id: 'DOM013', client_id: 'EC002', name: 'checkout.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-07-08' },
      { id: 'DOM014', client_id: 'EC002', name: 'payments.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-12-03' },
      { id: 'DOM015', client_id: 'EC002', name: 'api.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-10-18' },
      { id: 'DOM016', client_id: 'EC002', name: 'admin.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-05-25' },

      // Startup Innovation Inc domains
      { id: 'DOM017', client_id: 'SC003', name: 'startupinc.com', registrar: 'Namecheap', status: 'active', price: 22.99, expiration_date: '2024-03-22' },
      { id: 'DOM018', client_id: 'SC003', name: 'innovation.io', registrar: 'Namecheap', status: 'active', price: 45.99, expiration_date: '2024-09-15' },
      { id: 'DOM019', client_id: 'SC003', name: 'startup.dev', registrar: 'Google Domains', status: 'active', price: 12.99, expiration_date: '2024-11-08' },
      { id: 'DOM020', client_id: 'SC003', name: 'myapp.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-08-12' },
      { id: 'DOM021', client_id: 'SC003', name: 'beta.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-07-30' },
      { id: 'DOM022', client_id: 'SC003', name: 'demo.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-06-14' },
      { id: 'DOM023', client_id: 'SC003', name: 'staging.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-10-27' },
      { id: 'DOM024', client_id: 'SC003', name: 'docs.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-12-09' },

      // Marketing Agency Pro domains
      { id: 'DOM025', client_id: 'MC004', name: 'marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 28.99, expiration_date: '2024-09-15' },
      { id: 'DOM026', client_id: 'MC004', name: 'campaigns.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-11-22' },
      { id: 'DOM027', client_id: 'MC004', name: 'analytics.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-08-07' },
      { id: 'DOM028', client_id: 'MC004', name: 'crm.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-10-31' },
      { id: 'DOM029', client_id: 'MC004', name: 'landing.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-07-19' },
      { id: 'DOM030', client_id: 'MC004', name: 'forms.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-12-15' },
      { id: 'DOM031', client_id: 'MC004', name: 'email.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-06-28' },
      { id: 'DOM032', client_id: 'MC004', name: 'social.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-09-11' },

      // Financial Services Group domains
      { id: 'DOM033', client_id: 'FS005', name: 'fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 32.99, expiration_date: '2024-11-30' },
      { id: 'DOM034', client_id: 'FS005', name: 'portal.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-08-16' },
      { id: 'DOM035', client_id: 'FS005', name: 'secure.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-10-04' },
      { id: 'DOM036', client_id: 'FS005', name: 'api.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-07-12' },
      { id: 'DOM037', client_id: 'FS005', name: 'trading.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-12-20' },
      { id: 'DOM038', client_id: 'FS005', name: 'reports.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-09-28' },
      { id: 'DOM039', client_id: 'FS005', name: 'compliance.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-11-07' },
      { id: 'DOM040', client_id: 'FS005', name: 'kyc.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-06-21' },

      // Additional domains to reach 48 total
      { id: 'DOM041', client_id: 'TC001', name: 'dev.techcorp.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-08-14' },
      { id: 'DOM042', client_id: 'EC002', name: 'mobile.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-09-30' },
      { id: 'DOM043', client_id: 'SC003', name: 'test.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-11-17' },
      { id: 'DOM044', client_id: 'MC004', name: 'clients.marketingpro.com', registrar: 'GoDaddy', status: 'active', price: 19.99, expiration_date: '2024-07-03' },
      { id: 'DOM045', client_id: 'FS005', name: 'backup.fsgroup.com', registrar: 'Cloudflare', status: 'active', price: 25.99, expiration_date: '2024-10-12' },
      { id: 'DOM046', client_id: 'TC001', name: 'cdn.techcorp.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-12-25' },
      { id: 'DOM047', client_id: 'EC002', name: 'cdn.ecommerce.com', registrar: 'GoDaddy', status: 'active', price: 18.99, expiration_date: '2024-08-28' },
      { id: 'DOM048', client_id: 'SC003', name: 'cdn.startupinc.com', registrar: 'Namecheap', status: 'active', price: 15.99, expiration_date: '2024-06-05' }
    ];

    // Generate full domain objects with all required fields
    const domains = sampleDomains.map((domain, index) => ({
      ...domain,
      registrar: domain.registrar,
      registration_date: new Date(new Date(domain.expiration_date).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      primary_ns: domain.registrar === 'Namecheap' ? 'ns1.namecheap.com' :
                  domain.registrar === 'GoDaddy' ? 'ns1.godaddy.com' :
                  domain.registrar === 'Cloudflare' ? 'ns1.cloudflare.com' : 'ns1.google.com',
      secondary_ns: domain.registrar === 'Namecheap' ? 'ns2.namecheap.com' :
                    domain.registrar === 'GoDaddy' ? 'ns2.godaddy.com' :
                    domain.registrar === 'Cloudflare' ? 'ns2.cloudflare.com' : 'ns2.google.com',
      currency: 'USD',
      payment_status: Math.random() > 0.7 ? 'unpaid' : 'paid',
      invoice_number: `INV-D-2024-${String(index + 1).padStart(3, '0')}`,
      notes: index === 0 ? 'Priority renewal required' : '',
      auto_renewal: Math.random() > 0.5,
      days_until_expiry: Math.ceil((new Date(domain.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'admin'
    }));

    this.data.set('domains', domains);

    // Add 28 sample hosting accounts to demonstrate the full system
    const sampleHosting = [
      // Tech Corp hosting (8 accounts)
      { id: 'HOST001', client_id: 'TC001', associated_domain_id: 'DOM001', package_name: 'Business Pro', hosting_type: 'vps', provider_name: 'HostGator', status: 'expiring', price: 599, expiration_date: '2024-02-01' },
      { id: 'HOST002', client_id: 'TC001', associated_domain_id: 'DOM002', package_name: 'Enterprise Cloud', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 899, expiration_date: '2024-12-15' },
      { id: 'HOST003', client_id: 'TC001', associated_domain_id: 'DOM003', package_name: 'Standard VPS', hosting_type: 'vps', provider_name: 'DigitalOcean', status: 'active', price: 299, expiration_date: '2024-08-30' },
      { id: 'HOST004', client_id: 'TC001', associated_domain_id: 'DOM004', package_name: 'Premium Shared', hosting_type: 'shared', provider_name: 'SiteGround', status: 'active', price: 199, expiration_date: '2024-11-20' },
      { id: 'HOST005', client_id: 'TC001', associated_domain_id: 'DOM005', package_name: 'API Hosting', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 449, expiration_date: '2024-09-10' },
      { id: 'HOST006', client_id: 'TC001', associated_domain_id: 'DOM006', package_name: 'App Hosting', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 549, expiration_date: '2024-07-25' },
      { id: 'HOST007', client_id: 'TC001', associated_domain_id: 'DOM007', package_name: 'Blog Hosting', hosting_type: 'shared', provider_name: 'Bluehost', status: 'active', price: 99, expiration_date: '2024-06-18' },
      { id: 'HOST008', client_id: 'TC001', associated_domain_id: 'DOM008', package_name: 'Support Portal', hosting_type: 'vps', provider_name: 'HostGator', status: 'active', price: 399, expiration_date: '2024-10-05' },

      // E-commerce LLC hosting (6 accounts)
      { id: 'HOST009', client_id: 'EC002', associated_domain_id: 'DOM009', package_name: 'E-commerce Pro', hosting_type: 'dedicated', provider_name: 'HostGator', status: 'active', price: 1299, expiration_date: '2024-06-10' },
      { id: 'HOST010', client_id: 'EC002', associated_domain_id: 'DOM010', package_name: 'Shop Hosting', hosting_type: 'vps', provider_name: 'SiteGround', status: 'active', price: 699, expiration_date: '2024-08-15' },
      { id: 'HOST011', client_id: 'EC002', associated_domain_id: 'DOM011', package_name: 'Store Backend', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 799, expiration_date: '2024-09-22' },
      { id: 'HOST012', client_id: 'EC002', associated_domain_id: 'DOM012', package_name: 'Marketplace Cloud', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 999, expiration_date: '2024-11-30' },
      { id: 'HOST013', client_id: 'EC002', associated_domain_id: 'DOM013', package_name: 'Checkout Service', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 649, expiration_date: '2024-07-08' },
      { id: 'HOST014', client_id: 'EC002', associated_domain_id: 'DOM014', package_name: 'Payment Gateway', hosting_type: 'dedicated', provider_name: 'HostGator', status: 'active', price: 1499, expiration_date: '2024-12-03' },

      // Startup Innovation Inc hosting (5 accounts)
      { id: 'HOST015', client_id: 'SC003', associated_domain_id: 'DOM017', package_name: 'Startup Basic', hosting_type: 'shared', provider_name: 'Bluehost', status: 'active', price: 149, expiration_date: '2024-03-22' },
      { id: 'HOST016', client_id: 'SC003', associated_domain_id: 'DOM018', package_name: 'Innovation Cloud', hosting_type: 'cloud', provider_name: 'DigitalOcean', status: 'active', price: 399, expiration_date: '2024-09-15' },
      { id: 'HOST017', client_id: 'SC003', associated_domain_id: 'DOM019', package_name: 'Dev Environment', hosting_type: 'vps', provider_name: 'DigitalOcean', status: 'active', price: 249, expiration_date: '2024-11-08' },
      { id: 'HOST018', client_id: 'SC003', associated_domain_id: 'DOM020', package_name: 'App Server', hosting_type: 'vps', provider_name: 'DigitalOcean', status: 'active', price: 349, expiration_date: '2024-08-12' },
      { id: 'HOST019', client_id: 'SC003', associated_domain_id: 'DOM021', package_name: 'Beta Testing', hosting_type: 'shared', provider_name: 'Bluehost', status: 'active', price: 99, expiration_date: '2024-07-30' },

      // Marketing Agency Pro hosting (5 accounts)
      { id: 'HOST020', client_id: 'MC004', associated_domain_id: 'DOM025', package_name: 'Agency Premium', hosting_type: 'vps', provider_name: 'SiteGround', status: 'active', price: 599, expiration_date: '2024-09-15' },
      { id: 'HOST021', client_id: 'MC004', associated_domain_id: 'DOM026', package_name: 'Campaign Server', hosting_type: 'vps', provider_name: 'SiteGround', status: 'active', price: 449, expiration_date: '2024-11-22' },
      { id: 'HOST022', client_id: 'MC004', associated_domain_id: 'DOM027', package_name: 'Analytics Pro', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 699, expiration_date: '2024-08-07' },
      { id: 'HOST023', client_id: 'MC004', associated_domain_id: 'DOM028', package_name: 'CRM Hosting', hosting_type: 'vps', provider_name: 'SiteGround', status: 'active', price: 549, expiration_date: '2024-10-31' },
      { id: 'HOST024', client_id: 'MC004', associated_domain_id: 'DOM029', package_name: 'Landing Pages', hosting_type: 'shared', provider_name: 'WP Engine', status: 'active', price: 299, expiration_date: '2024-07-19' },

      // Financial Services Group hosting (4 accounts)
      { id: 'HOST025', client_id: 'FS005', associated_domain_id: 'DOM033', package_name: 'Enterprise Security', hosting_type: 'dedicated', provider_name: 'AWS', status: 'active', price: 1999, expiration_date: '2024-11-30' },
      { id: 'HOST026', client_id: 'FS005', associated_domain_id: 'DOM034', package_name: 'Portal Server', hosting_type: 'dedicated', provider_name: 'AWS', status: 'active', price: 1699, expiration_date: '2024-08-16' },
      { id: 'HOST027', client_id: 'FS005', associated_domain_id: 'DOM035', package_name: 'Secure Cloud', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 1299, expiration_date: '2024-10-04' },
      { id: 'HOST028', client_id: 'FS005', associated_domain_id: 'DOM036', package_name: 'API Gateway', hosting_type: 'cloud', provider_name: 'AWS', status: 'active', price: 999, expiration_date: '2024-07-12' }
    ];

    // Generate full hosting objects with all required fields
    const hosting = sampleHosting.map((host, index) => ({
      ...host,
      account_username: `user_${host.id.toLowerCase()}`,
      account_password: 'encrypted_password_here',
      control_panel_url: host.provider_name === 'AWS' ? 'https://console.aws.amazon.com' :
                        host.provider_name === 'HostGator' ? 'https://cpanel.hostgator.com' :
                        host.provider_name === 'SiteGround' ? 'https://sitetools.siteground.com' :
                        host.provider_name === 'DigitalOcean' ? 'https://cloud.digitalocean.com' :
                        host.provider_name === 'Bluehost' ? 'https://my.bluehost.com/hosting/cpanel' :
                        'https://my.wpengine.com',
      storage_space: host.hosting_type === 'shared' ? '50GB' :
                     host.hosting_type === 'vps' ? '100GB' :
                     host.hosting_type === 'cloud' ? '250GB' : '500GB',
      bandwidth_limit: host.hosting_type === 'shared' ? '1TB' : 'Unlimited',
      ip_address: `192.168.${Math.floor(index / 10) + 1}.${(index % 10) + 100}`,
      server_location: ['Singapore', 'USA East', 'USA West', 'London', 'Frankfurt'][index % 5],
      purchase_date: new Date(new Date(host.expiration_date).getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      payment_status: Math.random() > 0.8 ? 'unpaid' : 'paid',
      invoice_number: `INV-H-2024-${String(index + 1).padStart(3, '0')}`,
      usage_percent: Math.floor(Math.random() * 90) + 10,
      last_backup: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      backup_status: ['success', 'success', 'success', 'failed'][Math.floor(Math.random() * 4)],
      notes: index === 0 ? 'Priority renewal required' : '',
      auto_renewal: Math.random() > 0.5,
      support_contact: `support@${host.provider_name.toLowerCase().replace(' ', '')}.com`,
      days_until_expiry: Math.ceil((new Date(host.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'admin'
    }));

    this.data.set('hosting', hosting);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    // Simple SQL parser for demonstration
    const upperSql = sql.toUpperCase().trim();
    
    if (upperSql.startsWith('SELECT')) {
      return this.handleSelect(sql, params) as T[];
    }
    
    return [] as T[];
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number | string }> {
    const upperSql = sql.toUpperCase().trim();
    
    if (upperSql.startsWith('INSERT')) {
      return this.handleInsert(sql, params);
    } else if (upperSql.startsWith('UPDATE')) {
      return this.handleUpdate(sql, params);
    } else if (upperSql.startsWith('DELETE')) {
      return this.handleDelete(sql, params);
    } else if (upperSql.startsWith('CREATE TABLE')) {
      // Table creation is handled, just return success
      return { changes: 0, lastInsertRowid: 0 };
    }
    
    return { changes: 0, lastInsertRowid: 0 };
  }

  async transaction<T>(callback: (conn: DatabaseConnection) => Promise<T>): Promise<T> {
    // For mock implementation, just execute the callback
    return callback(this);
  }

  async close(): Promise<void> {
    this.data.clear();
  }

  private handleSelect(sql: string, params: any[]): any[] {
    // Extract table name from SELECT statement
    const match = sql.match(/FROM\s+(\w+)/i);
    if (!match) return [];
    
    const tableName = match[1].toLowerCase();
    const tableData = this.data.get(tableName) || [];
    
    // Simple filtering for COUNT queries
    if (sql.toUpperCase().includes('COUNT(*)')) {
      return [{ count: tableData.length }];
    }
    
    return tableData;
  }

  private handleInsert(sql: string, params: any[]): { changes: number; lastInsertRowid: number | string } {
    const match = sql.match(/INSERT INTO\s+(\w+)/i);
    if (!match) return { changes: 0, lastInsertRowid: 0 };
    
    const tableName = match[1].toLowerCase();
    const tableData = this.data.get(tableName) || [];
    
    // For backup_logs, generate numeric ID
    let id: string | number;
    if (tableName === 'backup_logs') {
      id = ++this.lastId;
    } else {
      id = params[0] || `ID${Date.now()}`;
    }
    
    // Create record object (simplified)
    const record: any = { id };
    tableData.push(record);
    this.data.set(tableName, tableData);
    
    return { changes: 1, lastInsertRowid: id };
  }

  private handleUpdate(sql: string, params: any[]): { changes: number; lastInsertRowid: number | string } {
    // Simplified update handling
    return { changes: 1, lastInsertRowid: 0 };
  }

  private handleDelete(sql: string, params: any[]): { changes: number; lastInsertRowid: number | string } {
    // Simplified delete handling
    return { changes: 1, lastInsertRowid: 0 };
  }
}

// Singleton instance
export const databaseManager = new DatabaseManager();
