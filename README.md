# Domain & Hosting Manager (DomainHub)

A comprehensive, production-ready domain and hosting management system built with React, TypeScript, and Express. Manage clients, domains, hosting services, and payments in one integrated platform with automated notifications and analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)

## 🚀 Features

### Core Functionality
- **Client Management**: Complete client database with contact information, service history, and billing details
- **Domain Management**: Track domain registrations, renewals, DNS settings, and registrar information
- **Hosting Management**: Monitor hosting accounts, server details, usage statistics, and backups
- **Payment Processing**: Multi-currency payment tracking with support for USD/BDT and various payment methods
- **Automated Notifications**: Email, SMS, and WhatsApp alerts for renewals and overdue payments

### Advanced Features
- **Dashboard Analytics**: Real-time revenue charts, service status overview, and performance metrics
- **Calendar Integration**: Visual expiry calendar with color-coded priorities
- **Relational Data Structure**: Fully normalized database with foreign key relationships
- **Multi-currency Support**: Automatic currency conversion between USD and BDT
- **Backup Management**: Automated database backups with retention policies
- **Audit Logging**: Complete system logs for all actions and changes

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- NPM (comes with Node.js)
- SQLite3 or Supabase account
- (Optional) SMS service account for notifications

### 1. Clone and Install
```bash
git clone <repository-url>
cd domain-hosting-manager
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 3. Database Setup
```bash
# Initialize database with schema
npm run db:setup

# (Optional) Load sample data
npm run db:seed
```

### 4. Start Development Server
```bash
pnpm dev
```

Visit `http://localhost:8080` to access the application.

## 💻 System Requirements

### Server Requirements
- **Node.js**: 18.0 or higher
- **NPM**: 8.0 or higher (included with Node.js)
- **Memory**: 512MB RAM minimum (2GB recommended)
- **Storage**: 1GB disk space
- **Network**: Stable internet for SMS/email services

### Client Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Enabled
- **Screen Resolution**: 1024x768 minimum (responsive design)

## 🔧 Installation

### Development Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd domain-hosting-manager
   ```

2. **Install Dependencies**
   ```bash
   # Using NPM
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

4. **Database Initialization**
   ```bash
   # Create database and tables
   npm run db:setup
   
   # Load sample data (optional)
   npm run db:seed
   ```

### Production Installation

1. **Build Application**
   ```bash
   pnpm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Process Manager (Recommended)**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start dist/server/node-build.mjs --name "domainhub"
   pm2 save
   pm2 startup
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="./database.sqlite"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Server Configuration
PORT=8080
NODE_ENV=production

# SMS Service (BulkSMSBD)
BULKSMSBD_API_KEY="your-api-key"
BULKSMSBD_SENDER_ID="your-sender-id"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Currency Exchange
USD_TO_BDT_RATE=120
AUTO_UPDATE_RATES=true

# Backup Settings
AUTO_BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=30

# Security
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
```

### Database Configuration

The system supports two database options:

#### Option 1: SQLite (Default)
- Local file-based database
- Perfect for small to medium deployments
- No external dependencies

#### Option 2: Supabase (Recommended for Production)
- Cloud-hosted PostgreSQL
- Built-in authentication and real-time features
- Automatic backups and scaling

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

## 🗄️ Database Setup

### Automatic Setup
```bash
pnpm run db:setup
```

### Manual Setup
1. **Create Database**
   ```bash
   sqlite3 database.sqlite < shared/database/schema.sql
   ```

2. **Verify Tables**
   ```bash
   sqlite3 database.sqlite ".tables"
   ```

### Database Schema Overview

The system uses a fully relational database structure:

- **clients** - Master table for all customer information
- **domains** - Domain registrations linked to clients
- **hosting** - Hosting accounts linked to clients and optionally domains
- **payments** - Payment records linked to clients and services
- **expiry_events** - Calendar events for service renewals
- **notifications** - System notifications and alerts
- **system_logs** - Audit trail for all actions
- **backup_logs** - Backup operation history

## 📖 Usage Guide

### Complete Workflow Example

#### 1. Add New Client
1. Navigate to **Clients** → Click **"Add Client"**
2. Fill client information:
   - Full Name: "Tech Startup LLC"
   - Email: "admin@techstartup.com"
   - Phone, Address, Country
3. Save client

#### 2. Add Domain for Client
1. Navigate to **Domains** → Click **"Add Domain"**
2. Select client from dropdown: "Tech Startup LLC"
3. Client details auto-populate
4. Enter domain details:
   - Domain: "techstartup.com"
   - Registrar: "Namecheap"
   - Expiration date
   - Price: $15.99 USD
5. Save domain

#### 3. Add Hosting for Client
1. Navigate to **Hosting** → Click **"Add Hosting"**
2. Select same client: "Tech Startup LLC"
3. Associate with domain: "techstartup.com" (optional)
4. Enter hosting details:
   - Package: "Business VPS"
   - Provider: "DigitalOcean"
   - Specifications
   - Price: $50.00 USD
5. Save hosting

#### 4. Record Payment
1. Navigate to **Payments** → Click **"Add Payment"**
2. Select client: "Tech Startup LLC"
3. Choose service type: "Domain" or "Hosting"
4. Select specific service
5. System auto-fills price and currency
6. Select payment method and record payment

### Key Features Explained

#### Dashboard Analytics
- **Real-time Stats**: Total clients, domains, hosting, revenue
- **Revenue Charts**: Monthly trends with dual currency support
- **Service Status**: Active, expiring, expired services breakdown
- **Calendar View**: Visual expiry timeline with color coding

#### Notification System
- **Automated Alerts**: 30, 15, 7, and 1-day renewal reminders
- **Multi-channel**: Email, SMS, WhatsApp support
- **Payment Reminders**: Overdue payment notifications
- **Custom Templates**: Personalized message templates

#### Multi-currency Support
- **Dual Currency**: USD and BDT support
- **Auto Conversion**: Real-time exchange rate updates
- **Flexible Pricing**: Set prices in either currency
- **Reporting**: Revenue analytics in both currencies

## 🔌 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication
Currently using session-based authentication. JWT support planned.

### Core Endpoints

#### Clients
```http
GET    /api/clients           # List all clients
POST   /api/clients           # Create new client
GET    /api/clients/:id       # Get client details
PUT    /api/clients/:id       # Update client
DELETE /api/clients/:id       # Delete client
```

#### Domains
```http
GET    /api/domains           # List all domains
POST   /api/domains           # Create new domain
GET    /api/domains/:id       # Get domain details
PUT    /api/domains/:id       # Update domain
DELETE /api/domains/:id       # Delete domain
```

#### Hosting
```http
GET    /api/hosting           # List all hosting
POST   /api/hosting           # Create new hosting
GET    /api/hosting/:id       # Get hosting details  
PUT    /api/hosting/:id       # Update hosting
DELETE /api/hosting/:id       # Delete hosting
```

#### Payments
```http
GET    /api/payments          # List all payments
POST   /api/payments          # Create new payment
GET    /api/payments/:id      # Get payment details
PUT    /api/payments/:id      # Update payment
DELETE /api/payments/:id      # Delete payment
```

#### Notifications
```http
POST   /api/sms/bulksmsbd     # Send SMS notification
GET    /api/notifications     # List notifications
POST   /api/notifications     # Create notification
```

### Example API Usage

#### Create Client
```bash
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "country": "United States"
  }'
```

#### Create Domain
```bash
curl -X POST http://localhost:8080/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid",
    "name": "example.com",
    "registrar": "Namecheap",
    "expirationDate": "2025-01-15",
    "price": 15.99,
    "currency": "USD"
  }'
```

## 🚀 Deployment

### Option 1: Traditional Server

1. **Build Application**
   ```bash
   pnpm run build
   ```

2. **Copy Files to Server**
   ```bash
   scp -r dist/ user@server:/var/www/domainhub/
   scp package.json user@server:/var/www/domainhub/
   ```

3. **Install Dependencies on Server**
   ```bash
   ssh user@server
   cd /var/www/domainhub
   npm install --production
   ```

4. **Start with Process Manager**
   ```bash
   pm2 start dist/server/node-build.mjs --name domainhub
   pm2 save
   pm2 startup
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist ./dist
   EXPOSE 8080
   CMD ["node", "dist/server/node-build.mjs"]
   ```

2. **Build and Run**
   ```bash
   docker build -t domainhub .
   docker run -d -p 8080:8080 --name domainhub domainhub
   ```

### Option 3: Cloud Deployment

The system includes configurations for:
- **Netlify**: See `netlify.toml`
- **Vercel**: See `vercel.json`
- **Heroku**: Add `Procfile` with: `web: node dist/server/node-build.mjs`

## 🔒 Security Considerations

### Data Protection
- Environment variables for sensitive data
- SQL injection protection via parameterized queries
- Input validation and sanitization
- CORS protection enabled

### Password Security
- Hosting account passwords should be encrypted
- Use environment variables for API keys
- Regular security updates

### Backup Security
- Encrypt backup files
- Secure backup storage location
- Regular backup integrity checks

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pnpm test

# Type checking
pnpm typecheck

# Linting
npm run lint
```

### Test Coverage
- Database operations
- API endpoints
- UI components
- Validation schemas

## 📝 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── components/        # UI components
│   ├── pages/            # Route components
│   ├── contexts/         # React contexts
│   └── services/         # API services
├── server/               # Express backend
│   ├── routes/          # API routes
│   └── middleware/      # Express middleware
├── shared/              # Shared types and utilities
│   ├── database/       # Database schema and config
│   └── types/          # TypeScript definitions
└── public/             # Static assets
```

### Adding New Features

1. **Database Changes**
   - Update `shared/database/schema.sql`
   - Update TypeScript types in `shared/types/`
   - Create migration scripts

2. **API Endpoints**
   - Add route handler in `server/routes/`
   - Update `server/index.ts`
   - Add shared types in `shared/api.ts`

3. **Frontend Pages**
   - Create component in `client/pages/`
   - Add route in `client/App.tsx`
   - Create forms in `client/components/forms/`

### Code Style
- TypeScript strict mode enabled
- ESLint configuration
- Prettier formatting
- Conventional commit messages

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m "Add amazing feature"`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure backward compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Complete Workflow Demo](./COMPLETE_WORKFLOW_DEMO.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Payment System Implementation](./PAYMENT_SYSTEM_IMPLEMENTATION.md)
- [Hosting Integration Guide](./HOSTING_INTEGRATION_GUIDE.md)

### Getting Help
- Create an [Issue](../../issues) for bugs or feature requests
- Check [Discussions](../../discussions) for questions
- Review existing documentation

### Common Issues

#### Database Connection
```bash
# Check database file permissions
ls -la database.sqlite

# Verify schema
sqlite3 database.sqlite ".schema"
```

#### SMS Not Working
```bash
# Check environment variables
echo $BULKSMSBD_API_KEY

# Test API connectivity
curl -X POST https://api.bulksmsbd.com/api/test
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
pnpm run build
```

---

## 🎉 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] NPM installed (comes with Node.js)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file configured (`.env`)
- [ ] Database initialized (`npm run db:setup`)
- [ ] Development server started (`npm run dev`)
- [ ] Accessed application at `http://localhost:8080`

**Ready to manage your domains and hosting!** 🚀

---

*Built with ❤️ using React, TypeScript, and modern web technologies.*