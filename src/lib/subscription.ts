// Subscription Service for Wipay WiFi Token Management System
// Handles subscription plans, payment processing, and access control

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: SubscriptionFeatures;
  popular?: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface SubscriptionFeatures {
  tokensPerMonth: number;
  smsDelivery: 'simulation' | 'real';
  wifiNetworks: number;
  advancedReports: boolean;
  pdfExport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  multiLocation: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  tokensUsedThisMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Plans Configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    currency: 'SSP',
    interval: 'month',
    features: {
      tokensPerMonth: 10,
      smsDelivery: 'simulation',
      wifiNetworks: 1,
      advancedReports: false,
      pdfExport: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      multiLocation: false,
    },
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 2500, // 2,500 SSP (~$10 USD equivalent)
    currency: 'SSP',
    interval: 'month',
    features: {
      tokensPerMonth: 100,
      smsDelivery: 'real',
      wifiNetworks: 2,
      advancedReports: true,
      pdfExport: true,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      multiLocation: false,
    },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 6000, // 6,000 SSP (~$25 USD equivalent)
    currency: 'SSP',
    interval: 'month',
    features: {
      tokensPerMonth: 500,
      smsDelivery: 'real',
      wifiNetworks: 5,
      advancedReports: true,
      pdfExport: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: false,
      multiLocation: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 12000, // 12,000 SSP (~$50 USD equivalent)
    currency: 'SSP',
    interval: 'month',
    features: {
      tokensPerMonth: -1, // Unlimited
      smsDelivery: 'real',
      wifiNetworks: -1, // Unlimited
      advancedReports: true,
      pdfExport: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
      multiLocation: true,
    },
  },
];

// Subscription Service Class
export class SubscriptionService {
  private stripePublishableKey: string;
  private stripeSecretKey: string;

  constructor() {
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    this.stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || '';
  }

  // Get all available subscription plans
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // Get a specific plan by ID
  getPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
  }

  // Check if user can perform action based on subscription
  canPerformAction(subscription: UserSubscription, action: string): boolean {
    const plan = this.getPlan(subscription.planId);
    if (!plan) return false;

    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return false;
    }

    switch (action) {
      case 'generate_token':
        if (plan.features.tokensPerMonth === -1) return true; // Unlimited
        return subscription.tokensUsedThisMonth < plan.features.tokensPerMonth;

      case 'send_real_sms':
        return plan.features.smsDelivery === 'real';

      case 'advanced_reports':
        return plan.features.advancedReports;

      case 'pdf_export':
        return plan.features.pdfExport;

      case 'custom_branding':
        return plan.features.customBranding;

      case 'api_access':
        return plan.features.apiAccess;

      case 'multiple_networks':
        return plan.features.wifiNetworks > 1;

      default:
        return false;
    }
  }

  // Get remaining tokens for current period
  getRemainingTokens(subscription: UserSubscription): number {
    const plan = this.getPlan(subscription.planId);
    if (!plan) return 0;

    if (plan.features.tokensPerMonth === -1) return -1; // Unlimited

    return Math.max(0, plan.features.tokensPerMonth - subscription.tokensUsedThisMonth);
  }

  // Increment token usage
  async incrementTokenUsage(subscriptionId: string): Promise<void> {
    // This would typically update the database
    console.log(`Incrementing token usage for subscription ${subscriptionId}`);
  }

  // Create Stripe checkout session
  async createCheckoutSession(
    planId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const plan = this.getPlan(planId);
    if (!plan) throw new Error('Invalid plan');

    if (plan.id === 'free') {
      throw new Error('Free plan does not require payment');
    }

    try {
      // In a real implementation, this would call your backend API
      // which would create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          successUrl,
          cancelUrl,
        }),
      });

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  // Create a customer portal session for subscription management
  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string> {
    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl,
        }),
      });

      const { sessionUrl } = await response.json();
      return sessionUrl;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw new Error('Failed to create customer portal session');
    }
  }

  // Validate subscription limits before action
  validateAction(subscription: UserSubscription, action: string): {
    allowed: boolean;
    message?: string;
    upgradeRequired?: boolean;
  } {
    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      return {
        allowed: false,
        message: 'Invalid subscription plan',
        upgradeRequired: true,
      };
    }

    // Check subscription status
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return {
        allowed: false,
        message: 'Subscription is not active. Please update your payment method.',
        upgradeRequired: true,
      };
    }

    // Check if current period has expired
    if (new Date() > subscription.currentPeriodEnd) {
      return {
        allowed: false,
        message: 'Subscription period has expired. Please renew your subscription.',
        upgradeRequired: true,
      };
    }

    switch (action) {
      case 'generate_token':
        if (plan.features.tokensPerMonth === -1) {
          return { allowed: true };
        }
        if (subscription.tokensUsedThisMonth >= plan.features.tokensPerMonth) {
          return {
            allowed: false,
            message: `Monthly token limit reached (${plan.features.tokensPerMonth} tokens). Upgrade to generate more tokens.`,
            upgradeRequired: true,
          };
        }
        return { allowed: true };

      case 'send_real_sms':
        if (plan.features.smsDelivery !== 'real') {
          return {
            allowed: false,
            message: 'Real SMS delivery requires a paid plan. Currently in simulation mode.',
            upgradeRequired: true,
          };
        }
        return { allowed: true };

      case 'advanced_reports':
        if (!plan.features.advancedReports) {
          return {
            allowed: false,
            message: 'Advanced reports require a paid plan.',
            upgradeRequired: true,
          };
        }
        return { allowed: true };

      case 'pdf_export':
        if (!plan.features.pdfExport) {
          return {
            allowed: false,
            message: 'PDF export requires a paid plan.',
            upgradeRequired: true,
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }
}

// Factory function
export function createSubscriptionService(): SubscriptionService {
  return new SubscriptionService();
}

// Mock subscription for development/testing
export function createMockSubscription(userId: string, planId: string = 'free'): UserSubscription {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  return {
    id: `sub_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planId,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: nextMonth,
    tokensUsedThisMonth: 0,
    createdAt: now,
    updatedAt: now,
  };
}
