import LanguageSelector from '@/components/LanguageSelector';
import WiFiTokenSystem from '@/components/WiFiTokenSystem';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertTriangle,
    Globe,
    LogOut,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface IndexProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onLogout?: () => void;
}

const Index = ({ currentUser, onLogout }: IndexProps) => {
  const [language, setLanguage] = useState('en');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monitor online/offline status for reliable connectivity
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

  const translations = {
    en: {
      title: 'Wipay',
      offlineMode: 'Offline Mode',
      onlineStatus: 'Online',
      lastSync: 'Last Sync',
      welcomeBack: 'Welcome back',
      logout: 'Logout',
    },
    ar: {
      title: 'Wipay',
      offlineMode: 'وضع عدم الاتصال',
      onlineStatus: 'متصل',
      lastSync: 'آخر مزامنة',
      welcomeBack: 'أهلاً بعودتك',
      logout: 'تسجيل الخروج',
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${language === 'ar' ? 'rtl' : 'ltr'}`}
    >
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
                    {currentUser.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
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

        {/* System Alerts */}
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

        {/* WiFi Token Management System - Original Dashboard */}
        <WiFiTokenSystem
          language={language}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
};

export default Index;
