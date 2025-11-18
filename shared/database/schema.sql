-- DomainHub Database Schema
-- Version: 1.0
-- Description: Complete schema for domain and hosting management system

-- Enable foreign key constraints (SQLite)
PRAGMA foreign_keys = ON;

-- Clients table (Master table)
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    address TEXT,
    country TEXT DEFAULT 'United States',
    timezone TEXT DEFAULT 'UTC',
    preferred_contact TEXT CHECK(preferred_contact IN ('email', 'phone', 'both')) DEFAULT 'email',
    join_date DATE NOT NULL,
    account_status TEXT CHECK(account_status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL
);

-- Domains table
CREATE TABLE IF NOT EXISTS domains (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    name TEXT UNIQUE NOT NULL,
    registrar TEXT NOT NULL,
    registration_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status TEXT CHECK(status IN ('active', 'expiring', 'expired', 'suspended')) DEFAULT 'active',
    primary_ns TEXT,
    secondary_ns TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT CHECK(currency IN ('USD', 'BDT')) DEFAULT 'USD',
    payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid', 'partially_paid')) DEFAULT 'unpaid',
    invoice_number TEXT,
    notes TEXT,
    auto_renewal BOOLEAN DEFAULT FALSE,
    days_until_expiry INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_domains_client_id (client_id),
    INDEX idx_domains_expiration (expiration_date),
    INDEX idx_domains_status (status)
);

-- Hosting table
CREATE TABLE IF NOT EXISTS hosting (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    associated_domain_id TEXT,
    package_name TEXT NOT NULL,
    hosting_type TEXT CHECK(hosting_type IN ('shared', 'vps', 'dedicated', 'cloud')) DEFAULT 'shared',
    provider_name TEXT NOT NULL,
    account_username TEXT,
    account_password TEXT, -- Should be encrypted in production
    control_panel_url TEXT,
    storage_space TEXT,
    bandwidth_limit TEXT,
    ip_address TEXT,
    server_location TEXT,
    purchase_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status TEXT CHECK(status IN ('active', 'expiring', 'expired', 'suspended')) DEFAULT 'active',
    price DECIMAL(10,2) NOT NULL,
    currency TEXT CHECK(currency IN ('USD', 'BDT')) DEFAULT 'USD',
    payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid', 'partially_paid')) DEFAULT 'unpaid',
    invoice_number TEXT,
    usage_percent INTEGER DEFAULT 0 CHECK(usage_percent >= 0 AND usage_percent <= 100),
    last_backup DATE,
    backup_status TEXT CHECK(backup_status IN ('success', 'failed', 'pending')),
    notes TEXT,
    auto_renewal BOOLEAN DEFAULT FALSE,
    support_contact TEXT,
    days_until_expiry INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (associated_domain_id) REFERENCES domains(id) ON DELETE SET NULL,
    INDEX idx_hosting_client_id (client_id),
    INDEX idx_hosting_domain_id (associated_domain_id),
    INDEX idx_hosting_expiration (expiration_date),
    INDEX idx_hosting_status (status)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_type TEXT CHECK(service_type IN ('domain', 'hosting', 'other')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT CHECK(currency IN ('USD', 'BDT')) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4),
    converted_amount DECIMAL(10,2),
    payment_date DATE,
    due_date DATE NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'bank_transfer', 'card', 'bkash', 'nagad', 'paypal', 'stripe')) NOT NULL,
    invoice_number TEXT,
    payment_status TEXT CHECK(payment_status IN ('paid', 'unpaid', 'partially_paid', 'refunded')) DEFAULT 'unpaid',
    notes TEXT,
    is_overdue BOOLEAN DEFAULT FALSE,
    days_overdue INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_payments_client_id (client_id),
    INDEX idx_payments_service (service_id, service_type),
    INDEX idx_payments_due_date (due_date),
    INDEX idx_payments_status (payment_status)
);

-- Expiry Events table (for calendar and notifications)
CREATE TABLE IF NOT EXISTS expiry_events (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_type TEXT CHECK(service_type IN ('domain', 'hosting', 'other')) NOT NULL,
    service_name TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT CHECK(status IN ('active', 'expiring', 'expired', 'renewed')) DEFAULT 'active',
    renewal_price DECIMAL(10,2),
    renewal_currency TEXT CHECK(renewal_currency IN ('USD', 'BDT')) DEFAULT 'USD',
    auto_renewal BOOLEAN DEFAULT FALSE,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_date DATE,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_expiry_events_client_id (client_id),
    INDEX idx_expiry_events_expiry_date (expiry_date),
    INDEX idx_expiry_events_status (status)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK(type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    expires_at DATETIME,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_notifications_client_id (client_id),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_is_read (is_read)
);

-- System logs table (for audit and backup tracking)
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_system_logs_action (action),
    INDEX idx_system_logs_table (table_name),
    INDEX idx_system_logs_created_at (created_at)
);

-- Backup logs table
CREATE TABLE IF NOT EXISTS backup_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_type TEXT CHECK(backup_type IN ('full', 'incremental', 'differential')) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    status TEXT CHECK(status IN ('success', 'failed', 'in_progress')) DEFAULT 'in_progress',
    error_message TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    created_by TEXT,
    INDEX idx_backup_logs_status (status),
    INDEX idx_backup_logs_started_at (started_at)
);

-- Database settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, description, updated_by) VALUES
('db_version', '1.0', 'Database schema version', 'system'),
('auto_backup_enabled', 'true', 'Enable automatic backups', 'system'),
('auto_backup_interval', '24', 'Backup interval in hours', 'system'),
('backup_retention_days', '30', 'Number of days to keep backups', 'system'),
('notification_expiry_days', '30', 'Days before expiry to send notifications', 'system'),
('default_currency', 'USD', 'Default currency for new records', 'system'),
('exchange_rate_usd_bdt', '120', 'USD to BDT exchange rate', 'system'),
('timezone', 'UTC', 'System timezone', 'system');

-- Create triggers for auto-updating timestamps
CREATE TRIGGER IF NOT EXISTS update_clients_timestamp 
    AFTER UPDATE ON clients
BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_domains_timestamp 
    AFTER UPDATE ON domains
BEGIN
    UPDATE domains SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_hosting_timestamp 
    AFTER UPDATE ON hosting
BEGIN
    UPDATE hosting SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_payments_timestamp 
    AFTER UPDATE ON payments
BEGIN
    UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_expiry_events_timestamp 
    AFTER UPDATE ON expiry_events
BEGIN
    UPDATE expiry_events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create triggers for automatic expiry calculations
CREATE TRIGGER IF NOT EXISTS calculate_domain_days_until_expiry
    AFTER INSERT ON domains
BEGIN
    UPDATE domains 
    SET days_until_expiry = CAST((julianday(expiration_date) - julianday('now')) AS INTEGER)
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS calculate_hosting_days_until_expiry
    AFTER INSERT ON hosting
BEGIN
    UPDATE hosting 
    SET days_until_expiry = CAST((julianday(expiration_date) - julianday('now')) AS INTEGER)
    WHERE id = NEW.id;
END;

-- Create triggers for automatic payment overdue calculations
CREATE TRIGGER IF NOT EXISTS calculate_payment_overdue
    AFTER INSERT ON payments
BEGIN
    UPDATE payments 
    SET 
        is_overdue = CASE WHEN julianday('now') > julianday(due_date) THEN TRUE ELSE FALSE END,
        days_overdue = CASE 
            WHEN julianday('now') > julianday(due_date) 
            THEN CAST((julianday('now') - julianday(due_date)) AS INTEGER)
            ELSE 0 
        END
    WHERE id = NEW.id;
END;
