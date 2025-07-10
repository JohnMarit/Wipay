import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Receipt,
  DollarSign,
  Clock,
  AlertCircle,
  FileText,
  Bell,
  Calculator,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBillingModuleProps {
  language: string;
}

// Invoice interface for type safety
interface Invoice {
  id: string;
  customer: string;
  planType: 'prepaid' | 'postpaid';
  baseAmount: number;
  installationFee: number;
  equipmentFee: number;
  vatAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  generatedDate: string;
  remindersSent: number;
  daysOverdue: number;
}

const EnhancedBillingModule = ({ language }: EnhancedBillingModuleProps) => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [billingAmount, setBillingAmount] = useState('');
  const [taxRate, setTaxRate] = useState('18'); // South Sudan VAT rate
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [includeEquipment, setIncludeEquipment] = useState(false);
  const [autoReminders, setAutoReminders] = useState(true);

  const translations = {
    en: {
      title: 'Enhanced Billing Management',
      description: 'Complete billing system with South Sudan tax compliance',
      generateInvoice: 'Generate Invoice',
      bulkBilling: 'Bulk Monthly Billing',
      automaticReminders: 'Automatic Reminders',
      taxCalculation: 'Tax Calculation',
      invoice: 'Invoice',
      customer: 'Customer',
      planType: 'Plan Type',
      baseAmount: 'Base Amount (SSP)',
      installationFee: 'Installation Fee',
      equipmentFee: 'Equipment Fee',
      subtotal: 'Subtotal',
      vatRate: 'VAT Rate (%)',
      vatAmount: 'VAT Amount',
      totalAmount: 'Total Amount',
      dueDate: 'Due Date',
      status: 'Status',
      actions: 'Actions',
      paid: 'Paid',
      pending: 'Pending',
      overdue: 'Overdue',
      partial: 'Partial',
      prepaid: 'Prepaid',
      postpaid: 'Postpaid',
      viewInvoice: 'View Invoice',
      sendReminder: 'Send SMS Reminder',
      markPaid: 'Mark as Paid',
      suspendService: 'Suspend Service',
      selectCustomer: 'Select Customer',
      enterAmount: 'Enter Amount',
      generate: 'Generate',
      cancel: 'Cancel',
      invoiceGenerated: 'Invoice generated successfully',
      reminderSent: 'SMS reminder sent successfully',
      totalRevenue: 'Total Revenue',
      pendingAmount: 'Pending Amount',
      overdueAmount: 'Overdue Amount',
      thisMonth: 'This Month',
      agingReport: 'Aging Report',
      days030: '0-30 Days',
      days3060: '31-60 Days',
      days6090: '61-90 Days',
      days90plus: '90+ Days',
      sendBulkReminders: 'Send Bulk SMS Reminders',
      automatedSuspension: 'Automated Service Suspension',
      suspensionThreshold: 'Suspension Threshold (Days Overdue)',
      enableAutoSuspension: 'Enable Auto Suspension',
    },
    ar: {
      title: 'إدارة الفواتير المحسنة',
      description: 'نظام فوترة متكامل مع الامتثال الضريبي لجنوب السودان',
      generateInvoice: 'إنشاء فاتورة',
      bulkBilling: 'الفوترة الشهرية المجمعة',
      automaticReminders: 'التذكيرات التلقائية',
      taxCalculation: 'حساب الضرائب',
      invoice: 'فاتورة',
      customer: 'العميل',
      planType: 'نوع الخطة',
      baseAmount: 'المبلغ الأساسي (جنيه جنوب سوداني)',
      installationFee: 'رسوم التركيب',
      equipmentFee: 'رسوم المعدات',
      subtotal: 'المجموع الفرعي',
      vatRate: 'معدل ضريبة القيمة المضافة (%)',
      vatAmount: 'مبلغ ضريبة القيمة المضافة',
      totalAmount: 'المبلغ الإجمالي',
      dueDate: 'تاريخ الاستحقاق',
      status: 'الحالة',
      actions: 'الإجراءات',
      paid: 'مدفوع',
      pending: 'معلق',
      overdue: 'متأخر',
      partial: 'جزئي',
      prepaid: 'مدفوع مسبقاً',
      postpaid: 'مدفوع لاحقاً',
      viewInvoice: 'عرض الفاتورة',
      sendReminder: 'إرسال تذكير رسالة نصية',
      markPaid: 'تمييز كمدفوع',
      suspendService: 'تعليق الخدمة',
      selectCustomer: 'اختر العميل',
      enterAmount: 'أدخل المبلغ',
      generate: 'إنشاء',
      cancel: 'إلغاء',
      invoiceGenerated: 'تم إنشاء الفاتورة بنجاح',
      reminderSent: 'تم إرسال التذكير بنجاح',
      totalRevenue: 'إجمالي الإيرادات',
      pendingAmount: 'المبلغ المعلق',
      overdueAmount: 'المبلغ المتأخر',
      thisMonth: 'هذا الشهر',
      agingReport: 'تقرير التقادم',
      days030: '0-30 يوم',
      days3060: '31-60 يوم',
      days6090: '61-90 يوم',
      days90plus: '90+ يوم',
      sendBulkReminders: 'إرسال تذكيرات جماعية',
      automatedSuspension: 'التعليق التلقائي للخدمة',
      suspensionThreshold: 'عتبة التعليق (أيام التأخير)',
      enableAutoSuspension: 'تمكين التعليق التلقائي',
    },
  };

  const t = translations[language as keyof typeof translations];

  // Enhanced billing stats with aging report
  const billingStats = {
    totalRevenue: 245600,
    pendingAmount: 48400,
    overdueAmount: 22800,
    thisMonthBills: 89,
    aging: {
      days030: 28400,
      days3060: 15200,
      days6090: 8600,
      days90plus: 4200,
    },
  };

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2024-001',
      customer: 'Ahmed Hassan Mohamed',
      planType: 'postpaid',
      baseAmount: 150,
      installationFee: 0,
      equipmentFee: 0,
      vatAmount: 27,
      totalAmount: 177,
      dueDate: '2024-02-29',
      status: 'pending',
      generatedDate: '2024-01-30',
      remindersSent: 1,
      daysOverdue: 0,
    },
    {
      id: 'INV-2024-002',
      customer: 'Mary John Deng',
      planType: 'prepaid',
      baseAmount: 100,
      installationFee: 200,
      equipmentFee: 150,
      vatAmount: 81,
      totalAmount: 531,
      dueDate: '2024-01-31',
      status: 'overdue',
      generatedDate: '2024-01-01',
      remindersSent: 3,
      daysOverdue: 15,
    },
  ]);

  const customers = [
    {
      name: 'Ahmed Hassan Mohamed',
      planType: 'postpaid',
      phone: '+211912345678',
    },
    { name: 'Mary John Deng', planType: 'prepaid', phone: '+211923456789' },
    {
      name: 'Peter Garang Mabior',
      planType: 'postpaid',
      phone: '+211934567890',
    },
  ];

  const calculateTotalAmount = () => {
    const base = parseFloat(billingAmount) || 0;
    const installation = includeInstallation ? 200 : 0;
    const equipment = includeEquipment ? 150 : 0;
    const subtotal = base + installation + equipment;
    const vat = subtotal * (parseFloat(taxRate) / 100);
    return {
      subtotal,
      vatAmount: vat,
      total: subtotal + vat,
    };
  };

  const handleGenerateInvoice = () => {
    if (selectedCustomer && billingAmount) {
      const calculations = calculateTotalAmount();
      const selectedCustomerData = customers.find(
        c => c.name === selectedCustomer
      );

      const newInvoice = {
        id: `INV-2024-${(invoices.length + 1).toString().padStart(3, '0')}`,
        customer: selectedCustomer,
        planType: selectedCustomerData?.planType || 'postpaid',
        baseAmount: parseFloat(billingAmount),
        installationFee: includeInstallation ? 200 : 0,
        equipmentFee: includeEquipment ? 150 : 0,
        vatAmount: calculations.vatAmount,
        totalAmount: calculations.total,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        status: 'pending' as const,
        generatedDate: new Date().toISOString().split('T')[0],
        remindersSent: 0,
        daysOverdue: 0,
      };

      setInvoices([...invoices, newInvoice]);
      setSelectedCustomer('');
      setBillingAmount('');
      setIncludeInstallation(false);
      setIncludeEquipment(false);

      toast({
        title: t.invoiceGenerated,
        description: `Invoice ${newInvoice.id} generated for ${selectedCustomer} - Total: ${newInvoice.totalAmount.toFixed(2)} SSP`,
      });
    }
  };

  const handleSendReminder = (invoice: Invoice) => {
    const customerData = customers.find(c => c.name === invoice.customer);

    // Simulate SMS sending
    toast({
      title: t.reminderSent,
      description: `SMS reminder sent to ${customerData?.phone} for invoice ${invoice.id}`,
    });

    // Update reminder count
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id
        ? { ...inv, remindersSent: inv.remindersSent + 1 }
        : inv
    );
    setInvoices(updatedInvoices);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: t.paid, variant: 'default' as const },
      pending: { label: t.pending, variant: 'secondary' as const },
      overdue: { label: t.overdue, variant: 'destructive' as const },
      partial: { label: t.partial, variant: 'outline' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculations = calculateTotalAmount();

  return (
    <div className="space-y-6">
      {/* Enhanced Billing Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalRevenue}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingStats.totalRevenue.toLocaleString()} SSP
            </div>
            <p className="text-xs text-muted-foreground">{t.thisMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.pendingAmount}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingStats.pendingAmount.toLocaleString()} SSP
            </div>
            <p className="text-xs text-muted-foreground">
              {billingStats.thisMonthBills} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.overdueAmount}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {billingStats.overdueAmount.toLocaleString()} SSP
            </div>
            <Button size="sm" className="mt-2 w-full">
              <Bell className="h-3 w-3 mr-1" />
              {t.sendBulkReminders}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.generateInvoice}
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Receipt className="h-4 w-4 mr-2" />
                  {t.generateInvoice}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.generateInvoice}</DialogTitle>
                  <DialogDescription>{t.taxCalculation}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer">{t.customer}</Label>
                    <Select
                      value={selectedCustomer}
                      onValueChange={setSelectedCustomer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCustomer} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer.name} value={customer.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{customer.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {customer.planType === 'prepaid'
                                  ? t.prepaid
                                  : t.postpaid}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">{t.baseAmount}</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={billingAmount}
                      onChange={e => setBillingAmount(e.target.value)}
                      placeholder={t.enterAmount}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="installation">{t.installationFee}</Label>
                      <Switch
                        id="installation"
                        checked={includeInstallation}
                        onCheckedChange={setIncludeInstallation}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="equipment">{t.equipmentFee}</Label>
                      <Switch
                        id="equipment"
                        checked={includeEquipment}
                        onCheckedChange={setIncludeEquipment}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="taxRate">{t.vatRate}</Label>
                    <Select value={taxRate} onValueChange={setTaxRate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (Exempt)</SelectItem>
                        <SelectItem value="18">18% (Standard VAT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calculation Summary */}
                  {billingAmount && (
                    <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t.baseAmount}:</span>
                        <span>{parseFloat(billingAmount).toFixed(2)} SSP</span>
                      </div>
                      {includeInstallation && (
                        <div className="flex justify-between text-sm">
                          <span>{t.installationFee}:</span>
                          <span>200.00 SSP</span>
                        </div>
                      )}
                      {includeEquipment && (
                        <div className="flex justify-between text-sm">
                          <span>{t.equipmentFee}:</span>
                          <span>150.00 SSP</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>{t.subtotal}:</span>
                        <span>{calculations.subtotal.toFixed(2)} SSP</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>
                          {t.vatAmount} ({taxRate}%):
                        </span>
                        <span>{calculations.vatAmount.toFixed(2)} SSP</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>{t.totalAmount}:</span>
                        <span>{calculations.total.toFixed(2)} SSP</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline">{t.cancel}</Button>
                    <Button onClick={handleGenerateInvoice}>
                      {t.generate}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Aging Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t.agingReport}
          </CardTitle>
          <CardDescription>Accounts receivable aging analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {billingStats.aging.days030.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t.days030}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">
                {billingStats.aging.days3060.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t.days3060}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {billingStats.aging.days6090.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t.days6090}</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {billingStats.aging.days90plus.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{t.days90plus}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Invoice Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enhanced Invoice History
          </CardTitle>
          <CardDescription>
            Complete invoice management with automated features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.planType}</TableHead>
                  <TableHead>{t.totalAmount}</TableHead>
                  <TableHead>{t.dueDate}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.planType === 'prepaid'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {invoice.planType === 'prepaid'
                          ? t.prepaid
                          : t.postpaid}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.totalAmount.toFixed(2)} SSP</TableCell>
                    <TableCell>{invoice.dueDate}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.remindersSent}</Badge>
                      {invoice.daysOverdue > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {invoice.daysOverdue} days overdue
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          {t.viewInvoice}
                        </Button>
                        {invoice.status !== 'paid' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendReminder(invoice)}
                            >
                              <Bell className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              {t.markPaid}
                            </Button>
                            {invoice.daysOverdue > 7 && (
                              <Button variant="destructive" size="sm">
                                {t.suspendService}
                              </Button>
                            )}
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

export default EnhancedBillingModule;
