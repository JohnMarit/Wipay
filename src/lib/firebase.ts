// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
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

      // Create user profile in Firestore
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
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'users'), userProfile);
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
    const q = query(
      collection(db, 'wifiTokens'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, querySnapshot => {
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
    });
  },
};

// User profile functions
export const userService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as UserProfile;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get user profile: ${errorMsg}`);
    }
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const q = query(collection(db, 'users'), where('uid', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, updates);
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
