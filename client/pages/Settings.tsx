import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Palette,
  Layout as LayoutIcon,
  Bell,
  Download,
  Upload,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  RefreshCw,
  Eye,
  Lock,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Trash2,
  Copy,
  Check,
  Move,
  Maximize,
  Minimize,
  RotateCcw,
  FileText,
  Database,
  Key,
  AlertTriangle,
  Info,
  Zap,
  Paintbrush,
  Languages,
  DollarSign,
  Timer,
  TrendingUp,
  Calendar,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
  // General Settings State
  const [systemName, setSystemName] = useState("DomainHub");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Dhaka");

  // Appearance Settings State
  const [themeMode, setThemeMode] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("blue");
  const [secondaryColor, setSecondaryColor] = useState("gray");
  const [showPreview, setShowPreview] = useState(false);

  // Layout Settings State
  const [dragDropEnabled, setDragDropEnabled] = useState(true);
  const [pinnedSections, setPinnedSections] = useState({
    summaryCards: true,
    revenueChart: true,
    expiryCalendar: true,
    upcomingExpiries: true,
    recentPayments: true,
    notifications: true
  });

  // Notification Settings State
  const [expiryReminders, setExpiryReminders] = useState({
    enabled: true,
    thirtyDays: true,
    sevenDays: true,
    oneDay: true
  });
  const [overdueAlerts, setOverdueAlerts] = useState(true);
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: false,
    whatsapp: true
  });

  // Security Settings State
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const colorOptions = [
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Green", value: "green", color: "bg-green-500" },
    { name: "Orange", value: "orange", color: "bg-orange-500" },
    { name: "Purple", value: "purple", color: "bg-purple-500" },
    { name: "Red", value: "red", color: "bg-red-500" },
    { name: "Teal", value: "teal", color: "bg-teal-500" }
  ];

  const timezoneOptions = [
    { label: "Asia/Dhaka (GMT+6)", value: "Asia/Dhaka" },
    { label: "Asia/Kolkata (GMT+5:30)", value: "Asia/Kolkata" },
    { label: "UTC (GMT+0)", value: "UTC" },
    { label: "America/New_York (GMT-5)", value: "America/New_York" },
    { label: "Europe/London (GMT+0)", value: "Europe/London" }
  ];

  const handleSaveSettings = () => {
    console.log("Saving settings...");
    // In real app, save to backend/localStorage
  };

  const handleResetToDefaults = () => {
    console.log("Resetting to defaults...");
    // Reset all settings to default values
  };

  const handleExportSettings = () => {
    const settings = {
      general: { systemName, defaultCurrency, defaultLanguage, timezone },
      appearance: { themeMode, primaryColor, secondaryColor },
      layout: { dragDropEnabled, pinnedSections },
      notifications: { expiryReminders, overdueAlerts, notificationChannels },
      security: { sessionTimeout, twoFactorEnabled }
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domainhub-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          console.log("Importing settings:", settings);
          // Apply imported settings
        } catch (error) {
          console.error("Invalid settings file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Customize your DomainHub experience and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleResetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <LayoutIcon className="h-4 w-4" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure basic system preferences and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      placeholder="DomainHub"
                    />
                    <p className="text-sm text-muted-foreground">
                      This name appears in the header and reports
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="BDT">BDT (৳) - Bangladeshi Taka</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Primary currency for reports and payments
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Interface language preference
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Used for expiry reminders and scheduling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paintbrush className="h-5 w-5" />
                      Theme Mode
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred theme appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-colors",
                            themeMode === "light" && "border-primary bg-primary/5"
                          )}
                          onClick={() => setThemeMode("light")}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Sun className="h-6 w-6" />
                            <span className="text-sm font-medium">Light</span>
                          </div>
                        </div>
                        
                        <div 
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-colors",
                            themeMode === "dark" && "border-primary bg-primary/5"
                          )}
                          onClick={() => setThemeMode("dark")}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Moon className="h-6 w-6" />
                            <span className="text-sm font-medium">Dark</span>
                          </div>
                        </div>
                        
                        <div 
                          className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-colors",
                            themeMode === "auto" && "border-primary bg-primary/5"
                          )}
                          onClick={() => setThemeMode("auto")}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Monitor className="h-6 w-6" />
                            <span className="text-sm font-medium">Auto</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Color Theme
                    </CardTitle>
                    <CardDescription>
                      Customize your interface colors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Primary Color</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {colorOptions.map((color) => (
                            <div
                              key={color.value}
                              className={cn(
                                "p-3 border rounded-lg cursor-pointer transition-colors",
                                primaryColor === color.value && "border-primary bg-primary/5"
                              )}
                              onClick={() => setPrimaryColor(color.value)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("w-4 h-4 rounded", color.color)} />
                                <span className="text-sm">{color.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Secondary Color</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {colorOptions.map((color) => (
                            <div
                              key={color.value}
                              className={cn(
                                "p-3 border rounded-lg cursor-pointer transition-colors",
                                secondaryColor === color.value && "border-primary bg-primary/5"
                              )}
                              onClick={() => setSecondaryColor(color.value)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("w-4 h-4 rounded", color.color)} />
                                <span className="text-sm">{color.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => setShowPreview(!showPreview)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? "Hide Preview" : "Show Preview"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview Panel */}
              {showPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                      See how your theme changes will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Sample Dashboard</h3>
                        <Badge>Preview</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-primary/10 border-l-4 border-l-primary rounded">
                          <div className="text-sm text-muted-foreground">Total Clients</div>
                          <div className="text-xl font-bold text-primary">25</div>
                        </div>
                        <div className="p-3 bg-secondary/10 border-l-4 border-l-secondary rounded">
                          <div className="text-sm text-muted-foreground">Revenue</div>
                          <div className="text-xl font-bold">$12,450</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Primary Button
                        </Button>
                        <Button size="sm" variant="outline">
                          Secondary Button
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Layout Customization */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Move className="h-5 w-5" />
                  Dashboard Layout
                </CardTitle>
                <CardDescription>
                  Customize your dashboard layout and widgets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Drag & Drop</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow rearranging dashboard sections
                    </p>
                  </div>
                  <Switch
                    checked={dragDropEnabled}
                    onCheckedChange={setDragDropEnabled}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Dashboard Sections</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose which sections appear on your dashboard
                  </p>
                  
                  <div className="space-y-3">
                    {Object.entries(pinnedSections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                            {key === 'summaryCards' && <LayoutIcon className="h-4 w-4" />}
                            {key === 'revenueChart' && <TrendingUp className="h-4 w-4" />}
                            {key === 'expiryCalendar' && <Calendar className="h-4 w-4" />}
                            {key === 'upcomingExpiries' && <Clock className="h-4 w-4" />}
                            {key === 'recentPayments' && <CreditCard className="h-4 w-4" />}
                            {key === 'notifications' && <Bell className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {key === 'summaryCards' && 'Top statistics cards'}
                              {key === 'revenueChart' && 'Monthly revenue chart'}
                              {key === 'expiryCalendar' && 'Mini calendar widget'}
                              {key === 'upcomingExpiries' && 'Expiring services list'}
                              {key === 'recentPayments' && 'Latest payments table'}
                              {key === 'notifications' && 'Alerts and notifications'}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setPinnedSections(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Layout
                  </Button>
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Save as Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Expiry Reminders
                  </CardTitle>
                  <CardDescription>
                    Configure when to send expiration alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Enable Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send automatic expiry notifications
                      </p>
                    </div>
                    <Switch
                      checked={expiryReminders.enabled}
                      onCheckedChange={(checked) => 
                        setExpiryReminders(prev => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>

                  {expiryReminders.enabled && (
                    <div className="space-y-3 pl-4 border-l-2 border-muted">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">30 days before expiry</Label>
                        <Switch
                          checked={expiryReminders.thirtyDays}
                          onCheckedChange={(checked) => 
                            setExpiryReminders(prev => ({ ...prev, thirtyDays: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">7 days before expiry</Label>
                        <Switch
                          checked={expiryReminders.sevenDays}
                          onCheckedChange={(checked) => 
                            setExpiryReminders(prev => ({ ...prev, sevenDays: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">1 day before expiry</Label>
                        <Switch
                          checked={expiryReminders.oneDay}
                          onCheckedChange={(checked) => 
                            setExpiryReminders(prev => ({ ...prev, oneDay: checked }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Overdue Payment Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when payments are overdue
                      </p>
                    </div>
                    <Switch
                      checked={overdueAlerts}
                      onCheckedChange={setOverdueAlerts}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Choose how to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-500" />
                        <div>
                          <Label className="text-sm font-medium">Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive alerts via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationChannels.email}
                        onCheckedChange={(checked) => 
                          setNotificationChannels(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-500" />
                        <div>
                          <Label className="text-sm font-medium">SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive alerts via SMS
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationChannels.sms}
                        onCheckedChange={(checked) => 
                          setNotificationChannels(prev => ({ ...prev, sms: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div>
                          <Label className="text-sm font-medium">WhatsApp Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive alerts via WhatsApp
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationChannels.whatsapp}
                        onCheckedChange={(checked) => 
                          setNotificationChannels(prev => ({ ...prev, whatsapp: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup & Restore */}
          <TabsContent value="backup" className="space-y-6">
            {/* Database Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
                <CardDescription>
                  Advanced database operations, backups, and data export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Database Features</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full database backup & restore</li>
                    <li>• Data export (JSON, CSV, SQL)</li>
                    <li>• Table statistics and monitoring</li>
                    <li>• Connection status and health</li>
                    <li>• Backup history management</li>
                  </ul>
                </div>
                <Button asChild className="w-full">
                  <Link to="/database">
                    <Database className="h-4 w-4 mr-2" />
                    Open Database Manager
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Settings
                  </CardTitle>
                  <CardDescription>
                    Download your current settings as a backup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Backup Contents</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• General settings and preferences</li>
                      <li>• Appearance and theme configuration</li>
                      <li>• Dashboard layout customization</li>
                      <li>• Notification preferences</li>
                      <li>• Security settings (excluding passwords)</li>
                    </ul>
                  </div>
                  <Button onClick={handleExportSettings} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Settings
                  </CardTitle>
                  <CardDescription>
                    Restore settings from a backup file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Warning</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Importing settings will overwrite your current configuration. 
                      Export your current settings first as a backup.
                    </p>
                  </div>
                  
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                      id="import-settings"
                    />
                    <label
                      htmlFor="import-settings"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium">Upload Settings File</span>
                      <span className="text-xs text-muted-foreground">JSON files only</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Reset to Defaults
                </CardTitle>
                <CardDescription>
                  Restore all settings to their default values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      This will reset all your customizations and preferences to the original defaults.
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset to Defaults</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reset all settings to their default values? 
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button variant="destructive" onClick={handleResetToDefaults}>
                          Reset Settings
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password & Authentication
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>

                    {twoFactorEnabled && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">2FA Enabled</span>
                        </div>
                        <p className="text-sm text-green-700 mb-3">
                          Your account is protected with two-factor authentication.
                        </p>
                        <Button size="sm" variant="outline">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Manage 2FA Settings
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Session Management
                  </CardTitle>
                  <CardDescription>
                    Control session timeout and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Auto Logout (minutes)</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after inactivity
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Active Sessions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="text-sm font-medium">Current Session</div>
                          <div className="text-xs text-muted-foreground">Chrome on Windows</div>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
