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
  CreditCard,
  Calculator,
  Receipt,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Client, Domain, Hosting, CreatePaymentDTO } from "@shared/types/database";
import { getClientOptions, getDomainsForClient, getHostingForClient, dataService } from "@/services/dataService";
import { ClientForm } from "./ClientForm";

interface PaymentFormProps {
  payment?: any; // Existing payment for editing
  onClose: () => void;
  onSuccess?: (payment: any) => void;
  preselectedClient?: string;
  preselectedService?: { id: string; type: 'domain' | 'hosting' };
}

export function PaymentForm({ payment, onClose, onSuccess, preselectedClient, preselectedService }: PaymentFormProps) {
  const [formData, setFormData] = useState<CreatePaymentDTO>({
    clientId: payment?.clientId || preselectedClient || "",
    serviceId: payment?.serviceId || preselectedService?.id || "",
    serviceType: payment?.serviceType || preselectedService?.type || "domain",
    amount: payment?.amount || 0,
    currency: payment?.currency || "USD",
    exchangeRate: payment?.exchangeRate || 120,
    paymentDate: payment?.paymentDate || "",
    dueDate: payment?.dueDate || "",
    paymentMethod: payment?.paymentMethod || "stripe",
    invoiceNumber: payment?.invoiceNumber || "",
    paymentStatus: payment?.paymentStatus || "unpaid",
    notes: payment?.notes || ""
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);
  const [availableHosting, setAvailableHosting] = useState<Hosting[]>([]);
  const [selectedService, setSelectedService] = useState<Domain | Hosting | null>(null);
  const [convertedAmount, setConvertedAmount] = useState(0);
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
      loadServicesForClient(formData.clientId);
    }
  }, [formData.clientId, clients]);

  // Auto-fill service data when service is selected
  useEffect(() => {
    if (formData.serviceId && (availableDomains.length > 0 || availableHosting.length > 0)) {
      let service = null;
      if (formData.serviceType === 'domain') {
        service = availableDomains.find(d => d.id === formData.serviceId);
      } else if (formData.serviceType === 'hosting') {
        service = availableHosting.find(h => h.id === formData.serviceId);
      }
      
      if (service) {
        setSelectedService(service);
        // Auto-fill price and currency from service
        setFormData(prev => ({
          ...prev,
          amount: service.price || prev.amount,
          currency: service.currency || prev.currency,
          dueDate: service.expirationDate || prev.dueDate,
          invoiceNumber: service.invoiceNumber || prev.invoiceNumber
        }));
      }
    }
  }, [formData.serviceId, formData.serviceType, availableDomains, availableHosting]);

  // Calculate converted amount when amount, currency, or exchange rate changes
  useEffect(() => {
    const rate = formData.exchangeRate || 120;
    if (formData.currency === "USD") {
      setConvertedAmount(formData.amount * rate);
    } else {
      setConvertedAmount(formData.amount / rate);
    }
  }, [formData.amount, formData.currency, formData.exchangeRate]);

  const loadClients = async () => {
    try {
      const clientList = await getClientOptions();
      setClients(clientList);
    } catch (error) {
      setError("Failed to load clients");
    }
  };

  const loadServicesForClient = async (clientId: string) => {
    try {
      const [domains, hosting] = await Promise.all([
        getDomainsForClient(clientId),
        getHostingForClient(clientId)
      ]);
      setAvailableDomains(domains);
      setAvailableHosting(hosting);
    } catch (error) {
      console.error("Failed to load services for client");
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
      serviceId: "", // Reset service selection when client changes
    }));
    setSelectedService(null);
    loadServicesForClient(clientId);
  };

  const handleNewClientAdded = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setSelectedClient(newClient);
    setFormData(prev => ({
      ...prev,
      clientId: newClient.id,
      serviceId: ""
    }));
    setSelectedService(null);
    loadServicesForClient(newClient.id);
    setIsAddClientDialogOpen(false);
  };

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceId
    }));
  };

  const handleServiceTypeChange = (serviceType: 'domain' | 'hosting' | 'other') => {
    setFormData(prev => ({
      ...prev,
      serviceType,
      serviceId: "" // Reset service selection when type changes
    }));
    setSelectedService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (payment) {
        // Update existing payment
        setSuccess("Payment updated successfully!");
      } else {
        // Create new payment
        const response = await dataService.createPayment(formData);
        if (response.success) {
          setSuccess(response.message || "Payment created successfully!");
          if (onSuccess) {
            onSuccess(response.data);
          }
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError(response.error || "Failed to create payment");
        }
      }
    } catch (error) {
      setError("An error occurred while saving the payment");
    } finally {
      setIsLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const prefix = formData.serviceType === 'domain' ? 'INV-D' : 
                   formData.serviceType === 'hosting' ? 'INV-H' : 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${timestamp}`;
    setFormData(prev => ({ ...prev, invoiceNumber }));
  };

  const getAvailableServices = () => {
    if (formData.serviceType === 'domain') {
      return availableDomains;
    } else if (formData.serviceType === 'hosting') {
      return availableHosting;
    }
    return [];
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'domain': return Globe;
      case 'hosting': return Server;
      default: return CreditCard;
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methods: Record<string, string> = {
      "cash": "Cash",
      "bank_transfer": "Bank Transfer",
      "card": "Credit/Debit Card",
      "bkash": "bKash",
      "nagad": "Nagad",
      "paypal": "PayPal",
      "stripe": "Stripe"
    };
    return methods[method] || method;
  };

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
          <h3 className="text-lg font-medium">Client & Service Selection</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select value={formData.serviceType} onValueChange={handleServiceTypeChange} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="hosting">Hosting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Service Selection */}
        {formData.clientId && formData.serviceType !== 'other' && (
          <div className="space-y-2">
            <Label htmlFor="serviceId">Select {formData.serviceType === 'domain' ? 'Domain' : 'Hosting'} *</Label>
            <Select value={formData.serviceId} onValueChange={handleServiceSelect} required>
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${formData.serviceType}`} />
              </SelectTrigger>
              <SelectContent>
                {getAvailableServices().map((service: any) => {
                  const ServiceIcon = getServiceIcon(formData.serviceType);
                  return (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center gap-2">
                        <ServiceIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {formData.serviceType === 'domain' ? service.name : service.packageName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Expires: {service.expirationDate} • {service.currency === "USD" ? "$" : "৳"}{service.price}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Service Preview */}
        {selectedService && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Service Details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Service:</span> {
                  'name' in selectedService ? selectedService.name : selectedService.packageName
                }
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span> {selectedService.currency === "USD" ? "$" : "৳"}{selectedService.price}
              </div>
              <div>
                <span className="text-muted-foreground">Expires:</span> {selectedService.expirationDate}
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span> 
                <Badge variant="outline" className="ml-1">{selectedService.status}</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Payment Amount & Currency */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Payment Amount & Currency</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
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
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              placeholder="299"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeRate">Exchange Rate (USD to BDT)</Label>
            <Input
              id="exchangeRate"
              type="number"
              step="0.01"
              value={formData.exchangeRate}
              onChange={(e) => setFormData({...formData, exchangeRate: Number(e.target.value)})}
              placeholder="120"
            />
          </div>
        </div>

        {/* Currency Conversion Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Original Amount</div>
            <div className="text-2xl font-bold">
              {formData.currency === "USD" ? "$" : "৳"}{formData.amount.toLocaleString()}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Converted Amount</div>
            <div className="text-2xl font-bold">
              {formData.currency === "USD" ? "৳" : "$"}{convertedAmount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Rate: 1 {formData.currency} = {formData.currency === "USD" ? formData.exchangeRate : (1/formData.exchangeRate).toFixed(4)} {formData.currency === "USD" ? "BDT" : "USD"}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Payment Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({...formData, paymentMethod: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="bkash">bKash</SelectItem>
                <SelectItem value="nagad">Nagad</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status *</Label>
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
          <div className="flex gap-2">
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
              placeholder="INV-2024-001"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={generateInvoiceNumber}>
              <Receipt className="h-4 w-4 mr-2" />
              Generate
            </Button>
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
          placeholder="Additional payment details or comments..."
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : payment ? "Update Payment" : "Create Payment"}
        </Button>
      </div>
    </form>

    {/* Add Client Dialog */}
    <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Create a new client and automatically select them for this payment.
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
