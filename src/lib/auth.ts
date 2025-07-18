import { authService, userService } from './firebase';

// User interface
export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  role: string;
}

// Authentication functions using Firebase
export const authenticateUser = async (
  usernameOrEmail: string,
  password: string
): Promise<User | null> => {
  try {
    // Use email for Firebase authentication
    const isEmail = usernameOrEmail.includes('@');
    const email = isEmail ? usernameOrEmail : `${usernameOrEmail}@wipay.local`; // Fallback for username

    const firebaseUser = await authService.signIn(email, password);

    if (firebaseUser) {
      // Get user profile from Firestore
      const userProfile = await userService.getUserProfile(firebaseUser.uid);

      if (userProfile) {
        return {
          id: firebaseUser.uid,
          username: userProfile.name.toLowerCase().replace(/\s+/g, ''),
          name: userProfile.name,
          phone: userProfile.phone,
          email: userProfile.email,
          role: 'user',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const firebaseUser = await authService.signInWithGoogle();

    if (firebaseUser) {
      // Get user profile from Firestore
      const userProfile = await userService.getUserProfile(firebaseUser.uid);

      if (userProfile) {
        return {
          id: firebaseUser.uid,
          username: userProfile.name.toLowerCase().replace(/\s+/g, ''),
          name: userProfile.name,
          phone: userProfile.phone,
          email: userProfile.email,
          role: 'user',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Google authentication error:', error);
    throw error;
  }
};

// Register new user
export const registerUser = async (
  name: string,
  phone: string,
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const userProfile = await authService.signUp(email, password, name, phone);

    return {
      id: userProfile.uid,
      username: name.toLowerCase().replace(/\s+/g, ''),
      name: userProfile.name,
      phone: userProfile.phone,
      email: userProfile.email,
      role: 'user',
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await authService.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current authenticated user
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise(resolve => {
    const unsubscribe = authService.onAuthStateChanged(async firebaseUser => {
      unsubscribe(); // Stop listening after first result

      if (firebaseUser) {
        try {
          const userProfile = await userService.getUserProfile(
            firebaseUser.uid
          );
          if (userProfile) {
            resolve({
              id: firebaseUser.uid,
              username: userProfile.name.toLowerCase().replace(/\s+/g, ''),
              name: userProfile.name,
              phone: userProfile.phone,
              email: userProfile.email,
              role: 'user',
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Listen to authentication state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return authService.onAuthStateChanged(async firebaseUser => {
    console.log('🔄 Auth state changed:', firebaseUser?.uid || 'null');

    if (firebaseUser) {
      try {
        console.log(
          '🔍 Getting user profile for Firebase user:',
          firebaseUser.uid
        );
        const userProfile = await userService.getUserProfile(firebaseUser.uid);

        if (userProfile) {
          console.log('✅ User profile loaded successfully:', userProfile.name);
          callback({
            id: firebaseUser.uid,
            username: userProfile.name.toLowerCase().replace(/\s+/g, ''),
            name: userProfile.name,
            phone: userProfile.phone,
            email: userProfile.email,
            role: 'user',
          });
        } else {
          console.log('❌ User profile not found, signing out user');
          callback(null);
        }
      } catch (error) {
        console.error('❌ Error getting user profile:', error);
        callback(null);
      }
    } else {
      console.log('📤 User signed out');
      callback(null);
    }
  });
};
