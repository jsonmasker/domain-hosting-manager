import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Mail,
  Phone,
  User,
  Server,
  Globe,
  Calendar,
  DollarSign,
  Info,
  CheckCircle,
  AlertTriangle,
  Shield,
  HardDrive,
  MapPin,
  Eye,
  EyeOff,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Client, Domain, CreateHostingDTO } from "@shared/types/database";
import { getClientOptions, getDomainsForClient, dataService } from "@/services/dataService";
import { ClientForm } from "./ClientForm";

interface HostingFormProps {
  hosting?: any; // Existing hosting for editing
  onClose: () => void;
  onSuccess?: (hosting: any) => void;
}

export function HostingForm({ hosting, onClose, onSuccess }: HostingFormProps) {
  const [formData, setFormData] = useState<CreateHostingDTO>({
    clientId: hosting?.clientId || "",
    associatedDomainId: hosting?.associatedDomainId || "",
    packageName: hosting?.packageName || "",
    hostingType: hosting?.hostingType || "shared",
    providerName: hosting?.providerName || "",
    accountUsername: hosting?.accountUsername || "",
    accountPassword: hosting?.accountPassword || "",
    controlPanelUrl: hosting?.controlPanelUrl || "",
    storageSpace: hosting?.storageSpace || "",
    bandwidthLimit: hosting?.bandwidthLimit || "",
    ipAddress: hosting?.ipAddress || "",
    serverLocation: hosting?.serverLocation || "",
    purchaseDate: hosting?.purchaseDate || "",
    expirationDate: hosting?.expirationDate || "",
    status: hosting?.status || "active",
    price: hosting?.price || 0,
    currency: hosting?.currency || "USD",
    paymentStatus: hosting?.paymentStatus || "unpaid",
    invoiceNumber: hosting?.invoiceNumber || "",
    usagePercent: hosting?.usagePercent || 0,
    notes: hosting?.notes || "",
    autoRenewal: hosting?.autoRenewal || false,
    supportContact: hosting?.supportContact || ""
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Auto-fill client data when client is selected
  useEffect(() => {
    if (formData.clientId && clients.length > 0) {
      const client = clients.find(c => c.id === formData.clientId);
      setSelectedClient(client || null);
      loadDomainsForClient(formData.clientId);
    }
  }, [formData.clientId, clients]);

  // Auto-fill domain data when domain is selected
  useEffect(() => {
    if (formData.associatedDomainId && availableDomains.length > 0) {
      const domain = availableDomains.find(d => d.id === formData.associatedDomainId);
      setSelectedDomain(domain || null);
    }
  }, [formData.associatedDomainId, availableDomains]);

  const loadClients = async () => {
    try {
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

  const handleClientSelect = (clientId: string) => {
    if (clientId === "add-new") {
      setIsAddClientDialogOpen(true);
      return;
    }

    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({
      ...prev,
      clientId,
      associatedDomainId: "" // Reset domain selection when client changes
    }));
    setSelectedDomain(null);
    loadDomainsForClient(clientId);
  };

  const handleNewClientAdded = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setSelectedClient(newClient);
    setFormData(prev => ({
      ...prev,
      clientId: newClient.id,
      associatedDomainId: ""
    }));
    setSelectedDomain(null);
    loadDomainsForClient(newClient.id);
    setIsAddClientDialogOpen(false);
  };

  const handleDomainSelect = (domainId: string) => {
    const domain = availableDomains.find(d => d.id === domainId);
    setSelectedDomain(domain || null);
    setFormData(prev => ({
      ...prev,
      associatedDomainId: domainId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (hosting) {
        // Update existing hosting
        setSuccess("Hosting updated successfully!");
      } else {
        // Create new hosting
        const response = await dataService.createHosting(formData);
        if (response.success) {
          setSuccess(response.message || "Hosting created successfully!");
          if (onSuccess) {
            onSuccess(response.data);
          }
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(response.error || "Failed to create hosting");
        }
      }
    } catch (error) {
      setError("An error occurred while saving the hosting");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysUntilExpiry = () => {
    if (!formData.expirationDate) return null;
    const today = new Date();
    const expiry = new Date(formData.expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUsageColor = () => {
    const usage = formData.usagePercent || 0;
    if (usage >= 90) return "text-destructive";
    if (usage >= 75) return "text-warning";
    return "text-success";
  };

  const daysUntilExpiry = calculateDaysUntilExpiry();

  return (
    <>
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Client Information</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientId">Customer Name *</Label>
          <Select value={formData.clientId} onValueChange={handleClientSelect} required>
            <SelectTrigger>
              <SelectValue placeholder="Choose a client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add-new">
                <div className="flex items-center gap-2 text-primary">
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Add New Client</span>
                </div>
              </SelectItem>
              {clients.length > 0 && <div className="border-t my-1" />}
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{client.fullName}</div>
                      <div className="text-xs text-muted-foreground">{client.email}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Domain Selection (Optional) */}
        {formData.clientId && (
          <div className="space-y-2">
            <Label htmlFor="associatedDomainId">Associated Domain (Optional)</Label>
            <Select value={formData.associatedDomainId} onValueChange={handleDomainSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a domain (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No associated domain</SelectItem>
                {availableDomains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{domain.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Expires: {domain.expirationDate}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Client Preview */}
        {selectedClient && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Client Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{selectedClient.email}</span>
              </div>
              {selectedClient.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{selectedClient.phoneNumber}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Country:</span> {selectedClient.country}
              </div>
              {selectedDomain && (
                <div>
                  <span className="text-muted-foreground">Domain:</span> {selectedDomain.name}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Hosting Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Hosting Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="packageName">Package Name *</Label>
            <Input
              id="packageName"
              value={formData.packageName}
              onChange={(e) => setFormData({...formData, packageName: e.target.value})}
              placeholder="Business Pro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostingType">Hosting Type *</Label>
            <Select value={formData.hostingType} onValueChange={(value: any) => setFormData({...formData, hostingType: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="vps">VPS</SelectItem>
                <SelectItem value="dedicated">Dedicated</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="providerName">Provider Name *</Label>
            <Select value={formData.providerName} onValueChange={(value) => setFormData({...formData, providerName: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HostGator">HostGator</SelectItem>
                <SelectItem value="SiteGround">SiteGround</SelectItem>
                <SelectItem value="DigitalOcean">DigitalOcean</SelectItem>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="WP Engine">WP Engine</SelectItem>
                <SelectItem value="Bluehost">Bluehost</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serverLocation">Server Location</Label>
            <Select value={formData.serverLocation} onValueChange={(value) => setFormData({...formData, serverLocation: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Singapore">Singapore</SelectItem>
                <SelectItem value="USA East">USA East</SelectItem>
                <SelectItem value="USA West">USA West</SelectItem>
                <SelectItem value="USA Central">USA Central</SelectItem>
                <SelectItem value="London">London</SelectItem>
                <SelectItem value="Frankfurt">Frankfurt</SelectItem>
                <SelectItem value="Tokyo">Tokyo</SelectItem>
                <SelectItem value="Sydney">Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Account Credentials */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Account Credentials</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="accountUsername">Account Username</Label>
            <Input
              id="accountUsername"
              value={formData.accountUsername}
              onChange={(e) => setFormData({...formData, accountUsername: e.target.value})}
              placeholder="user_12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountPassword">Account Password</Label>
            <div className="relative">
              <Input
                id="accountPassword"
                type={showPassword ? "text" : "password"}
                value={formData.accountPassword}
                onChange={(e) => setFormData({...formData, accountPassword: e.target.value})}
                placeholder={hosting ? "Enter new password" : "Enter password"}
                className="pr-10"
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
          <Label htmlFor="controlPanelUrl">Control Panel URL</Label>
          <Input
            id="controlPanelUrl"
            value={formData.controlPanelUrl}
            onChange={(e) => setFormData({...formData, controlPanelUrl: e.target.value})}
            placeholder="https://cpanel.provider.com"
          />
        </div>
      </div>

      <Separator />

      {/* Server Specifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Server Specifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storageSpace">Storage Space</Label>
            <Input
              id="storageSpace"
              value={formData.storageSpace}
              onChange={(e) => setFormData({...formData, storageSpace: e.target.value})}
              placeholder="100GB"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bandwidthLimit">Bandwidth Limit</Label>
            <Input
              id="bandwidthLimit"
              value={formData.bandwidthLimit}
              onChange={(e) => setFormData({...formData, bandwidthLimit: e.target.value})}
              placeholder="Unlimited"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              value={formData.ipAddress}
              onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
              placeholder="192.168.1.100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="usagePercent">Current Usage (%)</Label>
          <div className="space-y-2">
            <Input
              id="usagePercent"
              type="number"
              min="0"
              max="100"
              value={formData.usagePercent}
              onChange={(e) => setFormData({...formData, usagePercent: Number(e.target.value)})}
              placeholder="65"
            />
            {formData.usagePercent !== undefined && formData.usagePercent > 0 && (
              <div className="space-y-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      formData.usagePercent >= 90 ? "bg-destructive" :
                      formData.usagePercent >= 75 ? "bg-warning" : "bg-success"
                    }`}
                    style={{ width: `${formData.usagePercent}%` }}
                  />
                </div>
                <p className={`text-sm ${getUsageColor()}`}>
                  {formData.usagePercent}% used
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Dates & Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Dates & Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date *</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
              required
            />
            {daysUntilExpiry !== null && (
              <div className="text-sm">
                <Badge variant={
                  daysUntilExpiry < 0 ? "destructive" :
                  daysUntilExpiry <= 30 ? "secondary" : "outline"
                }>
                  {daysUntilExpiry < 0 
                    ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                    : `${daysUntilExpiry} days remaining`
                  }
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="autoRenewal">Auto-Renewal</Label>
            <Select value={formData.autoRenewal ? "true" : "false"} onValueChange={(value) => setFormData({...formData, autoRenewal: value === "true"})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Enabled</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Financial Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Financial Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              placeholder="599"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value: any) => setFormData({...formData, currency: value})}>
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
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={formData.paymentStatus} onValueChange={(value: any) => setFormData({...formData, paymentStatus: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
              placeholder="INV-H-2024-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportContact">Support Contact</Label>
            <Input
              id="supportContact"
              value={formData.supportContact}
              onChange={(e) => setFormData({...formData, supportContact: e.target.value})}
              placeholder="support@provider.com"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Comments</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Any special instructions or configuration notes..."
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : hosting ? "Update Hosting" : "Create Hosting"}
        </Button>
      </div>
    </form>

    {/* Add Client Dialog */}
    <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client and automatically select them for this hosting.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          onClose={() => setIsAddClientDialogOpen(false)}
          onSuccess={handleNewClientAdded}
          embedded={true}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}
