import { userService } from './firebase';

export interface AdminAccessResult {
  isAdmin: boolean;
  reason: string;
  userProfile?: any;
}

/**
 * Check if a user has admin access
 * @param currentUser - The current authenticated user
 * @returns AdminAccessResult with access status and reason
 */
export const checkAdminAccess = async (currentUser: {
  id: string;
  name: string;
  email: string;
  role: string;
}): Promise<AdminAccessResult> => {
  try {
    const userProfile = await userService.getUserProfile(currentUser.id);

    if (!userProfile) {
      return {
        isAdmin: false,
        reason: 'User profile not found'
      };
    }

    // Admin access criteria
    const emailContainsAdmin = currentUser.email.toLowerCase().includes('admin');
    const hasAdminRole = currentUser.role === 'admin';

    // Check if this is the first user (created more than 24 hours ago)
    const isFirstUser = userProfile.createdAt &&
      new Date(userProfile.createdAt).getTime() < Date.now() - (24 * 60 * 60 * 1000);

    // Development mode: allow any user with "admin" in email
    const isDevelopmentAdmin = process.env.NODE_ENV === 'development' && emailContainsAdmin;

    if (emailContainsAdmin) {
      return {
        isAdmin: true,
        reason: 'Email contains "admin"',
        userProfile
      };
    }

    if (hasAdminRole) {
      return {
        isAdmin: true,
        reason: 'User has admin role',
        userProfile
      };
    }

    if (isFirstUser) {
      return {
        isAdmin: true,
        reason: 'First user in system',
        userProfile
      };
    }

    if (isDevelopmentAdmin) {
      return {
        isAdmin: true,
        reason: 'Development admin access',
        userProfile
      };
    }

    return {
      isAdmin: false,
      reason: 'No admin criteria met',
      userProfile
    };

  } catch (error) {
    console.error('Error checking admin access:', error);
    return {
      isAdmin: false,
      reason: 'Error checking admin access'
    };
  }
};

/**
 * Get admin access requirements for display
 */
export const getAdminRequirements = () => {
  return [
    'Email contains "admin" (e.g., admin@wipay.com)',
    'User role is set to "admin"',
    'First user in the system (created more than 24 hours ago)',
    'Development mode: any user with "admin" in email'
  ];
};

/**
 * Check if email qualifies for admin access
 */
export const isAdminEmail = (email: string): boolean => {
  return email.toLowerCase().includes('admin');
};

/**
 * Get suggested admin emails for testing
 */
export const getSuggestedAdminEmails = (): string[] => {
  return [
    'admin@wipay.com',
    'admin@example.com',
    'john.admin@gmail.com',
    'admin.user@company.com',
    'system.admin@wipay.com'
  ];
};
