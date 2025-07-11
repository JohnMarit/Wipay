import { Button } from '@/components/ui/button';
import { CreditCard, LogOut, MessageCircle } from 'lucide-react';
import { ReactNode } from 'react';
import LanguageSelector from './LanguageSelector';
import NotificationButton from './NotificationButton';

interface MobileFooterProps {
  language: string;
  setLanguage: (language: string) => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onLogout?: () => void;
  onSupportClick?: () => void;
  onBillingClick?: () => void;
  showBillingButton?: boolean;
}

interface FooterButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline';
  badge?: ReactNode;
  className?: string;
}

const FooterButton: React.FC<FooterButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'outline',
  badge,
  className = ''
}) => {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center h-14 px-2 min-w-0 touch-manipulation ${className}`}
    >
      <div className="relative">
        {icon}
        {badge}
      </div>
      <span className="text-xs mt-1 hidden sm:block font-medium">{label}</span>
    </Button>
  );
};

const MobileFooter: React.FC<MobileFooterProps> = ({
  language,
  setLanguage,
  currentUser,
  onLogout,
  onSupportClick,
  onBillingClick,
  showBillingButton = false,
}) => {
  if (!currentUser) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
      <div className="container mx-auto px-0 py-2">
        <div className="flex items-center justify-between w-full gap-1">
          {/* Support Button */}
          <FooterButton
            icon={<MessageCircle className="h-5 w-5" />}
            label="Support"
            onClick={onSupportClick || (() => {})}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-1"
          />

          {/* Notification Button */}
          <NotificationButton currentUser={currentUser} className="flex-1" />

          {/* Billing Button */}
          {showBillingButton ? (
            <FooterButton
              icon={<CreditCard className="h-5 w-5" />}
              label="Billing"
              onClick={onBillingClick || (() => {})}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 flex-1"
            />
          ) : (
            <div className="flex-1" />
          )}

          {/* Language Selector as a button */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="relative flex flex-col items-center justify-center h-14 px-2 min-w-0 touch-manipulation border-gray-300 hover:bg-gray-50 w-full"
              asChild
            >
              <span>
                <LanguageSelector language={language} setLanguage={setLanguage} />
                <span className="text-xs mt-1 hidden sm:block font-medium">Language</span>
              </span>
            </Button>
          </div>

          {/* Logout Button */}
          <FooterButton
            icon={<LogOut className="h-5 w-5" />}
            label="Logout"
            onClick={onLogout || (() => {})}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;
