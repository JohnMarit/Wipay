export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'billing_manager' | 'customer_service' | 'technician' | 'customer';
  name: string;
  permissions: string[];
  isActive: boolean;
}

const ROLE_PERMISSIONS = {
  admin: ['all'],
  billing_manager: ['billing', 'payments', 'customers'],
  customer_service: ['customers', 'support', 'payments'],
  technician: ['equipment', 'installations', 'maintenance'],
  customer: ['self_service']
};

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(username: string, password: string): Promise<User> {
    const mockUsers: { [key: string]: User } = {
      'admin': {
        id: '1', username: 'admin', email: 'admin@ispbilling.ss',
        role: 'admin', name: 'System Administrator',
        permissions: ROLE_PERMISSIONS.admin, isActive: true
      }
    };

    const user = mockUsers[username];
    if (user && password === 'password') {
      this.currentUser = user;
      localStorage.setItem('authUser', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('authUser');
      if (stored) this.currentUser = JSON.parse(stored);
    }
    return this.currentUser;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions.includes('all') || user?.permissions.includes(permission) || false;
  }
} 