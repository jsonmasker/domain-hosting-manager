import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Mail, 
  Phone, 
  User, 
  MapPin,
  Calendar,
  Info,
  CheckCircle,
  AlertTriangle,
  Globe
} from "lucide-react";
import type { Client, CreateClientDTO } from "@shared/types/database";
import { dataService } from "@/services/dataService";

interface ClientFormProps {
  client?: Client; // Existing client for editing
  onClose: () => void;
  onSuccess?: (client: Client) => void;
  embedded?: boolean; // For use within other forms
}

export function ClientForm({ client, onClose, onSuccess, embedded = false }: ClientFormProps) {
  const [formData, setFormData] = useState<CreateClientDTO>({
    fullName: client?.fullName || "",
    companyName: client?.companyName || "",
    email: client?.email || "",
    phoneNumber: client?.phoneNumber || "",
    address: client?.address || "",
    country: client?.country || "United States",
    timezone: client?.timezone || "UTC",
    preferredContact: client?.preferredContact || "email",
    joinDate: client?.joinDate || new Date().toISOString().split('T')[0],
    accountStatus: client?.accountStatus || "active",
    notes: client?.notes || ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (client) {
        // Update existing client
        const response = await dataService.updateClient(client.id, formData);
        if (response.success) {
          setSuccess(response.message || "Client updated successfully!");
          if (onSuccess && response.data) {
            onSuccess(response.data);
          }
          if (!embedded) {
            setTimeout(() => {
              onClose();
            }, 1500);
          }
        } else {
          setError(response.error || "Failed to update client");
        }
      } else {
        // Create new client
        const response = await dataService.createClient(formData);
        if (response.success) {
          setSuccess(response.message || "Client created successfully!");
          if (onSuccess && response.data) {
            onSuccess(response.data);
          }
          if (!embedded) {
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            // For embedded forms, close immediately after success
            setTimeout(() => {
              onClose();
            }, 1000);
          }
        } else {
          setError(response.error || "Failed to create client");
        }
      }
    } catch (error) {
      setError("An error occurred while saving the client");
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Italy", "Spain", 
    "Netherlands", "Australia", "New Zealand", "Japan", "South Korea", "Singapore", 
    "India", "Bangladesh", "Pakistan", "China", "Brazil", "Mexico", "Argentina"
  ];

  const timezones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Toronto", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome",
    "Asia/Tokyo", "Asia/Seoul", "Asia/Singapore", "Asia/Kolkata", "Asia/Dhaka",
    "Australia/Sydney", "Australia/Melbourne"
  ];

  return (
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

      {/* Basic Information */}
      <div className="space-y-4">
        {!embedded && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Basic Information</h3>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name / Business Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="John Doe / Acme Corp"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name (Optional)</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              placeholder="Acme Corporation Ltd"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Contact Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              placeholder="+1-555-0123"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="123 Main St, City, State, ZIP Code"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData({...formData, timezone: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Account Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferredContact">Preferred Contact Method</Label>
            <Select value={formData.preferredContact} onValueChange={(value: any) => setFormData({...formData, preferredContact: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountStatus">Account Status</Label>
            <Select value={formData.accountStatus} onValueChange={(value: any) => setFormData({...formData, accountStatus: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!embedded && (
          <div className="space-y-2">
            <Label htmlFor="joinDate">Join Date</Label>
            <Input
              id="joinDate"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Comments</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about this client..."
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : client ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
