import { SupabaseConnection, getSupabaseConfig } from './supabase';
import type { Client, Domain, Hosting, Payment } from '../types/database';

export class DataMigrator {
  private supabase: SupabaseConnection;

  constructor() {
    const config = getSupabaseConfig();
    this.supabase = new SupabaseConnection(config);
  }

  async migrateAllData(): Promise<void> {
    console.log('🚀 Starting data migration to Supabase...');

    try {
      // Migrate clients first (they are referenced by other tables)
      await this.migrateClients();
      
      // Then migrate domains
      await this.migrateDomains();
      
      // Then migrate hosting
      await this.migrateHosting();
      
      // Finally migrate payments
      await this.migratePayments();

      console.log('✅ Data migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private async migrateClients(): Promise<void> {
    console.log('📋 Migrating clients...');
    
    const clients: Client[] = [
      {
        id: 'TC001',
        fullName: 'Tech Corp',
        companyName: 'Tech Corporation Ltd',
        email: 'admin@techcorp.com',
        phoneNumber: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        country: 'United States',
        timezone: 'America/Los_Angeles',
        preferredContact: 'email',
        joinDate: '2023-01-15',
        accountStatus: 'active',
        notes: 'Priority enterprise client',
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-01-30T15:30:00Z',
        createdBy: 'admin'
      },
      {
        id: 'EC002',
        fullName: 'E-commerce LLC',
        companyName: 'E-commerce Solutions LLC',
        email: 'contact@ecommerce.com',
        phoneNumber: '+1-555-0456',
        address: '456 Commerce Ave, New York, NY 10001',
        country: 'United States',
        timezone: 'America/New_York',
        preferredContact: 'email',
        joinDate: '2022-06-10',
        accountStatus: 'active',
        notes: 'Auto-renewal enabled for all services',
        createdAt: '2022-06-10T08:00:00Z',
        updatedAt: '2024-01-25T12:00:00Z',
        createdBy: 'admin'
      }
    ];

    for (const client of clients) {
      await this.insertClient(client);
    }
    
    console.log(`✅ Migrated ${clients.length} clients`);
  }

  private async migrateDomains(): Promise<void> {
    console.log('🌐 Migrating domains...');
    
    // Add the user's domain first
    const domains: Partial<Domain>[] = [
      {
        id: 'DOM_ROBIUL_001',
        clientId: 'TC001',
        name: 'domain.robiulawal.com',
        registrar: 'Namecheap',
        registrationDate: '2024-01-01',
        expirationDate: '2025-01-01',
        status: 'active',
        primaryNs: 'ns1.namecheap.com',
        secondaryNs: 'ns2.namecheap.com',
        price: 15.99,
        currency: 'USD',
        paymentStatus: 'paid',
        invoiceNumber: 'INV-D-2024-049',
        notes: 'Your primary domain - domain.robiulawal.com',
        autoRenewal: true,
        daysUntilExpiry: 365,
        createdBy: 'admin'
      },
      // Add a few more sample domains
      {
        id: 'DOM001',
        clientId: 'TC001',
        name: 'techcorp.com',
        registrar: 'Namecheap',
        registrationDate: '2023-02-01',
        expirationDate: '2024-02-01',
        status: 'expiring',
        primaryNs: 'ns1.namecheap.com',
        secondaryNs: 'ns2.namecheap.com',
        price: 299.00,
        currency: 'USD',
        paymentStatus: 'unpaid',
        invoiceNumber: 'INV-D-2024-001',
        notes: 'Priority renewal required',
        autoRenewal: false,
        daysUntilExpiry: 30,
        createdBy: 'admin'
      },
      {
        id: 'DOM002',
        clientId: 'EC002',
        name: 'ecommerce.com',
        registrar: 'GoDaddy',
        registrationDate: '2022-06-10',
        expirationDate: '2024-06-10',
        status: 'active',
        primaryNs: 'ns1.godaddy.com',
        secondaryNs: 'ns2.godaddy.com',
        price: 24.99,
        currency: 'USD',
        paymentStatus: 'paid',
        invoiceNumber: 'INV-D-2024-002',
        notes: '',
        autoRenewal: true,
        daysUntilExpiry: 150,
        createdBy: 'admin'
      }
    ];

    for (const domain of domains) {
      await this.insertDomain(domain);
    }
    
    console.log(`✅ Migrated ${domains.length} domains`);
  }

  private async migrateHosting(): Promise<void> {
    console.log('🏠 Migrating hosting accounts...');
    
    const hostingAccounts: Partial<Hosting>[] = [
      {
        id: 'HOST001',
        clientId: 'TC001',
        associatedDomainId: 'DOM_ROBIUL_001',
        packageName: 'Business Pro',
        hostingType: 'vps',
        providerName: 'HostGator',
        accountUsername: 'user_host001',
        controlPanelUrl: 'https://cpanel.hostgator.com',
        storageSpace: '100GB',
        bandwidthLimit: 'Unlimited',
        ipAddress: '192.168.1.100',
        serverLocation: 'USA East',
        purchaseDate: '2024-01-01',
        expirationDate: '2025-01-01',
        status: 'active',
        price: 599.00,
        currency: 'USD',
        paymentStatus: 'paid',
        invoiceNumber: 'INV-H-2024-001',
        usagePercent: 45,
        lastBackup: '2024-01-30',
        backupStatus: 'success',
        notes: 'VPS hosting for domain.robiulawal.com',
        autoRenewal: true,
        supportContact: 'support@hostgator.com',
        daysUntilExpiry: 365,
        createdBy: 'admin'
      },
      {
        id: 'HOST002',
        clientId: 'EC002',
        associatedDomainId: 'DOM002',
        packageName: 'E-commerce Pro',
        hostingType: 'dedicated',
        providerName: 'HostGator',
        accountUsername: 'user_host002',
        controlPanelUrl: 'https://cpanel.hostgator.com',
        storageSpace: '500GB',
        bandwidthLimit: 'Unlimited',
        ipAddress: '192.168.1.101',
        serverLocation: 'USA West',
        purchaseDate: '2022-06-10',
        expirationDate: '2024-06-10',
        status: 'active',
        price: 1299.00,
        currency: 'USD',
        paymentStatus: 'paid',
        invoiceNumber: 'INV-H-2024-002',
        usagePercent: 65,
        lastBackup: '2024-01-29',
        backupStatus: 'success',
        notes: 'Dedicated server for e-commerce',
        autoRenewal: true,
        supportContact: 'support@hostgator.com',
        daysUntilExpiry: 150,
        createdBy: 'admin'
      }
    ];

    for (const hosting of hostingAccounts) {
      await this.insertHosting(hosting);
    }
    
    console.log(`✅ Migrated ${hostingAccounts.length} hosting accounts`);
  }

  private async migratePayments(): Promise<void> {
    console.log('💳 Migrating payments...');
    
    const payments: Partial<Payment>[] = [
      {
        id: 'PAY001',
        clientId: 'TC001',
        serviceId: 'DOM_ROBIUL_001',
        serviceType: 'domain',
        amount: 15.99,
        currency: 'USD',
        paymentDate: '2024-01-01',
        dueDate: '2024-01-01',
        paymentMethod: 'Credit Card',
        invoiceNumber: 'INV-D-2024-049',
        paymentStatus: 'completed',
        notes: 'Payment for domain.robiulawal.com',
        isOverdue: false,
        daysOverdue: 0,
        createdBy: 'admin'
      },
      {
        id: 'PAY002',
        clientId: 'TC001',
        serviceId: 'HOST001',
        serviceType: 'hosting',
        amount: 599.00,
        currency: 'USD',
        paymentDate: '2024-01-01',
        dueDate: '2024-01-01',
        paymentMethod: 'Credit Card',
        invoiceNumber: 'INV-H-2024-001',
        paymentStatus: 'completed',
        notes: 'Payment for VPS hosting',
        isOverdue: false,
        daysOverdue: 0,
        createdBy: 'admin'
      }
    ];

    for (const payment of payments) {
      await this.insertPayment(payment);
    }
    
    console.log(`✅ Migrated ${payments.length} payments`);
  }

  private async insertClient(client: Client): Promise<void> {
    const sql = `
      INSERT INTO clients (
        id, full_name, company_name, email, phone_number, address, 
        country, timezone, preferred_contact, join_date, account_status, 
        notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.supabase.execute(sql, [
      client.id,
      client.fullName,
      client.companyName,
      client.email,
      client.phoneNumber,
      client.address,
      client.country,
      client.timezone,
      client.preferredContact,
      client.joinDate,
      client.accountStatus,
      client.notes,
      client.createdBy
    ]);
  }

  private async insertDomain(domain: Partial<Domain>): Promise<void> {
    const sql = `
      INSERT INTO domains (
        id, client_id, name, registrar, registration_date, expiration_date,
        status, primary_ns, secondary_ns, price, currency, payment_status,
        invoice_number, notes, auto_renewal, days_until_expiry, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.supabase.execute(sql, [
      domain.id,
      domain.clientId,
      domain.name,
      domain.registrar,
      domain.registrationDate,
      domain.expirationDate,
      domain.status,
      domain.primaryNs,
      domain.secondaryNs,
      domain.price,
      domain.currency,
      domain.paymentStatus,
      domain.invoiceNumber,
      domain.notes,
      domain.autoRenewal,
      domain.daysUntilExpiry,
      domain.createdBy
    ]);
  }

  private async insertHosting(hosting: Partial<Hosting>): Promise<void> {
    const sql = `
      INSERT INTO hosting (
        id, client_id, associated_domain_id, package_name, hosting_type,
        provider_name, account_username, control_panel_url, storage_space,
        bandwidth_limit, ip_address, server_location, purchase_date,
        expiration_date, status, price, currency, payment_status,
        invoice_number, usage_percent, last_backup, backup_status,
        notes, auto_renewal, support_contact, days_until_expiry, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.supabase.execute(sql, [
      hosting.id,
      hosting.clientId,
      hosting.associatedDomainId,
      hosting.packageName,
      hosting.hostingType,
      hosting.providerName,
      hosting.accountUsername,
      hosting.controlPanelUrl,
      hosting.storageSpace,
      hosting.bandwidthLimit,
      hosting.ipAddress,
      hosting.serverLocation,
      hosting.purchaseDate,
      hosting.expirationDate,
      hosting.status,
      hosting.price,
      hosting.currency,
      hosting.paymentStatus,
      hosting.invoiceNumber,
      hosting.usagePercent,
      hosting.lastBackup,
      hosting.backupStatus,
      hosting.notes,
      hosting.autoRenewal,
      hosting.supportContact,
      hosting.daysUntilExpiry,
      hosting.createdBy
    ]);
  }

  private async insertPayment(payment: Partial<Payment>): Promise<void> {
    const sql = `
      INSERT INTO payments (
        id, client_id, service_id, service_type, amount, currency,
        payment_date, due_date, payment_method, invoice_number,
        payment_status, notes, is_overdue, days_overdue, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.supabase.execute(sql, [
      payment.id,
      payment.clientId,
      payment.serviceId,
      payment.serviceType,
      payment.amount,
      payment.currency,
      payment.paymentDate,
      payment.dueDate,
      payment.paymentMethod,
      payment.invoiceNumber,
      payment.paymentStatus,
      payment.notes,
      payment.isOverdue,
      payment.daysOverdue,
      payment.createdBy
    ]);
  }
}

// Export function to run migration
export async function runMigration(): Promise<void> {
  const migrator = new DataMigrator();
  await migrator.migrateAllData();
}
