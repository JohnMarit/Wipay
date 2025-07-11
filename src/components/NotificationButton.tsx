import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationCounts, notificationService } from '@/lib/notificationService';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationCenter from './NotificationCenter';

interface NotificationButtonProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ currentUser, className = '' }) => {
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, archived: 0 });
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to notification counts
  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('🔔 NotificationButton: Subscribing to notification counts for user:', currentUser.id);

    const unsubscribe = notificationService.subscribeToNotificationCounts(
      currentUser.id,
      (counts) => {
        console.log('📊 NotificationButton: Received counts:', counts);
        setCounts(counts);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser.id]);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={`relative flex flex-col items-center justify-center h-14 px-2 min-w-0 touch-manipulation border-gray-300 hover:bg-gray-50 ${className}`}
      >
        <div className="relative">
          <Bell className="h-5 w-5" />
          {counts.unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {counts.unread > 99 ? '99+' : counts.unread}
            </Badge>
          )}
        </div>
        <span className="text-xs mt-1 hidden sm:block font-medium">Notifications</span>
      </Button>

      <NotificationCenter
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  );
};

export default NotificationButton;
