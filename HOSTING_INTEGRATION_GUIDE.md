# 🌐 Hosting Integration Guide for DomainHub

## Overview
This guide explains how to connect various hosting providers to your DomainHub management system for automated hosting management.

---

## 🔧 **Method 1: Manual Hosting Addition (Current)**

### Via Web Interface
1. **Navigate to Hosting Module**
   - Click "Hosting" in sidebar
   - Click "Add Hosting" button

2. **Select Client & Provider**
   - Choose existing client from dropdown
   - Select hosting provider (HostGator, AWS, DigitalOcean, etc.)

3. **Enter Hosting Details**
   - Package name and type
   - Server specifications
   - Account credentials
   - Control panel URL

4. **Link to Domain (Optional)**
   - Associate with client's existing domains
   - System maintains relational links

---

## 🚀 **Method 2: API Integrations (Advanced)**

### **A. cPanel/WHM Integration**
```javascript
// Example cPanel API integration
const cPanelAPI = {
  baseURL: 'https://your-cpanel-server.com:2083',
  
  async getAccountInfo(username, password) {
    const response = await fetch(`${this.baseURL}/execute/StatsBar/get_stats`, {
      headers: {
        'Authorization': `cpanel ${username}:${password}`
      }
    });
    return response.json();
  },

  async createAccount(accountData) {
    // Create new hosting account
    const response = await fetch(`${this.baseURL}/json-api/createacct`, {
      method: 'POST',
      body: JSON.stringify(accountData)
    });
    return response.json();
  }
};
```

### **B. AWS Integration**
```javascript
// AWS SDK integration for EC2/hosting management
import AWS from 'aws-sdk';

const ec2 = new AWS.EC2({
  accessKeyId: 'YOUR_ACCESS_KEY',
  secretAccessKey: 'YOUR_SECRET_KEY',
  region: 'us-east-1'
});

// List EC2 instances
const getHostingInstances = async () => {
  const params = { MaxResults: 100 };
  const data = await ec2.describeInstances(params).promise();
  return data.Reservations.flatMap(r => r.Instances);
};
```

### **C. DigitalOcean Integration**
```javascript
// DigitalOcean API integration
const digitalOceanAPI = {
  baseURL: 'https://api.digitalocean.com/v2',
  token: 'YOUR_DO_TOKEN',

  async getDroplets() {
    const response = await fetch(`${this.baseURL}/droplets`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  },

  async createDroplet(dropletData) {
    const response = await fetch(`${this.baseURL}/droplets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dropletData)
    });
    return response.json();
  }
};
```

---

## 🔗 **Method 3: Domain-to-Hosting Linking**

### **Automatic DNS Management**
```javascript
// Example DNS management integration
const dnsManager = {
  async updateNameservers(domain, nameservers) {
    // Update domain nameservers to point to hosting
    const response = await fetch('/api/domains/update-ns', {
      method: 'POST',
      body: JSON.stringify({
        domain,
        nameservers
      })
    });
    return response.json();
  },

  async createDNSRecords(domain, records) {
    // Create A, CNAME, MX records for hosting
    const response = await fetch('/api/dns/records', {
      method: 'POST',
      body: JSON.stringify({
        domain,
        records
      })
    });
    return response.json();
  }
};
```

---

## 📊 **Method 4: Hosting Monitoring Integration**

### **Server Monitoring**
```javascript
// Example monitoring integration
const hostingMonitor = {
  async checkServerStatus(serverIP) {
    try {
      const response = await fetch(`http://${serverIP}/health`, {
        timeout: 5000
      });
      return {
        status: response.ok ? 'online' : 'offline',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'offline',
        error: error.message
      };
    }
  },

  async getServerStats(serverIP) {
    // Get CPU, memory, disk usage
    const response = await fetch(`/api/monitoring/${serverIP}/stats`);
    return response.json();
  }
};
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Choose Integration Type**
- **Manual**: Use existing UI for simple hosting management
- **API**: Integrate with hosting provider APIs for automation
- **Hybrid**: Combine manual entry with API monitoring

### **Step 2: Configure Provider Settings**
```javascript
// Add to your hosting service configuration
const hostingProviders = {
  hostgator: {
    apiURL: 'https://api.hostgator.com',
    authType: 'api_key',
    features: ['account_creation', 'monitoring', 'dns_management']
  },
  aws: {
    apiURL: 'https://ec2.amazonaws.com',
    authType: 'access_key',
    features: ['instance_management', 'monitoring', 'auto_scaling']
  },
  digitalocean: {
    apiURL: 'https://api.digitalocean.com/v2',
    authType: 'bearer_token',
    features: ['droplet_management', 'monitoring', 'backups']
  }
};
```

### **Step 3: Update Database Schema**
```sql
-- Add hosting provider integration fields
ALTER TABLE hosting ADD COLUMN provider_api_key TEXT;
ALTER TABLE hosting ADD COLUMN provider_instance_id TEXT;
ALTER TABLE hosting ADD COLUMN auto_monitoring BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting ADD COLUMN last_monitored DATETIME;
```

### **Step 4: Implement Automation**
```javascript
// Example automation service
class HostingAutomation {
  async syncHostingAccounts() {
    const providers = await this.getConfiguredProviders();
    
    for (const provider of providers) {
      const accounts = await this.fetchProviderAccounts(provider);
      await this.updateLocalHostingRecords(accounts);
    }
  }

  async monitorHostingHealth() {
    const hostingAccounts = await this.getHostingWithMonitoring();
    
    for (const account of hostingAccounts) {
      const status = await this.checkHostingStatus(account);
      await this.updateHostingStatus(account.id, status);
      
      if (status.isDown) {
        await this.sendAlertNotification(account);
      }
    }
  }
}
```

---

## 🎯 **Quick Start Recommendations**

### **For Basic Setup**
1. Use the existing UI to manually add hosting accounts
2. Link hosting to existing domains through the interface
3. Use the payment system to track hosting renewals

### **For Advanced Setup**
1. Implement API integrations with your main hosting providers
2. Set up automated monitoring and status updates
3. Configure DNS management automation
4. Enable hosting renewal notifications

### **For Enterprise Setup**
1. Full API integration with all hosting providers
2. Automated provisioning and deprovisioning
3. Real-time monitoring and alerting
4. Automated DNS and SSL management
5. Cost optimization and resource monitoring

---

## 🔐 **Security Considerations**

### **API Key Management**
```javascript
// Secure API key storage
const secureConfig = {
  hostingAPIs: {
    encryption: 'AES-256',
    storage: 'environment_variables',
    rotation: 'monthly'
  }
};
```

### **Access Control**
- Limit API permissions to necessary operations only
- Use read-only keys for monitoring
- Implement API rate limiting
- Log all hosting operations for audit

---

## 📞 **Support & Next Steps**

1. **Current System**: Use the Hosting module in your DomainHub interface
2. **API Integration**: Contact your hosting providers for API documentation
3. **Custom Development**: Implement provider-specific integrations
4. **Monitoring**: Set up automated health checks and alerts

Your DomainHub system already has the foundation for hosting management. Choose the integration level that matches your needs and technical capabilities.
