import LanguageSelector from '@/components/LanguageSelector';
import WiFiTokenSystem from '@/components/WiFiTokenSystem';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

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

  const translations = {
    en: {
      logout: 'Logout',
    },
    ar: {
      logout: 'تسجيل الخروج',
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${language === 'ar' ? 'rtl' : 'ltr'} pb-20`}
    >
      <div className="container mx-auto p-4">
        {/* WiFi Token Management System - Main Content */}
        <WiFiTokenSystem language={language} currentUser={currentUser} />
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <LanguageSelector language={language} setLanguage={setLanguage} />
            </div>

            {/* Logout Button */}
            {currentUser && (
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                {t.logout}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
