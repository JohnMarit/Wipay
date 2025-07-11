// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

// Firebase configuration - uses environment variables for security
//
// ✅ CONFIGURED: Real Firebase project configuration added
//
// Project: wipay-john
// Domain: wipay-john.firebaseapp.com
//
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyBL_qAkFLrWp0NIhJ-dmRHDqMvz1B8iSMA',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wipay-john.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wipay-john',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'wipay-john.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '633048699728',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:633048699728:web:29233b4a8e99d2fb581255',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX', // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// WiFi Token interface for Firebase
export interface WiFiToken {
  id?: string;
  recipientPhone: string;
  duration: number;
  price: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  username: string;
  password: string;
  isActive: boolean;
  userId: string; // Link to the user who created it
}

// User Profile interface
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone: string;
  wifiConfig?: {
    ssid: string;
    isConfigured: boolean;
  };
  pricingConfig?: {
    currency: string;
    prices: { [key: string]: number };
  };
  subscription?: {
    planId: string;
    status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    tokensUsedThisMonth: number;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
  };
  paymentProfile?: {
    momoNumber: string;
    isVerified: boolean;
    isProfileComplete: boolean;
    lastSuccessfulPayment?: Date;
    totalFailedAttempts: number;
    accountStatus: 'active' | 'suspended' | 'disabled';
    billingDay: number;
    nextBillingDate?: Date;
  };
  createdAt: Date;
}

// Type for WiFi configuration
interface WiFiConfig {
  ssid: string;
  isConfigured: boolean;
}

// Type for pricing configuration
interface PricingConfig {
  currency: string;
  prices: { [key: string]: number };
}

// Authentication functions
export const authService = {
  // Sign up new user
  async signUp(
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user profile in Firestore using UID as document ID
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        phone,
        pricingConfig: {
          currency: 'SSP',
          prices: {
            '1': 50,
            '3': 120,
            '6': 200,
            '12': 350,
            '24': 500,
          },
        },
        subscription: {
          planId: 'free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          tokensUsedThisMonth: 0,
        },
        createdAt: new Date(),
      };

      // Use setDoc with user.uid as document ID instead of addDoc
      await setDoc(doc(db, 'users', user.uid), userProfile);
      return userProfile;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Sign up failed: ${errorMsg}`);
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Sign in failed: ${errorMsg}`);
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists, if not create one
      const existingProfile = await userService.getUserProfile(user.uid);

      if (!existingProfile) {
        // Create user profile for new Google user
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          name: user.displayName || 'Google User',
          phone: user.phoneNumber || '', // Google doesn't always provide phone number
          pricingConfig: {
            currency: 'SSP',
            prices: {
              '1': 50,
              '3': 120,
              '6': 200,
              '12': 350,
              '24': 500,
            },
          },
          subscription: {
            planId: 'free',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            tokensUsedThisMonth: 0,
          },
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
      }

      return user;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Google sign in failed: ${errorMsg}`);
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Sign out failed: ${errorMsg}`);
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

// Database functions for WiFi tokens
export const tokenService = {
  // Add new WiFi token
  async addToken(token: Omit<WiFiToken, 'id'>): Promise<string> {
    try {
      const tokenData = {
        ...token,
        createdAt: Timestamp.fromDate(token.createdAt),
        expiresAt: Timestamp.fromDate(token.expiresAt),
      };
      const docRef = await addDoc(collection(db, 'wifiTokens'), tokenData);
      return docRef.id;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to add token: ${errorMsg}`);
    }
  },

  // Get all tokens for a user
  async getUserTokens(userId: string): Promise<WiFiToken[]> {
    try {
      // Try the optimized query with ordering first
      const q = query(
        collection(db, 'wifiTokens'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
        } as WiFiToken;
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      // If the error is about missing index, fall back to a simpler query
      if (
        errorMsg.includes('requires an index') ||
        errorMsg.includes('indexes')
      ) {
        console.warn(
          '⚠️ Composite index not available, using fallback query. Please create the index for better performance.'
        );

        try {
          // Fallback: Query without ordering, then sort in memory
          const fallbackQuery = query(
            collection(db, 'wifiTokens'),
            where('userId', '==', userId)
          );
          const querySnapshot = await getDocs(fallbackQuery);

          const tokens = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt.toDate(),
              expiresAt: data.expiresAt.toDate(),
            } as WiFiToken;
          });

          // Sort in memory by createdAt descending
          return tokens.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
        } catch (fallbackError: unknown) {
          const fallbackErrorMsg =
            fallbackError instanceof Error
              ? fallbackError.message
              : 'Unknown error';
          throw new Error(
            `Failed to get tokens (fallback failed): ${fallbackErrorMsg}`
          );
        }
      }

      throw new Error(`Failed to get tokens: ${errorMsg}`);
    }
  },

  // Get tokens for date range
  async getTokensForDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WiFiToken[]> {
    try {
      // Try the optimized query with ordering first
      const q = query(
        collection(db, 'wifiTokens'),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          expiresAt: data.expiresAt.toDate(),
        } as WiFiToken;
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      // If the error is about missing index, fall back to a simpler query
      if (
        errorMsg.includes('requires an index') ||
        errorMsg.includes('indexes')
      ) {
        console.warn(
          '⚠️ Composite index not available for date range query, using fallback query.'
        );

        try {
          // Fallback: Query without ordering, then filter and sort in memory
          const fallbackQuery = query(
            collection(db, 'wifiTokens'),
            where('userId', '==', userId)
          );
          const querySnapshot = await getDocs(fallbackQuery);

          const tokens = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt.toDate(),
              expiresAt: data.expiresAt.toDate(),
            } as WiFiToken;
          });

          // Filter by date range and sort in memory
          return tokens
            .filter(
              token =>
                token.createdAt >= startDate && token.createdAt <= endDate
            )
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (fallbackError: unknown) {
          const fallbackErrorMsg =
            fallbackError instanceof Error
              ? fallbackError.message
              : 'Unknown error';
          throw new Error(
            `Failed to get tokens for date range (fallback failed): ${fallbackErrorMsg}`
          );
        }
      }

      throw new Error(`Failed to get tokens for date range: ${errorMsg}`);
    }
  },

  // Update token status
  async updateTokenStatus(tokenId: string, status: string): Promise<void> {
    try {
      const tokenRef = doc(db, 'wifiTokens', tokenId);
      await updateDoc(tokenRef, { status, isActive: status === 'active' });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update token: ${errorMsg}`);
    }
  },

  // Delete token
  async deleteToken(tokenId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'wifiTokens', tokenId));
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete token: ${errorMsg}`);
    }
  },

  // Listen to real-time token updates
  onTokensChanged(userId: string, callback: (tokens: WiFiToken[]) => void) {
    try {
      // Try the optimized query with ordering first
      const q = query(
        collection(db, 'wifiTokens'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(
        q,
        querySnapshot => {
          const tokens = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt.toDate(),
              expiresAt: data.expiresAt.toDate(),
            } as WiFiToken;
          });
          callback(tokens);
        },
        error => {
          // If the error is about missing index, fall back to a simpler query
          if (
            error.message.includes('requires an index') ||
            error.message.includes('indexes')
          ) {
            console.warn(
              '⚠️ Composite index not available for real-time query, using fallback query.'
            );

            // Fallback: Query without ordering, then sort in callback
            const fallbackQuery = query(
              collection(db, 'wifiTokens'),
              where('userId', '==', userId)
            );

            return onSnapshot(fallbackQuery, querySnapshot => {
              const tokens = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt.toDate(),
                  expiresAt: data.expiresAt.toDate(),
                } as WiFiToken;
              });

              // Sort in memory by createdAt descending
              const sortedTokens = tokens.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
              );
              callback(sortedTokens);
            });
          } else {
            console.error('Error in real-time token listener:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up real-time token listener:', error);

      // Return a fallback listener without ordering
      const fallbackQuery = query(
        collection(db, 'wifiTokens'),
        where('userId', '==', userId)
      );

      return onSnapshot(fallbackQuery, querySnapshot => {
        const tokens = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            expiresAt: data.expiresAt.toDate(),
          } as WiFiToken;
        });

        // Sort in memory by createdAt descending
        const sortedTokens = tokens.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        callback(sortedTokens);
      });
    }
  },
};

// User profile functions
export const userService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 Getting user profile for UID:', userId);
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log('❌ User profile not found for UID:', userId);
        // Try to find user in old collection structure (for migration)
        return await this.migrateOldUserProfile(userId);
      }

      const data = userDocSnap.data();
      console.log('✅ User profile found:', data);
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as UserProfile;
    } catch (error: unknown) {
      console.error('❌ Error getting user profile:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get user profile: ${errorMsg}`);
    }
  },

  // Migrate user profile from old collection structure (for existing users)
  async migrateOldUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('🔄 Attempting to migrate old user profile for UID:', userId);
      const q = query(collection(db, 'users'), where('uid', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('❌ No old user profile found for migration');
        return null;
      }

      const oldDoc = querySnapshot.docs[0];
      const data = oldDoc.data();
      const userProfile = {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as UserProfile;

      // Create new document with UID as document ID
      await setDoc(doc(db, 'users', userId), {
        ...data,
        createdAt: data.createdAt,
      });

      // Delete old document
      await deleteDoc(oldDoc.ref);

      console.log('✅ User profile migrated successfully');
      return userProfile;
    } catch (error: unknown) {
      console.error('❌ Error migrating user profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        await updateDoc(userDocRef, updates);
      } else {
        // If user document doesn't exist, we can't update it
        throw new Error('User profile not found');
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update user profile: ${errorMsg}`);
    }
  },

  // Update WiFi configuration
  async updateWifiConfig(
    userId: string,
    wifiConfig: WiFiConfig
  ): Promise<void> {
    try {
      await this.updateUserProfile(userId, { wifiConfig });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update WiFi config: ${errorMsg}`);
    }
  },

  // Update pricing configuration
  async updatePricingConfig(
    userId: string,
    pricingConfig: PricingConfig
  ): Promise<void> {
    try {
      await this.updateUserProfile(userId, { pricingConfig });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update pricing config: ${errorMsg}`);
    }
  },

  // Update subscription
  async updateSubscription(
    userId: string,
    subscription: {
      planId: string;
      status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      tokensUsedThisMonth: number;
      stripeSubscriptionId?: string;
      stripeCustomerId?: string;
    }
  ): Promise<void> {
    try {
      await this.updateUserProfile(userId, { subscription });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update subscription: ${errorMsg}`);
    }
  },

  // Increment token usage for subscription
  async incrementTokenUsage(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentUsage = userData.subscription?.tokensUsedThisMonth || 0;

        await updateDoc(userDocRef, {
          'subscription.tokensUsedThisMonth': currentUsage + 1
        });
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to increment token usage: ${errorMsg}`);
    }
  },

  // Reset monthly token usage (should be called monthly)
  async resetMonthlyTokenUsage(userId: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'subscription.tokensUsedThisMonth': 0
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to reset token usage: ${errorMsg}`);
    }
  },

  // Update payment profile
  async updatePaymentProfile(
    userId: string,
    paymentProfile: {
      momoNumber: string;
      isVerified: boolean;
      isProfileComplete: boolean;
      lastSuccessfulPayment?: Date;
      totalFailedAttempts: number;
      accountStatus: 'active' | 'suspended' | 'disabled';
      billingDay: number;
      nextBillingDate?: Date;
    }
  ): Promise<void> {
    try {
      await this.updateUserProfile(userId, { paymentProfile });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update payment profile: ${errorMsg}`);
    }
  },

  // Complete user profile after login
  async completeUserProfile(
    userId: string,
    profileData: {
      momoNumber: string;
      selectedPlan: string;
    }
  ): Promise<void> {
    try {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      const paymentProfile = {
        momoNumber: profileData.momoNumber,
        isVerified: false, // Will be verified after first successful payment
        isProfileComplete: true,
        totalFailedAttempts: 0,
        accountStatus: 'active' as const,
        billingDay: now.getDate(),
        nextBillingDate: nextMonth,
      };

      const subscription = {
        planId: profileData.selectedPlan,
        status: 'trialing' as const, // Start with trial until first payment
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        tokensUsedThisMonth: 0,
      };

      await this.updateUserProfile(userId, {
        paymentProfile,
        subscription,
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to complete user profile: ${errorMsg}`);
    }
  },

  // Update account status after payment attempt
  async updateAccountStatus(
    userId: string,
    paymentSuccess: boolean,
    referenceId?: string
  ): Promise<void> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile?.paymentProfile) {
        throw new Error('Payment profile not found');
      }

      const now = new Date();
      let updates: any = {
        'paymentProfile.lastSuccessfulPayment': paymentSuccess ? now : userProfile.paymentProfile.lastSuccessfulPayment,
        'paymentProfile.totalFailedAttempts': paymentSuccess
          ? 0
          : userProfile.paymentProfile.totalFailedAttempts + 1,
      };

      // Update account status based on payment result
      if (paymentSuccess) {
        updates['paymentProfile.accountStatus'] = 'active';
        updates['paymentProfile.isVerified'] = true;
        updates['subscription.status'] = 'active';

        // Set next billing date
        const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, userProfile.paymentProfile.billingDay);
        updates['paymentProfile.nextBillingDate'] = nextBilling;
      } else {
        // Suspend after 3 failed attempts
        if (userProfile.paymentProfile.totalFailedAttempts + 1 >= 3) {
          updates['paymentProfile.accountStatus'] = 'suspended';
          updates['subscription.status'] = 'past_due';
        }
      }

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updates);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update account status: ${errorMsg}`);
    }
  },

  // Check if user needs profile completion
  async needsProfileCompletion(userId: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(userId);
      return !userProfile?.paymentProfile?.isProfileComplete;
    } catch (error: unknown) {
      console.error('Error checking profile completion:', error);
      return true; // Default to requiring completion
    }
  },

  // Get users due for billing (for monthly billing job)
  async getUsersDueForBilling(): Promise<Array<{ userId: string; paymentProfile: any; subscription: any }>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // This is a simplified version - in a real implementation,
      // you'd query for users where nextBillingDate <= today
      console.log('Getting users due for billing on:', today);

      // For now, return empty array as this would require more complex Firestore queries
      return [];
    } catch (error: unknown) {
      console.error('Error getting users due for billing:', error);
      return [];
    }
  },
};

// Analytics helper
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && analytics) {
    // Analytics tracking can be added here
    console.log(`Analytics Event: ${eventName}`, parameters);
  }
};

export { analytics, auth, db };
export default app;
