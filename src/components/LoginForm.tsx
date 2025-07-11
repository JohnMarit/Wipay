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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authenticateUser } from '@/lib/auth';
import { Globe, Lock, User } from 'lucide-react';
import { useState } from 'react';

interface LoginFormProps {
  onLogin: (userData: {
    id: string;
    username: string;
    name: string;
    phone: string;
    email: string;
  }) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

const LoginForm = ({ onLogin, language, setLanguage }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Wipay',
      subtitle: 'WiFi Token Management System',
      loginToAccount: 'Login to your account',
      signupToAccount: 'Create new account',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      signup: 'Sign Up',
      signingIn: 'Signing in...',
      signingUp: 'Creating account...',
      loginError: 'Invalid credentials',
      signupError: 'Failed to create account',
      networkError: 'Network error. Please check your connection.',
      enterUsername: 'Enter your username',
      enterPassword: 'Enter your password',
      selectLanguage: 'Select Language',
      switchToSignup: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Login',
      description: 'Complete WiFi token management for your business',
    },
    ar: {
      title: 'Wipay',
      subtitle: 'نظام إدارة رموز الواي فاي',
      loginToAccount: 'تسجيل الدخول إلى حسابك',
      signupToAccount: 'إنشاء حساب جديد',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      signingIn: 'جاري تسجيل الدخول...',
      signingUp: 'جاري إنشاء الحساب...',
      loginError: 'بيانات الاعتماد غير صحيحة',
      signupError: 'فشل في إنشاء الحساب',
      networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
      enterUsername: 'أدخل اسم المستخدم',
      enterPassword: 'أدخل كلمة المرور',
      selectLanguage: 'اختر اللغة',
      switchToSignup: 'ليس لديك حساب؟ أنشئ حساباً',
      switchToLogin: 'لديك حساب بالفعل؟ سجل دخولك',
      description: 'إدارة شاملة لرموز الواي فاي لعملك',
    },
  };

  const t = translations[language as keyof typeof translations];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await authenticateUser(username, password);
      if (user) {
        onLogin(user);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        toast({
          title: t.loginFailed,
          description: t.invalidCredentials,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t.loginFailed,
        description: t.invalidCredentials,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultPassword =
    import.meta.env.VITE_DEFAULT_PASSWORD || 'change-me-in-production';
  const demoAccounts = [
    { username: 'admin', role: t.admin, password: defaultPassword },
    { username: 'billing', role: t.billing, password: defaultPassword },
    { username: 'support', role: t.support, password: defaultPassword },
    { username: 'tech', role: t.technician, password: defaultPassword },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Language Selector */}
        <div className="flex justify-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-600 rounded-full">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">{t.title}</CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t.username}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={t.username}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t.password}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t.signingIn : t.login}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t.demoAccounts}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {demoAccounts.map(account => (
                <div
                  key={account.username}
                  className="p-2 bg-gray-50 rounded text-center"
                >
                  <div className="font-medium">{account.role}</div>
                  <div className="text-gray-600">
                    {account.username}/
                    {import.meta.env.VITE_DEBUG_MODE === 'true'
                      ? '••••••'
                      : 'check env'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
