import { useState, useEffect } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Zap,
  Settings,
  Copy,
  ExternalLink,
  RefreshCw,
  Save,
  X,
  Loader2
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { DomainForm } from "@/components/forms/DomainForm";
import type { Domain } from "@shared/types/database";

// Enhanced Auto Domain Creator Component
function AutoDomainCreator({ onDomainCreated }: { onDomainCreated: (domain: Domain) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [selectedTLDs, setSelectedTLDs] = useState<string[]>([]);
  const [clientId, setClientId] = useState("");
  const [generatedDomains, setGeneratedDomains] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const popularTLDs = [
    { tld: '.com', price: 15.99, description: 'Most popular and trusted' },
    { tld: '.org', price: 12.99, description: 'For organizations' },
    { tld: '.net', price: 13.99, description: 'For networks' },
    { tld: '.io', price: 39.99, description: 'For tech companies' },
    { tld: '.ai', price: 59.99, description: 'For AI companies' },
    { tld: '.co', price: 24.99, description: 'Alternative to .com' },
    { tld: '.app', price: 19.99, description: 'For applications' },
    { tld: '.dev', price: 17.99, description: 'For developers' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      await dataService.initialize();
      const response = await dataService.getClients();
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const generateDomains = () => {
    if (!baseName || selectedTLDs.length === 0) return;

    setIsGenerating(true);
    
    // Simulate domain generation process
    setTimeout(() => {
      const domains = selectedTLDs.map(tld => {
        const tldInfo = popularTLDs.find(t => t.tld === tld);
        return {
          name: `${baseName}${tld}`,
          tld,
          price: tldInfo?.price || 15.99,
          description: tldInfo?.description || '',
          available: Math.random() > 0.3, // 70% chance of being available
          suggestions: Math.random() > 0.5 ? [
            `${baseName}app${tld}`,
            `${baseName}pro${tld}`,
            `get${baseName}${tld}`
          ] : []
        };
      });
      
      setGeneratedDomains(domains);
      setIsGenerating(false);
    }, 2000);
  };

  const createDomain = async (domainData: any) => {
    try {
      const domainDTO = {
        clientId,
        name: domainData.name,
        registrar: "Auto-Generated",
        registrationDate: new Date().toISOString().split('T')[0],
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "active",
        primaryNS: "ns1.example.com",
        secondaryNS: "ns2.example.com",
        price: domainData.price,
        currency: "USD",
        paymentStatus: "unpaid",
        invoiceNumber: `INV-AUTO-${Date.now()}`,
        notes: `Auto-generated domain for ${baseName}`,
        autoRenewal: true
      };

      const response = await dataService.createDomain(domainDTO);
      if (response.success && response.data) {
        onDomainCreated(response.data);
        setIsOpen(false);
        setBaseName("");
        setSelectedTLDs([]);
        setGeneratedDomains([]);
      }
    } catch (error) {
      console.error('Failed to create domain:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <Zap className="h-4 w-4 mr-2" />
          Auto Create Domains
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Automatic Domain Generator
          </DialogTitle>
          <DialogDescription>
            Generate and register multiple domain variations instantly with smart suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="autoClient">Select Client *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose client for these domains" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
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

          {/* Base Domain Name */}
          <div className="space-y-2">
            <Label htmlFor="baseName">Base Domain Name *</Label>
            <Input
              id="baseName"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="mydomain"
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Enter the main part of your domain name (without extension)
            </p>
          </div>

          {/* TLD Selection */}
          <div className="space-y-3">
            <Label>Select Extensions (TLDs) *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {popularTLDs.map((tldInfo) => (
                <div
                  key={tldInfo.tld}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTLDs.includes(tldInfo.tld)
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => {
                    if (selectedTLDs.includes(tldInfo.tld)) {
                      setSelectedTLDs(prev => prev.filter(t => t !== tldInfo.tld));
                    } else {
                      setSelectedTLDs(prev => [...prev, tldInfo.tld]);
                    }
                  }}
                >
                  <div className="font-medium">{tldInfo.tld}</div>
                  <div className="text-sm text-primary font-semibold">${tldInfo.price}</div>
                  <div className="text-xs text-muted-foreground">{tldInfo.description}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedTLDs.length} extensions
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateDomains}
              disabled={!baseName || selectedTLDs.length === 0 || isGenerating}
              size="lg"
              className="px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Availability...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check Availability
                </>
              )}
            </Button>
          </div>

          {/* Generated Domains Results */}
          {generatedDomains.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <h3 className="text-lg font-medium">Domain Availability Results</h3>
              </div>
              
              <div className="space-y-3">
                {generatedDomains.map((domain, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      domain.available ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <div>
                          <div className="font-medium text-lg">{domain.name}</div>
                          <div className="text-sm text-muted-foreground">{domain.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold text-lg">${domain.price}</div>
                          <Badge variant={domain.available ? "default" : "destructive"}>
                            {domain.available ? "Available" : "Taken"}
                          </Badge>
                        </div>
                        {domain.available && (
                          <Button 
                            onClick={() => createDomain(domain)}
                            size="sm"
                            className="ml-2"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Register
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {!domain.available && domain.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Alternative suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {domain.suggestions.map((suggestion: string, i: number) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              onClick={() => createDomain({ name: suggestion, price: domain.price })}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedDomains([]);
                    setBaseName("");
                    setSelectedTLDs([]);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Edit Component
function QuickEditCell({ domain, field, onUpdate }: { domain: Domain; field: string; onUpdate: (id: string, field: string, value: any) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(domain[field as keyof Domain]);

  const handleSave = () => {
    onUpdate(domain.id, field, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(domain[field as keyof Domain]);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        className="cursor-pointer hover:bg-muted/50 p-1 rounded group"
        onClick={() => setIsEditing(true)}
      >
        <span>{String(domain[field as keyof Domain])}</span>
        <Edit className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 inline" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={String(value)}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 text-sm"
        autoFocus
        onBlur={handleCancel}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') handleCancel();
        }}
      />
      <Button size="sm" variant="ghost" onClick={handleSave}>
        <Save className="h-3 w-3" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Main Enhanced Domains Component
export default function DomainsAdvanced() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"expiry" | "name" | "registrar" | "customer">("expiry");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);
  const [viewingDomain, setViewingDomain] = useState<Domain | null>(null);

  // Load domains on component mount
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setIsLoading(true);
      await dataService.initialize();
      const response = await dataService.getDomains();
      if (response.success && response.data) {
        setDomains(response.data);
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

  const handleQuickUpdate = async (domainId: string, field: string, value: any) => {
    try {
      // Update locally for immediate feedback
      setDomains(prev => prev.map(d => 
        d.id === domainId ? { ...d, [field]: value } : d
      ));
      
      // In real app, make API call to update
      console.log(`Updated domain ${domainId}: ${field} = ${value}`);
    } catch (error) {
      console.error('Failed to update domain:', error);
      // Revert local change
      loadDomains();
    }
  };

  const handleDeleteDomain = async (domain: Domain) => {
    try {
      const response = await dataService.deleteDomain(domain.id);
      if (response.success) {
        setDomains(prev => prev.filter(d => d.id !== domain.id));
        setDeletingDomain(null);
      }
    } catch (error) {
      console.error('Failed to delete domain:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDomains.length === 0) return;
    
    try {
      for (const domainId of selectedDomains) {
        await dataService.deleteDomain(domainId);
      }
      setDomains(prev => prev.filter(d => !selectedDomains.includes(d.id)));
      setSelectedDomains([]);
    } catch (error) {
      console.error('Failed to bulk delete domains:', error);
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Domain Management Hub</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {domains.length} Total Domains
              </Badge>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                Advanced CRUD operations with automatic domain creation
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <AutoDomainCreator onDomainCreated={handleDomainCreated} />
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

        {/* Enhanced Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters & Search
            </CardTitle>
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
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedDomains.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => console.log("Bulk renew")}>
                        Mark as Renewed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log("Bulk reminder")}>
                        Send Reminders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => console.log("Bulk export")}>
                        Export Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleBulkDelete}
                        className="text-destructive"
                      >
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
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
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${domains.reduce((sum, d) => sum + (d.price || 0), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total portfolio value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Domains Table */}
        <Card>
          <CardHeader>
            <CardTitle>Domains ({filteredAndSortedDomains.length})</CardTitle>
            <CardDescription>
              Advanced domain management with inline editing and bulk operations
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
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading domains...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedDomains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                            <QuickEditCell 
                              domain={domain} 
                              field="name" 
                              onUpdate={handleQuickUpdate} 
                            />
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
                        <TableCell>
                          <QuickEditCell 
                            domain={domain} 
                            field="registrar" 
                            onUpdate={handleQuickUpdate} 
                          />
                        </TableCell>
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
                        <TableCell>
                          <QuickEditCell 
                            domain={domain} 
                            field="price" 
                            onUpdate={handleQuickUpdate} 
                          />
                        </TableCell>
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
                              <DropdownMenuItem onClick={() => setViewingDomain(domain)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingDomain(domain)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Domain
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(domain.name)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Domain
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit Domain
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Server className="mr-2 h-4 w-4" />
                                Link to Hosting
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeletingDomain(domain)}
                              >
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

        {/* View Details Dialog */}
        <Dialog open={!!viewingDomain} onOpenChange={(open) => !open && setViewingDomain(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Details: {viewingDomain?.name}
              </DialogTitle>
            </DialogHeader>
            {viewingDomain && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Domain Name</Label>
                      <p className="font-medium">{viewingDomain.name}</p>
                    </div>
                    <div>
                      <Label>Registrar</Label>
                      <p>{viewingDomain.registrar}</p>
                    </div>
                    <div>
                      <Label>Registration Date</Label>
                      <p>{viewingDomain.registrationDate}</p>
                    </div>
                    <div>
                      <Label>Expiration Date</Label>
                      <p>{viewingDomain.expirationDate}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Badge className={getStatusColor(viewingDomain.status)}>
                        {viewingDomain.status}
                      </Badge>
                    </div>
                    <div>
                      <Label>Auto Renewal</Label>
                      <p>{viewingDomain.autoRenewal ? "Enabled" : "Disabled"}</p>
                    </div>
                  </div>
                  {viewingDomain.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm text-muted-foreground">{viewingDomain.notes}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price</Label>
                      <p className="font-medium">${viewingDomain.price}</p>
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <p>{viewingDomain.currency}</p>
                    </div>
                    <div>
                      <Label>Payment Status</Label>
                      <Badge variant={viewingDomain.paymentStatus === "paid" ? "default" : "destructive"}>
                        {viewingDomain.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <Label>Invoice Number</Label>
                      <p>{viewingDomain.invoiceNumber || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="technical" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Primary Nameserver</Label>
                      <p>{viewingDomain.primaryNS || "N/A"}</p>
                    </div>
                    <div>
                      <Label>Secondary Nameserver</Label>
                      <p>{viewingDomain.secondaryNS || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingDomain} onOpenChange={(open) => !open && setDeletingDomain(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Domain</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingDomain?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deletingDomain && handleDeleteDomain(deletingDomain)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Domain
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
