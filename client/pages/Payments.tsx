import { useState, useEffect } from "react";
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
  Zap,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Banknote,
  Calculator
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { PaymentForm } from "@/components/forms/PaymentForm";
import type { Payment } from "@shared/types/database";

// Data will be loaded from dataService

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "amount" | "client" | "paymentDate">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [currentExchangeRate, setCurrentExchangeRate] = useState(120);

  // Load payments on component mount
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const response = await dataService.getPayments();
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCreated = (newPayment: Payment) => {
    setPayments(prev => [...prev, newPayment]);
    setIsAddDialogOpen(false);
  };

  const handlePaymentUpdated = (updatedPayment: Payment) => {
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
    setEditingPayment(null);
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await dataService.deletePayment(paymentId);
      if (response.success) {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
      }
    } catch (error) {
      console.error('Failed to delete payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success text-success-foreground";
      case "unpaid": return "bg-destructive text-destructive-foreground";
      case "partially_paid": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "domain": return Globe;
      case "hosting": return Server;
      case "other": return CreditCard;
      default: return FileText;
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

  const calculateTotals = () => {
    const totals = {
      totalUSD: 0,
      totalBDT: 0,
      paidUSD: 0,
      paidBDT: 0,
      unpaidUSD: 0,
      unpaidBDT: 0,
      overdueUSD: 0,
      overdueBDT: 0
    };

    payments.forEach(payment => {
      const amount = payment.amount;

      if (payment.currency === "USD") {
        totals.totalUSD += amount;
        if (payment.paymentStatus === "paid") {
          totals.paidUSD += amount;
        } else {
          totals.unpaidUSD += amount;
          if (payment.isOverdue) {
            totals.overdueUSD += amount;
          }
        }
      } else {
        totals.totalBDT += amount;
        if (payment.paymentStatus === "paid") {
          totals.paidBDT += amount;
        } else {
          totals.unpaidBDT += amount;
          if (payment.isOverdue) {
            totals.overdueBDT += amount;
          }
        }
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  const filteredAndSortedPayments = payments
    .filter(payment => {
      const clientName = payment.clientName || '';
      const serviceName = payment.serviceName || '';
      const invoiceNumber = payment.invoiceNumber || '';

      const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || payment.paymentStatus === statusFilter;
      const matchesCurrency = currencyFilter === "all" || payment.currency === currencyFilter;
      const matchesServiceType = serviceTypeFilter === "all" || payment.serviceType === serviceTypeFilter;
      return matchesSearch && matchesStatus && matchesCurrency && matchesServiceType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "dueDate":
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "client":
          aValue = (a.clientName || '').toLowerCase();
          bValue = (b.clientName || '').toLowerCase();
          break;
        case "paymentDate":
          aValue = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
          bValue = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
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
      setSelectedPayments(filteredAndSortedPayments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
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
    console.log(`Exporting ${selectedPayments.length || payments.length} payments as ${format}`);
  };

  const bulkUpdate = (action: string) => {
    console.log(`Bulk ${action} for payments:`, selectedPayments);
    setSelectedPayments([]);
  };

  const generateInvoice = (paymentId: string) => {
    console.log(`Generating invoice for payment ${paymentId}`);
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, rate: number) => {
    if (fromCurrency === toCurrency) return amount;
    if (fromCurrency === "USD" && toCurrency === "BDT") {
      return amount * rate;
    }
    if (fromCurrency === "BDT" && toCurrency === "USD") {
      return amount / rate;
    }
    return amount;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Tracking</h1>
            <p className="text-muted-foreground">
              Monitor payments, track currency conversions, and manage financial records
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment with currency conversion support.
                  </DialogDescription>
                </DialogHeader>
                <PaymentForm
                  onClose={() => setIsAddDialogOpen(false)}
                  onSuccess={handlePaymentCreated}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Financial Dashboard */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold">${totals.totalUSD.toLocaleString()}</div>
                <div className="text-lg font-bold">৳{totals.totalBDT.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Combined total revenue
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-success">${totals.paidUSD.toLocaleString()}</div>
                <div className="text-lg font-bold text-success">��{totals.paidBDT.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully collected
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-warning">${totals.unpaidUSD.toLocaleString()}</div>
                <div className="text-lg font-bold text-warning">৳{totals.unpaidBDT.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Pending collection
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-destructive">${totals.overdueUSD.toLocaleString()}</div>
                <div className="text-lg font-bold text-destructive">৳{totals.overdueBDT.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.isOverdue).length} overdue payments
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Rate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Currency Exchange Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>USD to BDT Rate:</Label>
                <Input
                  type="number"
                  value={currentExchangeRate}
                  onChange={(e) => setCurrentExchangeRate(Number(e.target.value))}
                  className="w-24"
                />
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Rate
              </Button>
              <div className="text-sm text-muted-foreground">
                1 USD = ৳{currentExchangeRate} | 1 BDT = ${(1/currentExchangeRate).toFixed(4)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by client, service, or invoice number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currency</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BDT">BDT</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                    <SelectItem value="hosting">Hosting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                {selectedPayments.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedPayments.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => bulkUpdate("mark_paid")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkUpdate("send_reminder")}>
                        <Bell className="mr-2 h-4 w-4" />
                        Send Reminders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => bulkUpdate("generate_invoices")}>
                        <Receipt className="mr-2 h-4 w-4" />
                        Generate Invoices
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
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records ({filteredAndSortedPayments.length})</CardTitle>
            <CardDescription>
              Complete payment history with currency conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayments.length === filteredAndSortedPayments.length && filteredAndSortedPayments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("client")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Client & Service
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("amount")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Amount & Currency
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("dueDate")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Due Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("paymentDate")}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Payment Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPayments.map((payment) => {
                    const ServiceIcon = getServiceTypeIcon(payment.serviceType);
                    return (
                      <TableRow key={payment.id} className={payment.isOverdue ? "bg-destructive/5" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPayments.includes(payment.id)}
                            onCheckedChange={(checked) => handleSelectPayment(payment.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{payment.clientName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ServiceIcon className="h-3 w-3" />
                              <span>{payment.serviceName}</span>
                              <Badge variant="outline" className="text-xs">
                                {payment.serviceType}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {payment.currency === "USD" ? "$" : "৳"}{payment.amount.toLocaleString()}
                            </div>
                            {payment.convertedAmount && (
                              <div className="text-sm text-muted-foreground">
                                ≈ {payment.currency === "USD" ? "৳" : "$"}{payment.convertedAmount.toLocaleString()}
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {payment.currency}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={payment.isOverdue ? "text-destructive" : ""}>
                            <p className="font-medium">{payment.dueDate}</p>
                            {payment.isOverdue && (
                              <p className="text-sm text-destructive">
                                {payment.daysOverdue} days overdue
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.paymentDate ? (
                            <p className="text-sm">{payment.paymentDate}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not paid</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{getPaymentMethodName(payment.paymentMethod)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.paymentStatus)} variant="secondary">
                            {payment.paymentStatus === "partially_paid" ? "Partial" : 
                             payment.paymentStatus.charAt(0).toUpperCase() + payment.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{payment.invoiceNumber}</span>
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
                              <DropdownMenuItem onClick={() => setEditingPayment(payment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => generateInvoice(payment.id)}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Generate Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Bell className="mr-2 h-4 w-4" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Payment Dialog */}
        <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Payment: {editingPayment?.invoiceNumber}</DialogTitle>
              <DialogDescription>
                Update payment details and currency information.
              </DialogDescription>
            </DialogHeader>
            {editingPayment && (
              <PaymentForm
                payment={editingPayment}
                onClose={() => setEditingPayment(null)}
                onSuccess={handlePaymentUpdated}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Payment Form Component
function PaymentForm({ payment, exchangeRate, onClose }: { payment?: Payment; exchangeRate: number; onClose: () => void }) {
  const [formData, setFormData] = useState({
    clientName: payment?.clientName || "",
    clientId: payment?.clientId || "",
    serviceType: payment?.serviceType || "domain",
    serviceId: payment?.serviceId || "",
    serviceName: payment?.serviceName || "",
    currency: payment?.currency || "USD",
    amount: payment?.amount || 0,
    exchangeRate: payment?.exchangeRate || exchangeRate,
    paymentDate: payment?.paymentDate || "",
    dueDate: payment?.dueDate || "",
    paymentMethod: payment?.paymentMethod || "stripe",
    invoiceNumber: payment?.invoiceNumber || "",
    paymentStatus: payment?.paymentStatus || "unpaid",
    notes: payment?.notes || ""
  });

  const [convertedAmount, setConvertedAmount] = useState(payment?.convertedAmount || 0);

  useEffect(() => {
    // Auto-calculate converted amount when amount, currency, or exchange rate changes
    const rate = formData.exchangeRate;
    if (formData.currency === "USD") {
      setConvertedAmount(formData.amount * rate);
    } else {
      setConvertedAmount(formData.amount / rate);
    }
  }, [formData.amount, formData.currency, formData.exchangeRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { ...formData, convertedAmount });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client & Service Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Client & Service Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              placeholder="Tech Corp"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              placeholder="TC001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type *</Label>
            <Select value={formData.serviceType} onValueChange={(value) => setFormData({...formData, serviceType: value})}>
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
          <div className="space-y-2">
            <Label htmlFor="serviceId">Service ID</Label>
            <Input
              id="serviceId"
              value={formData.serviceId}
              onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
              placeholder="DOM-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              value={formData.serviceName}
              onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
              placeholder="example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment & Currency Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Payment & Currency Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
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
            <Label htmlFor="exchangeRate">Exchange Rate</Label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <Label>Original Amount</Label>
              <div className="text-2xl font-bold">
                {formData.currency === "USD" ? "$" : "৳"}{formData.amount.toLocaleString()}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="space-y-2">
              <Label>Converted Amount</Label>
              <div className="text-2xl font-bold">
                {formData.currency === "USD" ? "৳" : "$"}{convertedAmount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Rate: 1 {formData.currency} = {formData.currency === "USD" ? formData.exchangeRate : (1/formData.exchangeRate).toFixed(4)} {formData.currency === "USD" ? "BDT" : "USD"}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Dates & Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Dates & Status
        </h3>
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
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
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
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({...formData, paymentStatus: value})}>
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
          placeholder="Additional payment details or comments..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {payment ? "Update Payment" : "Add Payment"}
        </Button>
      </div>
    </form>
  );
}
