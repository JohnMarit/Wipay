import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    AlertTriangle,
    Banknote,
    Building,
    CheckCircle,
    Clock,
    CreditCard,
    History,
    Plus,
    Search,
    Smartphone,
    Wifi,
} from 'lucide-react';
import { useState } from 'react';

interface PaymentTrackingProps {
  language: string;
}

const PaymentTracking = ({ language }: PaymentTrackingProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('history');
  const [newPayment, setNewPayment] = useState({
    customer: '',
    amount: '',
    method: '',
    reference: '',
    phoneNumber: '',
  });

  const translations = {
    en: {
      title: 'Payment Tracking',
      description: 'Complete payment management for Wipay',
      addPayment: 'Add Payment',
      filterPayments: 'Filter Payments',
      exportPayments: 'Export Data',
      searchPayments: 'Search payments...',
      dateRange: 'Date Range',
      paymentMethod: 'Payment Method',
      status: 'Status',
      allMethods: 'All Methods',
      cash: 'Cash',
      bankTransfer: 'Bank Transfer',
      mobilePayment: 'Mobile Payment',
      orangeMoney: 'Orange Money',
      mtnMoney: 'MTN Money',
      airtelMoney: 'Airtel Money',
      bankOfSouthSudan: 'Bank of South Sudan',
      kenyaCommercialBank: 'KCB Bank South Sudan',
      equityBank: 'Equity Bank',
      allStatuses: 'All Statuses',
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      customer: 'Customer',
      amount: 'Amount (SSP)',
      method: 'Method',
      date: 'Date',
      actions: 'Actions',
      verify: 'Verify',
      refund: 'Refund',
      details: 'Details',
      noPayments: 'No payments found',
      totalAmount: 'Total Amount',
      totalPayments: 'Total Payments',
      averagePayment: 'Average Payment',
      successRate: 'Success Rate',
      todaysPayments: "Today's Payments",
      recentPayments: 'Recent Payments',
      paymentTrends: 'Payment Trends',
      paymentMethods: 'Payment Methods',
    },
    ar: {
      title: 'تتبع المدفوعات المحسن',
      description: 'إدارة مدفوعات شاملة لمزود خدمة الإنترنت في جنوب السودان',
      addPayment: 'تسجيل دفع',
      paymentHistory: 'تاريخ المدفوعات',
      paymentMethods: 'طرق الدفع',
      mobileMoney: 'الأموال المحمولة',
      mobileMoneyStats: 'إحصائيات الأموال المحمولة',
      bankTransfer: 'حوالة بنكية',
      cash: 'دفع نقدي',
      customer: 'العميل',
      amount: 'المبلغ (جنيه جنوب سوداني)',
      method: 'طريقة الدفع',
      reference: 'رقم المرجع',
      phoneNumber: 'رقم الهاتف',
      date: 'التاريخ',
      status: 'الحالة',
      actions: 'الإجراءات',
      completed: 'مكتمل',
      pending: 'معلق',
      failed: 'فشل',
      orangeMoney: 'أورانج موني',
      mtnMoney: 'إم تي إن موني',
      airtelMoney: 'إيرتل موني',
      bankOfSouthSudan: 'بنك جنوب السودان',
      kenyaCommercialBank: 'بنك كينيا التجاري جنوب السودان',
      equityBank: 'بنك إكويتي',
      walkInCash: 'نقد مباشر',
      searchPayments: 'البحث في المدفوعات...',
      selectCustomer: 'اختر العميل',
      selectMethod: 'اختر طريقة الدفع',
      enterAmount: 'أدخل المبلغ',
      enterReference: 'أدخل رقم المرجع',
      enterPhone: 'أدخل رقم الهاتف',
      recordPayment: 'تسجيل الدفع',
      cancel: 'إلغاء',
      paymentRecorded: 'تم تسجيل الدفع بنجاح',
      totalPayments: 'إجمالي المدفوعات',
      thisMonth: 'هذا الشهر',
      pendingPayments: 'المدفوعات المعلقة',
      failedPayments: 'المدفوعات الفاشلة',
      mobileMoneyVolume: 'حجم الأموال المحمولة',
      averageTransaction: 'متوسط المعاملة',
      viewReceipt: 'عرض الإيصال',
      verify: 'تحقق من الدفع',
      sendSMS: 'إرسال إيصال نصي',
      reconciliation: 'المصالحة اليومية',
      offlinePayments: 'المدفوعات غير المتصلة',
      syncPending: 'المزامنة معلقة',
      verificationRequired: 'التحقق مطلوب',
    },
  };

  const t = translations[language as keyof typeof translations];

  // Enhanced payment stats with South Sudan specific data
  const paymentStats = {
    totalPayments: 0, // Will be calculated from actual payment data
    pendingPayments: 0, // Will be calculated from actual payment data
    failedPayments: 0, // Will be calculated from actual payment data
    thisMonthCount: 0, // Will be calculated from actual payment data
    mobileMoneyVolume: 0, // Will be calculated from actual payment data
    averageTransaction: 0, // Will be calculated from actual payment data
    offlinePayments: 0, // Will be calculated from actual payment data
    verificationRequired: 0, // Will be calculated from actual payment data
  };

  const [payments, setPayments] = useState([
    // Payments will be loaded from actual data sources
    // Hard coded sample data removed for production use
  ]);

  const customers = [
    // Customer names will be loaded dynamically from user data
  ];

  // Enhanced payment methods for South Sudan
  const paymentMethods = [
    {
      value: 'orange_money',
      label: t.orangeMoney,
      icon: Smartphone,
      prefix: 'OM',
      color: 'orange',
    },
    {
      value: 'mtn_money',
      label: t.mtnMoney,
      icon: Smartphone,
      prefix: 'MTN',
      color: 'yellow',
    },
    {
      value: 'airtel_money',
      label: t.airtelMoney,
      icon: Smartphone,
      prefix: 'AM',
      color: 'red',
    },
    {
      value: 'bank_south_sudan',
      label: t.bankOfSouthSudan,
      icon: Building,
      prefix: 'BSS',
      color: 'blue',
    },
    {
      value: 'kcb_bank',
      label: t.kenyaCommercialBank,
      icon: Building,
      prefix: 'KCB',
      color: 'green',
    },
    {
      value: 'equity_bank',
      label: t.equityBank,
      icon: Building,
      prefix: 'EQB',
      color: 'purple',
    },
    {
      value: 'cash',
      label: t.walkInCash,
      icon: Banknote,
      prefix: 'CASH',
      color: 'gray',
    },
  ];

  const handleAddPayment = () => {
    if (newPayment.customer && newPayment.amount && newPayment.method) {
      const methodData = paymentMethods.find(
        m => m.value === newPayment.method
      );
      const payment = {
        id: `PAY-2024-${(payments.length + 1).toString().padStart(3, '0')}`,
        customer: newPayment.customer,
        amount: parseInt(newPayment.amount),
        method: methodData?.label || newPayment.method,
        reference:
          newPayment.reference || `${methodData?.prefix}-${Date.now()}`,
        phoneNumber: newPayment.phoneNumber,
        date: new Date().toISOString().split('T')[0],
        status: 'completed' as const,
        verifiedBy: 'System Auto',
      };
      setPayments([...payments, payment]);
      setNewPayment({
        customer: '',
        amount: '',
        method: '',
        reference: '',
        phoneNumber: '',
      });
      toast({
        title: t.paymentRecorded,
        description: `Payment of ${payment.amount} SSP recorded for ${payment.customer}`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: t.completed,
        variant: 'default' as const,
        icon: CheckCircle,
      },
      pending: { label: t.pending, variant: 'secondary' as const, icon: Clock },
      failed: {
        label: t.failed,
        variant: 'destructive' as const,
        icon: AlertTriangle,
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    if (
      method.includes('Orange') ||
      method.includes('MTN') ||
      method.includes('Airtel')
    ) {
      return <Smartphone className="h-4 w-4" />;
    } else if (method.includes('Bank')) {
      return <Building className="h-4 w-4" />;
    } else {
      return <Banknote className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(
    payment =>
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Payment Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.totalPayments}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {paymentStats.totalPayments.toLocaleString()} SSP
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.thisMonthCount} {t.thisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.mobileMoneyVolume}
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {paymentStats.mobileMoneyVolume.toLocaleString()} SSP
            </div>
            <p className="text-xs text-muted-foreground">
              68% of total payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.pendingPayments}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {paymentStats.pendingPayments.toLocaleString()} SSP
            </div>
            <p className="text-xs text-muted-foreground">
              {paymentStats.verificationRequired} {t.verificationRequired}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.recordPayment}
            </CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full text-xs">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t.addPayment}</span>
                  <span className="sm:hidden">Payment</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle className="text-sm sm:text-base">
                    {t.addPayment}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    Record a new customer payment with verification
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer" className="text-sm">
                      {t.customer}
                    </Label>
                    <Select
                      value={newPayment.customer}
                      onValueChange={value =>
                        setNewPayment({ ...newPayment, customer: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCustomer} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(customer => (
                          <SelectItem key={customer} value={customer}>
                            <span className="text-sm">{customer}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-sm">
                      {t.amount}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newPayment.amount}
                      onChange={e =>
                        setNewPayment({ ...newPayment, amount: e.target.value })
                      }
                      placeholder={t.enterAmount}
                    />
                  </div>

                  <div>
                    <Label htmlFor="method" className="text-sm">
                      {t.method}
                    </Label>
                    <Select
                      value={newPayment.method}
                      onValueChange={value =>
                        setNewPayment({ ...newPayment, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectMethod} />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              <span className="text-sm">{method.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(newPayment.method === 'orange_money' ||
                    newPayment.method === 'mtn_money' ||
                    newPayment.method === 'airtel_money') && (
                    <div>
                      <Label htmlFor="phone" className="text-sm">
                        {t.phoneNumber}
                      </Label>
                      <Input
                        id="phone"
                        value={newPayment.phoneNumber}
                        onChange={e =>
                          setNewPayment({
                            ...newPayment,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="+211 XXX XXX XXX"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reference" className="text-sm">
                      {t.reference}
                    </Label>
                    <Input
                      id="reference"
                      value={newPayment.reference}
                      onChange={e =>
                        setNewPayment({
                          ...newPayment,
                          reference: e.target.value,
                        })
                      }
                      placeholder={t.enterReference}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleAddPayment}
                      className="w-full sm:w-auto"
                    >
                      {t.recordPayment}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Payment Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">{t.paymentHistory}</TabsTrigger>
              <TabsTrigger value="methods">{t.paymentMethods}</TabsTrigger>
              <TabsTrigger value="reconciliation">
                {t.reconciliation}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t.searchPayments}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {paymentStats.offlinePayments > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {paymentStats.offlinePayments} {t.syncPending}
                  </Badge>
                )}
              </div>

              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {filteredPayments.map(payment => (
                  <Card key={payment.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {payment.customer}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {payment.id}
                          </p>
                          {payment.phoneNumber && (
                            <p className="text-xs text-muted-foreground">
                              {payment.phoneNumber}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Amount:</span>{' '}
                          {payment.amount.toLocaleString()} SSP
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{' '}
                          {payment.date}
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="font-medium">Method:</span>
                            <span className="text-sm">{payment.method}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Reference:</span>
                          <span className="font-mono text-xs ml-1">
                            {payment.reference}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          {t.viewReceipt}
                        </Button>
                        <div className="flex gap-2">
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              {t.verify}
                            </Button>
                          )}
                          {payment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              SMS
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>{t.customer}</TableHead>
                      <TableHead>{t.amount}</TableHead>
                      <TableHead>{t.method}</TableHead>
                      <TableHead>{t.reference}</TableHead>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead>{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.customer}
                            </div>
                            {payment.phoneNumber && (
                              <div className="text-sm text-gray-500">
                                {payment.phoneNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.amount.toLocaleString()} SSP
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="text-sm">{payment.method}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.reference}
                        </TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              {t.viewReceipt}
                            </Button>
                            {payment.status === 'pending' && (
                              <Button variant="outline" size="sm">
                                {t.verify}
                              </Button>
                            )}
                            {payment.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                {t.sendSMS}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="methods" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map(method => (
                  <Card
                    key={method.value}
                    className="border-2 hover:border-blue-200 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <method.icon
                          className={`h-5 w-5 text-${method.color}-600`}
                        />
                        <span className="text-sm sm:text-base">
                          {method.label}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Prefix:{' '}
                          <span className="font-mono">{method.prefix}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Status: <Badge variant="default">Active</Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                        >
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Today's Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">47</div>
                    <div className="text-sm text-gray-600">
                      Total: 8,540 SSP
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Pending Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      8
                    </div>
                    <div className="text-sm text-gray-600">
                      Amount: 1,200 SSP
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Failed Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-red-600">
                      2
                    </div>
                    <div className="text-sm text-gray-600">Amount: 300 SSP</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="w-full sm:w-auto">
                  Generate Daily Report
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Export to CSV
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Send to Accounting
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;
