import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Send,
  Eye,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Receipt,
  Printer
} from "lucide-react";

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  serviceName: string;
  serviceType: string;
  amount: number;
  currency: string;
  dueDate: string;
  issueDate: string;
  notes?: string;
  taxRate?: number;
  discountAmount?: number;
}

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<InvoiceData>;
  onInvoiceGenerated?: (invoice: InvoiceData) => void;
}

export function InvoiceGenerator({ isOpen, onClose, initialData, onInvoiceGenerated }: InvoiceGeneratorProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: initialData?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
    clientName: initialData?.clientName || "",
    clientEmail: initialData?.clientEmail || "",
    clientAddress: initialData?.clientAddress || "",
    serviceName: initialData?.serviceName || "",
    serviceType: initialData?.serviceType || "domain",
    amount: initialData?.amount || 0,
    currency: initialData?.currency || "USD",
    dueDate: initialData?.dueDate || "",
    issueDate: new Date().toISOString().split('T')[0],
    notes: initialData?.notes || "",
    taxRate: 0,
    discountAmount: 0
  });

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const calculateTotal = () => {
    const subtotal = invoiceData.amount - (invoiceData.discountAmount || 0);
    const tax = subtotal * (invoiceData.taxRate || 0) / 100;
    return subtotal + tax;
  };

  const handleGenerateInvoice = () => {
    if (onInvoiceGenerated) {
      onInvoiceGenerated(invoiceData);
    }
    onClose();
  };

  const handleDownloadPDF = () => {
    // Implementation for PDF download
    console.log('Downloading PDF for invoice:', invoiceData.invoiceNumber);
  };

  const handleSendEmail = () => {
    // Implementation for sending invoice via email
    console.log('Sending invoice via email to:', invoiceData.clientEmail);
  };

  const InvoicePreview = () => (
    <div className="bg-white p-8 rounded-lg border max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
          <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-900">Your Company Name</h2>
          <p className="text-gray-600">123 Business Street</p>
          <p className="text-gray-600">City, State 12345</p>
          <p className="text-gray-600">contact@company.com</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-medium">{invoiceData.clientName}</p>
          <p className="text-gray-600">{invoiceData.clientEmail}</p>
          <p className="text-gray-600 whitespace-pre-line">{invoiceData.clientAddress}</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <p className="text-gray-600">Issue Date:</p>
          <p className="font-medium">{invoiceData.issueDate}</p>
        </div>
        <div>
          <p className="text-gray-600">Due Date:</p>
          <p className="font-medium">{invoiceData.dueDate}</p>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-left">Service</th>
              <th className="border border-gray-300 p-3 text-left">Type</th>
              <th className="border border-gray-300 p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-3">{invoiceData.serviceName}</td>
              <td className="border border-gray-300 p-3 capitalize">{invoiceData.serviceType}</td>
              <td className="border border-gray-300 p-3 text-right">
                {invoiceData.currency === "USD" ? "$" : "৳"}{invoiceData.amount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>{invoiceData.currency === "USD" ? "$" : "৳"}{invoiceData.amount.toLocaleString()}</span>
          </div>
          {invoiceData.discountAmount > 0 && (
            <div className="flex justify-between py-2 text-green-600">
              <span>Discount:</span>
              <span>-{invoiceData.currency === "USD" ? "$" : "৳"}{invoiceData.discountAmount.toLocaleString()}</span>
            </div>
          )}
          {invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-2">
              <span>Tax ({invoiceData.taxRate}%):</span>
              <span>
                {invoiceData.currency === "USD" ? "$" : "৳"}
                {((invoiceData.amount - (invoiceData.discountAmount || 0)) * (invoiceData.taxRate || 0) / 100).toLocaleString()}
              </span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Total:</span>
            <span>{invoiceData.currency === "USD" ? "$" : "৳"}{calculateTotal().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoiceData.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes:</h3>
          <p className="text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm border-t pt-4">
        <p>Thank you for your business!</p>
        <p>Payment is due within 30 days of the invoice date.</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isPreviewMode ? "Invoice Preview" : "Generate Invoice"}
          </DialogTitle>
          <DialogDescription>
            {isPreviewMode ? "Review and finalize your invoice" : "Create a professional invoice for client services"}
          </DialogDescription>
        </DialogHeader>

        {!isPreviewMode ? (
          <div className="space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={invoiceData.issueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={invoiceData.clientAddress}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Service Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input
                      id="serviceName"
                      value={invoiceData.serviceName}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, serviceName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select 
                      value={invoiceData.serviceType} 
                      onValueChange={(value) => setInvoiceData(prev => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domain">Domain</SelectItem>
                        <SelectItem value="hosting">Hosting</SelectItem>
                        <SelectItem value="ssl">SSL Certificate</SelectItem>
                        <SelectItem value="development">Website Development</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={invoiceData.amount}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={invoiceData.currency} 
                      onValueChange={(value) => setInvoiceData(prev => ({ ...prev, currency: value }))}
                    >
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
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={invoiceData.taxRate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">Discount Amount</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      step="0.01"
                      value={invoiceData.discountAmount}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Additional notes or payment instructions..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Total Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Total Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>
                      {invoiceData.currency === "USD" ? "$" : "৳"}{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleGenerateInvoice}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <InvoicePreview />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                Back to Edit
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button onClick={handleGenerateInvoice}>
                <FileText className="h-4 w-4 mr-2" />
                Generate & Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
