import BillingDashboard from '@/components/BillingDashboard';
import LanguageSelector from '@/components/LanguageSelector';
import ProfileCompletion from '@/components/ProfileCompletion';
import WiFiTokenSystem from '@/components/WiFiTokenSystem';
import { Button } from '@/components/ui/button';
import { userService } from '@/lib/firebase';
import { CreditCard, LogOut } from 'lucide-react';
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
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      logout: 'Logout',
      billing: 'Billing',
      loadingProfile: 'Loading profile...',
    },
    ar: {
      logout: 'تسجيل الخروج',
      billing: 'الفواتير',
      loadingProfile: 'جاري تحميل الملف الشخصي...',
    },
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (currentUser?.id) {
      checkProfileCompletion();
    }
  }, [currentUser]);

  const checkProfileCompletion = async () => {
    try {
      setLoading(true);

      // Check if user needs profile completion
      const needsCompletion = await userService.needsProfileCompletion(currentUser!.id);
      setNeedsProfileCompletion(needsCompletion);

      // Load user profile for billing info
      if (!needsCompletion) {
        const profile = await userService.getUserProfile(currentUser!.id);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // Default to requiring completion if there's an error
      setNeedsProfileCompletion(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCompleted = () => {
    setNeedsProfileCompletion(false);
    checkProfileCompletion(); // Reload profile data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">{t.loadingProfile}</p>
        </div>
      </div>
    );
  }

  // Show profile completion if needed
  if (needsProfileCompletion && currentUser) {
    return (
      <ProfileCompletion
        currentUser={currentUser}
        onComplete={handleProfileCompleted}
      />
    );
  }

  // Show billing dashboard if requested
  if (showBilling && currentUser && userProfile) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${language === 'ar' ? 'rtl' : 'ltr'} pb-20`}>
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowBilling(false)}
                className="flex items-center gap-2"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Billing & Payments</h1>
            </div>
          </div>

          {/* Billing Dashboard */}
          <BillingDashboard
            currentUser={currentUser}
            userProfile={userProfile}
            onPlanChanged={() => {
              // Refresh profile data when plan changes
              checkProfileCompletion();
            }}
          />
        </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <LanguageSelector language={language} setLanguage={setLanguage} />
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            <div className="flex items-center gap-2">
              {/* Billing Button */}
              {currentUser && userProfile?.paymentProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBilling(true)}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  {t.billing}
                </Button>
              )}

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
    </div>
  );
};

export default Index;
