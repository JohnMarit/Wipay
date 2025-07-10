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
import { Globe, Lock, User } from 'lucide-react';
import { authenticateUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

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
      title: 'South Sudan ISP Management System',
      subtitle: 'Secure Login Portal',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      signingIn: 'Signing in...',
      demoAccounts: 'Demo Accounts',
      admin: 'Administrator',
      billing: 'Billing Manager',
      support: 'Customer Service',
      technician: 'Field Technician',
      loginFailed: 'Login failed',
      invalidCredentials: 'Invalid username or password',
    },
    ar: {
      title: 'نظام إدارة مزود خدمة الإنترنت - جنوب السودان',
      subtitle: 'بوابة الدخول الآمنة',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      signingIn: 'جاري تسجيل الدخول...',
      demoAccounts: 'حسابات تجريبية',
      admin: 'مدير النظام',
      billing: 'مدير الفوترة',
      support: 'خدمة العملاء',
      technician: 'فني ميداني',
      loginFailed: 'فشل تسجيل الدخول',
      invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
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
