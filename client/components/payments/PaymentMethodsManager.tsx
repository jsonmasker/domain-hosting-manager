import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'card' | 'mobile_banking' | 'digital_wallet' | 'crypto';
  provider: string;
  isActive: boolean;
  processingFee: number;
  currency: string;
  accountDetails?: string;
  description?: string;
}

interface PaymentMethodsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const samplePaymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    name: "Credit/Debit Cards",
    type: "card",
    provider: "Stripe",
    isActive: true,
    processingFee: 2.9,
    currency: "USD",
    description: "Accept Visa, MasterCard, American Express"
  },
  {
    id: "pm2", 
    name: "Bank Transfer",
    type: "bank_transfer",
    provider: "Direct",
    isActive: true,
    processingFee: 0,
    currency: "USD",
    accountDetails: "Account: 123456789, Routing: 987654321",
    description: "Direct bank wire transfer"
  },
  {
    id: "pm3",
    name: "bKash",
    type: "mobile_banking",
    provider: "bKash Limited",
    isActive: true,
    processingFee: 1.85,
    currency: "BDT",
    accountDetails: "+880-1234-567890",
    description: "Mobile financial service in Bangladesh"
  },
  {
    id: "pm4",
    name: "Nagad",
    type: "mobile_banking", 
    provider: "Nagad",
    isActive: true,
    processingFee: 1.99,
    currency: "BDT",
    accountDetails: "+880-1987-654321",
    description: "Digital financial service"
  },
  {
    id: "pm5",
    name: "PayPal",
    type: "digital_wallet",
    provider: "PayPal Inc",
    isActive: true,
    processingFee: 3.49,
    currency: "USD",
    description: "International digital payments"
  },
  {
    id: "pm6",
    name: "Cash Payment",
    type: "bank_transfer",
    provider: "Manual",
    isActive: true,
    processingFee: 0,
    currency: "USD",
    description: "In-person cash payments"
  }
];

export function PaymentMethodsManager({ isOpen, onClose }: PaymentMethodsManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(samplePaymentMethods);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return CreditCard;
      case 'bank_transfer': return Building2;
      case 'mobile_banking': return Smartphone;
      case 'digital_wallet': return Wallet;
      default: return CreditCard;
    }
  };

  const getMethodTypeName = (type: string) => {
    switch (type) {
      case 'card': return 'Credit/Debit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'mobile_banking': return 'Mobile Banking';
      case 'digital_wallet': return 'Digital Wallet';
      case 'crypto': return 'Cryptocurrency';
      default: return 'Other';
    }
  };

  const handleToggleActive = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, isActive: !method.isActive } : method
      )
    );
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const activeMethodsCount = paymentMethods.filter(m => m.isActive).length;
  const totalTransactionFees = paymentMethods
    .filter(m => m.isActive)
    .reduce((sum, m) => sum + m.processingFee, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods Management
          </DialogTitle>
          <DialogDescription>
            Configure and manage available payment gateways and methods for your clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Methods</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeMethodsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Payment options available
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Methods</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentMethods.length}</div>
                <p className="text-xs text-muted-foreground">
                  Configured payment methods
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Fees</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeMethodsCount > 0 ? (totalTransactionFees / activeMethodsCount).toFixed(2) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average processing fee
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Payment Methods</h3>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          {/* Payment Methods Table */}
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Processing Fee</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method) => {
                      const MethodIcon = getMethodIcon(method.type);
                      
                      return (
                        <TableRow key={method.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <MethodIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{method.name}</p>
                                {method.description && (
                                  <p className="text-sm text-muted-foreground">{method.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getMethodTypeName(method.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{method.provider}</p>
                            {method.accountDetails && (
                              <p className="text-sm text-muted-foreground">{method.accountDetails}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{method.processingFee}%</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{method.currency}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {method.isActive ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className={method.isActive ? "text-success" : "text-muted-foreground"}>
                                {method.isActive ? "Active" : "Inactive"}
                              </span>
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
                                <DropdownMenuItem onClick={() => setEditingMethod(method)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Method
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(method.id)}>
                                  {method.isActive ? (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteMethod(method.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Method
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

          {/* Payment Method Categories */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traditional Methods</CardTitle>
                <CardDescription>Bank transfers and card payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentMethods
                    .filter(m => ['bank_transfer', 'card'].includes(m.type))
                    .map(method => (
                      <div key={method.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{method.name}</span>
                        <Badge variant={method.isActive ? "default" : "secondary"}>
                          {method.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Digital Methods</CardTitle>
                <CardDescription>Mobile banking and digital wallets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentMethods
                    .filter(m => ['mobile_banking', 'digital_wallet', 'crypto'].includes(m.type))
                    .map(method => (
                      <div key={method.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{method.name}</span>
                        <Badge variant={method.isActive ? "default" : "secondary"}>
                          {method.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
