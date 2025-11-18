import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Shield,
  Smartphone,
  Key,
  Globe,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fingerprint,
  History,
  MapPin,
  Monitor,
  Moon,
  Sun,
  Loader2,
  Github,
  Chrome,
  Zap,
  UserCheck,
  Settings,
  LogIn,
  RefreshCw,
  Send,
  Copy,
  Check,
  Info,
  ExternalLink,
  Timer,
  ShieldCheck,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginAttempt {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed" | "blocked";
  username: string;
  location?: string;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
    captcha: ""
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<"credentials" | "2fa" | "success">("credentials");
  
  // Security State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Admin Features
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  
  // Mock Data
  const userRoles: UserRole[] = [
    {
      id: "super_admin",
      name: "Super Admin",
      permissions: ["full_access", "user_management", "system_settings", "audit_logs"],
      description: "Complete system access and administration"
    },
    {
      id: "admin",
      name: "Admin",
      permissions: ["client_management", "domain_management", "hosting_management", "payment_view"],
      description: "Manage clients, domains, and hosting services"
    },
    {
      id: "finance",
      name: "Finance",
      permissions: ["payment_management", "invoice_management", "financial_reports"],
      description: "Payment and financial operations only"
    }
  ];

  const recentLoginAttempts: LoginAttempt[] = [
    {
      id: "1",
      timestamp: "2024-01-30 10:30:15",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      status: "success",
      username: "admin@domainhub.com",
      location: "Dhaka, Bangladesh"
    },
    {
      id: "2",
      timestamp: "2024-01-30 09:15:42",
      ipAddress: "203.112.58.41",
      userAgent: "Firefox 121.0.0.0",
      status: "failed",
      username: "admin@domainhub.com",
      location: "Unknown"
    },
    {
      id: "3",
      timestamp: "2024-01-29 18:45:33",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      status: "success",
      username: "admin@domainhub.com",
      location: "Dhaka, Bangladesh"
    }
  ];

  // Generate CAPTCHA
  const [captchaCode, setCaptchaCode] = useState("");
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (lockoutTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockoutTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isAccountLocked && lockoutTimeRemaining === 0) {
      setIsAccountLocked(false);
      setFailedAttempts(0);
    }
  }, [lockoutTimeRemaining, isAccountLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (isAccountLocked) {
      setError(`Account locked. Try again in ${lockoutTimeRemaining} seconds.`);
      return;
    }

    // Validate CAPTCHA
    if (formData.captcha.toUpperCase() !== captchaCode) {
      setError("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      setFormData(prev => ({ ...prev, captcha: "" }));
      return;
    }

    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (formData.username === "admin@domainhub.com" && formData.password === "admin123") {
        // Check if 2FA is enabled
        const has2FA = true; // In real app, check from user settings
        
        if (has2FA) {
          setLoginStep("2fa");
          setSuccess("Please enter your 2FA code to complete login.");
        } else {
          handleSuccessfulLogin();
        }
      } else {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        if (newFailedAttempts >= 5) {
          setIsAccountLocked(true);
          setLockoutTimeRemaining(300); // 5 minutes lockout
          setError("Too many failed attempts. Account locked for 5 minutes.");
        } else {
          setError(`Invalid credentials. ${5 - newFailedAttempts} attempts remaining.`);
        }
        generateCaptcha();
        setFormData(prev => ({ ...prev, captcha: "" }));
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleTwoFactorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (twoFactorCode === "123456") { // Mock 2FA code
      handleSuccessfulLogin();
    } else {
      setError("Invalid 2FA code. Please try again.");
      setTwoFactorCode("");
    }
  };

  const handleSuccessfulLogin = () => {
    setLoginStep("success");
    setSuccess("Login successful! Redirecting to dashboard...");
    
    // Store auth state (in real app, use proper auth management)
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRole", selectedRole);
    localStorage.setItem("username", formData.username);
    
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    setError("");
    
    // Simulate OAuth flow
    setTimeout(() => {
      setSuccess(`${provider} authentication successful!`);
      handleSuccessfulLogin();
    }, 2000);
  };

  const handleForgotPassword = () => {
    const email = formData.username || "admin@domainhub.com";
    setSuccess(`Password reset link sent to ${email}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "blocked": return <Shield className="h-4 w-4 text-warning" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Server className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">DomainHub</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex justify-center gap-1">
            <Button
              variant={theme === "light" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === "system" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {loginStep === "credentials" && "Admin Login"}
              {loginStep === "2fa" && "Two-Factor Authentication"}
              {loginStep === "success" && "Login Successful"}
            </CardTitle>
            <CardDescription>
              {loginStep === "credentials" && "Enter your credentials to access the admin panel"}
              {loginStep === "2fa" && "Enter your 2FA code to complete login"}
              {loginStep === "success" && "Redirecting to your dashboard..."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-success/50 text-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Lockout Warning */}
            {isAccountLocked && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked. Time remaining: {Math.floor(lockoutTimeRemaining / 60)}:
                  {(lockoutTimeRemaining % 60).toString().padStart(2, '0')}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Credentials */}
            {loginStep === "credentials" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role">Login As</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Username/Email */}
                <div className="space-y-2">
                  <Label htmlFor="username">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="email"
                      placeholder="admin@domainhub.com"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-9"
                      required
                      disabled={isAccountLocked}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-9 pr-9"
                      required
                      disabled={isAccountLocked}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isAccountLocked}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* CAPTCHA */}
                <div className="space-y-2">
                  <Label htmlFor="captcha">Security Code</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="captcha"
                        placeholder="Enter CAPTCHA"
                        value={formData.captcha}
                        onChange={(e) => setFormData(prev => ({ ...prev, captcha: e.target.value }))}
                        required
                        disabled={isAccountLocked}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 bg-muted border rounded font-mono text-lg tracking-wider">
                        {captchaCode}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCaptcha}
                        disabled={isAccountLocked}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
                    disabled={isAccountLocked}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me for 30 days
                  </Label>
                </div>

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || isAccountLocked}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login to Admin Panel
                    </>
                  )}
                </Button>

                {/* Demo Credentials */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Demo Credentials</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Email: admin@domainhub.com</div>
                    <div>Password: admin123</div>
                    <div>2FA Code: 123456</div>
                  </div>
                </div>
              </form>
            )}

            {/* Step 2: Two-Factor Authentication */}
            {loginStep === "2fa" && (
              <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Authentication Code</Label>
                  <Input
                    id="twoFactorCode"
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify & Login
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLoginStep("credentials")}
                >
                  Back to Login
                </Button>
              </form>
            )}

            {/* Step 3: Success */}
            {loginStep === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Welcome Back!</h3>
                  <p className="text-muted-foreground">
                    Login successful. Redirecting to your dashboard...
                  </p>
                </div>
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </div>
            )}

            {/* OAuth Login Options */}
            {loginStep === "credentials" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthLogin("Google")}
                    disabled={isLoading || isAccountLocked}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleOAuthLogin("Microsoft")}
                    disabled={isLoading || isAccountLocked}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Microsoft
                  </Button>
                </div>
              </>
            )}

            {/* Footer Links */}
            {loginStep === "credentials" && (
              <div className="text-center space-y-2">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={handleForgotPassword}
                >
                  Forgot your password?
                </Button>
                
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <Dialog open={showAuditLogs} onOpenChange={setShowAuditLogs}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-xs h-auto p-0">
                        <History className="mr-1 h-3 w-3" />
                        Login History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Recent Login Attempts</DialogTitle>
                        <DialogDescription>
                          Security audit log for admin account access
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
                        {recentLoginAttempts.map((attempt) => (
                          <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(attempt.status)}
                              <div>
                                <div className="text-sm font-medium">{attempt.timestamp}</div>
                                <div className="text-xs text-muted-foreground">
                                  {attempt.ipAddress} • {attempt.userAgent}
                                </div>
                              </div>
                            </div>
                            <Badge variant={
                              attempt.status === "success" ? "default" :
                              attempt.status === "failed" ? "destructive" : "secondary"
                            }>
                              {attempt.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showSecuritySettings} onOpenChange={setShowSecuritySettings}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-xs h-auto p-0">
                        <Settings className="mr-1 h-3 w-3" />
                        Security
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Security Information</DialogTitle>
                        <DialogDescription>
                          Current security settings and protection status
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-success" />
                            <div>
                              <div className="font-medium">Two-Factor Authentication</div>
                              <div className="text-sm text-muted-foreground">Enabled via Google Authenticator</div>
                            </div>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Timer className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium">Session Timeout</div>
                              <div className="text-sm text-muted-foreground">Auto logout after 15 minutes</div>
                            </div>
                          </div>
                          <Badge variant="outline">15 min</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-warning" />
                            <div>
                              <div className="font-medium">IP Restrictions</div>
                              <div className="text-sm text-muted-foreground">Whitelist mode active</div>
                            </div>
                          </div>
                          <Badge variant="secondary">Protected</Badge>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>All activity monitored</span>
            </div>
          </div>
          <p className="mt-2">
            © 2024 DomainHub. Unauthorized access is prohibited and will be prosecuted.
          </p>
        </div>
      </div>
    </div>
  );
}
