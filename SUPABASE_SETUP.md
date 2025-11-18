# Supabase Integration Setup Guide

## 🚀 Quick Setup Steps

### 1. Get Your Supabase Credentials
From your Supabase dashboard:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (optional, for admin operations)

### 2. Update Environment Variables
Replace the placeholder values:

```bash
# Update in your terminal or through Builder.io DevServerControl
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Create Database Schema
Run this SQL in your Supabase SQL Editor:

```sql
-- Create clients table
CREATE TABLE clients (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Create domains table
CREATE TABLE domains (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Create hosting table  
CREATE TABLE hosting (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  associated_domain_id TEXT REFERENCES domains(id),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Create payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Create backup_logs table
CREATE TABLE backup_logs (
  id SERIAL PRIMARY KEY,
  backup_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'in_progress',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by TEXT
);

-- Create indexes
CREATE INDEX idx_domains_client_id ON domains(client_id);
CREATE INDEX idx_hosting_client_id ON hosting(client_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_domains_expiration ON domains(expiration_date);
CREATE INDEX idx_hosting_expiration ON hosting(expiration_date);
```

### 4. Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Enable all operations for authenticated users" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON domains
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON hosting
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON payments
  FOR ALL USING (auth.role() = 'authenticated');
```

### 5. Seed Sample Data
Insert your existing data into Supabase:

```sql
-- Insert sample clients
INSERT INTO clients (id, full_name, company_name, email, phone_number, address, country, timezone, preferred_contact, join_date, account_status, notes, created_by)
VALUES 
('TC001', 'Tech Corp', 'Tech Corporation Ltd', 'admin@techcorp.com', '+1-555-0123', '123 Tech Street, Silicon Valley, CA 94000', 'United States', 'America/Los_Angeles', 'email', '2023-01-15', 'active', 'Priority enterprise client', 'admin'),
('EC002', 'E-commerce LLC', 'E-commerce Solutions LLC', 'contact@ecommerce.com', '+1-555-0456', '456 Commerce Ave, New York, NY 10001', 'United States', 'America/New_York', 'email', '2022-06-10', 'active', 'Auto-renewal enabled for all services', 'admin');

-- Insert domain for domain.robiulawal.com
INSERT INTO domains (id, client_id, name, registrar, registration_date, expiration_date, status, primary_ns, secondary_ns, price, currency, payment_status, invoice_number, notes, auto_renewal, days_until_expiry, created_by)
VALUES ('DOM_ROBIUL_001', 'TC001', 'domain.robiulawal.com', 'Namecheap', '2024-01-01', '2025-01-01', 'active', 'ns1.namecheap.com', 'ns2.namecheap.com', 15.99, 'USD', 'paid', 'INV-D-2024-049', 'Your primary domain', true, 365, 'admin');
```

## 🔧 Configuration Complete

Once you've:
1. ✅ Updated environment variables with real Supabase credentials
2. ✅ Created the database schema 
3. ✅ Enabled RLS and policies
4. ✅ Seeded initial data

Your DomainHub will automatically connect to Supabase instead of the mock database!

## 🚀 Next Steps

- **Deploy to Netlify**: Use Builder.io MCP to deploy your app
- **Set up Authentication**: Add Supabase Auth for user management
- **Real-time Updates**: Enable real-time subscriptions for live data
- **File Storage**: Use Supabase Storage for invoice PDFs and backups

## 🔒 Security Notes

- Never commit your service role key to version control
- Use RLS policies to secure your data
- Consider IP restrictions for production
- Enable MFA on your Supabase account

## 📞 Support

If you need help with the setup, check the Supabase documentation or reach out for assistance.
