// Database Models with Relational Structure
// Client is the master table, all others reference via foreign keys

export interface Client {
  id: string; // Primary Key (Auto-generated)
  fullName: string;
  companyName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  country: string;
  timezone: string;
  preferredContact: 'email' | 'sms' | 'whatsapp' | 'phone';
  joinDate: string;
  accountStatus: 'active' | 'inactive' | 'suspended';
  notes?: string;
  
  // Computed fields (calculated from related tables)
  totalDomains?: number;
  totalHosting?: number;
  totalServices?: number;
  upcomingRenewals?: number;
  totalSpent?: number;
  lastPayment?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Domain {
  id: string; // Primary Key (Auto-generated)
  clientId: string; // Foreign Key -> clients.id
  
  // Domain Information
  name: string;
  registrar: string;
  registrationDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired' | 'pending';
  
  // DNS Information
  primaryNS?: string;
  secondaryNS?: string;
  
  // Financial Information
  price: number;
  currency: 'USD' | 'BDT';
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  invoiceNumber?: string;
  
  // Additional Information
  notes?: string;
  autoRenewal: boolean;
  
  // Computed fields
  daysUntilExpiry?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Related data (populated from joins)
  client?: Client;
  payments?: Payment[];

  // Display fields (computed for UI)
  customerName?: string;
  customerId?: string;
  contactEmail?: string;
  phoneNumber?: string;
}

export interface Hosting {
  id: string; // Primary Key (Auto-generated)
  clientId: string; // Foreign Key -> clients.id
  associatedDomainId?: string; // Foreign Key -> domains.id (optional)
  
  // Hosting Information
  packageName: string;
  hostingType: 'shared' | 'vps' | 'dedicated' | 'cloud';
  providerName: string;
  
  // Account Details
  accountUsername?: string;
  accountPassword?: string; // Encrypted
  controlPanelUrl?: string;
  
  // Server Specifications
  storageSpace?: string;
  bandwidthLimit?: string;
  ipAddress?: string;
  serverLocation?: string;
  
  // Dates
  purchaseDate: string;
  expirationDate: string;
  status: 'active' | 'expiring' | 'expired' | 'suspended';
  
  // Financial Information
  price: number;
  currency: 'USD' | 'BDT';
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  invoiceNumber?: string;
  
  // Usage & Monitoring
  usagePercent?: number;
  lastBackup?: string;
  backupStatus?: 'success' | 'failed' | 'pending';
  
  // Additional Information
  notes?: string;
  autoRenewal: boolean;
  supportContact?: string;
  
  // Computed fields
  daysUntilExpiry?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Related data (populated from joins)
  client?: Client;
  associatedDomain?: Domain;
  payments?: Payment[];
}

export interface Payment {
  id: string; // Primary Key (Auto-generated)
  clientId: string; // Foreign Key -> clients.id
  serviceId: string; // Foreign Key -> domains.id OR hosting.id
  serviceType: 'domain' | 'hosting' | 'other';
  
  // Payment Information
  amount: number;
  currency: 'USD' | 'BDT';
  exchangeRate?: number;
  convertedAmount?: number; // Auto-calculated
  
  // Dates
  paymentDate?: string;
  dueDate: string;
  
  // Payment Details
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'bkash' | 'nagad' | 'paypal' | 'stripe';
  invoiceNumber?: string;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid' | 'refunded';
  
  // Additional Information
  notes?: string;
  
  // Overdue tracking
  isOverdue?: boolean;
  daysOverdue?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Related data (populated from joins)
  client?: Client;
  service?: Domain | Hosting; // Union type based on serviceType

  // Display fields (computed for UI)
  clientName?: string;
  serviceName?: string;
}

export interface ExpiryEvent {
  id: string; // Primary Key (Auto-generated)
  clientId: string; // Foreign Key -> clients.id
  serviceId: string; // Foreign Key -> domains.id OR hosting.id
  serviceType: 'domain' | 'hosting' | 'other';
  
  // Event Information
  serviceName: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'renewed';
  
  // Renewal Information
  renewalPrice: number;
  currency: 'USD' | 'BDT';
  paymentStatus: 'paid' | 'unpaid';
  
  // Computed fields
  daysRemaining?: number;
  
  // Notification tracking
  notificationsSent?: string[]; // Array of notification types sent
  lastNotificationDate?: string;
  
  // Additional Information
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Related data (populated from joins)
  client?: Client;
  service?: Domain | Hosting;
  payment?: Payment;
}

export interface Notification {
  id: string; // Primary Key (Auto-generated)
  clientId: string; // Foreign Key -> clients.id
  serviceId?: string; // Foreign Key -> domains.id OR hosting.id (optional)
  paymentId?: string; // Foreign Key -> payments.id (optional)
  
  // Notification Information
  type: 'expiry_reminder' | 'payment_due' | 'overdue_payment' | 'renewal_success' | 'system_alert';
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'system';
  
  // Status
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Scheduling
  scheduledDate?: string;
  sentDate?: string;
  
  // Additional Information
  metadata?: Record<string, any>; // For storing additional data
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Related data (populated from joins)
  client?: Client;
  service?: Domain | Hosting;
  payment?: Payment;
}

// Data Transfer Objects (DTOs) for API communication
export interface CreateClientDTO {
  fullName: string;
  companyName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  country: string;
  timezone?: string;
  preferredContact?: 'email' | 'sms' | 'whatsapp' | 'phone';
  accountStatus?: 'active' | 'inactive';
  notes?: string;
}

export interface CreateDomainDTO {
  clientId: string;
  name: string;
  registrar: string;
  registrationDate?: string;
  expirationDate: string;
  status?: 'active' | 'expiring' | 'expired';
  primaryNS?: string;
  secondaryNS?: string;
  price: number;
  currency: 'USD' | 'BDT';
  paymentStatus?: 'paid' | 'unpaid';
  invoiceNumber?: string;
  notes?: string;
  autoRenewal?: boolean;
}

export interface CreateHostingDTO {
  clientId: string;
  associatedDomainId?: string;
  packageName: string;
  hostingType: 'shared' | 'vps' | 'dedicated' | 'cloud';
  providerName: string;
  accountUsername?: string;
  accountPassword?: string;
  controlPanelUrl?: string;
  storageSpace?: string;
  bandwidthLimit?: string;
  ipAddress?: string;
  serverLocation?: string;
  purchaseDate?: string;
  expirationDate: string;
  status?: 'active' | 'expiring' | 'expired';
  price: number;
  currency: 'USD' | 'BDT';
  paymentStatus?: 'paid' | 'unpaid';
  invoiceNumber?: string;
  usagePercent?: number;
  notes?: string;
  autoRenewal?: boolean;
  supportContact?: string;
}

export interface CreatePaymentDTO {
  clientId: string;
  serviceId: string;
  serviceType: 'domain' | 'hosting' | 'other';
  amount: number;
  currency: 'USD' | 'BDT';
  exchangeRate?: number;
  paymentDate?: string;
  dueDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'bkash' | 'nagad' | 'paypal' | 'stripe';
  invoiceNumber?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'partially_paid';
  notes?: string;
}

// Database Query Types
export interface DatabaseFilters {
  clientId?: string;
  serviceType?: 'domain' | 'hosting';
  status?: string;
  paymentStatus?: string;
  currency?: 'USD' | 'BDT';
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface DatabaseSortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DatabaseQueryOptions {
  filters?: DatabaseFilters;
  sort?: DatabaseSortOptions;
  limit?: number;
  offset?: number;
  include?: string[]; // Related tables to include
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalClients: number;
  totalDomains: number;
  totalHosting: number;
  upcomingRenewals: number;
  unpaidInvoices: number;
  totalRevenueBDT: number;
  totalRevenueUSD: number;
  expiredServices: number;
  criticalServices: number; // Expiring in 7 days
  warningServices: number; // Expiring in 30 days
  activeServices: number;
}

// Validation Schemas (for use with libraries like Zod)
export interface ValidationSchema {
  clients: CreateClientDTO;
  domains: CreateDomainDTO;
  hosting: CreateHostingDTO;
  payments: CreatePaymentDTO;
}

// Relationship helper types
export interface ClientWithServices extends Client {
  domains: Domain[];
  hosting: Hosting[];
  payments: Payment[];
  notifications: Notification[];
  expiryEvents: ExpiryEvent[];
}

export interface DomainWithRelations extends Domain {
  client: Client;
  hosting?: Hosting[]; // Associated hosting
  payments: Payment[];
}

export interface HostingWithRelations extends Hosting {
  client: Client;
  associatedDomain?: Domain;
  payments: Payment[];
}

export interface PaymentWithRelations extends Payment {
  client: Client;
  service: Domain | Hosting;
}
