import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChange, signOutUser } from '@/lib/auth';
import { authService } from '@/lib/firebase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    AlertTriangle,
    Eye,
    EyeOff,
    LogIn,
    UserPlus,
    Wifi,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// User authentication for WiFi token system
interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
}

// Login component props interface
interface LoginComponentProps {
  language: string;
  setLanguage: (lang: string) => void;
  isSignupMode: boolean;
  setIsSignupMode: (mode: boolean) => void;
  loginForm: {
    username: string;
    password: string;
    isLoading: boolean;
    error: string;
  };
  signupForm: {
    username: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone: string;
    email: string;
    isLoading: boolean;
    error: string;
  };
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleSignup: (e: React.FormEvent) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLoginPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: {
    title: string;
    loginSubtitle: string;
    signupSubtitle: string;
    username: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    login: string;
    signup: string;
    signingIn: string;
    signingUp: string;
    loginError: string;
    signupError: string;
    passwordMismatch: string;
    usernameExists: string;
    invalidPhone: string;
    invalidEmail: string;
    accountCreated: string;
    enterUsername: string;
    enterPassword: string;
    enterConfirmPassword: string;
    enterFullName: string;
    enterPhone: string;
    enterEmail: string;
    selectLanguage: string;
    switchToSignup: string;
    switchToLogin: string;
    createAccount: string;
    loginToAccount: string;
    passwordLength: string;
    networkError: string;
    unknownError: string;
  };
}

// LoginComponent moved outside App to prevent re-creation on every render
const LoginComponent: React.FC<LoginComponentProps> = ({
  language,
  setLanguage,
  isSignupMode,
  setIsSignupMode,
  loginForm,
  signupForm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleLogin,
  handleSignup,
  handleNameChange,
  handleEmailChange,
  handlePhoneChange,
  handlePasswordChange,
  handleConfirmPasswordChange,
  handleUsernameChange,
  handleLoginPasswordChange,
  t,
}) => (
  <div
    className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}
  >
    <div className="w-full max-w-md space-y-6">
      {/* Language Selector */}
      <div className="flex justify-center">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
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

              {/* Username/Email Field */}
              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <Input
                  id="username"
                  type="email"
                  value={loginForm.username}
                  onChange={handleUsernameChange}
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
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={handleLoginPasswordChange}
                    placeholder={t.enterPassword}
                    required
                    disabled={loginForm.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loginForm.isLoading ||
                  !loginForm.username ||
                  !loginForm.password
                }
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

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.fullName}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={signupForm.name}
                  onChange={handleNameChange}
                  placeholder={t.enterFullName}
                  required
                  disabled={signupForm.isLoading}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">{t.emailAddress}</Label>
                <Input
                  id="email"
                  type="email"
                  value={signupForm.email}
                  onChange={handleEmailChange}
                  placeholder={t.enterEmail}
                  required
                  disabled={signupForm.isLoading}
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phoneNumber}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={signupForm.phone}
                  onChange={handlePhoneChange}
                  placeholder={t.enterPhone}
                  required
                  disabled={signupForm.isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="signupPassword">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={signupForm.password}
                    onChange={handlePasswordChange}
                    placeholder={t.enterPassword}
                    required
                    minLength={6}
                    disabled={signupForm.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupForm.confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder={t.enterConfirmPassword}
                    required
                    minLength={6}
                    disabled={signupForm.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  signupForm.isLoading ||
                  !signupForm.name ||
                  !signupForm.email ||
                  !signupForm.phone ||
                  !signupForm.password ||
                  !signupForm.confirmPassword
                }
              >
                {signupForm.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t.signingUp}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t.signup}
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const { toast } = useToast();

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    isLoading: false,
    error: '',
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    email: '',
    isLoading: false,
    error: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Memoized input change handlers to prevent re-creation on every render
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupForm(prev => ({ ...prev, name: e.target.value }));
    },
    []
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupForm(prev => ({ ...prev, email: e.target.value }));
    },
    []
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupForm(prev => ({ ...prev, phone: e.target.value }));
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupForm(prev => ({ ...prev, password: e.target.value }));
    },
    []
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }));
    },
    []
  );

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginForm(prev => ({ ...prev, username: e.target.value }));
    },
    []
  );

  const handleLoginPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginForm(prev => ({ ...prev, password: e.target.value }));
    },
    []
  );

  const translations = {
    en: {
      title: 'Wipay',
      loginSubtitle: 'Login to your account',
      signupSubtitle: 'Create a new account',
      username: 'Username or Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      login: 'Login',
      signup: 'Sign Up',
      signingIn: 'Signing in...',
      signingUp: 'Creating account...',
      loginError: 'Invalid credentials or user not found',
      signupError: 'Failed to create account',
      passwordMismatch: 'Passwords do not match',
      usernameExists: 'Email already exists',
      invalidPhone: 'Please enter a valid phone number',
      invalidEmail: 'Please enter a valid email address',
      accountCreated: 'Account created successfully!',
      enterUsername: 'Enter your email address',
      enterPassword: 'Enter your password',
      enterConfirmPassword: 'Confirm your password',
      enterFullName: 'Enter your full name',
      enterPhone: 'Enter your phone number',
      enterEmail: 'Enter your email address',
      selectLanguage: 'Select Language',
      switchToSignup: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Login',
      createAccount: 'Create Account',
      loginToAccount: 'Login to Account',
      passwordLength: 'Password must be at least 6 characters',
      networkError: 'Network error. Please check your connection.',
      unknownError: 'An unknown error occurred. Please try again.',
    },
    ar: {
      title: 'Wipay',
      loginSubtitle: 'تسجيل الدخول إلى حسابك',
      signupSubtitle: 'إنشاء حساب جديد',
      username: 'اسم المستخدم أو البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      fullName: 'الاسم الكامل',
      phoneNumber: 'رقم الهاتف',
      emailAddress: 'عنوان البريد الإلكتروني',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      signingIn: 'جاري تسجيل الدخول...',
      signingUp: 'جاري إنشاء الحساب...',
      loginError: 'بيانات الاعتماد غير صحيحة أو المستخدم غير موجود',
      signupError: 'فشل في إنشاء الحساب',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      usernameExists: 'البريد الإلكتروني موجود بالفعل',
      invalidPhone: 'يرجى إدخال رقم هاتف صحيح',
      invalidEmail: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
      accountCreated: 'تم إنشاء الحساب بنجاح!',
      enterUsername: 'أدخل عنوان بريدك الإلكتروني',
      enterPassword: 'أدخل كلمة المرور',
      enterConfirmPassword: 'أكد كلمة المرور',
      enterFullName: 'أدخل اسمك الكامل',
      enterPhone: 'أدخل رقم الهاتف',
      enterEmail: 'أدخل عنوان البريد الإلكتروني',
      selectLanguage: 'اختر اللغة',
      switchToSignup: 'ليس لديك حساب؟ أنشئ حساباً',
      switchToLogin: 'لديك حساب بالفعل؟ سجل دخولك',
      createAccount: 'إنشاء حساب',
      loginToAccount: 'تسجيل الدخول',
      passwordLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
      unknownError: 'حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.',
    },
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = onAuthStateChange(user => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10 seconds timeout

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeoutId);
    };
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
    setLoginForm(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Use email for Firebase authentication
      const email = loginForm.username.includes('@')
        ? loginForm.username
        : `${loginForm.username}@wipay.local`; // Fallback for username

      await authService.signIn(email, loginForm.password);

      setLoginForm({ username: '', password: '', isLoading: false, error: '' });
    } catch (error: unknown) {
      let errorMessage = t.loginError;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (errorMsg.includes('user-not-found')) {
        errorMessage = t.loginError;
      } else if (errorMsg.includes('wrong-password')) {
        errorMessage = t.loginError;
      } else if (errorMsg.includes('network')) {
        errorMessage = t.networkError;
      } else if (errorMsg.includes('too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      setLoginForm(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupForm(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Validation
      if (signupForm.password !== signupForm.confirmPassword) {
        setSignupForm(prev => ({
          ...prev,
          isLoading: false,
          error: t.passwordMismatch,
        }));
        return;
      }

      if (signupForm.password.length < 6) {
        setSignupForm(prev => ({
          ...prev,
          isLoading: false,
          error: t.passwordLength,
        }));
        return;
      }

      if (!validateEmail(signupForm.email)) {
        setSignupForm(prev => ({
          ...prev,
          isLoading: false,
          error: t.invalidEmail,
        }));
        return;
      }

      if (!validatePhone(signupForm.phone)) {
        setSignupForm(prev => ({
          ...prev,
          isLoading: false,
          error: t.invalidPhone,
        }));
        return;
      }

      // Create new user with Firebase
      await authService.signUp(
        signupForm.email,
        signupForm.password,
        signupForm.name,
        signupForm.phone
      );

      setSignupForm({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        email: '',
        isLoading: false,
        error: '',
      });

      toast({
        title: t.accountCreated,
        description: `Welcome ${signupForm.name}! You can now set up your WiFi network.`,
      });
    } catch (error: unknown) {
      let errorMessage = t.signupError;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (errorMsg.includes('email-already-in-use')) {
        errorMessage = t.usernameExists;
      } else if (errorMsg.includes('weak-password')) {
        errorMessage = t.passwordLength;
      } else if (errorMsg.includes('network')) {
        errorMessage = t.networkError;
      }

      setSignupForm(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoginForm({ username: '', password: '', isLoading: false, error: '' });
      setSignupForm({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        email: '',
        isLoading: false,
        error: '',
      });
      setIsSignupMode(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Wipay...</p>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we set up your workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginComponent
              language={language}
              setLanguage={setLanguage}
              isSignupMode={isSignupMode}
              setIsSignupMode={setIsSignupMode}
              loginForm={loginForm}
              setLoginForm={setLoginForm}
              signupForm={signupForm}
              setSignupForm={setSignupForm}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              handleLogin={handleLogin}
              handleSignup={handleSignup}
              handleNameChange={handleNameChange}
              handleEmailChange={handleEmailChange}
              handlePhoneChange={handlePhoneChange}
              handlePasswordChange={handlePasswordChange}
              handleConfirmPasswordChange={handleConfirmPasswordChange}
              handleUsernameChange={handleUsernameChange}
              handleLoginPasswordChange={handleLoginPasswordChange}
              t={t}
            />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Index currentUser={currentUser} onLogout={handleLogout} />
                ) : (
                  <LoginComponent
                    language={language}
                    setLanguage={setLanguage}
                    isSignupMode={isSignupMode}
                    setIsSignupMode={setIsSignupMode}
                    loginForm={loginForm}
                    setLoginForm={setLoginForm}
                    signupForm={signupForm}
                    setSignupForm={setSignupForm}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword}
                    setShowConfirmPassword={setShowConfirmPassword}
                    handleLogin={handleLogin}
                    handleSignup={handleSignup}
                    handleNameChange={handleNameChange}
                    handleEmailChange={handleEmailChange}
                    handlePhoneChange={handlePhoneChange}
                    handlePasswordChange={handlePasswordChange}
                    handleConfirmPasswordChange={handleConfirmPasswordChange}
                    handleUsernameChange={handleUsernameChange}
                    handleLoginPasswordChange={handleLoginPasswordChange}
                    t={t}
                  />
                )
              }
            />
            <Route
              path="*"
              element={isAuthenticated ? <NotFound /> : <LoginComponent
                language={language}
                setLanguage={setLanguage}
                isSignupMode={isSignupMode}
                setIsSignupMode={setIsSignupMode}
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                signupForm={signupForm}
                setSignupForm={setSignupForm}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                handleLogin={handleLogin}
                handleSignup={handleSignup}
                handleNameChange={handleNameChange}
                handleEmailChange={handleEmailChange}
                handlePhoneChange={handlePhoneChange}
                handlePasswordChange={handlePasswordChange}
                handleConfirmPasswordChange={handleConfirmPasswordChange}
                handleUsernameChange={handleUsernameChange}
                handleLoginPasswordChange={handleLoginPasswordChange}
                t={t}
              />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
