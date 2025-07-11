import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/lib/notificationService';
import { Bell, CreditCard, MessageCircle, Settings, Wifi } from 'lucide-react';

interface NotificationTestProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
}

const NotificationTest: React.FC<NotificationTestProps> = ({ currentUser }) => {
  const { toast } = useToast();

  const createTestNotification = async (type: string) => {
    try {
      let notificationId: string;

      switch (type) {
        case 'token':
          notificationId = await notificationService.createTokenGeneratedNotification(
            currentUser.id,
            '+1234567890',
            '3 hours',
            5,
            'USD'
          );
          break;
        case 'payment':
          notificationId = await notificationService.createPaymentNotification(
            currentUser.id,
            25,
            'USD',
            'MTN Mobile Money',
            'completed'
          );
          break;
        case 'support':
          notificationId = await notificationService.createSupportNotification(
            currentUser.id,
            'chat_123',
            'Test support message',
            false
          );
          break;
        case 'subscription':
          notificationId = await notificationService.createSubscriptionNotification(
            currentUser.id,
            'Premium Plan',
            'upgraded'
          );
          break;
        default:
          notificationId = await notificationService.createSystemNotification(
            currentUser.id,
            'Test Notification',
            'This is a test notification',
            'info'
          );
      }

      toast({
        title: 'Test Notification Created',
        description: `Created ${type} notification with ID: ${notificationId}`,
      });
    } catch (error) {
      console.error('❌ NotificationTest: Failed to create test notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test notification.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Test Notifications</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => createTestNotification('token')}
          className="flex items-center gap-2"
        >
          <Wifi className="h-4 w-4" />
          Token Generated
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createTestNotification('payment')}
          className="flex items-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Payment
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createTestNotification('support')}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Support
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createTestNotification('subscription')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Subscription
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createTestNotification('system')}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          System
        </Button>
      </div>
    </div>
  );
};

export default NotificationTest;
