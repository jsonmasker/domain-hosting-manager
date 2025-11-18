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
  Globe,
  Calendar,
  DollarSign,
  Info,
  CheckCircle,
  AlertTriangle,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Client, CreateDomainDTO } from "@shared/types/database";
import { getClientOptions, dataService } from "@/services/dataService";
import { ClientForm } from "./ClientForm";

interface DomainFormProps {
  domain?: any; // Existing domain for editing
  onClose: () => void;
  onSuccess?: (domain: any) => void;
}

export function DomainForm({ domain, onClose, onSuccess }: DomainFormProps) {
  const [formData, setFormData] = useState<CreateDomainDTO>({
    clientId: domain?.clientId || "",
    name: domain?.name || "",
    registrar: domain?.registrar || "",
    registrationDate: domain?.registrationDate || "",
    expirationDate: domain?.expirationDate || "",
    status: domain?.status || "active",
    primaryNS: domain?.primaryNS || "",
    secondaryNS: domain?.secondaryNS || "",
    price: domain?.price || 0,
    currency: domain?.currency || "USD",
    paymentStatus: domain?.paymentStatus || "unpaid",
    invoiceNumber: domain?.invoiceNumber || "",
    notes: domain?.notes || "",
    autoRenewal: domain?.autoRenewal || false
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
    }
  }, [formData.clientId, clients]);

  const loadClients = async () => {
    try {
      // Initialize database service if needed
      await dataService.initialize();

      const clientList = await getClientOptions();
      console.log('Loaded clients:', clientList);
      setClients(clientList);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setError("Failed to load clients");
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
      clientId
    }));
  };

  const handleNewClientAdded = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setSelectedClient(newClient);
    setFormData(prev => ({
      ...prev,
      clientId: newClient.id
    }));
    setIsAddClientDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (domain) {
        // Update existing domain
        setSuccess("Domain updated successfully!");
      } else {
        // Create new domain
        const response = await dataService.createDomain(formData);
        if (response.success) {
          setSuccess(response.message || "Domain created successfully!");
          if (onSuccess) {
            onSuccess(response.data);
          }
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(response.error || "Failed to create domain");
        }
      }
    } catch (error) {
      setError("An error occurred while saving the domain");
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
          <h3 className="text-lg font-medium">Customer Information</h3>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientId">Customer Name *</Label>
          <Select value={formData.clientId} onValueChange={handleClientSelect} required>
            <SelectTrigger>
              <SelectValue placeholder="Select an existing client or add new" />
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

        {/* Selected Customer Details */}
        {selectedClient && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Selected Customer</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-lg">{selectedClient.fullName}</span>
                {selectedClient.companyName && (
                  <span className="text-sm text-muted-foreground">({selectedClient.companyName})</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{selectedClient.email}</span>
                </div>
                {selectedClient.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{selectedClient.phoneNumber}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Country:</span> {selectedClient.country}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-1 capitalize text-primary">{selectedClient.accountStatus}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Domain Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Domain Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Domain Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrar">Registrar *</Label>
            <Select value={formData.registrar} onValueChange={(value) => setFormData({...formData, registrar: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select registrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Namecheap">Namecheap</SelectItem>
                <SelectItem value="GoDaddy">GoDaddy</SelectItem>
                <SelectItem value="Cloudflare">Cloudflare</SelectItem>
                <SelectItem value="Google Domains">Google Domains</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationDate">Registration Date</Label>
            <Input
              id="registrationDate"
              type="date"
              value={formData.registrationDate}
              onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
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
                <SelectItem value="pending">Pending</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryNS">Primary Nameserver</Label>
            <Input
              id="primaryNS"
              value={formData.primaryNS}
              onChange={(e) => setFormData({...formData, primaryNS: e.target.value})}
              placeholder="ns1.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryNS">Secondary Nameserver</Label>
            <Input
              id="secondaryNS"
              value={formData.secondaryNS}
              onChange={(e) => setFormData({...formData, secondaryNS: e.target.value})}
              placeholder="ns2.example.com"
            />
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
              placeholder="299"
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

        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
            placeholder="INV-2024-001"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Comments</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Any special instructions or notes..."
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : domain ? "Update Domain" : "Create Domain"}
        </Button>
      </div>
    </form>

    {/* Add Client Dialog */}
    <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client and automatically select them for this domain.
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
