import BillingDashboard from '@/components/BillingDashboard';
import CustomerSupport from '@/components/CustomerSupport';
import MobileFooter from '@/components/MobileFooter';
import NotificationTest from '@/components/NotificationTest';
import ProfileCompletion from '@/components/ProfileCompletion';
import WiFiTokenSystem from '@/components/WiFiTokenSystem';
import { Button } from '@/components/ui/button';
import { UserProfile, userService } from '@/lib/firebase';
import { useCallback, useEffect, useState } from 'react';

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
  const [showSupport, setShowSupport] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      logout: 'Logout',
      billing: 'Billing',
      support: 'Support',
      loadingProfile: 'Loading profile...',
    },
    ar: {
      logout: 'تسجيل الخروج',
      billing: 'الفواتير',
      support: 'الدعم',
      loadingProfile: 'جاري تحميل الملف الشخصي...',
    },
  };

  const t = translations[language as keyof typeof translations];

  const checkProfileCompletion = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      // Check if user needs profile completion
      const needsCompletion = await userService.needsProfileCompletion(
        currentUser.id
      );
      setNeedsProfileCompletion(needsCompletion);

      // Load user profile for billing info
      if (!needsCompletion) {
        const profile = await userService.getUserProfile(currentUser.id);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // Default to requiring completion if there's an error
      setNeedsProfileCompletion(true);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      checkProfileCompletion();
    }
  }, [currentUser, checkProfileCompletion]);

  // Listen for support button clicks from WiFiTokenSystem
  useEffect(() => {
    const handleSupportClick = () => {
      setShowSupport(true);
    };

    window.addEventListener('openSupport', handleSupportClick);
    return () => {
      window.removeEventListener('openSupport', handleSupportClick);
    };
  }, []);

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
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${language === 'ar' ? 'rtl' : 'ltr'} pb-20`}
      >
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

        {/* Mobile-Optimized Footer */}
        <MobileFooter
          language={language}
          setLanguage={setLanguage}
          currentUser={currentUser}
          onLogout={onLogout}
          onSupportClick={() => setShowSupport(true)}
          onBillingClick={() => setShowBilling(true)}
          showBillingButton={!!userProfile?.paymentProfile}
        />
      </div>
    );
  }

  // Show support page if requested
  if (showSupport && currentUser) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 ${language === 'ar' ? 'rtl' : 'ltr'} pb-20`}
      >
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowSupport(false)}
                className="flex items-center gap-2"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">Customer Support</h1>
            </div>
          </div>

          {/* Customer Support */}
          <CustomerSupport currentUser={currentUser} />
        </div>

        {/* Mobile-Optimized Footer */}
        <MobileFooter
          language={language}
          setLanguage={setLanguage}
          currentUser={currentUser}
          onLogout={onLogout}
          onSupportClick={() => setShowSupport(true)}
          onBillingClick={() => setShowBilling(true)}
          showBillingButton={!!userProfile?.paymentProfile}
        />
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

        {/* Temporary Notification Test */}
        {currentUser && (
          <div className="mt-6">
            <NotificationTest currentUser={currentUser} />
          </div>
        )}
      </div>

      {/* Mobile-Optimized Footer */}
      <MobileFooter
        language={language}
        setLanguage={setLanguage}
        currentUser={currentUser}
        onLogout={onLogout}
        onSupportClick={() => setShowSupport(true)}
        onBillingClick={() => setShowBilling(true)}
        showBillingButton={!!userProfile?.paymentProfile}
      />
    </div>
  );
};

export default Index;
