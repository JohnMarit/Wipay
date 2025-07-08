import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  CreditCard, 
  Wifi, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Globe,
  Phone,
  Settings,
  BarChart3,
  UserPlus,
  Receipt,
  Wrench,
  WifiOff,
  LogOut,
  Bell,
  Shield
} from "lucide-react";
import CustomerManagement from "@/components/CustomerManagement";
import BillingModule from "@/components/BillingModule";
import ServiceManagement from "@/components/ServiceManagement";
import PaymentTracking from "@/components/PaymentTracking";
import ReportsAnalytics from "@/components/ReportsAnalytics";
import LanguageSelector from "@/components/LanguageSelector";

interface IndexProps {
  currentUser?: any;
  onLogout?: () => void;
}

const Index = ({ currentUser, onLogout }: IndexProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [language, setLanguage] = useState("en");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monitor online/offline status for South Sudan's intermittent connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced sample data with South Sudan specific information
  const dashboardStats = {
    totalCustomers: 247,
    activeServices: 198,
    monthlyRevenue: 456000, // in South Sudanese Pounds
    pendingPayments: 128000,
    newCustomers: 15,
    suspendedServices: 8,
    mobileMoneyPayments: 65, // percentage
    cashPayments: 25,
    bankTransfers: 10,
    overdueAccounts: 23,
    fupViolations: 12,
    equipmentIssues: 5
  };

  const recentActivity = [
    { id: 1, type: "payment", customer: "Ahmed Hassan", amount: 150, method: "Orange Money", time: "2 hours ago" },
    { id: 2, type: "service", customer: "Mary John", action: "Service Activated", location: "Juba", time: "4 hours ago" },
    { id: 3, type: "billing", customer: "Peter Deng", action: "Invoice Generated", amount: 200, time: "6 hours ago" },
    { id: 4, type: "payment", customer: "Sarah Ali", amount: 200, method: "MTN Money", time: "8 hours ago" },
    { id: 5, type: "equipment", customer: "John Maker", action: "Router Replaced", time: "1 day ago" }
  ];

  const translations = {
    en: {
      title: "South Sudan ISP Management System",
      dashboard: "Dashboard",
      customers: "Customers",
      billing: "Billing",
      services: "Services",
      payments: "Payments",
      reports: "Reports",
      totalCustomers: "Total Customers",
      activeServices: "Active Services",
      monthlyRevenue: "Monthly Revenue (SSP)",
      pendingPayments: "Pending Payments",
      newCustomers: "New This Month",
      suspendedServices: "Suspended Services",
      recentActivity: "Recent Activity",
      quickActions: "Quick Actions",
      addCustomer: "Add Customer",
      generateBill: "Generate Bill",
      serviceRequest: "Service Request",
      viewReports: "View Reports",
      offlineMode: "Offline Mode",
      onlineStatus: "Online",
      lastSync: "Last Sync",
      overdueAccounts: "Overdue Accounts",
      mobileMoneyPayments: "Mobile Money Usage",
      fupViolations: "FUP Violations",
      equipmentIssues: "Equipment Issues",
      welcomeBack: "Welcome back",
      systemAlerts: "System Alerts",
      logout: "Logout"
    },
    ar: {
      title: "نظام إدارة مزود خدمة الإنترنت - جنوب السودان",
      dashboard: "لوحة التحكم",
      customers: "العملاء",
      billing: "الفواتير",
      services: "الخدمات",
      payments: "المدفوعات",
      reports: "التقارير",
      totalCustomers: "إجمالي العملاء",
      activeServices: "الخدمات النشطة",
      monthlyRevenue: "الإيرادات الشهرية (جنيه جنوب سوداني)",
      pendingPayments: "المدفوعات المعلقة",
      newCustomers: "جديد هذا الشهر",
      suspendedServices: "الخدمات المعلقة",
      recentActivity: "النشاط الأخير",
      quickActions: "إجراءات سريعة",
      addCustomer: "إضافة عميل",
      generateBill: "إنشاء فاتورة",
      serviceRequest: "طلب خدمة",
      viewReports: "عرض التقارير",
      offlineMode: "وضع عدم الاتصال",
      onlineStatus: "متصل",
      lastSync: "آخر مزامنة",
      overdueAccounts: "الحسابات المتأخرة",
      mobileMoneyPayments: "استخدام الأموال المحمولة",
      fupViolations: "انتهاكات سياسة الاستخدام العادل",
      equipmentIssues: "مشاكل المعدات",
      welcomeBack: "أهلاً بعودتك",
      systemAlerts: "تنبيهات النظام",
      logout: "تسجيل الخروج"
    }
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-green-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto p-4">
        {/* Enhanced Header with User Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
              {currentUser && (
                <p className="text-sm text-gray-600">
                  {t.welcomeBack}, {currentUser.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">{t.onlineStatus}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">{t.offlineMode}</span>
                </div>
              )}
              {lastSync && (
                <span className="text-xs text-gray-500">
                  {t.lastSync}: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>

            <LanguageSelector language={language} setLanguage={setLanguage} />
            
            {/* User Menu */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  {t.logout}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* System Alerts for South Sudan specific issues */}
        {!isOnline && (
          <div className="mb-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    {t.offlineMode} - Data will sync when connection is restored
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t.dashboard}
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t.customers}
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              {t.billing}
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              {t.services}
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t.payments}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.reports}
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Enhanced Stats Cards with South Sudan specific metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.totalCustomers}</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                  <Badge className="mt-2 bg-white/20 text-white">
                    +{dashboardStats.newCustomers} {t.newCustomers}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.activeServices}</CardTitle>
                  <Wifi className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.activeServices}</div>
                  <Badge className="mt-2 bg-red-200 text-red-800">
                    {dashboardStats.suspendedServices} {t.suspendedServices}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.monthlyRevenue}</CardTitle>
                  <DollarSign className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.monthlyRevenue.toLocaleString()} SSP</div>
                  <Badge className="mt-2 text-white border-white bg-transparent">
                    {dashboardStats.pendingPayments.toLocaleString()} SSP {t.pendingPayments}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t.systemAlerts}</CardTitle>
                  <Bell className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-sm">{dashboardStats.overdueAccounts} {t.overdueAccounts}</div>
                    <div className="text-sm">{dashboardStats.fupViolations} {t.fupViolations}</div>
                    <div className="text-sm">{dashboardStats.equipmentIssues} {t.equipmentIssues}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods Distribution (South Sudan specific) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t.mobileMoneyPayments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.mobileMoneyPayments}%</div>
                  <div className="text-xs text-gray-500">Orange Money + MTN Money</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cash Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardStats.cashPayments}%</div>
                  <div className="text-xs text-gray-500">Walk-in payments</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bank Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{dashboardStats.bankTransfers}%</div>
                  <div className="text-xs text-gray-500">Local banks</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {t.recentActivity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">{activity.customer}</p>
                          <p className="text-sm text-gray-500">
                            {activity.amount ? `${activity.amount} SSP` : activity.action}
                            {activity.method && ` via ${activity.method}`}
                            {activity.location && ` in ${activity.location}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t.quickActions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-16 flex flex-col items-center justify-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      {t.addCustomer}
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                      <Receipt className="h-5 w-5" />
                      {t.generateBill}
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                      <Wrench className="h-5 w-5" />
                      {t.serviceRequest}
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {t.viewReports}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagement language={language} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingModule language={language} />
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement language={language} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentTracking language={language} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsAnalytics language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
