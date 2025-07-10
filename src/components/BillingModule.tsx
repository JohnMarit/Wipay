
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Receipt, DollarSign, Clock, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BillingModuleProps {
  language: string;
}

const BillingModule = ({ language }: BillingModuleProps) => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [billingAmount, setBillingAmount] = useState("");

  const translations = {
    en: {
      title: "Billing Management",
      description: "Generate invoices and manage billing cycles",
      generateInvoice: "Generate Invoice",
      monthlyBilling: "Monthly Billing",
      invoiceHistory: "Invoice History",
      pendingBills: "Pending Bills",
      customer: "Customer",
      amount: "Amount (SSP)",
      dueDate: "Due Date",
      status: "Status",
      actions: "Actions",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
      partial: "Partial",
      viewInvoice: "View Invoice",
      sendReminder: "Send Reminder",
      markPaid: "Mark as Paid",
      selectCustomer: "Select Customer",
      enterAmount: "Enter Amount",
      generate: "Generate",
      cancel: "Cancel",
      invoiceGenerated: "Invoice generated successfully",
      totalRevenue: "Total Revenue",
      pendingAmount: "Pending Amount",
      overdueAmount: "Overdue Amount",
      thisMonth: "This Month"
    },
    ar: {
      title: "إدارة الفواتير",
      description: "إنشاء الفواتير وإدارة دورات الفوترة",
      generateInvoice: "إنشاء فاتورة",
      monthlyBilling: "الفوترة الشهرية",
      invoiceHistory: "تاريخ الفواتير",
      pendingBills: "الفواتير المعلقة",
      customer: "العميل",
      amount: "المبلغ (جنيه جنوب سوداني)",
      dueDate: "تاريخ الاستحقاق",
      status: "الحالة",
      actions: "الإجراءات",
      paid: "مدفوع",
      pending: "معلق",
      overdue: "متأخر",
      partial: "جزئي",
      viewInvoice: "عرض الفاتورة",
      sendReminder: "إرسال تذكير",
      markPaid: "تمييز كمدفوع",
      selectCustomer: "اختر العميل",
      enterAmount: "أدخل المبلغ",
      generate: "إنشاء",
      cancel: "إلغاء",
      invoiceGenerated: "تم إنشاء الفاتورة بنجاح",
      totalRevenue: "إجمالي الإيرادات",
      pendingAmount: "المبلغ المعلق",
      overdueAmount: "المبلغ المتأخر",
      thisMonth: "هذا الشهر"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Sample billing data
  const billingStats = {
    totalRevenue: 145600,
    pendingAmount: 28400,
    overdueAmount: 12800,
    thisMonthBills: 67
  };

  const [invoices, setInvoices] = useState([
    {
      id: "INV-001",
      customer: "Ahmed Hassan Mohamed",
      amount: 150,
      dueDate: "2024-01-31",
      status: "paid",
      generatedDate: "2024-01-01"
    },
    {
      id: "INV-002",
      customer: "Mary John Deng",
      amount: 100,
      dueDate: "2024-01-31",
      status: "pending",
      generatedDate: "2024-01-01"
    },
    {
      id: "INV-003",
      customer: "Peter Garang Mabior",
      amount: 200,
      dueDate: "2024-01-15",
      status: "overdue",
      generatedDate: "2023-12-15"
    },
    {
      id: "INV-004",
      customer: "Sarah Ali Khamis",
      amount: 120,
      dueDate: "2024-02-15",
      status: "partial",
      generatedDate: "2024-01-15"
    }
  ]);

  const customers = [
    "Ahmed Hassan Mohamed",
    "Mary John Deng",
    "Peter Garang Mabior",
    "Sarah Ali Khamis",
    "John Maker Deng"
  ];

  const handleGenerateInvoice = () => {
    if (selectedCustomer && billingAmount) {
      const newInvoice = {
        id: `INV-${(invoices.length + 1).toString().padStart(3, '0')}`,
        customer: selectedCustomer,
        amount: parseInt(billingAmount),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "pending" as const,
        generatedDate: new Date().toISOString().split('T')[0]
      };
      setInvoices([...invoices, newInvoice]);
      setSelectedCustomer("");
      setBillingAmount("");
      toast({
        title: t.invoiceGenerated,
        description: `Invoice ${newInvoice.id} generated for ${selectedCustomer}`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: t.paid, variant: "default" as const },
      pending: { label: t.pending, variant: "secondary" as const },
      overdue: { label: t.overdue, variant: "destructive" as const },
      partial: { label: t.partial, variant: "outline" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Billing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.totalRevenue.toLocaleString()} SSP</div>
            <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pendingAmount}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.pendingAmount.toLocaleString()} SSP</div>
            <p className="text-xs text-muted-foreground">{billingStats.thisMonthBills} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.overdueAmount}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.overdueAmount.toLocaleString()} SSP</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.monthlyBilling}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Receipt className="h-4 w-4 mr-2" />
                  {t.generateInvoice}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.generateInvoice}</DialogTitle>
                  <DialogDescription>
                    Create a new invoice for a customer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer">{t.customer}</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCustomer} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">{t.amount}</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={billingAmount}
                      onChange={(e) => setBillingAmount(e.target.value)}
                      placeholder={t.enterAmount}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">{t.cancel}</Button>
                    <Button onClick={handleGenerateInvoice}>{t.generate}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.invoiceHistory}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.amount}</TableHead>
                  <TableHead>{t.dueDate}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.amount.toLocaleString()} SSP</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          {t.viewInvoice}
                        </Button>
                        {invoice.status !== 'paid' && (
                          <>
                            <Button variant="outline" size="sm">
                              {t.sendReminder}
                            </Button>
                            <Button variant="outline" size="sm">
                              {t.markPaid}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingModule;
