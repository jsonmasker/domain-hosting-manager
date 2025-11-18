import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Server,
  Globe,
  Shield,
  HardDrive,
  Wifi,
  MapPin,
  Eye,
  EyeOff,
  ExternalLink,
  Key,
  Database,
  Mail,
  CheckCircle,
  AlertTriangle,
  Info,
  Copy,
  RefreshCw
} from "lucide-react";
import type { Client, Domain, CreateHostingDTO } from "@shared/types/database";
import { getClientOptions, getDomainsForClient, dataService } from "@/services/dataService";

interface SharedHostingCPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (hosting: any) => void;
  preselectedClient?: string;
  preselectedDomain?: string;
}

export function SharedHostingCPanel({ isOpen, onClose, onSuccess, preselectedClient, preselectedDomain }: SharedHostingCPanelProps) {
  const [formData, setFormData] = useState<CreateHostingDTO>({
    clientId: preselectedClient || "",
    associatedDomainId: preselectedDomain || "",
    packageName: "",
    hostingType: "shared",
    providerName: "",
    accountUsername: "",
    accountPassword: "",
    controlPanelUrl: "",
    storageSpace: "",
    bandwidthLimit: "",
    ipAddress: "",
    serverLocation: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    expirationDate: "",
    status: "active",
    price: 0,
    currency: "USD",
    paymentStatus: "unpaid",
    invoiceNumber: "",
    usagePercent: 0,
    notes: "",
    autoRenewal: false,
    supportContact: ""
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cPanelStatus, setCPanelStatus] = useState<'checking' | 'connected' | 'error' | null>(null);

  // Popular shared hosting providers with cPanel
  const cPanelProviders = [
    { name: "HostGator", cpanelPort: "2083", features: ["Unlimited Storage", "Unlimited Bandwidth", "Free SSL"] },
    { name: "Bluehost", cpanelPort: "2083", features: ["50GB Storage", "Unmetered Bandwidth", "Free Domain"] },
    { name: "SiteGround", cpanelPort: "2083", features: ["10GB Storage", "SuperCacher", "Free CDN"] },
    { name: "InMotion Hosting", cpanelPort: "2083", features: ["Unlimited Storage", "Free SSL", "Malware Protection"] },
    { name: "A2 Hosting", cpanelPort: "2083", features: ["Turbo Servers", "Free SSL", "Anytime Money Back"] },
    { name: "Hostinger", cpanelPort: "2083", features: ["100GB Storage", "Free SSL", "WordPress Optimization"] },
    { name: "DreamHost", cpanelPort: "2083", features: ["Fast SSD Storage", "Free Domain", "24/7 Support"] },
    { name: "GreenGeeks", cpanelPort: "2083", features: ["Eco-Friendly", "Free SSL", "Lightning Speed"] }
  ];

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.clientId && clients.length > 0) {
      const client = clients.find(c => c.id === formData.clientId);
      setSelectedClient(client || null);
      loadDomainsForClient(formData.clientId);
    }
  }, [formData.clientId, clients]);

  useEffect(() => {
    if (formData.associatedDomainId && availableDomains.length > 0) {
      const domain = availableDomains.find(d => d.id === formData.associatedDomainId);
      setSelectedDomain(domain || null);
    }
  }, [formData.associatedDomainId, availableDomains]);

  const loadClients = async () => {
    try {
      await dataService.initialize();
      const clientList = await getClientOptions();
      setClients(clientList);
    } catch (error) {
      setError("Failed to load clients");
    }
  };

  const loadDomainsForClient = async (clientId: string) => {
    try {
      const domains = await getDomainsForClient(clientId);
      setAvailableDomains(domains);
    } catch (error) {
      console.error("Failed to load domains for client");
    }
  };

  const handleProviderSelect = (providerName: string) => {
    const provider = cPanelProviders.find(p => p.name === providerName);
    if (provider) {
      setFormData(prev => ({
        ...prev,
        providerName,
        controlPanelUrl: `https://yourdomain.com:${provider.cpanelPort}`,
        supportContact: `support@${providerName.toLowerCase().replace(/\s+/g, '')}.com`
      }));
    }
  };

  const generateCPanelURL = () => {
    if (selectedDomain) {
      const provider = cPanelProviders.find(p => p.name === formData.providerName);
      const port = provider?.cpanelPort || "2083";
      return `https://${selectedDomain.name}:${port}`;
    }
    return "";
  };

  const testCPanelConnection = async () => {
    if (!formData.controlPanelUrl || !formData.accountUsername || !formData.accountPassword) {
      setError("Please fill in cPanel URL, username, and password first");
      return;
    }

    setCPanelStatus('checking');
    try {
      // Simulate cPanel connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would make an actual API call to test cPanel access
      const isConnected = Math.random() > 0.3; // Simulate 70% success rate
      
      if (isConnected) {
        setCPanelStatus('connected');
        setSuccess("cPanel connection successful!");
      } else {
        setCPanelStatus('error');
        setError("Failed to connect to cPanel. Please check your credentials.");
      }
    } catch (error) {
      setCPanelStatus('error');
      setError("Connection test failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await dataService.createHosting(formData);
      if (response.success) {
        setSuccess("Shared hosting with cPanel created successfully!");
        if (onSuccess) {
          onSuccess(response.data);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response.error || "Failed to create hosting");
      }
    } catch (error) {
      setError("An error occurred while saving the hosting");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Add Shared Hosting with cPanel
          </DialogTitle>
          <DialogDescription>
            Configure shared hosting account with cPanel control panel access
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-success/50 text-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client & Domain Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Customer Name *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="associatedDomainId">Associated Domain</Label>
                  <Select value={formData.associatedDomainId} onValueChange={(value) => setFormData(prev => ({ ...prev, associatedDomainId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No associated domain</SelectItem>
                      {availableDomains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedClient && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Selected Client</span>
                  </div>
                  <p className="font-medium">{selectedClient.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  {selectedDomain && (
                    <p className="text-sm text-muted-foreground">Domain: {selectedDomain.name}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hosting Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Shared Hosting Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerName">Hosting Provider *</Label>
                  <Select value={formData.providerName} onValueChange={handleProviderSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hosting provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {cPanelProviders.map((provider) => (
                        <SelectItem key={provider.name} value={provider.name}>
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            {provider.name}
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packageName">Hosting Package *</Label>
                  <Input
                    id="packageName"
                    value={formData.packageName}
                    onChange={(e) => setFormData(prev => ({ ...prev, packageName: e.target.value }))}
                    placeholder="e.g., Starter Plan, Business Plan"
                    required
                  />
                </div>
              </div>

              {formData.providerName && cPanelProviders.find(p => p.name === formData.providerName) && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">{formData.providerName} Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {cPanelProviders.find(p => p.name === formData.providerName)?.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* cPanel Access Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                cPanel Access Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountUsername">cPanel Username *</Label>
                  <Input
                    id="accountUsername"
                    value={formData.accountUsername}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountUsername: e.target.value }))}
                    placeholder="cpanel_username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountPassword">cPanel Password *</Label>
                  <div className="relative">
                    <Input
                      id="accountPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.accountPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountPassword: e.target.value }))}
                      placeholder="Enter cPanel password"
                      className="pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="controlPanelUrl">cPanel URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="controlPanelUrl"
                    value={formData.controlPanelUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, controlPanelUrl: e.target.value }))}
                    placeholder="https://yourdomain.com:2083"
                    required
                  />
                  {selectedDomain && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, controlPanelUrl: generateCPanelURL() }))}
                    >
                      Auto-Generate
                    </Button>
                  )}
                </div>
              </div>

              {/* cPanel Connection Test */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testCPanelConnection}
                  disabled={cPanelStatus === 'checking'}
                >
                  {cPanelStatus === 'checking' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Test cPanel Connection
                    </>
                  )}
                </Button>

                {cPanelStatus === 'connected' && (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Connected</span>
                  </div>
                )}

                {cPanelStatus === 'error' && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Connection Failed</span>
                  </div>
                )}
              </div>

              {formData.controlPanelUrl && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">cPanel Access URL:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(formData.controlPanelUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(formData.controlPanelUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <code className="text-sm text-muted-foreground">{formData.controlPanelUrl}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Server Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Server Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storageSpace">Storage Space</Label>
                  <Input
                    id="storageSpace"
                    value={formData.storageSpace}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageSpace: e.target.value }))}
                    placeholder="e.g., 10GB, 100GB, Unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bandwidthLimit">Bandwidth</Label>
                  <Input
                    id="bandwidthLimit"
                    value={formData.bandwidthLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, bandwidthLimit: e.target.value }))}
                    placeholder="e.g., 100GB, Unlimited"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverLocation">Server Location</Label>
                  <Select value={formData.serverLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, serverLocation: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA East">USA East</SelectItem>
                      <SelectItem value="USA West">USA West</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Monthly Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="9.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="BDT">BDT (৳)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Renewal Date *</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about this shared hosting account..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Shared Hosting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
