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
  Link as LinkIcon
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { HostingForm } from "@/components/forms/HostingForm";
import { SharedHostingCPanel } from "@/components/hosting/SharedHostingCPanel";
import type { Hosting } from "@shared/types/database";

// Data will be loaded from dataService
const mockHosting = [
  {
    id: 1,
    packageName: "Business Pro",
    hostingType: "VPS",
    providerName: "HostGator",
    associatedDomain: "example.com",
    accountUsername: "user_12345",
    controlPanelUrl: "https://cpanel.hostgator.com",
    storageSpace: "100GB",
    bandwidthLimit: "Unlimited",
    ipAddress: "192.168.1.100",
    serverLocation: "Singapore",
    purchaseDate: "2023-01-15",
    expirationDate: "2024-01-15",
    status: "expired",
    price: 299,
    paymentStatus: "unpaid",
    invoiceNumber: "INV-H-2024-001",
    customerName: "Tech Corp",
    customerId: "TC001",
    supportContact: "support@hostgator.com",
    notes: "Priority client - expedite renewal",
    daysUntilExpiry: -15,
    usagePercent: 65,
    lastBackup: "2024-01-01",
    backupStatus: "Failed"
  },
  {
    id: 2,
    packageName: "Shared Premium",
    hostingType: "Shared",
    providerName: "SiteGround",
    associatedDomain: "mystore.net",
    accountUsername: "mystore_sg",
    controlPanelUrl: "https://my.siteground.com",
    storageSpace: "50GB",
    bandwidthLimit: "500GB",
    ipAddress: "203.142.10.50",
    serverLocation: "USA East",
    purchaseDate: "2022-06-10",
    expirationDate: "2024-02-28",
    status: "expiring",
    price: 189,
    paymentStatus: "paid",
    invoiceNumber: "INV-H-2024-002",
    customerName: "E-commerce LLC",
    customerId: "EC002",
    supportContact: "help@siteground.com",
    notes: "Auto-renewal enabled",
    daysUntilExpiry: 28,
    usagePercent: 82,
    lastBackup: "2024-01-28",
    backupStatus: "Success"
  },
  {
    id: 3,
    packageName: "Cloud Starter",
    hostingType: "Cloud",
    providerName: "DigitalOcean",
    associatedDomain: "portfolio.io",
    accountUsername: "portfolio_do",
    controlPanelUrl: "https://cloud.digitalocean.com",
    storageSpace: "25GB",
    bandwidthLimit: "1TB",
    ipAddress: "178.62.104.25",
    serverLocation: "London",
    purchaseDate: "2023-03-20",
    expirationDate: "2024-04-10",
    status: "active",
    price: 120,
    paymentStatus: "paid",
    invoiceNumber: "INV-H-2024-003",
    customerName: "John Doe",
    customerId: "JD003",
    supportContact: "support@digitalocean.com",
    notes: "Developer account with SSH access",
    daysUntilExpiry: 71,
    usagePercent: 34,
    lastBackup: "2024-01-30",
    backupStatus: "Success"
  },
  {
    id: 4,
    packageName: "Dedicated Enterprise",
    hostingType: "Dedicated",
    providerName: "AWS",
    associatedDomain: "startup.dev",
    accountUsername: "startup_aws",
    controlPanelUrl: "https://console.aws.amazon.com",
    storageSpace: "1TB",
    bandwidthLimit: "Unlimited",
    ipAddress: "54.239.98.142",
    serverLocation: "USA West",
    purchaseDate: "2023-08-05",
    expirationDate: "2024-02-20",
    status: "expiring",
    price: 899,
    paymentStatus: "unpaid",
    invoiceNumber: "INV-H-2024-004",
    customerName: "Innovation Inc",
    customerId: "II004",
    supportContact: "enterprise@aws.com",
    notes: "High-performance setup with load balancer",
    daysUntilExpiry: 20,
    usagePercent: 91,
    lastBackup: "2024-01-29",
    backupStatus: "Success"
  },
  {
    id: 5,
    packageName: "WordPress Managed",
    hostingType: "Shared",
    providerName: "WP Engine",
    associatedDomain: "blog.org",
    accountUsername: "blog_wpe",
    controlPanelUrl: "https://my.wpengine.com",
    storageSpace: "30GB",
    bandwidthLimit: "200GB",
    ipAddress: "192.155.83.74",
    serverLocation: "USA Central",
    purchaseDate: "2023-02-12",
    expirationDate: "2024-05-05",
    status: "active",
    price: 250,
    paymentStatus: "paid",
    invoiceNumber: "INV-H-2024-005",
    customerName: "Content Creator",
    customerId: "CC005",
    supportContact: "support@wpengine.com",
    notes: "WordPress optimized hosting",
    daysUntilExpiry: 96,
    usagePercent: 45,
    lastBackup: "2024-01-30",
    backupStatus: "Success"
  }
];

type Hosting = typeof mockHosting[0];

export default function Hosting() {
  const [hostingList, setHostingList] = useState<Hosting[]>(mockHosting);
  const [selectedHosting, setSelectedHosting] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"expiry" | "name" | "provider" | "customer" | "usage">("expiry");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSharedCPanelDialogOpen, setIsSharedCPanelDialogOpen] = useState(false);
  const [editingHosting, setEditingHosting] = useState<Hosting | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "expiring": return "bg-warning text-warning-foreground";
      case "expired": return "bg-destructive text-destructive-foreground";
      case "suspended": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "text-destructive";
    if (days <= 30) return "text-warning";
    return "text-success";
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return "bg-destructive";
    if (percent >= 75) return "bg-warning";
    return "bg-primary";
  };

  const getBackupStatusColor = (status: string) => {
    return status === "Success" ? "text-success" : "text-destructive";
  };

  const filteredAndSortedHosting = hostingList
    .filter(hosting => {
      const matchesSearch = hosting.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hosting.associatedDomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hosting.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hosting.providerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || hosting.status === statusFilter;
      const matchesType = typeFilter === "all" || hosting.hostingType.toLowerCase() === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "expiry":
          aValue = new Date(a.expirationDate).getTime();
          bValue = new Date(b.expirationDate).getTime();
          break;
        case "name":
          aValue = a.packageName.toLowerCase();
          bValue = b.packageName.toLowerCase();
          break;
        case "provider":
          aValue = a.providerName.toLowerCase();
          bValue = b.providerName.toLowerCase();
          break;
        case "customer":
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case "usage":
          aValue = a.usagePercent;
          bValue = b.usagePercent;
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
      setSelectedHosting(filteredAndSortedHosting.map(h => h.id));
    } else {
      setSelectedHosting([]);
    }
  };

  const handleSelectHosting = (hostingId: number, checked: boolean) => {
    if (checked) {
      setSelectedHosting([...selectedHosting, hostingId]);
    } else {
      setSelectedHosting(selectedHosting.filter(id => id !== hostingId));
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
    console.log(`Exporting ${selectedHosting.length || hostingList.length} hosting records as ${format}`);
    // In real app, implement actual export functionality
  };

  const bulkUpdate = (action: string) => {
    console.log(`Bulk ${action} for hosting:`, selectedHosting);
    // In real app, implement bulk update functionality
    setSelectedHosting([]);
  };

  const openControlPanel = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hosting Management</h1>
            <p className="text-muted-foreground">
              Manage hosting accounts, monitor resources, and track renewals
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsSharedCPanelDialogOpen(true)} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Shared + cPanel
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hosting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Hosting Account</DialogTitle>
                  <DialogDescription>
                    Enter all hosting details for proper tracking and management.
                  </DialogDescription>
                </DialogHeader>
                <HostingForm onClose={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hosting</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hostingList.length}</div>
              <p className="text-xs text-muted-foreground">
                Active accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {hostingList.filter(h => h.daysUntilExpiry <= 30 && h.daysUntilExpiry > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Usage</CardTitle>
              <Activity className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {hostingList.filter(h => h.usagePercent >= 80).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Over 80% capacity
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Backups</CardTitle>
              <Database className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {hostingList.filter(h => h.backupStatus === "Failed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
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
                    placeholder="Search hosting, domains, customers, or providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="vps">VPS</SelectItem>
                  <SelectItem value="dedicated">Dedicated</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                </SelectContent>
              </Select>
              {selectedHosting.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Bulk Actions ({selectedHosting.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => bulkUpdate("renew")}>
                      Mark as Renewed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => bulkUpdate("backup")}>
                      Trigger Backups
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

        {/* Hosting Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hosting Accounts ({filteredAndSortedHosting.length})</CardTitle>
            <CardDescription>
              Overview of all hosting accounts with resource monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedHosting.length === filteredAndSortedHosting.length && filteredAndSortedHosting.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Package & Domain
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
                        onClick={() => handleSort("provider")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Provider & Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("usage")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Resource Usage
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
                    <TableHead>Status & Payment</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedHosting.map((hosting) => (
                    <TableRow key={hosting.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedHosting.includes(hosting.id)}
                          onCheckedChange={(checked) => handleSelectHosting(hosting.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{hosting.packageName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{hosting.associatedDomain}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{hosting.customerName}</p>
                          <p className="text-sm text-muted-foreground">{hosting.customerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{hosting.providerName}</p>
                          <Badge variant="outline" className="text-xs">
                            {hosting.hostingType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Storage</span>
                            <span>{hosting.usagePercent}%</span>
                          </div>
                          <Progress 
                            value={hosting.usagePercent} 
                            className="h-2"
                            // @ts-ignore
                            color={getUsageColor(hosting.usagePercent)}
                          />
                          <div className="text-xs text-muted-foreground">
                            {hosting.storageSpace} / {hosting.bandwidthLimit} BW
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{hosting.expirationDate}</p>
                          <p className={`text-sm ${getExpiryColor(hosting.daysUntilExpiry)}`}>
                            {hosting.daysUntilExpiry < 0 
                              ? `Expired ${Math.abs(hosting.daysUntilExpiry)} days ago`
                              : `${hosting.daysUntilExpiry} days left`
                            }
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(hosting.status)} variant="secondary">
                            {hosting.status === "expiring" ? "Expiring Soon" : 
                             hosting.status.charAt(0).toUpperCase() + hosting.status.slice(1)}
                          </Badge>
                          <Badge variant={hosting.paymentStatus === "paid" ? "default" : "destructive"}>
                            {hosting.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${hosting.price}</p>
                          <p className="text-xs text-muted-foreground">per cycle</p>
                        </div>
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
                            <DropdownMenuItem onClick={() => setEditingHosting(hosting)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openControlPanel(hosting.controlPanelUrl)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Control Panel
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Link to Domain
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Database className="mr-2 h-4 w-4" />
                              Trigger Backup
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Hosting
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

        {/* Edit Dialog */}
        <Dialog open={!!editingHosting} onOpenChange={(open) => !open && setEditingHosting(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Hosting: {editingHosting?.packageName}</DialogTitle>
              <DialogDescription>
                Update hosting details and configuration.
              </DialogDescription>
            </DialogHeader>
            {editingHosting && (
              <HostingForm 
                hosting={editingHosting} 
                onClose={() => setEditingHosting(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Hosting Form Component
function HostingForm({ hosting, onClose }: { hosting?: Hosting; onClose: () => void }) {
  const [formData, setFormData] = useState({
    packageName: hosting?.packageName || "",
    hostingType: hosting?.hostingType || "shared",
    providerName: hosting?.providerName || "",
    associatedDomain: hosting?.associatedDomain || "",
    accountUsername: hosting?.accountUsername || "",
    password: "", // Never pre-fill passwords for security
    controlPanelUrl: hosting?.controlPanelUrl || "",
    storageSpace: hosting?.storageSpace || "",
    bandwidthLimit: hosting?.bandwidthLimit || "",
    ipAddress: hosting?.ipAddress || "",
    serverLocation: hosting?.serverLocation || "",
    purchaseDate: hosting?.purchaseDate || "",
    expirationDate: hosting?.expirationDate || "",
    status: hosting?.status || "active",
    price: hosting?.price || 0,
    paymentStatus: hosting?.paymentStatus || "unpaid",
    invoiceNumber: hosting?.invoiceNumber || "",
    customerName: hosting?.customerName || "",
    customerId: hosting?.customerId || "",
    supportContact: hosting?.supportContact || "",
    notes: hosting?.notes || ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // In real app, submit to API with proper encryption for password
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
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
            <Select value={formData.hostingType} onValueChange={(value) => setFormData({...formData, hostingType: value})}>
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
            <Label htmlFor="associatedDomain">Associated Domain</Label>
            <Input
              id="associatedDomain"
              value={formData.associatedDomain}
              onChange={(e) => setFormData({...formData, associatedDomain: e.target.value})}
              placeholder="example.com"
            />
          </div>
        </div>
      </div>

      {/* Account Credentials */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Credentials
        </h3>
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
            <Label htmlFor="password">Password / Access Key</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={hosting ? "Enter new password" : "Enter password"}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Eye className="h-4 w-4" />
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

      {/* Server Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Server Specifications
        </h3>
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

      {/* Dates and Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Dates and Status
        </h3>
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
                <SelectItem value="suspended">Suspended</SelectItem>
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
      </div>

      {/* Customer and Payment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Customer and Payment
        </h3>
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
              placeholder="INV-H-2024-001"
            />
          </div>
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {hosting ? "Update Hosting" : "Add Hosting"}
        </Button>
      </div>
    </form>
  );
}
