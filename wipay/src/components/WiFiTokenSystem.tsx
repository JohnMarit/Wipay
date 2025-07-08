import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi, Smartphone, Banknote, Clock, Send, Settings, History, Plus, QrCode, LogOut, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WiFiTokenSystemProps {
  language: string;
  currentUser?: any;
  onLogout?: () => void;
}

interface WiFiToken {
  id: string;
  recipientPhone: string;
  duration: number;
  price: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  username: string;
  password: string;
  isActive: boolean;
}

const WiFiTokenSystem = ({ language, currentUser, onLogout }: WiFiTokenSystemProps) => {
  const { toast } = useToast();
  const [wifiConfig, setWifiConfig] = useState({
    ssid: "",
    adminPassword: "",
    momoNumber: "",
    isConfigured: false
  });
  
  const [showWifiSetup, setShowWifiSetup] = useState(false);
  
  const [tokenForm, setTokenForm] = useState({
    recipientPhone: "",
    duration: "",
    paymentMethod: "",
    price: 0
  });

  const [tokens, setTokens] = useState<WiFiToken[]>([]);

  const translations = {
    en: {
      title: "WiFi Token Distribution System",
      description: "Generate and distribute WiFi access tokens",
      setup: "Network Setup",
      wifiSetup: "WiFi Network Configuration",
      ssid: "WiFi Network Name (SSID)",
      adminPassword: "Admin WiFi Password",
      momoNumber: "Your MTN MoMo Number",
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
      price: "Price (SSP)",
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
      enterSSID: "Enter WiFi network name",
      enterAdminPassword: "Enter admin password",
      enterMomoNumber: "Enter MTN MoMo number",
      enterRecipientPhone: "Enter recipient's phone",
      selectDuration: "Select access duration",
      selectPayment: "Select payment method",
      setupRequired: "Please setup your WiFi network first",
      totalRevenue: "Total Revenue",
      activeUsers: "Active Users",
      tokensToday: "Tokens Today",
      logout: "Logout",
      welcomeBack: "Welcome back",
      userProfile: "User Profile",
      wifiNotConfigured: "WiFi Network Not Configured",
      wifiNotConfiguredDesc: "Set up your WiFi network to start generating tokens",
      configureNow: "Configure WiFi Network"
    },
    ar: {
      title: "نظام توزيع رموز الواي فاي",
      description: "إنشاء وتوزيع رموز الوصول للواي فاي",
      setup: "إعداد الشبكة",
      wifiSetup: "تكوين شبكة الواي فاي",
      ssid: "اسم شبكة الواي فاي",
      adminPassword: "كلمة مرور المدير",
      momoNumber: "رقم إم تي إن موبايل موني",
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
      price: "السعر (جنيه جنوب سوداني)",
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
      enterSSID: "أدخل اسم شبكة الواي فاي",
      enterAdminPassword: "أدخل كلمة مرور المدير",
      enterMomoNumber: "أدخل رقم موبايل موني",
      enterRecipientPhone: "أدخل رقم هاتف المستلم",
      selectDuration: "اختر مدة الوصول",
      selectPayment: "اختر طريقة الدفع",
      setupRequired: "يرجى إعداد شبكة الواي فاي أولاً",
      totalRevenue: "إجمالي الإيرادات",
      activeUsers: "المستخدمون النشطون",
      tokensToday: "الرموز اليوم",
      logout: "تسجيل الخروج",
      welcomeBack: "أهلاً بعودتك",
      userProfile: "الملف الشخصي",
      wifiNotConfigured: "شبكة الواي فاي غير مكونة",
      wifiNotConfiguredDesc: "قم بإعداد شبكة الواي فاي لبدء إنشاء الرموز",
      configureNow: "تكوين شبكة الواي فاي"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Duration and pricing configuration
  const durationOptions = [
    { value: "1", label: t.oneHour, price: 50 },
    { value: "3", label: t.threeHours, price: 120 },
    { value: "6", label: t.sixHours, price: 200 },
    { value: "12", label: t.twelveHours, price: 350 },
    { value: "24", label: t.oneDay, price: 500 }
  ];

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('wifiConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setWifiConfig({ ...config, isConfigured: true });
    }
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
  const handleSaveConfig = () => {
    if (wifiConfig.ssid && wifiConfig.adminPassword && wifiConfig.momoNumber) {
      const config = {
        ssid: wifiConfig.ssid,
        adminPassword: wifiConfig.adminPassword,
        momoNumber: wifiConfig.momoNumber
      };
      localStorage.setItem('wifiConfig', JSON.stringify(config));
      setWifiConfig({ ...config, isConfigured: true });
      setShowWifiSetup(false);
      toast({
        title: t.configSaved,
        description: `WiFi network "${wifiConfig.ssid}" configured successfully`,
      });
    }
  };

  // Handle token generation
  const handleGenerateToken = () => {
    if (!wifiConfig.isConfigured) {
      toast({
        title: "Setup Required",
        description: t.setupRequired,
        variant: "destructive"
      });
      return;
    }

    if (tokenForm.recipientPhone && tokenForm.duration && tokenForm.paymentMethod) {
      const selectedDuration = durationOptions.find(d => d.value === tokenForm.duration);
      const credentials = generateCredentials();
      const expiryTime = calculateExpiryTime(parseInt(tokenForm.duration));
      
      const newToken: WiFiToken = {
        id: 'TOKEN-' + Date.now(),
        recipientPhone: tokenForm.recipientPhone,
        duration: parseInt(tokenForm.duration),
        price: selectedDuration?.price || 0,
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
      const smsMessage = `WiFi Access Token\nNetwork: ${wifiConfig.ssid}\nUsername: ${credentials.username}\nPassword: ${credentials.password}\nDuration: ${selectedDuration?.label}\nExpires: ${new Date(expiryTime).toLocaleString()}`;
      
      toast({
        title: t.tokenGenerated,
        description: `${t.smsSent} ${tokenForm.recipientPhone}`,
      });

      // In a real app, integrate with SMS API here
      console.log('SMS to send:', smsMessage);
    }
  };

  // Update price when duration changes
  useEffect(() => {
    const selectedDuration = durationOptions.find(d => d.value === tokenForm.duration);
    if (selectedDuration) {
      setTokenForm(prev => ({ ...prev, price: selectedDuration.price }));
    }
  }, [tokenForm.duration]);

  // Calculate statistics
  const stats = {
    totalRevenue: tokens.reduce((sum, token) => sum + token.price, 0),
    activeUsers: tokens.filter(token => token.status === 'active' && new Date(token.expiresAt) > new Date()).length,
    tokensToday: tokens.filter(token => {
      const today = new Date().toDateString();
      return new Date(token.createdAt).toDateString() === today;
    }).length
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: t.active, className: "bg-green-100 text-green-800" },
      expired: { label: t.expired, className: "bg-red-100 text-red-800" },
      used: { label: t.used, className: "bg-gray-100 text-gray-800" },
      pending: { label: t.pending, className: "bg-yellow-100 text-yellow-800" }
    };
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto space-y-6">
        {/* Enhanced Header with User Info and Logout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
              
              <div className="flex items-center gap-4">
                {/* User Info */}
                {currentUser && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{currentUser.name}</span>
                    <Badge variant="outline">{currentUser.phone}</Badge>
                  </div>
                )}
                
                {/* WiFi Setup Button */}
                <Dialog open={showWifiSetup} onOpenChange={setShowWifiSetup}>
                  <DialogTrigger asChild>
                    <Button variant={wifiConfig.isConfigured ? "outline" : "default"}>
                      <Settings className="h-4 w-4 mr-2" />
                      {wifiConfig.isConfigured ? "WiFi Settings" : t.setupWifi}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t.wifiSetup}</DialogTitle>
                      <DialogDescription>{t.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
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
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowWifiSetup(false)}>
                          {t.cancel}
                        </Button>
                        <Button onClick={handleSaveConfig}>
                          <Settings className="h-4 w-4 mr-2" />
                          {t.saveConfig}
                        </Button>
                      </div>
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
                            {durationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} - {option.price} SSP
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
                            <span className="text-lg font-bold">{tokenForm.price} SSP</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">{t.cancel}</Button>
                        <Button onClick={handleGenerateToken}>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} SSP</div>
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
                <div className="rounded-md border">
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
                <div className="rounded-md border">
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
                          <TableCell>{token.price} SSP</TableCell>
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
      </div>
    </div>
  );
};

export default WiFiTokenSystem; 