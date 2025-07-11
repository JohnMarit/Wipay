import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  phone: string;
  subscription?: {
    planId: string;
    status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    tokensUsedThisMonth: number;
  };
  paymentProfile?: {
    momoNumber: string;
    isVerified: boolean;
    accountStatus: 'active' | 'suspended' | 'disabled';
    lastSuccessfulPayment?: Date;
    totalFailedAttempts: number;
    nextBillingDate?: Date;
  };
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserFilter {
  subscriptionStatus?:
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'trialing';
  accountStatus?: 'active' | 'suspended' | 'disabled';
  planId?: string;
  hasPaymentProfile?: boolean;
  isVerified?: boolean;
  daysSinceLastPayment?: number;
  daysUntilExpiry?: number;
}

export interface BulkAction {
  userIds: string[];
  action:
    | 'suspend'
    | 'activate'
    | 'send_reminder'
    | 'reset_payment_attempts'
    | 'update_plan';
  planId?: string;
  message?: string;
}

export const adminService = {
  // Get all users with optional filtering
  async getAllUsers(filters?: UserFilter): Promise<AdminUser[]> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters?.subscriptionStatus) {
        q = query(
          q,
          where('subscription.status', '==', filters.subscriptionStatus)
        );
      }

      if (filters?.accountStatus) {
        q = query(
          q,
          where('paymentProfile.accountStatus', '==', filters.accountStatus)
        );
      }

      const querySnapshot = await getDocs(q);
      const users: AdminUser[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const user: AdminUser = {
          uid: doc.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          subscription: data.subscription,
          paymentProfile: data.paymentProfile,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate(),
        };
        users.push(user);
      });

      // Apply additional filters that can't be done in Firestore query
      return users.filter(user => {
        if (filters?.planId && user.subscription?.planId !== filters.planId) {
          return false;
        }

        if (filters?.hasPaymentProfile !== undefined) {
          const hasProfile = !!user.paymentProfile;
          if (hasProfile !== filters.hasPaymentProfile) {
            return false;
          }
        }

        if (filters?.isVerified !== undefined) {
          const isVerified = user.paymentProfile?.isVerified || false;
          if (isVerified !== filters.isVerified) {
            return false;
          }
        }

        if (filters?.daysSinceLastPayment !== undefined) {
          const lastPayment = user.paymentProfile?.lastSuccessfulPayment;
          if (!lastPayment) return false;

          const daysSince = Math.floor(
            (Date.now() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSince < filters.daysSinceLastPayment) {
            return false;
          }
        }

        if (filters?.daysUntilExpiry !== undefined) {
          const expiry = user.subscription?.currentPeriodEnd;
          if (!expiry) return false;

          const daysUntil = Math.floor(
            (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntil > filters.daysUntilExpiry) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  // Get users with expired subscriptions
  async getExpiredSubscriptions(): Promise<AdminUser[]> {
    const now = new Date();
    const users = await this.getAllUsers();

    return users.filter(user => {
      if (!user.subscription?.currentPeriodEnd) return false;
      return user.subscription.currentPeriodEnd < now;
    });
  },

  // Get users with failed payments
  async getFailedPaymentUsers(): Promise<AdminUser[]> {
    const users = await this.getAllUsers();

    return users.filter(user => {
      return user.paymentProfile?.totalFailedAttempts > 0;
    });
  },

  // Get users due for reminders
  async getUsersDueForReminders(
    daysBeforeExpiry: number = 7
  ): Promise<AdminUser[]> {
    const now = new Date();
    const reminderDate = new Date(
      now.getTime() + daysBeforeExpiry * 24 * 60 * 60 * 1000
    );
    const users = await this.getAllUsers();

    return users.filter(user => {
      if (!user.subscription?.currentPeriodEnd) return false;
      if (
        user.subscription.status !== 'active' &&
        user.subscription.status !== 'trialing'
      )
        return false;

      const expiry = user.subscription.currentPeriodEnd;
      return expiry <= reminderDate && expiry > now;
    });
  },

  // Bulk actions
  async performBulkAction(
    action: BulkAction
  ): Promise<{ success: number; failed: number }> {
    const batch = writeBatch(db);
    let success = 0;
    let failed = 0;

    try {
      for (const userId of action.userIds) {
        const userRef = doc(db, 'users', userId);

        switch (action.action) {
          case 'suspend':
            batch.update(userRef, {
              'paymentProfile.accountStatus': 'suspended',
              'subscription.status': 'past_due',
            });
            break;

          case 'activate':
            batch.update(userRef, {
              'paymentProfile.accountStatus': 'active',
              'subscription.status': 'active',
            });
            break;

          case 'reset_payment_attempts':
            batch.update(userRef, {
              'paymentProfile.totalFailedAttempts': 0,
            });
            break;

          case 'update_plan':
            if (action.planId) {
              batch.update(userRef, {
                'subscription.planId': action.planId,
              });
            }
            break;

          case 'send_reminder':
            // This would integrate with your SMS service
            // For now, we'll just log it
            console.log(
              `Sending reminder to user ${userId}: ${action.message}`
            );
            break;
        }
      }

      await batch.commit();
      success = action.userIds.length;
    } catch (error) {
      console.error('Bulk action failed:', error);
      failed = action.userIds.length;
    }

    return { success, failed };
  },

  // Send reminder to specific user
  async sendReminder(userId: string, message: string): Promise<boolean> {
    try {
      // This would integrate with your SMS service
      console.log(`Sending reminder to user ${userId}: ${message}`);

      // Update user record to track reminder sent
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastReminderSent: Timestamp.now(),
      });

      return true;
    } catch (error) {
      console.error('Failed to send reminder:', error);
      return false;
    }
  },

  // Get user statistics
  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    suspended: number;
    expired: number;
    trialing: number;
    withPaymentProfile: number;
    verified: number;
  }> {
    const users = await this.getAllUsers();

    return {
      total: users.length,
      active: users.filter(u => u.paymentProfile?.accountStatus === 'active')
        .length,
      suspended: users.filter(
        u => u.paymentProfile?.accountStatus === 'suspended'
      ).length,
      expired: users.filter(
        u =>
          u.subscription?.currentPeriodEnd &&
          u.subscription.currentPeriodEnd < new Date()
      ).length,
      trialing: users.filter(u => u.subscription?.status === 'trialing').length,
      withPaymentProfile: users.filter(u => !!u.paymentProfile).length,
      verified: users.filter(u => u.paymentProfile?.isVerified).length,
    };
  },

  // Get revenue statistics
  async getRevenueStatistics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    averageRevenuePerUser: number;
  }> {
    const users = await this.getAllUsers({
      subscriptionStatus: 'active',
    });

    // This is a simplified calculation - in a real app you'd track actual payments
    const totalRevenue = users.reduce((sum, user) => {
      const plan = user.subscription?.planId;
      const planPrices: { [key: string]: number } = {
        basic: 10,
        pro: 25,
        enterprise: 50,
      };
      return sum + (planPrices[plan || 'free'] || 0);
    }, 0);

    return {
      totalRevenue,
      monthlyRevenue: totalRevenue, // Simplified
      activeSubscriptions: users.length,
      averageRevenuePerUser: users.length > 0 ? totalRevenue / users.length : 0,
    };
  },
};
