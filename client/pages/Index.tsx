import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { 
  Globe, 
  Server, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  MoreHorizontal,
  Bell,
  Search,
  Filter,
  Zap,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  FileText,
  Receipt,
  Banknote,
  BarChart3,
  PieChart,
  TrendingDown,
  RefreshCw,
  Send,
  Target,
  UserPlus,
  ExternalLink,
  ChevronRight,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock data - in real app this would come from API/database
const dashboardData = {
  stats: {
    totalClients: 15,
    totalDomains: 48,
    totalHosting: 23,
    upcomingRenewals: 7,
    unpaidInvoices: 12,
    totalRevenueBDT: 485000,
    totalRevenueUSD: 12450
  },
  revenueChart: [
    { month: "Jan", bdt: 45000, usd: 1200 },
    { month: "Feb", bdt: 52000, usd: 1350 },
    { month: "Mar", bdt: 48000, usd: 1180 },
    { month: "Apr", bdt: 61000, usd: 1520 },
    { month: "May", bdt: 58000, usd: 1400 },
    { month: "Jun", bdt: 65000, usd: 1650 }
  ],
  servicesStatus: {
    active: 64,
    expiringSoon: 7,
    expired: 3
  },
  domainHostingDistribution: {
    domains: 48,
    hosting: 23
  },
  currencySplit: {
    bdt: 65,
    usd: 35
  },
  upcomingExpiries: [
    { id: 1, serviceName: "techcorp.com", serviceType: "domain", clientName: "Tech Corp", expiryDate: "2024-02-01", daysLeft: 2, status: "critical" },
    { id: 2, serviceName: "VPS Premium", serviceType: "hosting", clientName: "E-commerce LLC", expiryDate: "2024-02-03", daysLeft: 4, status: "critical" },
    { id: 3, serviceName: "mystore.net", serviceType: "domain", clientName: "E-commerce LLC", expiryDate: "2024-02-10", daysLeft: 11, status: "warning" },
    { id: 4, serviceName: "Dedicated Server", serviceType: "hosting", clientName: "Innovation Inc", expiryDate: "2024-02-15", daysLeft: 16, status: "warning" },
    { id: 5, serviceName: "portfolio.io", serviceType: "domain", clientName: "John Doe", expiryDate: "2024-01-28", daysLeft: -2, status: "expired" }
  ],
  recentPayments: [
    { id: 1, clientName: "Tech Corp", service: "techcorp.com", amount: 35880, currency: "BDT", date: "2024-01-15", method: "Stripe", status: "paid" },
    { id: 2, clientName: "E-commerce LLC", service: "VPS Premium", amount: 125, currency: "USD", date: "2024-01-20", method: "bKash", status: "unpaid" },
    { id: 3, clientName: "John Doe", service: "portfolio.io", amount: 23482, currency: "BDT", date: "2024-01-25", method: "PayPal", status: "paid" },
    { id: 4, clientName: "Innovation Inc", service: "Dedicated Server", amount: 899, currency: "USD", date: "2024-01-10", method: "Bank Transfer", status: "partially_paid" },
    { id: 5, clientName: "Content Creator", service: "SSL Certificate", amount: 8500, currency: "BDT", date: "2024-01-28", method: "Nagad", status: "paid" }
  ],
  notifications: [
    { id: 1, type: "expiry", message: "5 services expiring in next 7 days", count: 5, priority: "high" },
    { id: 2, type: "payment", message: "12 unpaid invoices need attention", count: 12, priority: "medium" },
    { id: 3, type: "renewal", message: "3 services expired and need renewal", count: 3, priority: "critical" }
  ]
};

// Calendar utilities
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const getCurrentDate = () => new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(getCurrentDate());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "warning": return "bg-warning text-warning-foreground";
      case "expired": return "bg-red-600 text-white";
      case "active": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "domain": return Globe;
      case "hosting": return Server;
      default: return FileText;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-destructive";
      case "high": return "text-orange-500";
      case "medium": return "text-yellow-600";
      default: return "text-muted-foreground";
    }
  };

  // Generate mini calendar
  const generateMiniCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 35; i++) { // 5 weeks
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getExpiryCountForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return dashboardData.upcomingExpiries.filter(exp => exp.expiryDate === dateStr).length;
  };

  const getExpiryStatusForDate = (date: Date) => {
    const dateStr = formatDate(date);
    const expiries = dashboardData.upcomingExpiries.filter(exp => exp.expiryDate === dateStr);
    if (expiries.length === 0) return null;
    
    if (expiries.some(exp => exp.status === "expired")) return "expired";
    if (expiries.some(exp => exp.status === "critical")) return "critical";
    if (expiries.some(exp => exp.status === "warning")) return "warning";
    return "active";
  };

  // Simple chart data processing for display
  const chartData = useMemo(() => {
    return {
      revenue: dashboardData.revenueChart.map(item => ({
        ...item,
        total: item.bdt + (item.usd * 120) // Convert USD to BDT for total
      })),
      services: [
        { name: "Active", value: dashboardData.servicesStatus.active, color: "bg-success" },
        { name: "Expiring Soon", value: dashboardData.servicesStatus.expiringSoon, color: "bg-warning" },
        { name: "Expired", value: dashboardData.servicesStatus.expired, color: "bg-destructive" }
      ],
      distribution: [
        { name: "Domains", value: dashboardData.domainHostingDistribution.domains, color: "bg-green-500" },
        { name: "Hosting", value: dashboardData.domainHostingDistribution.hosting, color: "bg-orange-500" }
      ],
      currency: [
        { name: "BDT", value: dashboardData.currencySplit.bdt, color: "bg-blue-500" },
        { name: "USD", value: dashboardData.currencySplit.usd, color: "bg-purple-500" }
      ]
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Search and Quick Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Complete overview of your domain and hosting management
            </p>
          </div>
          
          {/* Global Search and Filters */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients, domains, hosting..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="domain">Domains</SelectItem>
                <SelectItem value="hosting">Hosting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Actions Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button asChild className="justify-start">
                <Link to="/clients">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Client
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/domains">
                  <Globe className="h-4 w-4 mr-2" />
                  Add Domain
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/hosting">
                  <Server className="h-4 w-4 mr-2" />
                  Add Hosting
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/payments">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{dashboardData.stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Active accounts
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
              <Globe className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardData.stats.totalDomains}</div>
              <p className="text-xs text-muted-foreground">
                Registered domains
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hosting</CardTitle>
              <Server className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{dashboardData.stats.totalHosting}</div>
              <p className="text-xs text-muted-foreground">
                Active packages
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.upcomingRenewals}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardData.stats.unpaidInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Require payment
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-lg font-bold text-purple-600">৳{dashboardData.stats.totalRevenueBDT.toLocaleString()}</div>
                <div className="text-lg font-bold text-purple-600">${dashboardData.stats.totalRevenueUSD.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Calendar Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Revenue Trend
              </CardTitle>
              <CardDescription>Revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple bar chart representation */}
                <div className="flex items-end justify-between h-32 gap-2">
                  {chartData.revenue.map((item, index) => {
                    const maxValue = Math.max(...chartData.revenue.map(r => r.total));
                    const heightPercent = (item.total / maxValue) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <div className="text-xs text-center">
                          <div className="font-medium">{item.month}</div>
                          <div className="text-muted-foreground">
                            ৳{(item.bdt / 1000).toFixed(0)}k
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span>BDT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span>USD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mini Calendar Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Expiry Calendar
              </CardTitle>
              <CardDescription>
                {MONTHS[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Day headers */}
                  {DAYS.map(day => (
                    <div key={day} className="text-xs font-medium text-muted-foreground p-1">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {generateMiniCalendar().map((day, index) => {
                    const isCurrentMonth = day.getMonth() === currentCalendarDate.getMonth();
                    const isToday = formatDate(day) === formatDate(getCurrentDate());
                    const expiryCount = getExpiryCountForDate(day);
                    const expiryStatus = getExpiryStatusForDate(day);
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "text-xs p-1 rounded cursor-pointer hover:bg-accent relative",
                          !isCurrentMonth && "opacity-30",
                          isToday && "bg-primary text-primary-foreground",
                          expiryStatus === "expired" && isCurrentMonth && "bg-red-100 text-red-700",
                          expiryStatus === "critical" && isCurrentMonth && "bg-orange-100 text-orange-700",
                          expiryStatus === "warning" && isCurrentMonth && "bg-yellow-100 text-yellow-700"
                        )}
                        onClick={() => setSelectedDate(formatDate(day))}
                      >
                        {day.getDate()}
                        {expiryCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/calendar">
                      View Full Calendar
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Services Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Services Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.services.map((item, index) => {
                  const total = chartData.services.reduce((sum, s) => sum + s.value, 0);
                  const percentage = Math.round((item.value / total) * 100);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded", item.color)} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Domain vs Hosting Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Service Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.distribution.map((item, index) => {
                  const total = chartData.distribution.reduce((sum, s) => sum + s.value, 0);
                  const percentage = Math.round((item.value / total) * 100);
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded", item.color)} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Currency Split */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Payment Currency Split
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.currency.map((item, index) => {
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded", item.color)} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Expiries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Upcoming Expiries
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/calendar">View All</Link>
                </Button>
              </div>
              <CardDescription>Services requiring attention soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.upcomingExpiries.slice(0, 5).map((item) => {
                  const ServiceIcon = getServiceIcon(item.serviceType);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.serviceName}</div>
                          <div className="text-sm text-muted-foreground">{item.clientName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.expiryDate}</div>
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d overdue` : `${item.daysLeft}d left`}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Renew Service
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send Reminder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Recent Payments
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/payments">View All</Link>
                </Button>
              </div>
              <CardDescription>Latest payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{payment.clientName}</div>
                        <div className="text-sm text-muted-foreground">{payment.service}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {payment.currency === "USD" ? "$" : "৳"}{payment.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">{payment.date}</div>
                    </div>
                    <Badge variant={
                      payment.status === "paid" ? "default" : 
                      payment.status === "partially_paid" ? "secondary" : "destructive"
                    }>
                      {payment.status === "partially_paid" ? "Partial" : payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications & Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>Important updates and pending actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      notification.priority === "critical" && "bg-destructive",
                      notification.priority === "high" && "bg-orange-500",
                      notification.priority === "medium" && "bg-yellow-500"
                    )} />
                    <div>
                      <div className="font-medium">{notification.message}</div>
                      <div className={cn("text-sm", getPriorityColor(notification.priority))}>
                        Priority: {notification.priority}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{notification.count}</Badge>
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Send All Email Alerts
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send SMS Alerts
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp Alerts
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
