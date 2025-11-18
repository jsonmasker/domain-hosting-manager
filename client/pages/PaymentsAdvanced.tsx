import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  CreditCard,
  Building2,
  Users,
  Bell,
  RefreshCw,
  Send,
  Receipt,
  TrendingUp,
  TrendingDown,
  Banknote,
  Calculator,
  ShieldCheck,
  AlertCircle,
  Ban,
  CheckCheck,
  XCircle,
  Zap,
  Settings,
  History,
  UserCheck,
  Activity,
  Target
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { InvoiceGenerator } from "@/components/payments/InvoiceGenerator";
import { ServiceActivationControl } from "@/components/payments/ServiceActivationControl";
import { PaymentMethodsManager } from "@/components/payments/PaymentMethodsManager";
import type { Payment, Client, Domain, Hosting } from "@shared/types/database";

export default function PaymentsAdvanced() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [completedPayments, setCompletedPayments] = useState<Payment[]>([]);
  const [domainPayments, setDomainPayments] = useState<Payment[]>([]);
  const [hostingPayments, setHostingPayments] = useState<Payment[]>([]);
  const [otherPayments, setOtherPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isActivationControlOpen, setIsActivationControlOpen] = useState(false);
  const [isPaymentMethodsOpen, setIsPaymentMethodsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setIsLoading(true);
      await dataService.initialize();

      const [paymentsResponse, clientsResponse] = await Promise.all([
        dataService.getPayments(),
        dataService.getClients()
      ]);

      if (paymentsResponse.success && paymentsResponse.data) {
        const allPayments = paymentsResponse.data;
        setPayments(allPayments);
        
        // Categorize payments
        setPendingPayments(allPayments.filter(p => p.paymentStatus === 'unpaid' || p.paymentStatus === 'partially_paid'));
        setCompletedPayments(allPayments.filter(p => p.paymentStatus === 'paid'));
        setDomainPayments(allPayments.filter(p => p.serviceType === 'domain'));
        setHostingPayments(allPayments.filter(p => p.serviceType === 'hosting'));
        setOtherPayments(allPayments.filter(p => p.serviceType === 'other'));
      }

      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load payments data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentCreated = (newPayment: Payment) => {
    setPayments(prev => [...prev, newPayment]);
    loadPaymentsData(); // Refresh to update categorized lists
    setIsAddDialogOpen(false);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success text-success-foreground";
      case "unpaid": return "bg-destructive text-destructive-foreground";
      case "partially_paid": return "bg-warning text-warning-foreground";
      case "refunded": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "domain": return Globe;
      case "hosting": return Server;
      default: return CreditCard;
    }
  };

  const handleActivateService = async (paymentId: string) => {
    // Implementation for activating service after payment
    console.log(`Activating service for payment: ${paymentId}`);
  };

  const handleSuspendService = async (paymentId: string) => {
    // Implementation for suspending service due to non-payment
    console.log(`Suspending service for payment: ${paymentId}`);
  };

  const handleSendReminder = async (paymentId: string) => {
    // Implementation for sending payment reminder
    console.log(`Sending reminder for payment: ${paymentId}`);
  };

  const generateInvoice = async (paymentId: string) => {
    // Find the payment and open invoice generator with pre-filled data
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setIsInvoiceDialogOpen(true);
    }
  };

  const processRefund = async (paymentId: string) => {
    // Implementation for processing refund
    console.log(`Processing refund for payment: ${paymentId}`);
  };

  const filteredPayments = (paymentList: Payment[]) => {
    return paymentList.filter(payment =>
      payment.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const PaymentTable = ({ payments, title, emptyMessage }: { payments: Payment[], title: string, emptyMessage: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({payments.length})</CardTitle>
        <CardDescription>{emptyMessage}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments(payments).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-8 w-8 opacity-50" />
                      <p>No payments found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments(payments).map((payment) => {
                  const ServiceIcon = getServiceIcon(payment.serviceType);
                  const isOverdue = new Date(payment.dueDate) < new Date() && payment.paymentStatus !== 'paid';
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          {payment.invoiceNumber || `INV-${payment.id.slice(-6)}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.clientName || 'Unknown Client'}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.client?.email || ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{payment.serviceName || 'Unknown Service'}</p>
                            <p className="text-sm text-muted-foreground capitalize">{payment.serviceType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {payment.currency === "USD" ? "$" : "৳"}{payment.amount.toLocaleString()}
                          </p>
                          {payment.convertedAmount && (
                            <p className="text-sm text-muted-foreground">
                              {payment.currency === "USD" ? "৳" : "$"}{payment.convertedAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                            {payment.dueDate}
                          </p>
                          {isOverdue && (
                            <p className="text-sm text-destructive">
                              {payment.daysOverdue} days overdue
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getPaymentStatusColor(payment.paymentStatus)} variant="secondary">
                            {payment.paymentStatus === "paid" ? "Paid" :
                             payment.paymentStatus === "unpaid" ? "Unpaid" :
                             payment.paymentStatus === "partially_paid" ? "Partial" : "Refunded"}
                          </Badge>
                          {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
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
                            <DropdownMenuLabel>Payment Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => generateInvoice(payment.id)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              Generate Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(payment.id)}>
                              <Bell className="mr-2 h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payment.paymentStatus === 'paid' ? (
                              <DropdownMenuItem onClick={() => handleActivateService(payment.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate Service
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleSuspendService(payment.id)}>
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend Service
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => processRefund(payment.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Process Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Payment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {payments.length} Total Payments
              </Badge>
              <span className="text-muted-foreground">•</span>
              <p className="text-muted-foreground">
                Centralized payment control with service activation
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Payment</DialogTitle>
                  <DialogDescription>
                    Create a payment record for domain, hosting, or other services.
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

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments, clients, invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button variant="outline" onClick={() => setIsActivationControlOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Service Control
              </Button>
              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(true)}>
                <Receipt className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
              <Button variant="outline" onClick={() => setIsPaymentMethodsOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${completedPayments.reduce((sum, p) => sum + (p.currency === 'USD' ? p.amount : p.convertedAmount || 0), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From completed payments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingPayments.filter(p => new Date(p.dueDate) < new Date()).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payments.filter(p => {
                  const paymentDate = new Date(p.paymentDate || p.createdAt);
                  const now = new Date();
                  return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Payments this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Payment Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="service-wise">By Service</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <PaymentTable 
                payments={pendingPayments.slice(0, 5)} 
                title="Recent Pending Payments" 
                emptyMessage="No pending payments at the moment"
              />
              <PaymentTable 
                payments={completedPayments.slice(0, 5)} 
                title="Recent Completed Payments" 
                emptyMessage="No completed payments to display"
              />
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <PaymentTable 
              payments={pendingPayments} 
              title="Pending Payments" 
              emptyMessage="All payments are up to date!"
            />
          </TabsContent>

          <TabsContent value="completed">
            <PaymentTable 
              payments={completedPayments} 
              title="Completed Payments" 
              emptyMessage="No completed payments found"
            />
          </TabsContent>

          <TabsContent value="service-wise">
            <div className="space-y-6">
              <Tabs defaultValue="domains" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="domains">
                    <Globe className="h-4 w-4 mr-2" />
                    Domain Payments ({domainPayments.length})
                  </TabsTrigger>
                  <TabsTrigger value="hosting">
                    <Server className="h-4 w-4 mr-2" />
                    Hosting Payments ({hostingPayments.length})
                  </TabsTrigger>
                  <TabsTrigger value="other">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Other Services ({otherPayments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="domains">
                  <PaymentTable 
                    payments={domainPayments} 
                    title="Domain Payments" 
                    emptyMessage="No domain payments found"
                  />
                </TabsContent>

                <TabsContent value="hosting">
                  <PaymentTable 
                    payments={hostingPayments} 
                    title="Hosting Payments" 
                    emptyMessage="No hosting payments found"
                  />
                </TabsContent>

                <TabsContent value="other">
                  <PaymentTable 
                    payments={otherPayments} 
                    title="Other Service Payments" 
                    emptyMessage="No other service payments found"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>Generate, view, and manage invoices for all services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    Generate Invoices
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Send className="h-6 w-6" />
                    Send Invoices
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Download className="h-6 w-6" />
                    Download Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Automation</CardTitle>
                  <CardDescription>Configure automatic payment processing and reminders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Invoice Generation</p>
                      <p className="text-sm text-muted-foreground">Generate invoices when services are added</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Reminders</p>
                      <p className="text-sm text-muted-foreground">Send reminders before due dates</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-Suspend Services</p>
                      <p className="text-sm text-muted-foreground">Suspend services for overdue payments</p>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Activation Control</CardTitle>
                  <CardDescription>Manage service activation based on payment status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5 text-success" />
                      <p className="font-medium">Payment Verification</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Services are automatically verified against payment status before activation
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <p className="font-medium">Activation Restrictions</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Unpaid services are prevented from activation until payment is completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Invoice Generator Dialog */}
        <InvoiceGenerator
          isOpen={isInvoiceDialogOpen}
          onClose={() => setIsInvoiceDialogOpen(false)}
          onInvoiceGenerated={(invoice) => {
            console.log('Invoice generated:', invoice);
            // Here you would typically save the invoice to the database
          }}
        />

        {/* Service Activation Control Dialog */}
        <ServiceActivationControl
          isOpen={isActivationControlOpen}
          onClose={() => setIsActivationControlOpen(false)}
        />

        {/* Payment Methods Manager Dialog */}
        <PaymentMethodsManager
          isOpen={isPaymentMethodsOpen}
          onClose={() => setIsPaymentMethodsOpen(false)}
        />
      </div>
    </Layout>
  );
}
