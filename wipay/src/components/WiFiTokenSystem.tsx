import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi, Smartphone, Banknote, Clock, Send, Settings, History, Plus, QrCode, LogOut, User, AlertCircle, DollarSign, FileText, Calendar, BarChart3, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFReportGenerator } from "@/lib/pdfGenerator";
import { tokenService, userService, WiFiToken as FirebaseWiFiToken, UserProfile } from "@/lib/firebase";

interface WiFiTokenSystemProps {
  language: string;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onLogout?: () => void;
}

interface WiFiToken {
  id: string;
  recipientPhone: string;
  duration: number;
  price: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  username: string;
  password: string;
  isActive: boolean;
}

interface PricingConfig {
  currency: string;
  prices: {
    [key: string]: number;
  };
}

interface ReportData {
  period: string;
  revenue: number;
  transactions: number;
  totalUsers: number;
  avgTransactionValue: number;
  serviceBreakdown: Array<{ service: string; count: number; revenue: number }>;
  paymentBreakdown: Array<{ method: string; count: number; revenue: number }>;
  recentTransactions: Array<{
    date: string;
    customer: string;
    service: string;
    payment_method: string;
    amount: number;
  }>;
}

const WiFiTokenSystem = ({ language, currentUser, onLogout }: WiFiTokenSystemProps) => {
  const { toast } = useToast();
  const [wifiConfig, setWifiConfig] = useState({
    ssid: "",
    adminPassword: "",
    momoNumber: "",
    isConfigured: false
  });

  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    currency: "SSP",
    prices: {
      "1": 50,
      "3": 120,
      "6": 200,
      "12": 350,
      "24": 500
    }
  });
  
  const [showWifiSetup, setShowWifiSetup] = useState(false);
  const [setupTab, setSetupTab] = useState("network");
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ReportData | null>(null);
  const [previewType, setPreviewType] = useState<'week' | 'month' | 'year'>('week');
  
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
    reportType: 'custom' as 'custom' | 'week' | 'month' | 'year'
  });
  
  const [tokenForm, setTokenForm] = useState({
    recipientPhone: "",
    duration: "",
    paymentMethod: "",
    price: 0
  });

  // State for Firebase data
  const [tokens, setTokens] = useState<WiFiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile and tokens from Firebase
  const loadUserData = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      
      // Load user profile from Firebase
      const profile = await userService.getUserProfile(currentUser.id);
      if (profile) {
        setUserProfile(profile);
        
        // Set WiFi configuration from Firebase
        if (profile.wifiConfig) {
          setWifiConfig({
            ssid: profile.wifiConfig.ssid || "",
            adminPassword: "", // Don't store sensitive data in state
            momoNumber: "", // Don't store sensitive data in state
            isConfigured: profile.wifiConfig.isConfigured || false
          });
        }
        
        // Set pricing configuration from Firebase
        if (profile.pricingConfig) {
          setPricingConfig(profile.pricingConfig);
        }
      }
      
      // Load tokens from Firebase
      const firebaseTokens = await tokenService.getUserTokens(currentUser.id);
      const convertedTokens: WiFiToken[] = firebaseTokens.map(token => ({
        id: token.id!,
        recipientPhone: token.recipientPhone,
        duration: token.duration,
        price: token.price,
        currency: token.currency,
        paymentMethod: token.paymentMethod,
        status: token.status,
        createdAt: token.createdAt.toISOString(),
        expiresAt: token.expiresAt.toISOString(),
        username: token.username,
        password: token.password,
        isActive: token.isActive
      }));
      
      setTokens(convertedTokens);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your data. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserData();
    }
  }, [currentUser, loadUserData]);

  const translations = {
    en: {
      title: "Wipay",
      description: "WiFi Token Distribution System",
      setup: "Network Setup",
      wifiSetup: "WiFi Network Configuration",
      networkConfig: "Network Settings",
      pricingConfig: "Token Pricing",
      ssid: "WiFi Network Name (SSID)",
      adminPassword: "Admin WiFi Password",
      momoNumber: "Your MTN MoMo Number",
      currency: "Currency",
      tokenPricing: "Set Token Prices",
      oneHourPrice: "1 Hour Price",
      threeHourPrice: "3 Hours Price",
      sixHourPrice: "6 Hours Price",
      twelveHourPrice: "12 Hours Price",
      oneDayPrice: "24 Hours Price",
      saveConfig: "Save Configuration",
      setupWifi: "Setup WiFi Network",
      generateToken: "Generate WiFi Token",
      tokenManagement: "Token Management",
      activeTokens: "Active Tokens",
      tokenHistory: "Token History",
      recipientPhone: "Recipient Phone Number",
      duration: "Access Duration",
      paymentMethod: "Payment Method",
      cash: "Cash Payment",
      mtnMomo: "MTN Mobile Money",
      oneHour: "1 Hour",
      threeHours: "3 Hours",
      sixHours: "6 Hours",
      twelveHours: "12 Hours",
      oneDay: "24 Hours",
      price: "Price",
      generate: "Generate & Send Token",
      cancel: "Cancel",
      status: "Status",
      active: "Active",
      expired: "Expired",
      used: "Used",
      pending: "Pending",
      credentials: "WiFi Credentials",
      username: "Username",
      password: "Password",
      expiresAt: "Expires At",
      actions: "Actions",
      sendSMS: "Resend SMS",
      deactivate: "Deactivate",
      tokenGenerated: "WiFi token generated successfully",
      smsSent: "SMS sent to recipient",
      configSaved: "WiFi configuration saved",
      pricingSaved: "Pricing configuration saved",
      enterSSID: "Enter WiFi network name",
      enterAdminPassword: "Enter admin password",
      enterMomoNumber: "Enter MTN MoMo number",
      enterRecipientPhone: "Enter recipient's phone",
      enterPrice: "Enter price",
      selectDuration: "Select access duration",
      selectPayment: "Select payment method",
      selectCurrency: "Select currency",
      setupRequired: "Please setup your WiFi network first",
      totalRevenue: "Total Revenue",
      activeUsers: "Active Users",
      tokensToday: "Tokens Today",
      logout: "Logout",
      welcomeBack: "Welcome back",
      userProfile: "User Profile",
      wifiNotConfigured: "WiFi Network Not Configured",
      wifiNotConfiguredDesc: "Set up your WiFi network to start generating tokens",
      configureNow: "Configure WiFi Network",
      customPricing: "Custom Pricing Enabled",
      yourPricing: "Your Custom Pricing",
      generateReports: "Generate Reports",
      weeklyReport: "Weekly Report",
      monthlyReport: "Monthly Report",
      yearlyReport: "Yearly Report",
      previewWeekly: "Preview Weekly",
      previewMonthly: "Preview Monthly",
      previewYearly: "Preview Yearly",
      downloadPDF: "Download PDF",
      reportPreview: "Report Preview",
      reportGenerated: "PDF report generated successfully",
      reportError: "Error generating PDF report",
      close: "Close",
      totalUsers: "Total Users"
    },
    ar: {
      title: "Wipay",
      description: "نظام توزيع رموز الواي فاي",
      setup: "إعداد الشبكة",
      wifiSetup: "تكوين شبكة الواي فاي",
      networkConfig: "إعدادات الشبكة",
      pricingConfig: "تسعير الرموز",
      ssid: "اسم شبكة الواي فاي",
      adminPassword: "كلمة مرور المدير",
      momoNumber: "رقم إم تي إن موبايل موني",
      currency: "العملة",
      tokenPricing: "تحديد أسعار الرموز",
      oneHourPrice: "سعر الساعة الواحدة",
      threeHourPrice: "سعر 3 ساعات",
      sixHourPrice: "سعر 6 ساعات",
      twelveHourPrice: "سعر 12 ساعة",
      oneDayPrice: "سعر 24 ساعة",
      saveConfig: "حفظ التكوين",
      setupWifi: "إعداد شبكة الواي فاي",
      generateToken: "إنشاء رمز واي فاي",
      tokenManagement: "إدارة الرموز",
      activeTokens: "الرموز النشطة",
      tokenHistory: "تاريخ الرموز",
      recipientPhone: "رقم هاتف المستلم",
      duration: "مدة الوصول",
      paymentMethod: "طريقة الدفع",
      cash: "دفع نقدي",
      mtnMomo: "إم تي إن موبايل موني",
      oneHour: "ساعة واحدة",
      threeHours: "3 ساعات",
      sixHours: "6 ساعات",
      twelveHours: "12 ساعة",
      oneDay: "24 ساعة",
      price: "السعر",
      generate: "إنشاء وإرسال الرمز",
      cancel: "إلغاء",
      status: "الحالة",
      active: "نشط",
      expired: "منتهي الصلاحية",
      used: "مستخدم",
      pending: "معلق",
      credentials: "بيانات الواي فاي",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      expiresAt: "تنتهي في",
      actions: "الإجراءات",
      sendSMS: "إعادة إرسال رسالة",
      deactivate: "إلغاء التفعيل",
      tokenGenerated: "تم إنشاء رمز الواي فاي بنجاح",
      smsSent: "تم إرسال الرسالة للمستلم",
      configSaved: "تم حفظ تكوين الواي فاي",
      pricingSaved: "تم حفظ تكوين التسعير",
      enterSSID: "أدخل اسم شبكة الواي فاي",
      enterAdminPassword: "أدخل كلمة مرور المدير",
      enterMomoNumber: "أدخل رقم موبايل موني",
      enterRecipientPhone: "أدخل رقم هاتف المستلم",
      enterPrice: "أدخل السعر",
      selectDuration: "اختر مدة الوصول",
      selectPayment: "اختر طريقة الدفع",
      selectCurrency: "اختر العملة",
      setupRequired: "يرجى إعداد شبكة الواي فاي أولاً",
      totalRevenue: "إجمالي الإيرادات",
      activeUsers: "المستخدمون النشطون",
      tokensToday: "الرموز اليوم",
      logout: "تسجيل الخروج",
      welcomeBack: "أهلاً بعودتك",
      userProfile: "الملف الشخصي",
      wifiNotConfigured: "شبكة الواي فاي غير مكونة",
      wifiNotConfiguredDesc: "قم بإعداد شبكة الواي فاي لبدء إنشاء الرموز",
      configureNow: "تكوين شبكة الواي فاي",
      customPricing: "التسعير المخصص مفعل",
      yourPricing: "التسعير المخصص الخاص بك",
      generateReports: "إنشاء التقارير",
      weeklyReport: "التقرير الأسبوعي",
      monthlyReport: "التقرير الشهري",
      yearlyReport: "التقرير السنوي",
      previewWeekly: "معاينة أسبوعي",
      previewMonthly: "معاينة شهري",
      previewYearly: "معاينة سنوي",
      downloadPDF: "تحميل PDF",
      reportPreview: "معاينة التقرير",
      reportGenerated: "تم إنشاء تقرير PDF بنجاح",
      reportError: "خطأ في إنشاء تقرير PDF",
      close: "إغلاق",
      totalUsers: "المستخدمون"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Function to generate custom date range report data
  const generateCustomDateRangeReport = (startDateStr: string, endDateStr: string) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr + 'T23:59:59'); // Include full end date
    const periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    // Filter tokens within the custom date range
    const periodTokens = tokens.filter(token => {
      const tokenDate = new Date(token.createdAt);
      return tokenDate >= startDate && tokenDate <= endDate;
    });

    // Calculate basic metrics
    const totalRevenue = periodTokens.reduce((sum, token) => sum + token.price, 0);
    const totalTransactions = periodTokens.length;
    const uniqueCustomers = new Set(periodTokens.map(token => token.recipientPhone)).size;

    // Service breakdown
    const serviceBreakdown = [
      { service: "1 Hour WiFi", count: 0, revenue: 0 },
      { service: "3 Hours WiFi", count: 0, revenue: 0 },
      { service: "6 Hours WiFi", count: 0, revenue: 0 },
      { service: "12 Hours WiFi", count: 0, revenue: 0 },
      { service: "24 Hours WiFi", count: 0, revenue: 0 }
    ];

    periodTokens.forEach(token => {
      const serviceIndex = token.duration === 1 ? 0 : 
                          token.duration === 3 ? 1 :
                          token.duration === 6 ? 2 :
                          token.duration === 12 ? 3 : 4;
      serviceBreakdown[serviceIndex].count++;
      serviceBreakdown[serviceIndex].revenue += token.price;
    });

    // Payment method breakdown
    const paymentBreakdown = [
      { method: "MTN Mobile Money", count: 0, revenue: 0 },
      { method: "Cash Payment", count: 0, revenue: 0 }
    ];

    periodTokens.forEach(token => {
      const methodIndex = token.paymentMethod === 'mtn_momo' ? 0 : 1;
      paymentBreakdown[methodIndex].count++;
      paymentBreakdown[methodIndex].revenue += token.price;
    });

    // Recent transactions (all within the date range)
    const recentTransactions = periodTokens
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20) // Show up to 20 transactions
      .map(token => ({
        date: new Date(token.createdAt).toLocaleDateString(),
        customer: token.recipientPhone,
        service: `${token.duration} Hour${token.duration > 1 ? 's' : ''} WiFi`,
        payment_method: token.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Cash Payment',
        amount: token.price
      }));

    return {
      period: periodLabel,
      revenue: totalRevenue,
      transactions: totalTransactions,
      totalUsers: uniqueCustomers,
      avgTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      serviceBreakdown: serviceBreakdown.filter(s => s.count > 0),
      paymentBreakdown: paymentBreakdown.filter(p => p.count > 0),
      recentTransactions
    };
  };

  // Function to generate local report data from actual token transactions
  const generateLocalReportData = (period: 'week' | 'month' | 'year') => {
    const now = new Date();
    let startDate: Date;
    let periodLabel: string;

    // Calculate date range based on period
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        periodLabel = `${startDate.getFullYear()}`;
        break;
    }

    // Filter tokens within the period
    const periodTokens = tokens.filter(token => {
      const tokenDate = new Date(token.createdAt);
      return tokenDate >= startDate && tokenDate <= now;
    });

    // Calculate basic metrics
    const totalRevenue = periodTokens.reduce((sum, token) => sum + token.price, 0);
    const totalTransactions = periodTokens.length;
    const uniqueCustomers = new Set(periodTokens.map(token => token.recipientPhone)).size;

    // Service breakdown
    const serviceBreakdown = [
      { service: "1 Hour WiFi", count: 0, revenue: 0 },
      { service: "3 Hours WiFi", count: 0, revenue: 0 },
      { service: "6 Hours WiFi", count: 0, revenue: 0 },
      { service: "12 Hours WiFi", count: 0, revenue: 0 },
      { service: "24 Hours WiFi", count: 0, revenue: 0 }
    ];

    periodTokens.forEach(token => {
      const serviceIndex = token.duration === 1 ? 0 : 
                          token.duration === 3 ? 1 :
                          token.duration === 6 ? 2 :
                          token.duration === 12 ? 3 : 4;
      serviceBreakdown[serviceIndex].count++;
      serviceBreakdown[serviceIndex].revenue += token.price;
    });

    // Payment method breakdown
    const paymentBreakdown = [
      { method: "MTN Mobile Money", count: 0, revenue: 0 },
      { method: "Cash Payment", count: 0, revenue: 0 }
    ];

    periodTokens.forEach(token => {
      const methodIndex = token.paymentMethod === 'mtn_momo' ? 0 : 1;
      paymentBreakdown[methodIndex].count++;
      paymentBreakdown[methodIndex].revenue += token.price;
    });

    // Recent transactions (last 10)
    const recentTransactions = periodTokens
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(token => ({
        date: new Date(token.createdAt).toLocaleDateString(),
        customer: token.recipientPhone,
        service: `${token.duration} Hour${token.duration > 1 ? 's' : ''} WiFi`,
        payment_method: token.paymentMethod === 'mtn_momo' ? 'MTN Mobile Money' : 'Cash Payment',
        amount: token.price
      }));

    return {
      period: periodLabel,
      revenue: totalRevenue,
      transactions: totalTransactions,
      totalUsers: uniqueCustomers,
      avgTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      serviceBreakdown: serviceBreakdown.filter(s => s.count > 0),
      paymentBreakdown: paymentBreakdown.filter(p => p.count > 0),
      recentTransactions
    };
  };

  // Function to preview report data
  const previewReport = async (period: 'week' | 'month' | 'year') => {
    try {
      // Set default date range based on period
      const today = new Date();
      let startDate: Date;
      const endDate = today;

      switch (period) {
        case 'week':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
      }

      // Initialize custom date range with default values
      setCustomDateRange({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reportType: "custom"
      });

      const reportData = generateLocalReportData(period);
      setPreviewData(reportData);
      setPreviewType(period);
      setShowReportPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: t.reportError,
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Function to generate and download PDF reports
  const generatePDFReport = async () => {
    if (!previewData) {
      toast({
        title: "No Data",
        description: "No report data available to generate PDF.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Generating PDF with data:', previewData); // Debug log
      
      const generator = new PDFReportGenerator(t);
      
      // Ensure the data structure matches what PDFReportGenerator expects
      const reportData = {
        period: previewData.period,
        revenue: previewData.revenue || 0,
        transactions: previewData.transactions || 0,
        customers: previewData.totalUsers || 0,
        avgTransactionValue: previewData.avgTransactionValue || 0,
        transactions_data: previewData.recentTransactions || [],
        revenue_by_service: previewData.serviceBreakdown || [],
        payment_methods: previewData.paymentBreakdown || []
      };
      
      console.log('Formatted data for PDF:', reportData); // Debug log
      
      // Use the formatted data for PDF generation
      const pdf = generator.generateSimpleReport(reportData, 'monthly');
      
      // Create filename based on the current date range
      const dateRange = previewData.period.replace(/[^\w-]/g, '-');
      const filename = `wipay-wifi-token-report-${dateRange}-${new Date().toISOString().slice(0, 10)}.pdf`;
      
      pdf.save(filename);
      
      toast({
        title: t.reportGenerated,
        description: `WiFi Token Report downloaded successfully`,
      });
      
      setShowReportPreview(false);
    } catch (error) {
      console.error('Detailed PDF generation error:', error);
      toast({
        title: t.reportError,
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        variant: "destructive"
      });
    }
  };

  // Duration options with custom pricing
  const getDurationOptions = useCallback(() => [
    { value: "1", label: t.oneHour, price: pricingConfig.prices["1"] },
    { value: "3", label: t.threeHours, price: pricingConfig.prices["3"] },
    { value: "6", label: t.sixHours, price: pricingConfig.prices["6"] },
    { value: "12", label: t.twelveHours, price: pricingConfig.prices["12"] },
    { value: "24", label: t.oneDay, price: pricingConfig.prices["24"] }
  ], [pricingConfig.prices, t]);

  // Load configuration from storage
  useEffect(() => {
    // Since we're now using Firebase for data storage, we can skip localStorage for configuration
    // The loadUserData function handles loading from Firebase
    console.log('[Wipay] Configuration loading handled by Firebase integration');
  }, []);

  // Generate random WiFi credentials
  const generateCredentials = () => {
    const username = 'wifi_' + Math.random().toString(36).substr(2, 8);
    const password = Math.random().toString(36).substr(2, 12);
    return { username, password };
  };

  // Calculate token expiry time
  const calculateExpiryTime = (hours: number) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    return expiry.toISOString();
  };

  // Handle WiFi configuration save
  const handleSaveConfig = async () => {
    if (wifiConfig.ssid && wifiConfig.adminPassword && wifiConfig.momoNumber) {
      try {
        if (!currentUser?.id) {
          toast({
            title: "Error",
            description: "User not authenticated",
            variant: "destructive"
          });
          return;
        }

        // Save WiFi configuration to Firebase
        await userService.updateWifiConfig(currentUser.id, {
        ssid: wifiConfig.ssid,
          isConfigured: true
        });

        // Save pricing configuration to Firebase
        await userService.updatePricingConfig(currentUser.id, pricingConfig);
        
        setWifiConfig({ 
          ssid: wifiConfig.ssid, 
          adminPassword: wifiConfig.adminPassword, 
          momoNumber: wifiConfig.momoNumber, 
          isConfigured: true 
        });
      setShowWifiSetup(false);
        
      toast({
        title: t.configSaved,
        description: `WiFi network "${wifiConfig.ssid}" configured successfully`,
      });
      } catch (error) {
        console.error('Error saving configuration:', error);
        toast({
          title: "Error",
          description: "Failed to save configuration. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle pricing update
  const handlePricingUpdate = (duration: string, price: string) => {
    const numPrice = parseFloat(price) || 0;
    setPricingConfig(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [duration]: numPrice
      }
    }));
  };

  // Handle token generation
  const handleGenerateToken = async () => {
    if (!wifiConfig.isConfigured) {
      toast({
        title: "Setup Required",
        description: t.setupRequired,
        variant: "destructive"
      });
      return;
    }

    if (tokenForm.recipientPhone && tokenForm.duration && tokenForm.paymentMethod) {
      try {
        if (!currentUser?.id) {
          toast({
            title: "Error",
            description: "User not authenticated",
            variant: "destructive"
          });
          return;
        }

      const selectedDuration = getDurationOptions().find(d => d.value === tokenForm.duration);
      const credentials = generateCredentials();
      const expiryTime = calculateExpiryTime(parseInt(tokenForm.duration));
      
        // Create Firebase token object (without id, Firebase will generate it)
        const firebaseToken = {
          recipientPhone: tokenForm.recipientPhone,
          duration: parseInt(tokenForm.duration),
          price: selectedDuration?.price || 0,
          currency: pricingConfig.currency,
          paymentMethod: tokenForm.paymentMethod,
          status: 'active',
          createdAt: new Date(),
          expiresAt: new Date(expiryTime),
          username: credentials.username,
          password: credentials.password,
          isActive: true,
          userId: currentUser.id
        };

        // Add token to Firebase
        const tokenId = await tokenService.addToken(firebaseToken);
        
        // Create local token object for state update
      const newToken: WiFiToken = {
          id: tokenId,
        recipientPhone: tokenForm.recipientPhone,
        duration: parseInt(tokenForm.duration),
        price: selectedDuration?.price || 0,
        currency: pricingConfig.currency,
        paymentMethod: tokenForm.paymentMethod,
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: expiryTime,
        username: credentials.username,
        password: credentials.password,
        isActive: true
      };

      setTokens([...tokens, newToken]);
      setTokenForm({ recipientPhone: "", duration: "", paymentMethod: "", price: 0 });

      // Simulate SMS sending
      const smsMessage = `WiFi Access Token\nNetwork: ${wifiConfig.ssid}\nUsername: ${credentials.username}\nPassword: ${credentials.password}\nDuration: ${selectedDuration?.label}\nPrice: ${selectedDuration?.price} ${pricingConfig.currency}\nExpires: ${new Date(expiryTime).toLocaleString()}`;
      
      toast({
        title: t.tokenGenerated,
        description: `${t.smsSent} ${tokenForm.recipientPhone}`,
      });

      // In a real app, integrate with SMS API here
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          // Only log in development mode
          console.debug('SMS to send:', smsMessage);
        }
      } catch (error) {
        console.error('Error generating token:', error);
        toast({
          title: "Error",
          description: "Failed to generate token. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Update price when duration changes
  useEffect(() => {
    const selectedDuration = getDurationOptions().find(d => d.value === tokenForm.duration);
    if (selectedDuration) {
      setTokenForm(prev => ({ ...prev, price: selectedDuration.price }));
    }
  }, [tokenForm.duration, getDurationOptions]);

  // Calculate statistics
  const stats = {
    totalRevenue: tokens.reduce((sum, token) => sum + token.price, 0),
    activeUsers: tokens.filter(token => token.status === 'active' && new Date(token.expiresAt) > new Date()).length,
    tokensToday: tokens.filter(token => {
      const today = new Date().toDateString();
      return new Date(token.createdAt).toDateString() === today;
    }).length,
    totalUsers: new Set(tokens.map(token => token.recipientPhone)).size
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: t.active, className: "bg-blue-100 text-blue-800" },
      expired: { label: t.expired, className: "bg-red-100 text-red-800" },
      used: { label: t.used, className: "bg-gray-100 text-gray-800" },
      pending: { label: t.pending, className: "bg-blue-50 text-blue-700" }
    };
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="container mx-auto space-y-6">
        {/* Enhanced Header with User Info and Logout */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Wifi className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{t.title}</CardTitle>
                  <CardDescription>
                    {wifiConfig.isConfigured ? `Network: ${wifiConfig.ssid}` : t.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-4">
                {/* User Info */}
                {currentUser && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{currentUser.name}</span>
                    <Badge variant="outline">{currentUser.phone}</Badge>
                  </div>
                )}
                
                {/* Custom Pricing Indicator */}
                {wifiConfig.isConfigured && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {pricingConfig.currency}
                  </Badge>
                )}
                
                {/* WiFi Setup Button */}
                <Dialog open={showWifiSetup} onOpenChange={setShowWifiSetup}>
                  <DialogTrigger asChild>
                    <Button variant={wifiConfig.isConfigured ? "outline" : "default"}>
                      <Settings className="h-4 w-4 mr-2" />
                      {wifiConfig.isConfigured ? "WiFi Settings" : t.setupWifi}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t.wifiSetup}</DialogTitle>
                      <DialogDescription>{t.description}</DialogDescription>
                    </DialogHeader>
                    
                    <Tabs value={setupTab} onValueChange={setSetupTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="network">{t.networkConfig}</TabsTrigger>
                        <TabsTrigger value="pricing">{t.pricingConfig}</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="network" className="space-y-4">
                        <div>
                          <Label htmlFor="ssid">{t.ssid}</Label>
                          <Input
                            id="ssid"
                            value={wifiConfig.ssid}
                            onChange={(e) => setWifiConfig(prev => ({ ...prev, ssid: e.target.value }))}
                            placeholder={t.enterSSID}
                          />
                        </div>
                        <div>
                          <Label htmlFor="adminPassword">{t.adminPassword}</Label>
                          <Input
                            id="adminPassword"
                            type="password"
                            value={wifiConfig.adminPassword}
                            onChange={(e) => setWifiConfig(prev => ({ ...prev, adminPassword: e.target.value }))}
                            placeholder={t.enterAdminPassword}
                          />
                        </div>
                        <div>
                          <Label htmlFor="momoNumber">{t.momoNumber}</Label>
                          <Input
                            id="momoNumber"
                            value={wifiConfig.momoNumber}
                            onChange={(e) => setWifiConfig(prev => ({ ...prev, momoNumber: e.target.value }))}
                            placeholder={t.enterMomoNumber}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="pricing" className="space-y-4">
                        <div>
                          <Label htmlFor="currency">{t.currency}</Label>
                          <Select value={pricingConfig.currency} onValueChange={(value) => setPricingConfig(prev => ({ ...prev, currency: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder={t.selectCurrency} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SSP">South Sudanese Pound (SSP)</SelectItem>
                              <SelectItem value="USD">US Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">{t.tokenPricing}</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="price1">{t.oneHourPrice}</Label>
                              <Input
                                id="price1"
                                type="number"
                                value={pricingConfig.prices["1"]}
                                onChange={(e) => handlePricingUpdate("1", e.target.value)}
                                placeholder={t.enterPrice}
                              />
                            </div>
                            <div>
                              <Label htmlFor="price3">{t.threeHourPrice}</Label>
                              <Input
                                id="price3"
                                type="number"
                                value={pricingConfig.prices["3"]}
                                onChange={(e) => handlePricingUpdate("3", e.target.value)}
                                placeholder={t.enterPrice}
                              />
                            </div>
                            <div>
                              <Label htmlFor="price6">{t.sixHourPrice}</Label>
                              <Input
                                id="price6"
                                type="number"
                                value={pricingConfig.prices["6"]}
                                onChange={(e) => handlePricingUpdate("6", e.target.value)}
                                placeholder={t.enterPrice}
                              />
                            </div>
                            <div>
                              <Label htmlFor="price12">{t.twelveHourPrice}</Label>
                              <Input
                                id="price12"
                                type="number"
                                value={pricingConfig.prices["12"]}
                                onChange={(e) => handlePricingUpdate("12", e.target.value)}
                                placeholder={t.enterPrice}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <Label htmlFor="price24">{t.oneDayPrice}</Label>
                              <Input
                                id="price24"
                                type="number"
                                value={pricingConfig.prices["24"]}
                                onChange={(e) => handlePricingUpdate("24", e.target.value)}
                                placeholder={t.enterPrice}
                              />
                            </div>
                          </div>

                          {/* Pricing Preview */}
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium mb-2">{t.yourPricing}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              {getDurationOptions().map((option) => (
                                <div key={option.value} className="flex justify-between">
                                  <span>{option.label}:</span>
                                  <span className="font-medium">{option.price} {pricingConfig.currency}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setShowWifiSetup(false)} className="w-full sm:w-auto">
                        {t.cancel}
                      </Button>
                      <Button onClick={handleSaveConfig} className="w-full sm:w-auto">
                        <Settings className="h-4 w-4 mr-2" />
                        {t.saveConfig}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Generate Token Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={!wifiConfig.isConfigured}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t.generateToken}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.generateToken}</DialogTitle>
                      <DialogDescription>Create a new WiFi access token for a user</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="recipientPhone">{t.recipientPhone}</Label>
                        <Input
                          id="recipientPhone"
                          value={tokenForm.recipientPhone}
                          onChange={(e) => setTokenForm(prev => ({ ...prev, recipientPhone: e.target.value }))}
                          placeholder={t.enterRecipientPhone}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">{t.duration}</Label>
                        <Select value={tokenForm.duration} onValueChange={(value) => setTokenForm(prev => ({ ...prev, duration: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectDuration} />
                          </SelectTrigger>
                          <SelectContent>
                            {getDurationOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} - {option.price} {pricingConfig.currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">{t.paymentMethod}</Label>
                        <Select value={tokenForm.paymentMethod} onValueChange={(value) => setTokenForm(prev => ({ ...prev, paymentMethod: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectPayment} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">
                              <div className="flex items-center gap-2">
                                <Banknote className="h-4 w-4" />
                                {t.cash}
                              </div>
                            </SelectItem>
                            <SelectItem value="mtn_momo">
                              <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                {t.mtnMomo}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {tokenForm.duration && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t.price}:</span>
                            <span className="text-lg font-bold">{tokenForm.price} {pricingConfig.currency}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" className="w-full sm:w-auto">{t.cancel}</Button>
                        <Button onClick={handleGenerateToken} className="w-full sm:w-auto">
                          <Send className="h-4 w-4 mr-2" />
                          {t.generate}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Logout Button */}
                {onLogout && (
                  <Button variant="outline" onClick={onLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.logout}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* WiFi Not Configured Alert */}
        {!wifiConfig.isConfigured && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">{t.wifiNotConfigured}</h4>
                  <p className="text-sm text-yellow-700">{t.wifiNotConfiguredDesc}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  onClick={() => setShowWifiSetup(true)}
                >
                  {t.configureNow}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} {pricingConfig.currency}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.activeUsers}</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.tokensToday}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokensToday}</div>
            </CardContent>
          </Card>
        </div>

        {/* PDF Report Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t.generateReports}
            </CardTitle>
            <CardDescription>Generate PDF reports showing total revenue and total users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={() => previewReport('week')}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
              >
                <Clock className="h-4 w-4" />
                <div className="text-center">
                  <div className="font-medium">{t.previewWeekly}</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => previewReport('month')}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12"
              >
                <Calendar className="h-4 w-4" />
                <div className="text-center">
                  <div className="font-medium">{t.previewMonthly}</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => previewReport('year')}
                variant="outline"
                className="flex items-center justify-center gap-2 h-12 sm:col-span-2 lg:col-span-1"
              >
                <BarChart3 className="h-4 w-4" />
                <div className="text-center">
                  <div className="font-medium">{t.previewYearly}</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Token Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t.tokenManagement}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">{t.activeTokens}</TabsTrigger>
                <TabsTrigger value="history">{t.tokenHistory}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-4">
                {/* Mobile Card Layout */}
                <div className="block lg:hidden space-y-4">
                  {tokens
                    .filter(token => token.status === 'active' && new Date(token.expiresAt) > new Date())
                    .map((token) => (
                      <Card key={token.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{token.recipientPhone}</p>
                              <p className="text-sm text-muted-foreground">{token.duration}h duration</p>
                            </div>
                            {getStatusBadge(token.status)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">{t.username}:</span> {token.username}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{t.password}:</span> {token.password}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t.expiresAt}: {new Date(token.expiresAt).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Send className="h-3 w-3 mr-1" />
                              SMS
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <QrCode className="h-3 w-3 mr-1" />
                              QR
                            </Button>
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
                        <TableHead>{t.recipientPhone}</TableHead>
                        <TableHead>{t.credentials}</TableHead>
                        <TableHead>{t.duration}</TableHead>
                        <TableHead>{t.expiresAt}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens
                        .filter(token => token.status === 'active' && new Date(token.expiresAt) > new Date())
                        .map((token) => (
                          <TableRow key={token.id}>
                            <TableCell>{token.recipientPhone}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm"><strong>{t.username}:</strong> {token.username}</div>
                                <div className="text-sm"><strong>{t.password}:</strong> {token.password}</div>
                              </div>
                            </TableCell>
                            <TableCell>{token.duration}h</TableCell>
                            <TableCell>{new Date(token.expiresAt).toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(token.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Send className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <QrCode className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {/* Mobile Card Layout */}
                <div className="block lg:hidden space-y-4">
                  {tokens.map((token) => (
                    <Card key={token.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{token.recipientPhone}</p>
                            <p className="text-xs text-muted-foreground font-mono">{token.id}</p>
                          </div>
                          {getStatusBadge(token.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium">{t.duration}:</span> {token.duration}h
                          </div>
                          <div>
                            <span className="font-medium">{t.price}:</span> {token.price} {token.currency}
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              {token.paymentMethod === 'cash' ? (
                                <Banknote className="h-4 w-4" />
                              ) : (
                                <Smartphone className="h-4 w-4" />
                              )}
                              <span className="font-medium">{t.paymentMethod}:</span>
                              {token.paymentMethod === 'cash' ? t.cash : t.mtnMomo}
                            </div>
                          </div>
                          <div className="col-span-2 text-muted-foreground">
                            Created: {new Date(token.createdAt).toLocaleString()}
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
                        <TableHead>Token ID</TableHead>
                        <TableHead>{t.recipientPhone}</TableHead>
                        <TableHead>{t.duration}</TableHead>
                        <TableHead>{t.price}</TableHead>
                        <TableHead>{t.paymentMethod}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.map((token) => (
                        <TableRow key={token.id}>
                          <TableCell className="font-mono text-sm">{token.id}</TableCell>
                          <TableCell>{token.recipientPhone}</TableCell>
                          <TableCell>{token.duration}h</TableCell>
                          <TableCell>{token.price} {token.currency}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {token.paymentMethod === 'cash' ? (
                                <Banknote className="h-4 w-4" />
                              ) : (
                                <Smartphone className="h-4 w-4" />
                              )}
                              {token.paymentMethod === 'cash' ? t.cash : t.mtnMomo}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(token.status)}</TableCell>
                          <TableCell>{new Date(token.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Report Preview Modal */}
        <Dialog open={showReportPreview} onOpenChange={setShowReportPreview}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                <FileText className="h-5 w-5" />
                {t.reportPreview}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {previewType === 'week' ? t.weeklyReport : previewType === 'month' ? t.monthlyReport : t.yearlyReport}
                {previewData && ` - ${previewData.period}`}
              </DialogDescription>
            </DialogHeader>
            
            {previewData && (
              <div className="space-y-6">
                {/* Report Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold text-blue-600">Wipay</h2>
                  <p className="text-sm text-gray-600">WiFi Token Distribution System</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {previewType === 'week' ? t.weeklyReport : previewType === 'month' ? t.monthlyReport : t.yearlyReport}
                  </p>
                  <p className="text-xs text-gray-400">
                    Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </p>
                </div>

                {/* Custom Date Range Section */}
                <div className="space-y-4 border-b pb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Customize Date Range:</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="previewStartDate" className="text-xs font-medium flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Start Date
                      </Label>
                      <Input
                        id="previewStartDate"
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => {
                          setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }));
                        }}
                        max={customDateRange.endDate || new Date().toISOString().split('T')[0]}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="previewEndDate" className="text-xs font-medium flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        End Date
                      </Label>
                      <Input
                        id="previewEndDate"
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => {
                          setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }));
                        }}
                        min={customDateRange.startDate}
                        max={new Date().toISOString().split('T')[0]}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Quick shortcuts in dialog */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Quick Ranges:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const today = new Date();
                          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                          setCustomDateRange({
                            startDate: lastWeek.toISOString().split('T')[0],
                            endDate: today.toISOString().split('T')[0],
                            reportType: "custom"
                          });
                        }}
                      >
                        Last 7 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const today = new Date();
                          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                          setCustomDateRange({
                            startDate: lastMonth.toISOString().split('T')[0],
                            endDate: today.toISOString().split('T')[0],
                            reportType: "custom"
                          });
                        }}
                      >
                        Last 30 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const today = new Date();
                          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                          setCustomDateRange({
                            startDate: firstDayOfMonth.toISOString().split('T')[0],
                            endDate: today.toISOString().split('T')[0],
                            reportType: "custom"
                          });
                        }}
                      >
                        This Month
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          const today = new Date();
                          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                          setCustomDateRange({
                            startDate: firstDayOfYear.toISOString().split('T')[0],
                            endDate: today.toISOString().split('T')[0],
                            reportType: "custom"
                          });
                        }}
                      >
                        This Year
                      </Button>
                    </div>
                  </div>

                  {/* Update Preview Button */}
                  {customDateRange.startDate && customDateRange.endDate && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => {
                          const updatedData = generateCustomDateRangeReport(customDateRange.startDate, customDateRange.endDate);
                          setPreviewData(updatedData);
                        }}
                        size="sm"
                        className="text-xs"
                      >
                        Update Preview
                      </Button>
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Report Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-gray-600">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {previewData.revenue.toLocaleString()} SSP
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-gray-600">Total Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          {previewData.totalUsers}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Period Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Report Period</h4>
                  <p className="text-sm text-blue-700">{previewData.period}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    This report includes data from {previewData.transactions} transactions
                  </p>
                  <div className="mt-3 p-3 bg-blue-100 rounded text-sm text-blue-800">
                    <p className="font-medium">📄 Complete details will be included in the PDF:</p>
                    <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                      <li>Service breakdown by duration</li>
                      <li>Payment method analysis</li>
                      <li>Recent transaction history</li>
                      <li>Financial summaries and charts</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowReportPreview(false)} className="w-full sm:w-auto">
                    {t.close}
                  </Button>
                  <Button onClick={generatePDFReport} className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <FileText className="h-4 w-4" />
                    {t.downloadPDF}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WiFiTokenSystem; 