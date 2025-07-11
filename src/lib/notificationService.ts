import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'support' | 'system';
  category: 'payment' | 'support' | 'system' | 'billing' | 'token' | 'general';
  isRead: boolean;
  isArchived: boolean;
  createdAt: Timestamp;
  readAt?: Timestamp;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  archived: number;
}

class NotificationService {
  private subscriptions: Map<string, () => void> = new Map();

  // Create a new notification
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'general',
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    try {
      const notificationData = {
        userId,
        title,
        message,
        type,
        category,
        isRead: false,
        isArchived: false,
        createdAt: serverTimestamp(),
        actionUrl,
        metadata,
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('✅ NotificationService: Created notification:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ NotificationService: Failed to create notification:', error);
      throw error;
    }
  }

  // Subscribe to user notifications
  subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void,
    options: {
      includeArchived?: boolean;
      limit?: number;
    } = {}
  ): () => void {
    const { includeArchived = false, limit: limitCount = 50 } = options;

    console.log('🔔 NotificationService: Subscribing to notifications for user:', userId);

    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (!includeArchived) {
      q = query(q, where('isArchived', '==', false));
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications: Notification[] = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
          } as Notification);
        });

        console.log('📋 NotificationService: Received notifications update:', notifications.length, 'notifications');
        callback(notifications);
      },
      (error) => {
        console.error('❌ NotificationService: Error subscribing to notifications:', error);
      }
    );

    this.subscriptions.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Subscribe to notification counts
  subscribeToNotificationCounts(
    userId: string,
    callback: (counts: NotificationCounts) => void
  ): () => void {
    console.log('🔔 NotificationService: Subscribing to notification counts for user:', userId);

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isArchived', '==', false)
      ),
      (snapshot) => {
        const total = snapshot.size;
        const unread = snapshot.docs.filter(doc => !doc.data().isRead).length;
        const archived = 0; // We're not including archived in this query

        const counts: NotificationCounts = {
          total,
          unread,
          archived,
        };

        console.log('📊 NotificationService: Notification counts:', counts);
        callback(counts);
      },
      (error) => {
        console.error('❌ NotificationService: Error subscribing to notification counts:', error);
      }
    );

    return unsubscribe;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: serverTimestamp(),
      });
      console.log('✅ NotificationService: Marked notification as read:', notificationId);
    } catch (error) {
      console.error('❌ NotificationService: Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();
      console.log('✅ NotificationService: Marked all notifications as read for user:', userId);
    } catch (error) {
      console.error('❌ NotificationService: Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Archive notification
  async archiveNotification(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isArchived: true,
      });
      console.log('✅ NotificationService: Archived notification:', notificationId);
    } catch (error) {
      console.error('❌ NotificationService: Failed to archive notification:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      console.log('✅ NotificationService: Deleted notification:', notificationId);
    } catch (error) {
      console.error('❌ NotificationService: Failed to delete notification:', error);
      throw error;
    }
  }

  // Create system notifications for various events
  async createPaymentNotification(
    userId: string,
    amount: number,
    currency: string,
    paymentMethod: string,
    status: 'completed' | 'pending' | 'failed'
  ): Promise<string> {
    const title = `Payment ${status}`;
    const message = `Your payment of ${amount} ${currency} via ${paymentMethod} has been ${status}.`;

    return this.createNotification(
      userId,
      title,
      message,
      status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'warning',
      'payment',
      '/billing',
      { amount, currency, paymentMethod, status }
    );
  }

  async createTokenGeneratedNotification(
    userId: string,
    recipientPhone: string,
    duration: string,
    price: number,
    currency: string
  ): Promise<string> {
    const title = 'WiFi Token Generated';
    const message = `WiFi token sent to ${recipientPhone} for ${duration} (${price} ${currency}).`;

    return this.createNotification(
      userId,
      title,
      message,
      'success',
      'token',
      undefined,
      { recipientPhone, duration, price, currency }
    );
  }

  async createSupportNotification(
    userId: string,
    chatId: string,
    supportMessage: string,
    isAdminReply: boolean = false
  ): Promise<string> {
    const title = isAdminReply ? 'Support Reply Received' : 'Support Message Sent';
    const message = isAdminReply
      ? 'You have received a reply from support.'
      : 'Your support message has been sent.';

    return this.createNotification(
      userId,
      title,
      message,
      'info',
      'support',
      `/support?chat=${chatId}`,
      { chatId, isAdminReply, originalMessage: supportMessage }
    );
  }

  async createSubscriptionNotification(
    userId: string,
    planName: string,
    action: 'upgraded' | 'downgraded' | 'cancelled' | 'renewed'
  ): Promise<string> {
    const title = `Subscription ${action}`;
    const message = `Your subscription has been ${action} to ${planName}.`;

    return this.createNotification(
      userId,
      title,
      message,
      action === 'cancelled' ? 'warning' : 'success',
      'billing',
      '/billing',
      { planName, action }
    );
  }

  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<string> {
    return this.createNotification(
      userId,
      title,
      message,
      type,
      'system'
    );
  }

  // Cleanup subscriptions
  unsubscribe(userId: string): void {
    const unsubscribe = this.subscriptions.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(userId);
      console.log('🔔 NotificationService: Unsubscribed from notifications for user:', userId);
    }
  }

  // Cleanup all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
    console.log('🔔 NotificationService: Unsubscribed from all notifications');
  }
}

export const notificationService = new NotificationService();
