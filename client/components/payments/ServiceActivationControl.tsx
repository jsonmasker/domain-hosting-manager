import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Note: Switch component not available in current UI library, using regular checkbox for now
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  ShieldCheck,
  Activity,
  Clock,
  Globe,
  Server,
  CreditCard,
  Play,
  Pause,
  AlertCircle,
  Settings,
  RefreshCw
} from "lucide-react";
import { dataService } from "@/services/dataService";
import type { Domain, Hosting, Payment } from "@shared/types/database";

interface ServiceStatus {
  id: string;
  name: string;
  type: 'domain' | 'hosting';
  clientName: string;
  paymentStatus: 'paid' | 'unpaid' | 'partially_paid';
  serviceStatus: 'active' | 'suspended' | 'pending' | 'expired';
  canActivate: boolean;
  expirationDate: string;
  lastPaymentDate?: string;
  daysOverdue?: number;
}

interface ServiceActivationControlProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceActivationControl({ isOpen, onClose }: ServiceActivationControlProps) {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoActivationEnabled, setAutoActivationEnabled] = useState(true);
  const [autoSuspensionEnabled, setAutoSuspensionEnabled] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadServicesData();
    }
  }, [isOpen]);

  const loadServicesData = async () => {
    try {
      setIsLoading(true);
      await dataService.initialize();

      const [domainsResponse, hostingResponse, paymentsResponse] = await Promise.all([
        dataService.getDomains(),
        dataService.getHosting(),
        dataService.getPayments()
      ]);

      const serviceStatuses: ServiceStatus[] = [];

      // Process domains
      if (domainsResponse.success && domainsResponse.data) {
        for (const domain of domainsResponse.data) {
          const relatedPayments = paymentsResponse.data?.filter(
            p => p.serviceId === domain.id && p.serviceType === 'domain'
          ) || [];
          
          const latestPayment = relatedPayments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          const paymentStatus = latestPayment?.paymentStatus || 'unpaid';
          const canActivate = paymentStatus === 'paid';
          
          serviceStatuses.push({
            id: domain.id,
            name: domain.name,
            type: 'domain',
            clientName: domain.customerName || domain.client?.fullName || 'Unknown Client',
            paymentStatus: paymentStatus as any,
            serviceStatus: domain.status as any,
            canActivate,
            expirationDate: domain.expirationDate,
            lastPaymentDate: latestPayment?.paymentDate,
            daysOverdue: latestPayment?.daysOverdue
          });
        }
      }

      // Process hosting
      if (hostingResponse.success && hostingResponse.data) {
        for (const hosting of hostingResponse.data) {
          const relatedPayments = paymentsResponse.data?.filter(
            p => p.serviceId === hosting.id && p.serviceType === 'hosting'
          ) || [];
          
          const latestPayment = relatedPayments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

          const paymentStatus = latestPayment?.paymentStatus || 'unpaid';
          const canActivate = paymentStatus === 'paid';
          
          serviceStatuses.push({
            id: hosting.id,
            name: hosting.packageName,
            type: 'hosting',
            clientName: hosting.client?.fullName || 'Unknown Client',
            paymentStatus: paymentStatus as any,
            serviceStatus: hosting.status as any,
            canActivate,
            expirationDate: hosting.expirationDate,
            lastPaymentDate: latestPayment?.paymentDate,
            daysOverdue: latestPayment?.daysOverdue
          });
        }
      }

      setServices(serviceStatuses);
    } catch (error) {
      console.error('Failed to load services data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    if (!service.canActivate) {
      alert('Service cannot be activated. Payment is required.');
      return;
    }

    try {
      // Update service status to active
      if (service.type === 'domain') {
        await dataService.updateDomain(serviceId, { status: 'active' });
      } else {
        await dataService.updateHosting(serviceId, { status: 'active' });
      }

      // Refresh data
      await loadServicesData();
    } catch (error) {
      console.error('Failed to activate service:', error);
    }
  };

  const handleSuspendService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    try {
      // Update service status to suspended
      if (service.type === 'domain') {
        await dataService.updateDomain(serviceId, { status: 'suspended' });
      } else {
        await dataService.updateHosting(serviceId, { status: 'suspended' });
      }

      // Refresh data
      await loadServicesData();
    } catch (error) {
      console.error('Failed to suspend service:', error);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'suspend') => {
    for (const serviceId of selectedServices) {
      if (action === 'activate') {
        await handleActivateService(serviceId);
      } else {
        await handleSuspendService(serviceId);
      }
    }
    setSelectedServices([]);
  };

  const getServiceStatusIcon = (status: string, canActivate: boolean) => {
    if (status === 'active' && canActivate) return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === 'suspended') return <Ban className="h-4 w-4 text-destructive" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-warning" />;
    if (status === 'expired') return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case 'unpaid':
        return <Badge className="bg-destructive text-destructive-foreground">Unpaid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-warning text-warning-foreground">Partial</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getServiceIcon = (type: string) => {
    return type === 'domain' ? Globe : Server;
  };

  const unpaidServices = services.filter(s => s.paymentStatus !== 'paid');
  const activeServices = services.filter(s => s.serviceStatus === 'active' && s.canActivate);
  const suspendedServices = services.filter(s => s.serviceStatus === 'suspended');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Service Activation Control
          </DialogTitle>
          <DialogDescription>
            Manage service activation based on payment status and automate suspension for overdue payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Control Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-activation">Auto-Activation on Payment</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically activate services when payment is confirmed
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="auto-activation"
                  checked={autoActivationEnabled}
                  onChange={(e) => setAutoActivationEnabled(e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-suspension">Auto-Suspension for Overdue</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically suspend services when payments are overdue
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="auto-suspension"
                  checked={autoSuspensionEnabled}
                  onChange={(e) => setAutoSuspensionEnabled(e.target.checked)}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{services.length}</div>
                <p className="text-xs text-muted-foreground">
                  Domains & Hosting
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{activeServices.length}</div>
                <p className="text-xs text-muted-foreground">
                  Properly activated
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended Services</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{suspendedServices.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently suspended
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Required</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{unpaidServices.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activation Restrictions Alert */}
          {unpaidServices.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{unpaidServices.length} services</strong> cannot be activated due to unpaid invoices. 
                Payment must be completed before these services can be made active.
              </AlertDescription>
            </Alert>
          )}

          {/* Bulk Actions */}
          {selectedServices.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedServices.length} services selected
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkAction('activate')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Activate Selected
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkAction('suspend')}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Suspend Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Services</CardTitle>
                <Button variant="outline" size="sm" onClick={loadServicesData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices(services.map(s => s.id));
                            } else {
                              setSelectedServices([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Service Status</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Can Activate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            Loading services...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Activity className="h-8 w-8 opacity-50" />
                            <p>No services found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service) => {
                        const ServiceIcon = getServiceIcon(service.type);
                        const isOverdue = service.daysOverdue && service.daysOverdue > 0;
                        
                        return (
                          <TableRow key={service.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedServices.includes(service.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedServices(prev => [...prev, service.id]);
                                  } else {
                                    setSelectedServices(prev => prev.filter(id => id !== service.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-sm text-muted-foreground capitalize">{service.type}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{service.clientName}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPaymentStatusBadge(service.paymentStatus)}
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs">
                                    {service.daysOverdue}d overdue
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getServiceStatusIcon(service.serviceStatus, service.canActivate)}
                                <span className="capitalize">{service.serviceStatus}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{service.expirationDate}</p>
                              {service.lastPaymentDate && (
                                <p className="text-sm text-muted-foreground">
                                  Last paid: {service.lastPaymentDate}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {service.canActivate ? (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                                <span className="text-sm">
                                  {service.canActivate ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {service.serviceStatus !== 'active' && service.canActivate && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleActivateService(service.id)}
                                  >
                                    <Play className="h-3 w-3" />
                                  </Button>
                                )}
                                {service.serviceStatus === 'active' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuspendService(service.id)}
                                  >
                                    <Pause className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
