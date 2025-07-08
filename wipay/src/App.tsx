import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WiFiTokenSystem from "./components/WiFiTokenSystem";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wifi, Eye, EyeOff, UserPlus, LogIn, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient();

// User authentication for WiFi token system
interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
}

interface StoredUser extends User {
  password: string;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const [isSignupMode, setIsSignupMode] = useState(false);
  const { toast } = useToast();
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    isLoading: false,
    error: ""
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    email: "",
    isLoading: false,
    error: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Demo users database (in production, this would be from a real database/API)
  const defaultUsers = [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      name: "WiFi Administrator",
      phone: "+211912345678",
      email: "admin@wifi.ss"
    },
    {
      id: "2", 
      username: "cafe_owner",
      password: "cafe123",
      name: "Cafe Owner",
      phone: "+211923456789",
      email: "cafe@wifi.ss"
    },
    {
      id: "3",
      username: "hotel_manager", 
      password: "hotel123",
      name: "Hotel Manager",
      phone: "+211934567890",
      email: "hotel@wifi.ss"
    }
  ];

  // Get all users (default + created accounts)
  const getAllUsers = (): StoredUser[] => {
    const storedUsers = localStorage.getItem('registeredUsers');
    const createdUsers = storedUsers ? JSON.parse(storedUsers) : [];
    return [...defaultUsers, ...createdUsers];
  };

  const translations = {
    en: {
      title: "WiFi Token Management System",
      loginSubtitle: "Login to your account",
      signupSubtitle: "Create a new account",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      emailAddress: "Email Address",
      login: "Login",
      signup: "Sign Up",
      signingIn: "Signing in...",
      signingUp: "Creating account...",
      loginError: "Invalid username or password",
      signupError: "Failed to create account",
      passwordMismatch: "Passwords do not match",
      usernameExists: "Username already exists",
      invalidPhone: "Please enter a valid phone number",
      invalidEmail: "Please enter a valid email address",
      accountCreated: "Account created successfully!",
      demoAccounts: "Demo Accounts",
      adminAccount: "admin / admin123",
      cafeAccount: "cafe_owner / cafe123", 
      hotelAccount: "hotel_manager / hotel123",
      enterUsername: "Enter your username",
      enterPassword: "Enter your password",
      enterConfirmPassword: "Confirm your password",
      enterFullName: "Enter your full name",
      enterPhone: "Enter your phone number",
      enterEmail: "Enter your email address",
      selectLanguage: "Select Language",
      switchToSignup: "Don't have an account? Sign up",
      switchToLogin: "Already have an account? Login",
      createAccount: "Create Account",
      loginToAccount: "Login to Account"
    },
    ar: {
      title: "نظام إدارة رموز الواي فاي",
      loginSubtitle: "تسجيل الدخول إلى حسابك",
      signupSubtitle: "إنشاء حساب جديد",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      fullName: "الاسم الكامل",
      phoneNumber: "رقم الهاتف",
      emailAddress: "عنوان البريد الإلكتروني",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      signingIn: "جاري تسجيل الدخول...",
      signingUp: "جاري إنشاء الحساب...",
      loginError: "اسم المستخدم أو كلمة المرور غير صحيحة",
      signupError: "فشل في إنشاء الحساب",
      passwordMismatch: "كلمات المرور غير متطابقة",
      usernameExists: "اسم المستخدم موجود بالفعل",
      invalidPhone: "يرجى إدخال رقم هاتف صحيح",
      invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صحيح",
      accountCreated: "تم إنشاء الحساب بنجاح!",
      demoAccounts: "حسابات تجريبية",
      adminAccount: "admin / admin123",
      cafeAccount: "cafe_owner / cafe123",
      hotelAccount: "hotel_manager / hotel123", 
      enterUsername: "أدخل اسم المستخدم",
      enterPassword: "أدخل كلمة المرور",
      enterConfirmPassword: "أكد كلمة المرور",
      enterFullName: "أدخل اسمك الكامل",
      enterPhone: "أدخل رقم الهاتف",
      enterEmail: "أدخل عنوان البريد الإلكتروني",
      selectLanguage: "اختر اللغة",
      switchToSignup: "ليس لديك حساب؟ أنشئ حساباً",
      switchToLogin: "لديك حساب بالفعل؟ سجل دخولك",
      createAccount: "إنشاء حساب",
      loginToAccount: "تسجيل الدخول"
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    // Check for existing authentication
    const storedUser = localStorage.getItem('wifiTokenUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('wifiTokenUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Validation functions
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginForm(prev => ({ ...prev, isLoading: true, error: "" }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user in all users (default + created)
    const allUsers = getAllUsers();
    const user = allUsers.find(u => 
      u.username === loginForm.username && u.password === loginForm.password
    );

    if (user) {
      const userData: User = {
        id: user.id,
        username: user.username,
        name: user.name,
        phone: user.phone,
        email: user.email
      };
      
      setCurrentUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('wifiTokenUser', JSON.stringify(userData));
      setLoginForm({ username: "", password: "", isLoading: false, error: "" });
    } else {
      setLoginForm(prev => ({
        ...prev,
        isLoading: false,
        error: t.loginError
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupForm(prev => ({ ...prev, isLoading: true, error: "" }));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validation
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupForm(prev => ({
        ...prev,
        isLoading: false,
        error: t.passwordMismatch
      }));
      return;
    }

    if (!validateEmail(signupForm.email)) {
      setSignupForm(prev => ({
        ...prev,
        isLoading: false,
        error: t.invalidEmail
      }));
      return;
    }

    if (!validatePhone(signupForm.phone)) {
      setSignupForm(prev => ({
        ...prev,
        isLoading: false,
        error: t.invalidPhone
      }));
      return;
    }

    // Check if username already exists
    const allUsers = getAllUsers();
    if (allUsers.some(u => u.username === signupForm.username)) {
      setSignupForm(prev => ({
        ...prev,
        isLoading: false,
        error: t.usernameExists
      }));
      return;
    }

    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      username: signupForm.username,
      password: signupForm.password,
      name: signupForm.name,
      phone: signupForm.phone,
      email: signupForm.email
    };

    // Save to localStorage
    const storedUsers = localStorage.getItem('registeredUsers');
    const existingUsers = storedUsers ? JSON.parse(storedUsers) : [];
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    // Auto-login after successful signup
    const userData: User = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email
    };

    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('wifiTokenUser', JSON.stringify(userData));
    
    setSignupForm({
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      email: "",
      isLoading: false,
      error: ""
    });

    toast({
      title: t.accountCreated,
      description: `Welcome ${newUser.name}! You can now set up your WiFi network.`,
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('wifiTokenUser');
    localStorage.removeItem('wifiConfig');
    setLoginForm({ username: "", password: "", isLoading: false, error: "" });
    setSignupForm({
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      phone: "",
      email: "",
      isLoading: false,
      error: ""
    });
    setIsSignupMode(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WiFi Token System...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className="w-full max-w-md space-y-6">
              {/* Language Selector */}
              <div className="flex justify-center">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="p-2 border rounded bg-white"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Login/Signup Card */}
              <Card className="shadow-lg">
                <CardHeader className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-blue-600 rounded-full">
                      <Wifi className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{t.title}</CardTitle>
                    <CardDescription>
                      {isSignupMode ? t.signupSubtitle : t.loginSubtitle}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Toggle between Login and Signup */}
                  <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                    <button
                      type="button"
                      onClick={() => setIsSignupMode(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        !isSignupMode 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <LogIn className="h-4 w-4" />
                      {t.loginToAccount}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSignupMode(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        isSignupMode 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t.createAccount}
                    </button>
                  </div>

                  {/* Login Form */}
                  {!isSignupMode && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      {/* Error Display */}
                      {loginForm.error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          {loginForm.error}
                        </div>
                      )}

                      {/* Username Field */}
                      <div className="space-y-2">
                        <Label htmlFor="username">{t.username}</Label>
                        <Input
                          id="username"
                          type="text"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder={t.enterUsername}
                          required
                          disabled={loginForm.isLoading}
                        />
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <Label htmlFor="password">{t.password}</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder={t.enterPassword}
                            required
                            disabled={loginForm.isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Login Button */}
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginForm.isLoading || !loginForm.username || !loginForm.password}
                      >
                        {loginForm.isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t.signingIn}
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            {t.login}
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Signup Form */}
                  {isSignupMode && (
                    <form onSubmit={handleSignup} className="space-y-4">
                      {/* Error Display */}
                      {signupForm.error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          {signupForm.error}
                        </div>
                      )}

                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t.fullName}</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={signupForm.name}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t.enterFullName}
                          required
                          disabled={signupForm.isLoading}
                        />
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <Label htmlFor="signupUsername">{t.username}</Label>
                        <Input
                          id="signupUsername"
                          type="text"
                          value={signupForm.username}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder={t.enterUsername}
                          required
                          disabled={signupForm.isLoading}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.emailAddress}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t.enterEmail}
                          required
                          disabled={signupForm.isLoading}
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t.phoneNumber}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={signupForm.phone}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder={t.enterPhone}
                          required
                          disabled={signupForm.isLoading}
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword">{t.password}</Label>
                        <div className="relative">
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            value={signupForm.password}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                            placeholder={t.enterPassword}
                            required
                            disabled={signupForm.isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder={t.enterConfirmPassword}
                            required
                            disabled={signupForm.isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Signup Button */}
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={signupForm.isLoading || !signupForm.username || !signupForm.password || !signupForm.name || !signupForm.email || !signupForm.phone}
                      >
                        {signupForm.isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {t.signingUp}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t.signup}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Demo Accounts Card - Only show on login */}
              {!isSignupMode && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm">{t.demoAccounts}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Administrator</div>
                        <div className="text-gray-600">{t.adminAccount}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Cafe Owner</div>
                        <div className="text-gray-600">{t.cafeAccount}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Hotel Manager</div>
                        <div className="text-gray-600">{t.hotelAccount}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <WiFiTokenSystem 
                  language={language}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
