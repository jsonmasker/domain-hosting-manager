import { useState, useMemo } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
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
  Calendar as CalendarIcon,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ArrowUpDown,
  Eye,
  ExternalLink,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  Zap,
  Users,
  Building2,
  CreditCard,
  Send,
  Settings,
  Target,
  Timer,
  Repeat,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock expiry events - in real app this would come from API/database
const mockExpiryEvents = [
  {
    id: "EXP-001",
    serviceType: "domain",
    serviceName: "techcorp.com",
    clientName: "Tech Corp",
    clientId: "TC001",
    expiryDate: "2024-02-01",
    daysRemaining: 2,
    status: "expiring",
    renewalPrice: 299,
    currency: "USD",
    paymentStatus: "unpaid",
    notes: "Priority renewal required"
  },
  {
    id: "EXP-002",
    serviceType: "hosting",
    serviceName: "VPS Premium",
    clientName: "E-commerce LLC",
    clientId: "EC002",
    expiryDate: "2024-02-03",
    daysRemaining: 4,
    status: "expiring",
    renewalPrice: 15000,
    currency: "BDT",
    paymentStatus: "unpaid",
    notes: "Monthly hosting renewal"
  },
  {
    id: "EXP-003",
    serviceType: "domain",
    serviceName: "mystore.net",
    clientName: "E-commerce LLC",
    clientId: "EC002",
    expiryDate: "2024-02-10",
    daysRemaining: 11,
    status: "expiring",
    renewalPrice: 349,
    currency: "USD",
    paymentStatus: "paid",
    notes: "Auto-renewal enabled"
  },
  {
    id: "EXP-004",
    serviceType: "hosting",
    serviceName: "Dedicated Server",
    clientName: "Innovation Inc",
    clientId: "II004",
    expiryDate: "2024-02-15",
    daysRemaining: 16,
    status: "expiring",
    renewalPrice: 899,
    currency: "USD",
    paymentStatus: "unpaid",
    notes: "High priority client"
  },
  {
    id: "EXP-005",
    serviceType: "domain",
    serviceName: "portfolio.io",
    clientName: "John Doe",
    clientId: "JD003",
    expiryDate: "2024-01-28",
    daysRemaining: -2,
    status: "expired",
    renewalPrice: 199,
    currency: "USD",
    paymentStatus: "unpaid",
    notes: "Grace period active"
  },
  {
    id: "EXP-006",
    serviceType: "other",
    serviceName: "SSL Certificate",
    clientName: "Content Creator",
    clientId: "CC005",
    expiryDate: "2024-03-15",
    daysRemaining: 45,
    status: "active",
    renewalPrice: 8500,
    currency: "BDT",
    paymentStatus: "paid",
    notes: "Annual SSL renewal"
  },
  {
    id: "EXP-007",
    serviceType: "domain",
    serviceName: "startup.dev",
    clientName: "Innovation Inc",
    clientId: "II004",
    expiryDate: "2024-02-20",
    daysRemaining: 21,
    status: "expiring",
    renewalPrice: 450,
    currency: "USD",
    paymentStatus: "unpaid",
    notes: "New domain registration"
  },
  {
    id: "EXP-008",
    serviceType: "hosting",
    serviceName: "WordPress Managed",
    clientName: "Content Creator",
    clientId: "CC005",
    expiryDate: "2024-04-05",
    daysRemaining: 66,
    status: "active",
    renewalPrice: 250,
    currency: "USD",
    paymentStatus: "paid",
    notes: "WordPress hosting"
  }
];

type ExpiryEvent = typeof mockExpiryEvents[0];

// Calendar utilities
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getCurrentDate = () => new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [events, setEvents] = useState<ExpiryEvent[]>(mockExpiryEvents);
  const [selectedEvent, setSelectedEvent] = useState<ExpiryEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);

  const getStatusColor = (status: string, daysRemaining: number) => {
    if (daysRemaining < 0) return "bg-destructive text-destructive-foreground"; // Expired
    if (daysRemaining <= 7) return "bg-orange-500 text-white"; // Expiring within 7 days
    if (daysRemaining <= 30) return "bg-yellow-500 text-black"; // Expiring within 30 days
    return "bg-success text-success-foreground"; // Active
  };

  const getStatusText = (daysRemaining: number) => {
    if (daysRemaining < 0) return "Expired";
    if (daysRemaining <= 7) return "Critical";
    if (daysRemaining <= 30) return "Warning";
    return "Active";
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "domain": return Globe;
      case "hosting": return Server;
      case "other": return CreditCard;
      default: return FileText;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "expired" && event.daysRemaining < 0) ||
                         (statusFilter === "critical" && event.daysRemaining >= 0 && event.daysRemaining <= 7) ||
                         (statusFilter === "warning" && event.daysRemaining > 7 && event.daysRemaining <= 30) ||
                         (statusFilter === "active" && event.daysRemaining > 30);
    const matchesServiceType = serviceTypeFilter === "all" || event.serviceType === serviceTypeFilter;
    return matchesSearch && matchesStatus && matchesServiceType;
  });

  // Calendar generation
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return filteredEvents.filter(event => event.expiryDate === dateStr);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(getCurrentDate());
  };

  const exportCalendar = (format: string) => {
    console.log(`Exporting calendar as ${format}`);
  };

  const addCustomReminder = (eventId: string, reminderDays: number) => {
    console.log(`Adding reminder for event ${eventId} - ${reminderDays} days before`);
  };

  const sendNotifications = (type: string) => {
    console.log(`Sending ${type} notifications`);
  };

  // Calendar statistics
  const stats = useMemo(() => {
    const expired = events.filter(e => e.daysRemaining < 0).length;
    const critical = events.filter(e => e.daysRemaining >= 0 && e.daysRemaining <= 7).length;
    const warning = events.filter(e => e.daysRemaining > 7 && e.daysRemaining <= 30).length;
    const active = events.filter(e => e.daysRemaining > 30).length;
    
    return { expired, critical, warning, active };
  }, [events]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expiry Calendar</h1>
            <p className="text-muted-foreground">
              Track service expirations and manage renewal schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToToday}>
              <Target className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Reminders
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                  <DialogDescription>
                    Configure automatic reminders for upcoming expirations.
                  </DialogDescription>
                </DialogHeader>
                <ReminderSettings onClose={() => setIsReminderDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">
                Immediate attention needed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical (≤7 days)</CardTitle>
              <Timer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.critical}</div>
              <p className="text-xs text-muted-foreground">
                Renew immediately
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning (≤30 days)</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              <p className="text-xs text-muted-foreground">
                Plan renewals soon
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active (&gt;30 days)</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Services secure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calendar Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search services or clients..."
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
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="critical">Critical (≤7d)</SelectItem>
                    <SelectItem value="warning">Warning (≤30d)</SelectItem>
                    <SelectItem value="active">Active (&gt;30d)</SelectItem>
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
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <TabsList>
                    <TabsTrigger value="month">
                      <Grid3X3 className="h-4 w-4 mr-1" />
                      Month
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="h-4 w-4 mr-1" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Send Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => sendNotifications("email")}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email Alerts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => sendNotifications("sms")}>
                      <Phone className="mr-2 h-4 w-4" />
                      Send SMS Alerts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => sendNotifications("bulk")}>
                      <Zap className="mr-2 h-4 w-4" />
                      Bulk Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Calendar</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => exportCalendar("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportCalendar("excel")}>
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportCalendar("pdf")}>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Views */}
        {viewMode === "month" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {generateCalendarDays().map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = formatDate(day) === formatDate(getCurrentDate());
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[80px] p-1 border rounded-lg cursor-pointer hover:bg-accent",
                        !isCurrentMonth && "opacity-30",
                        isToday && "bg-primary/10 border-primary"
                      )}
                      onClick={() => setSelectedDate(formatDate(day))}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        isToday && "text-primary"
                      )}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => {
                          const ServiceIcon = getServiceIcon(event.serviceType);
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "text-xs p-1 rounded truncate cursor-pointer",
                                getStatusColor(event.status, event.daysRemaining)
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <ServiceIcon className="h-3 w-3" />
                                <span className="truncate">{event.serviceName}</span>
                              </div>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Expirations</CardTitle>
              <CardDescription>
                Timeline view of all service expirations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents
                  .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                  .map(event => {
                    const ServiceIcon = getServiceIcon(event.serviceType);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            getStatusColor(event.status, event.daysRemaining).replace("text-", "bg-").split(" ")[0]
                          )} />
                          <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{event.serviceName}</div>
                            <div className="text-sm text-muted-foreground">{event.clientName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{event.expiryDate}</div>
                          <div className={cn(
                            "text-sm",
                            event.daysRemaining < 0 ? "text-destructive" : 
                            event.daysRemaining <= 7 ? "text-orange-500" :
                            event.daysRemaining <= 30 ? "text-yellow-600" : "text-success"
                          )}>
                            {event.daysRemaining < 0 
                              ? `${Math.abs(event.daysRemaining)} days overdue`
                              : `${event.daysRemaining} days left`
                            }
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {event.currency === "USD" ? "$" : "৳"}{event.renewalPrice.toLocaleString()}
                          </div>
                          <Badge variant={event.paymentStatus === "paid" ? "default" : "destructive"}>
                            {event.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Details Modal */}
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent?.serviceName} - Expiry Details</DialogTitle>
              <DialogDescription>
                Complete information about this service expiration
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && <EventDetails event={selectedEvent} />}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

// Event Details Component
function EventDetails({ event }: { event: ExpiryEvent }) {
  const ServiceIcon = getServiceIcon(event.serviceType);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Service Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <ServiceIcon className="h-4 w-4" />
              <span className="font-medium">{event.serviceName}</span>
              <Badge variant="outline">{event.serviceType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{event.clientName} ({event.clientId})</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiry Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Expiry Date:</span>
              <span className="font-medium">{event.expiryDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Days Remaining:</span>
              <span className={cn(
                "font-medium",
                event.daysRemaining < 0 ? "text-destructive" : 
                event.daysRemaining <= 7 ? "text-orange-500" :
                event.daysRemaining <= 30 ? "text-yellow-600" : "text-success"
              )}>
                {event.daysRemaining < 0 
                  ? `${Math.abs(event.daysRemaining)} days overdue`
                  : `${event.daysRemaining} days left`
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge className={getStatusColor(event.status, event.daysRemaining)}>
                {getStatusText(event.daysRemaining)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Renewal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Renewal Price:</span>
              <span className="font-medium">
                {event.currency === "USD" ? "$" : "৳"}{event.renewalPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment Status:</span>
              <Badge variant={event.paymentStatus === "paid" ? "default" : "destructive"}>
                {event.paymentStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Currency:</span>
              <span className="font-medium">{event.currency}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{event.notes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 pt-4">
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          View Payment
        </Button>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          View Client
        </Button>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Set Reminder
        </Button>
        <Button variant="outline">
          <Send className="h-4 w-4 mr-2" />
          Send Alert
        </Button>
      </div>
    </div>
  );
}

// Reminder Settings Component
function ReminderSettings({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Email Notifications</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-30" defaultChecked />
              <Label htmlFor="email-30" className="text-sm">30 days before expiry</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-7" defaultChecked />
              <Label htmlFor="email-7" className="text-sm">7 days before expiry</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-1" defaultChecked />
              <Label htmlFor="email-1" className="text-sm">1 day before expiry</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">SMS Notifications</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sms-7" />
              <Label htmlFor="sms-7" className="text-sm">7 days before expiry</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sms-1" defaultChecked />
              <Label htmlFor="sms-1" className="text-sm">1 day before expiry</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">WhatsApp Notifications</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="whatsapp-7" />
              <Label htmlFor="whatsapp-7" className="text-sm">7 days before expiry</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="whatsapp-1" />
              <Label htmlFor="whatsapp-1" className="text-sm">1 day before expiry</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string, daysRemaining: number) {
  if (daysRemaining < 0) return "bg-destructive text-destructive-foreground";
  if (daysRemaining <= 7) return "bg-orange-500 text-white";
  if (daysRemaining <= 30) return "bg-yellow-500 text-black";
  return "bg-success text-success-foreground";
}

function getServiceIcon(type: string) {
  switch (type) {
    case "domain": return Globe;
    case "hosting": return Server;
    case "other": return CreditCard;
    default: return FileText;
  }
}
