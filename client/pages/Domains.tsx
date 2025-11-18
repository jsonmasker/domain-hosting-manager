import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  Globe,
  Server,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ArrowUpDown,
  Eye
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { DomainForm } from "@/components/forms/DomainForm";
import type { Domain } from "@shared/types/database";

// Data will be loaded from dataService

export default function Domains() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/domains-advanced", { replace: true });
  }, [navigate]);
  return null;
}

function DomainsOriginal() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"expiry" | "name" | "registrar" | "customer">("expiry");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);

  // Load domains on component mount
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setIsLoading(true);

      // Initialize database service if needed
      await dataService.initialize();

      const response = await dataService.getDomains();
      if (response.success && response.data) {
        console.log('Loaded domains:', response.data);
        setDomains(response.data);
      } else {
        console.error('Failed to load domains:', response.error);
      }
    } catch (error) {
      console.error('Failed to load domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDomainCreated = (newDomain: Domain) => {
    setDomains(prev => [...prev, newDomain]);
    setIsAddDialogOpen(false);
  };

  const handleDomainUpdated = (updatedDomain: Domain) => {
    setDomains(prev => prev.map(d => d.id === updatedDomain.id ? updatedDomain : d));
    setEditingDomain(null);
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await dataService.deleteDomain(domainId);
      if (response.success) {
        setDomains(prev => prev.filter(d => d.id !== domainId));
      }
    } catch (error) {
      console.error('Failed to delete domain:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "expiring": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "text-destructive";
    if (days <= 30) return "text-warning";
    return "text-success";
  };

  const filteredAndSortedDomains = domains
    .filter(domain => {
      const customerName = domain.customerName || '';
      const contactEmail = domain.contactEmail || '';

      const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || domain.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "expiry":
          aValue = new Date(a.expirationDate).getTime();
          bValue = new Date(b.expirationDate).getTime();
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "registrar":
          aValue = a.registrar.toLowerCase();
          bValue = b.registrar.toLowerCase();
          break;
        case "customer":
          aValue = (a.customerName || '').toLowerCase();
          bValue = (b.customerName || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDomains(filteredAndSortedDomains.map(d => d.id));
    } else {
      setSelectedDomains([]);
    }
  };

  const handleSelectDomain = (domainId: string, checked: boolean) => {
    if (checked) {
      setSelectedDomains([...selectedDomains, domainId]);
    } else {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    }
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportData = (format: string) => {
    console.log(`Exporting ${selectedDomains.length || domains.length} domains as ${format}`);
    // In real app, implement actual export functionality
  };

  const bulkUpdate = (action: string) => {
    console.log(`Bulk ${action} for domains:`, selectedDomains);
    // In real app, implement bulk update functionality
    setSelectedDomains([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Domain Management</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {domains.length} Registered Domains
              </Badge>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                Manage renewals and monitor expiration dates
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Domain</DialogTitle>
                  <DialogDescription>
                    Enter all domain details for proper tracking and management.
                  </DialogDescription>
                </DialogHeader>
                <DomainForm
                  onClose={() => setIsAddDialogOpen(false)}
                  onSuccess={handleDomainCreated}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search domains, customers, or emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {selectedDomains.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Bulk Actions ({selectedDomains.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => bulkUpdate("renew")}>
                      Mark as Renewed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdate("reminder")}>
                      Send Reminders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportData("csv")}>
                      Export Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => exportData("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("excel")}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Domain Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{domains.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered domains
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {domains.filter(d => d.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {domains.filter(d => {
                  const daysUntilExpiry = Math.ceil((new Date(d.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Expire within 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpaid Renewals</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {domains.filter(d => d.paymentStatus === 'unpaid').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Domains Table */}
        <Card>
          <CardHeader>
            <CardTitle>Domains ({filteredAndSortedDomains.length})</CardTitle>
            <CardDescription>
              Overview of all domain registrations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDomains.length === filteredAndSortedDomains.length && filteredAndSortedDomains.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Domain Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("customer")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Customer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("registrar")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Registrar
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("expiry")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Expiry Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          Loading domains...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedDomains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Globe className="h-8 w-8 opacity-50" />
                          <p>No domains found</p>
                          <p className="text-sm">Add your first domain to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedDomains.map((domain) => (
                      <TableRow key={domain.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDomains.includes(domain.id)}
                          onCheckedChange={(checked) => handleSelectDomain(domain.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          {domain.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {domain.customerName || domain.client?.fullName || 'Unknown Client'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {domain.contactEmail || domain.client?.email || ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{domain.registrar}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{domain.expirationDate}</p>
                          <p className={`text-sm ${getExpiryColor(domain.daysUntilExpiry)}`}>
                            {domain.daysUntilExpiry < 0 
                              ? `Expired ${Math.abs(domain.daysUntilExpiry)} days ago`
                              : `${domain.daysUntilExpiry} days left`
                            }
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(domain.status)} variant="secondary">
                          {domain.status === "expiring" ? "Expiring Soon" : 
                           domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={domain.paymentStatus === "paid" ? "default" : "destructive"}>
                          {domain.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>${domain.price}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingDomain(domain)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Server className="mr-2 h-4 w-4" />
                              Link to Hosting
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Domain
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingDomain} onOpenChange={(open) => !open && setEditingDomain(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Domain: {editingDomain?.name}</DialogTitle>
              <DialogDescription>
                Update domain details and renewal information.
              </DialogDescription>
            </DialogHeader>
            {editingDomain && (
              <DomainForm
                domain={editingDomain}
                onClose={() => setEditingDomain(null)}
                onSuccess={handleDomainUpdated}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Domain Form Component
function DomainForm({ domain, onClose }: { domain?: Domain; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: domain?.name || "",
    registrar: domain?.registrar || "",
    registrationDate: domain?.registrationDate || "",
    expirationDate: domain?.expirationDate || "",
    status: domain?.status || "active",
    primaryNS: domain?.primaryNS || "",
    secondaryNS: domain?.secondaryNS || "",
    customerName: domain?.customerName || "",
    customerId: domain?.customerId || "",
    contactEmail: domain?.contactEmail || "",
    phoneNumber: domain?.phoneNumber || "",
    price: domain?.price || 0,
    paymentStatus: domain?.paymentStatus || "unpaid",
    invoiceNumber: domain?.invoiceNumber || "",
    notes: domain?.notes || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // In real app, submit to API
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="regDate">Registration Date</Label>
          <Input
            id="regDate"
            type="date"
            value={formData.registrationDate}
            onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expDate">Expiration Date *</Label>
          <Input
            id="expDate"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
            placeholder="299"
          />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            placeholder="Tech Corp"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer ID</Label>
          <Input
            id="customerId"
            value={formData.customerId}
            onChange={(e) => setFormData({...formData, customerId: e.target.value})}
            placeholder="TC001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
            placeholder="admin@techcorp.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="+1-555-0123"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Payment Status</Label>
          <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({...formData, paymentStatus: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {domain ? "Update Domain" : "Add Domain"}
        </Button>
      </div>
    </form>
  );
}
