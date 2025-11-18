import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  ExternalLink,
  Shield,
  HardDrive,
  Wifi,
  MapPin,
  Activity,
  Database,
  Key,
  Link as LinkIcon,
  Users,
  Building2,
  MessageSquare,
  Send,
  BarChart3,
  CreditCard,
  Bell,
  UserPlus,
  Zap
} from "lucide-react";

// Mock data - in real app this would come from API/database
const mockClients = [
  {
    id: "TC001",
    fullName: "Tech Corp",
    email: "admin@techcorp.com",
    phoneNumber: "+1-555-0123",
    address: "123 Tech Street, Silicon Valley, CA 94000",
    country: "United States",
    preferredContact: "email",
    joinDate: "2023-01-15",
    accountStatus: "active",
    notes: "Priority enterprise client",
    totalDomains: 12,
    totalHosting: 8,
    totalServices: 20,
    upcomingRenewals: 3,
    totalSpent: 15420,
    lastPayment: "2024-01-15"
  },
  {
    id: "EC002",
    fullName: "E-commerce LLC",
    email: "contact@ecommerce.com",
    phoneNumber: "+1-555-0456",
    address: "456 Commerce Ave, New York, NY 10001",
    country: "United States",
    preferredContact: "email",
    joinDate: "2022-06-10",
    accountStatus: "active",
    notes: "Auto-renewal enabled for all services",
    totalDomains: 8,
    totalHosting: 5,
    totalServices: 13,
    upcomingRenewals: 2,
    totalSpent: 8950,
    lastPayment: "2024-01-20"
  },
  {
    id: "JD003",
    fullName: "John Doe",
    email: "john@portfolio.io",
    phoneNumber: "+1-555-0789",
    address: "789 Creative Blvd, Austin, TX 73301",
    country: "United States",
    preferredContact: "sms",
    joinDate: "2023-03-20",
    accountStatus: "active",
    notes: "Freelance developer, prefers SMS notifications",
    totalDomains: 3,
    totalHosting: 2,
    totalServices: 5,
    upcomingRenewals: 1,
    totalSpent: 1250,
    lastPayment: "2024-01-25"
  },
  {
    id: "II004",
    fullName: "Innovation Inc",
    email: "admin@innovation.com",
    phoneNumber: "+1-555-0321",
    address: "321 Innovation Drive, Seattle, WA 98101",
    country: "United States",
    preferredContact: "whatsapp",
    joinDate: "2023-08-05",
    accountStatus: "active",
    notes: "High-growth startup, premium support",
    totalDomains: 15,
    totalHosting: 12,
    totalServices: 27,
    upcomingRenewals: 5,
    totalSpent: 22300,
    lastPayment: "2024-01-10"
  },
  {
    id: "CC005",
    fullName: "Content Creator",
    email: "hello@blog.org",
    phoneNumber: "+1-555-0654",
    address: "654 Media Lane, Los Angeles, CA 90210",
    country: "United States",
    preferredContact: "email",
    joinDate: "2023-02-12",
    accountStatus: "inactive",
    notes: "Paused services temporarily",
    totalDomains: 2,
    totalHosting: 1,
    totalServices: 3,
    upcomingRenewals: 0,
    totalSpent: 650,
    lastPayment: "2023-12-15"
  }
];

// Mock linked domains for clients
const mockClientDomains = {
  "TC001": [
    { name: "techcorp.com", expiryDate: "2024-03-15", status: "active", daysLeft: 45 },
    { name: "techcorp.net", expiryDate: "2024-02-28", status: "expiring", daysLeft: 28 },
    { name: "techcorp.org", expiryDate: "2024-04-10", status: "active", daysLeft: 71 }
  ],
  "EC002": [
    { name: "ecommerce.com", expiryDate: "2024-02-25", status: "expiring", daysLeft: 25 },
    { name: "mystore.net", expiryDate: "2024-05-15", status: "active", daysLeft: 106 }
  ],
  "JD003": [
    { name: "portfolio.io", expiryDate: "2024-04-10", status: "active", daysLeft: 71 }
  ],
  "II004": [
    { name: "innovation.com", expiryDate: "2024-02-20", status: "expiring", daysLeft: 20 },
    { name: "startup.dev", expiryDate: "2024-03-30", status: "active", daysLeft: 60 }
  ],
  "CC005": [
    { name: "blog.org", expiryDate: "2024-05-05", status: "active", daysLeft: 96 }
  ]
};

// Mock linked hosting for clients
const mockClientHosting = {
  "TC001": [
    { name: "Business Pro", domain: "techcorp.com", expiryDate: "2024-03-15", status: "active", usage: 65 },
    { name: "Enterprise VPS", domain: "techcorp.net", expiryDate: "2024-02-28", status: "expiring", usage: 82 }
  ],
  "EC002": [
    { name: "E-commerce Premium", domain: "ecommerce.com", expiryDate: "2024-02-25", status: "expiring", usage: 78 },
    { name: "Shared Plus", domain: "mystore.net", expiryDate: "2024-05-15", status: "active", usage: 45 }
  ],
  "JD003": [
    { name: "Developer Cloud", domain: "portfolio.io", expiryDate: "2024-04-10", status: "active", usage: 34 }
  ],
  "II004": [
    { name: "Startup VPS", domain: "innovation.com", expiryDate: "2024-02-20", status: "expiring", usage: 91 },
    { name: "Scale Pro", domain: "startup.dev", expiryDate: "2024-03-30", status: "active", usage: 67 }
  ],
  "CC005": [
    { name: "WordPress Managed", domain: "blog.org", expiryDate: "2024-05-05", status: "active", usage: 23 }
  ]
};

// Mock payment history
const mockPaymentHistory = {
  "TC001": [
    { date: "2024-01-15", amount: 1250, service: "Domain Renewals", status: "paid" },
    { date: "2024-01-10", amount: 899, service: "VPS Hosting", status: "paid" },
    { date: "2023-12-15", amount: 299, service: "Domain Registration", status: "paid" }
  ],
  "EC002": [
    { date: "2024-01-20", amount: 450, service: "Hosting Renewal", status: "paid" },
    { date: "2024-01-05", amount: 349, service: "Domain Transfer", status: "paid" }
  ],
  "JD003": [
    { date: "2024-01-25", amount: 120, service: "Cloud Hosting", status: "paid" },
    { date: "2024-01-15", amount: 199, service: "Domain Registration", status: "paid" }
  ]
};

type Client = typeof mockClients[0];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "joinDate" | "services" | "spent">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getServiceStatusColor = (status: string) => {
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

  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || client.accountStatus === statusFilter;
      const matchesCountry = countryFilter === "all" || client.country === countryFilter;
      return matchesSearch && matchesStatus && matchesCountry;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case "joinDate":
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        case "services":
          aValue = a.totalServices;
          bValue = b.totalServices;
          break;
        case "spent":
          aValue = a.totalSpent;
          bValue = b.totalSpent;
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
      setSelectedClients(filteredAndSortedClients.map(c => c.id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
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
    console.log(`Exporting ${selectedClients.length || clients.length} clients as ${format}`);
  };

  const bulkMessage = (method: string) => {
    console.log(`Sending bulk ${method} to clients:`, selectedClients);
    setSelectedClients([]);
  };

  const sendRenewalReminder = (clientId: string) => {
    console.log(`Sending renewal reminder to client ${clientId}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
            <p className="text-muted-foreground">
              Manage clients and their domains, hosting, and payment history
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>
                    Create a new client profile for managing their services.
                  </DialogDescription>
                </DialogHeader>
                <ClientForm onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                {clients.filter(c => c.accountStatus === 'active').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.reduce((sum, client) => sum + client.totalServices, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all clients
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {clients.reduce((sum, client) => sum + client.upcomingRenewals, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${clients.reduce((sum, client) => sum + client.totalSpent, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All time revenue
              </p>
            </CardContent>
          </Card>
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
                    placeholder="Search clients by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
              {selectedClients.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Bulk Message ({selectedClients.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk Messaging</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => bulkMessage("email")}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkMessage("sms")}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkMessage("renewal")}>
                      <Bell className="mr-2 h-4 w-4" />
                      Renewal Reminders
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

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clients ({filteredAndSortedClients.length})</CardTitle>
            <CardDescription>
              Complete client directory with service overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedClients.length === filteredAndSortedClients.length && filteredAndSortedClients.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Client Information
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Contact Details</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("services")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Services
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("spent")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Revenue
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("joinDate")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Join Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedClients.includes(client.id)}
                          onCheckedChange={(checked) => handleSelectClient(client.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{client.fullName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">ID: {client.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{client.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{client.country}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Badge variant="outline">{client.totalDomains} Domains</Badge>
                            <Badge variant="outline">{client.totalHosting} Hosting</Badge>
                          </div>
                          {client.upcomingRenewals > 0 && (
                            <Badge className="bg-warning text-warning-foreground">
                              {client.upcomingRenewals} Expiring
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${client.totalSpent.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Last: {client.lastPayment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.accountStatus)} variant="secondary">
                          {client.accountStatus.charAt(0).toUpperCase() + client.accountStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{client.joinDate}</p>
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
                            <DropdownMenuItem onClick={() => setViewingClient(client)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingClient(client)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => sendRenewalReminder(client.id)}>
                              <Bell className="mr-2 h-4 w-4" />
                              Send Reminders
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Service
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Reports
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Client Details Modal */}
        <Dialog open={!!viewingClient} onOpenChange={(open) => !open && setViewingClient(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingClient?.fullName} - Service Overview</DialogTitle>
              <DialogDescription>
                Complete view of client services, payment history, and account details
              </DialogDescription>
            </DialogHeader>
            {viewingClient && <ClientDetailsView client={viewingClient} />}
          </DialogContent>
        </Dialog>

        {/* Edit Client Modal */}
        <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Client: {editingClient?.fullName}</DialogTitle>
              <DialogDescription>
                Update client information and preferences.
              </DialogDescription>
            </DialogHeader>
            {editingClient && (
              <ClientForm 
                client={editingClient} 
                onClose={() => setEditingClient(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Client Details View Component
function ClientDetailsView({ client }: { client: Client }) {
  const clientDomains = mockClientDomains[client.id] || [];
  const clientHosting = mockClientHosting[client.id] || [];
  const paymentHistory = mockPaymentHistory[client.id] || [];

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="domains">Domains ({clientDomains.length})</TabsTrigger>
        <TabsTrigger value="hosting">Hosting ({clientHosting.length})</TabsTrigger>
        <TabsTrigger value="payments">Payments ({paymentHistory.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{client.totalServices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{client.upcomingRenewals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${client.totalSpent.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(client.accountStatus)}>
                {client.accountStatus.charAt(0).toUpperCase() + client.accountStatus.slice(1)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name / Company</Label>
                <p className="text-sm">{client.fullName}</p>
              </div>
              <div className="space-y-2">
                <Label>Client ID</Label>
                <p className="text-sm">{client.id}</p>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <p className="text-sm">{client.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <p className="text-sm">{client.phoneNumber}</p>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <p className="text-sm">{client.country}</p>
              </div>
              <div className="space-y-2">
                <Label>Preferred Contact</Label>
                <p className="text-sm capitalize">{client.preferredContact}</p>
              </div>
              <div className="space-y-2">
                <Label>Join Date</Label>
                <p className="text-sm">{client.joinDate}</p>
              </div>
              <div className="space-y-2">
                <Label>Last Payment</Label>
                <p className="text-sm">{client.lastPayment}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Address</Label>
              <p className="text-sm">{client.address}</p>
            </div>
            <div className="mt-4 space-y-2">
              <Label>Notes</Label>
              <p className="text-sm">{client.notes}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="domains" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Domain Services</CardTitle>
            <CardDescription>All domains managed for this client</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain Name</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientDomains.map((domain, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{domain.name}</TableCell>
                    <TableCell>
                      <div>
                        <p>{domain.expiryDate}</p>
                        <p className={`text-sm ${getExpiryColor(domain.daysLeft)}`}>
                          {domain.daysLeft} days left
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getServiceStatusColor(domain.status)}>
                        {domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Renew</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hosting" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Hosting Services</CardTitle>
            <CardDescription>All hosting accounts for this client</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Associated Domain</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientHosting.map((hosting, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{hosting.name}</TableCell>
                    <TableCell>{hosting.domain}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={hosting.usage} className="h-2" />
                        <p className="text-xs text-muted-foreground">{hosting.usage}%</p>
                      </div>
                    </TableCell>
                    <TableCell>{hosting.expiryDate}</TableCell>
                    <TableCell>
                      <Badge className={getServiceStatusColor(hosting.status)}>
                        {hosting.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Renew</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Complete payment records for this client</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.service}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : "destructive"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Client Form Component
function ClientForm({ client, onClose }: { client?: Client; onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: client?.fullName || "",
    email: client?.email || "",
    phoneNumber: client?.phoneNumber || "",
    address: client?.address || "",
    country: client?.country || "United States",
    preferredContact: client?.preferredContact || "email",
    accountStatus: client?.accountStatus || "active",
    notes: client?.notes || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name / Company Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            placeholder="Tech Corp"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="admin@techcorp.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            placeholder="+1-555-0123"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          placeholder="123 Business Street, City, State, ZIP"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
          <Select value={formData.preferredContact} onValueChange={(value) => setFormData({...formData, preferredContact: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountStatus">Account Status</Label>
          <Select value={formData.accountStatus} onValueChange={(value) => setFormData({...formData, accountStatus: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Comments</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Any special notes about this client..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {client ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}

// Helper function for color coding
function getStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-success text-success-foreground";
    case "inactive": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}

function getServiceStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-success text-success-foreground";
    case "expiring": return "bg-warning text-warning-foreground";
    case "expired": return "bg-destructive text-destructive-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}

function getExpiryColor(days: number) {
  if (days < 0) return "text-destructive";
  if (days <= 30) return "text-warning";
  return "text-success";
}
