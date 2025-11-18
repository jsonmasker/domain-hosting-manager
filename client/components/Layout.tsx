import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Server,
  Globe,
  Users,
  CreditCard,
  Calendar,
  Settings,
  Menu,
  Bell,
  User,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { name: "Dashboard", href: "/", icon: Server },
  { name: "Domains", href: "/domains-advanced", icon: Globe },
  { name: "Hosting", href: "/hosting", icon: Server },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Expiry Calendar", href: "/calendar", icon: Calendar },
];

// Sample notification data - in a real app this would come from an API
const sampleNotifications = [
  {
    id: "1",
    title: "Domain Expiring Soon",
    message: "example.com expires in 5 days",
    type: "warning" as const,
    time: "2 hours ago",
    read: false,
    action: "/domains"
  },
  {
    id: "2",
    title: "Payment Overdue",
    message: "Invoice INV-2024-002 is 3 days overdue",
    type: "error" as const,
    time: "1 day ago",
    read: false,
    action: "/payments"
  },
  {
    id: "3",
    title: "New Client Added",
    message: "Innovation Inc has been successfully added",
    type: "success" as const,
    time: "2 days ago",
    read: true,
    action: "/clients"
  },
  {
    id: "4",
    title: "Backup Completed",
    message: "All hosting backups completed successfully",
    type: "info" as const,
    time: "3 days ago",
    read: true,
    action: "/hosting"
  }
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'info': return <Info className="h-4 w-4 text-info" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-2">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
              isActive 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card/50 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Server className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">DomainHub</h1>
                <p className="text-xs text-muted-foreground">Management Suite</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex-grow flex flex-col px-4">
            <NavContent />
          </div>
          <div className="flex-shrink-0 px-4 py-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@domainhub.com</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top Bar */}
        <header className="bg-card/50 border-b px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-4 border-b">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Server className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold">DomainHub</h1>
                      <p className="text-xs text-muted-foreground">Management Suite</p>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <NavContent />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="hidden md:block">
              <h2 className="text-xl font-semibold text-foreground">
                {navigation.find(item => item.href === location.pathname)?.name || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="max-h-96">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                            !notification.read && "bg-muted/20"
                          )}
                          onClick={() => {
                            handleMarkAsRead(notification.id);
                            if (notification.action) {
                              window.location.href = notification.action;
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={cn(
                                  "text-sm font-medium truncate",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="text-xs text-muted-foreground">
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {notifications.length > 0 && (
                  <>
                    <Separator />
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        asChild
                      >
                        <Link to="/notifications">View All Notifications</Link>
                      </Button>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
