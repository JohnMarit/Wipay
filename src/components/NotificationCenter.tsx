import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Notification, NotificationCounts, notificationService } from '@/lib/notificationService';
import { Timestamp } from 'firebase/firestore';
import {
    Archive,
    Bell,
    CheckCircle,
    Clock,
    CreditCard,
    MessageCircle,
    Settings,
    Trash2,
    Wifi,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationCenterProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, archived: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Load notifications
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;

    console.log('🔔 NotificationCenter: Loading notifications for user:', currentUser.id);

    const unsubscribeNotifications = notificationService.subscribeToNotifications(
      currentUser.id,
      (notifications) => {
        console.log('📋 NotificationCenter: Received notifications:', notifications.length);
        setNotifications(notifications);
      },
      { includeArchived: true, limit: 100 }
    );

    const unsubscribeCounts = notificationService.subscribeToNotificationCounts(
      currentUser.id,
      (counts) => {
        console.log('📊 NotificationCenter: Received counts:', counts);
        setCounts(counts);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeCounts();
    };
  }, [currentUser.id, isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.markAsRead(notificationId);
      toast({
        title: 'Notification marked as read',
        description: 'The notification has been marked as read.',
      });
    } catch (error) {
      console.error('❌ NotificationCenter: Failed to mark as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead(currentUser.id);
      toast({
        title: 'All notifications marked as read',
        description: 'All notifications have been marked as read.',
      });
    } catch (error) {
      console.error('❌ NotificationCenter: Failed to mark all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.archiveNotification(notificationId);
      toast({
        title: 'Notification archived',
        description: 'The notification has been archived.',
      });
    } catch (error) {
      console.error('❌ NotificationCenter: Failed to archive:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive notification.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      setLoading(true);
      await notificationService.deleteNotification(notificationId);
      toast({
        title: 'Notification deleted',
        description: 'The notification has been deleted.',
      });
    } catch (error) {
      console.error('❌ NotificationCenter: Failed to delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'support':
        return <MessageCircle className="h-4 w-4" />;
      case 'token':
        return <Wifi className="h-4 w-4" />;
      case 'billing':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatDate = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'Unknown';
    const date = (timestamp instanceof Timestamp) ? timestamp.toDate() : timestamp;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'archived') return notification.isArchived;
    return !notification.isArchived; // 'all' tab
  });

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const archivedCount = notifications.filter(n => n.isArchived).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {counts.unread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {counts.unread}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {counts.unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-1">
              All
              <Badge variant="secondary" className="ml-1">
                {notifications.filter(n => !n.isArchived).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-1">
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-1">
              Archived
              <Badge variant="secondary" className="ml-1">
                {archivedCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
              loading={loading}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
              loading={loading}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              onArchive={handleArchive}
              onDelete={handleDelete}
              loading={loading}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  getNotificationIcon: (category: string) => React.ReactNode;
  getNotificationColor: (type: string) => string;
  formatDate: (timestamp: Timestamp | Date) => string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onArchive,
  onDelete,
  loading,
  getNotificationIcon,
  getNotificationColor,
  formatDate,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No notifications found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-all hover:shadow-md ${
              !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(notification.createdAt)}
                      {notification.category !== 'general' && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      disabled={loading}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {!notification.isArchived ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(notification.id)}
                      disabled={loading}
                      className="h-8 w-8 p-0"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(notification.id)}
                      disabled={loading}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationCenter;
