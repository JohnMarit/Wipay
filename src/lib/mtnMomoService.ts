// MTN Mobile Money Payment Service for Wipay Subscriptions
// Handles MTN MoMo payments, recurring billing, and account management

export interface MtnMomoConfig {
  environment: 'sandbox' | 'production';
  apiKey: string;
  userId: string;
  subscriptionKey: string;
  targetEnvironment: string;
  baseUrl: string;
}

export interface PaymentRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyId: string; // Phone number
  };
  payerMessage: string;
  payeeNote: string;
}

export interface PaymentResponse {
  referenceId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
  financialTransactionId?: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  amount: string;
  currency: string;
  externalId: string;
  reason?: string;
  financialTransactionId?: string;
}

export interface BillingRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  momoNumber: string;
  status: 'pending' | 'successful' | 'failed' | 'retrying';
  billingDate: Date;
  dueDate: Date;
  attempts: number;
  maxAttempts: number;
  referenceId?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPaymentProfile {
  userId: string;
  momoNumber: string;
  isVerified: boolean;
  lastSuccessfulPayment?: Date;
  totalFailedAttempts: number;
  accountStatus: 'active' | 'suspended' | 'disabled';
  billingDay: number; // Day of month for billing
  createdAt: Date;
  updatedAt: Date;
}

export class MTNMomoService {
  private config: MtnMomoConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private isDevelopmentMode: boolean;

  constructor(config: MtnMomoConfig) {
    this.config = config;
    // Enable development mode if running locally or if API key is empty
    this.isDevelopmentMode =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      !config.apiKey ||
      !config.userId;

    if (this.isDevelopmentMode) {
      console.log(
        '🚀 MTN MoMo Service running in DEVELOPMENT MODE - payments will be simulated'
      );
    }
  }

  // Generate access token for MTN MoMo API
  private async getAccessToken(): Promise<string> {
    // Mock token in development mode
    if (this.isDevelopmentMode) {
      return 'dev_mock_token_' + Date.now();
    }

    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/collection/token/`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${this.config.userId}:${this.config.apiKey}`)}`,
          'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error getting MTN MoMo access token:', error);
      throw new Error('Failed to authenticate with MTN MoMo API');
    }
  }

  // Request payment from user's MTN MoMo account
  async requestPayment(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    // Mock payment in development mode
    if (this.isDevelopmentMode) {
      return this.mockPaymentRequest(paymentRequest);
    }

    try {
      const accessToken = await this.getAccessToken();
      const referenceId = this.generateReferenceId();

      const response = await fetch(
        `${this.config.baseUrl}/collection/v1_0/requesttopay`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.config.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequest),
        }
      );

      if (response.status === 202) {
        // Payment request accepted, now check status
        return {
          referenceId,
          status: 'PENDING',
        };
      } else {
        const errorData = await response.json();
        return {
          referenceId,
          status: 'FAILED',
          reason: errorData.message || 'Payment request failed',
        };
      }
    } catch (error) {
      console.error('Error requesting MTN MoMo payment:', error);
      return {
        referenceId: this.generateReferenceId(),
        status: 'FAILED',
        reason: 'Network error or API unavailable',
      };
    }
  }

  // Check payment status
  async getPaymentStatus(referenceId: string): Promise<PaymentStatus> {
    // Mock payment status in development mode
    if (this.isDevelopmentMode) {
      return this.mockPaymentStatus(referenceId);
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Target-Environment': this.config.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          externalId: data.externalId,
          reason: data.reason,
          financialTransactionId: data.financialTransactionId,
        };
      } else {
        return {
          status: 'FAILED',
          amount: '0',
          currency: 'SSP',
          externalId: '',
          reason: 'Failed to check payment status',
        };
      }
    } catch (error) {
      console.error('Error checking MTN MoMo payment status:', error);
      return {
        status: 'FAILED',
        amount: '0',
        currency: 'SSP',
        externalId: '',
        reason: 'Network error',
      };
    }
  }

  // Validate MTN MoMo number format
  validateMomoNumber(phoneNumber: string): boolean {
    // Remove spaces and special characters
    const cleaned = phoneNumber.replace(/[\s\-()]/g, '');

    // MTN South Sudan numbers typically start with:
    // +211 91, +211 92, +211 95, +211 96, +211 97, +211 98
    // Or local format: 091, 092, 095, 096, 097, 098
    const mtnPattern = /^(\+211|211)?(91|92|95|96|97|98)\d{7}$/;
    const localPattern = /^0(91|92|95|96|97|98)\d{7}$/;

    return mtnPattern.test(cleaned) || localPattern.test(cleaned);
  }

  // Normalize MTN MoMo number to international format
  normalizeMomoNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[\s\-()]/g, '');

    if (cleaned.startsWith('+211')) {
      return cleaned;
    } else if (cleaned.startsWith('211')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+211' + cleaned.substring(1);
    } else {
      return '+211' + cleaned;
    }
  }

  // Generate unique reference ID
  private generateReferenceId(): string {
    return (
      'wipay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  // Test account balance (for development/testing)
  async checkAccountBalance(
    momoNumber: string
  ): Promise<{ balance: number; currency: string } | null> {
    try {
      // This would typically call MTN MoMo account balance API
      // For now, return mock data
      console.log(`Checking balance for ${momoNumber}`);

      // Simulate API call
      return {
        balance: Math.floor(Math.random() * 10000) + 1000, // Random balance between 1000-11000
        currency: 'SSP',
      };
    } catch (error) {
      console.error('Error checking account balance:', error);
      return null;
    }
  }

  // Mock payment request for development
  private async mockPaymentRequest(
    paymentRequest: PaymentRequest
  ): Promise<PaymentResponse> {
    console.log('🎭 MOCK: Processing payment request:', paymentRequest);

    // Simulate processing delay
    await this.delay(1000);

    const referenceId = this.generateReferenceId();

    // 90% success rate in mock mode
    const shouldSucceed = Math.random() > 0.1;

    if (shouldSucceed) {
      console.log('✅ MOCK: Payment request accepted');
      return {
        referenceId,
        status: 'PENDING',
      };
    } else {
      console.log('❌ MOCK: Payment request failed');
      return {
        referenceId,
        status: 'FAILED',
        reason: 'Mock payment failure for testing',
      };
    }
  }

  // Mock payment status for development
  private async mockPaymentStatus(referenceId: string): Promise<PaymentStatus> {
    console.log('🎭 MOCK: Checking payment status for:', referenceId);

    // Simulate processing delay
    await this.delay(500);

    // 95% success rate for status check
    const shouldSucceed = Math.random() > 0.05;

    if (shouldSucceed) {
      console.log('✅ MOCK: Payment successful');
      return {
        status: 'SUCCESSFUL',
        amount: '2500',
        currency: 'SSP',
        externalId: referenceId,
        financialTransactionId: `ftx_mock_${Date.now()}`,
      };
    } else {
      console.log('❌ MOCK: Payment failed');
      return {
        status: 'FAILED',
        amount: '2500',
        currency: 'SSP',
        externalId: referenceId,
        reason: 'Mock payment failure - insufficient funds',
      };
    }
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Billing Management Service
export class BillingManager {
  private mtnMomoService: MTNMomoService;

  constructor(mtnMomoService: MTNMomoService) {
    this.mtnMomoService = mtnMomoService;
  }

  // Process subscription payment
  async processSubscriptionPayment(
    userId: string,
    subscriptionId: string,
    planAmount: number,
    momoNumber: string,
    planName: string
  ): Promise<{ success: boolean; referenceId?: string; error?: string }> {
    try {
      // Validate MoMo number
      if (!this.mtnMomoService.validateMomoNumber(momoNumber)) {
        return {
          success: false,
          error: 'Invalid MTN Mobile Money number format',
        };
      }

      const normalizedNumber =
        this.mtnMomoService.normalizeMomoNumber(momoNumber);

      // Create payment request
      const paymentRequest: PaymentRequest = {
        amount: planAmount.toString(),
        currency: 'SSP',
        externalId: `wipay_${subscriptionId}_${Date.now()}`,
        payer: {
          partyIdType: 'MSISDN',
          partyId: normalizedNumber.replace('+', ''),
        },
        payerMessage: `Wipay ${planName} subscription payment`,
        payeeNote: `Monthly subscription for ${planName} plan`,
      };

      // Request payment
      const paymentResponse =
        await this.mtnMomoService.requestPayment(paymentRequest);

      if (paymentResponse.status === 'PENDING') {
        // Wait for a few seconds then check status
        await this.delay(3000);
        const status = await this.mtnMomoService.getPaymentStatus(
          paymentResponse.referenceId
        );

        return {
          success: status.status === 'SUCCESSFUL',
          referenceId: paymentResponse.referenceId,
          error: status.status === 'FAILED' ? status.reason : undefined,
        };
      } else {
        return {
          success: false,
          referenceId: paymentResponse.referenceId,
          error: paymentResponse.reason || 'Payment failed',
        };
      }
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      return {
        success: false,
        error: 'Payment processing failed. Please try again.',
      };
    }
  }

  // Schedule monthly billing
  async scheduleMonthlyBilling(
    billingRecord: Omit<BillingRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const record: BillingRecord = {
      ...billingRecord,
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real implementation, this would save to database and schedule the billing
    console.log('Billing scheduled:', record);

    return record.id;
  }

  // Process monthly billing (would be called by a cron job)
  async processMonthlyBilling(billingRecord: BillingRecord): Promise<boolean> {
    try {
      const paymentResult = await this.processSubscriptionPayment(
        billingRecord.userId,
        billingRecord.subscriptionId,
        billingRecord.amount,
        billingRecord.momoNumber,
        'Monthly Subscription'
      );

      if (paymentResult.success) {
        console.log(
          `✅ Monthly billing successful for user ${billingRecord.userId}`
        );
        return true;
      } else {
        console.log(
          `❌ Monthly billing failed for user ${billingRecord.userId}: ${paymentResult.error}`
        );
        return false;
      }
    } catch (error) {
      console.error('Error processing monthly billing:', error);
      return false;
    }
  }

  // Check if user should be suspended due to failed payments
  shouldSuspendUser(paymentProfile: UserPaymentProfile): boolean {
    // Suspend after 3 consecutive failed payment attempts
    return paymentProfile.totalFailedAttempts >= 3;
  }

  // Utility function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Factory function to create MTN MoMo service
export function createMTNMomoService(): MTNMomoService {
  const config: MtnMomoConfig = {
    environment:
      (import.meta.env.VITE_MTN_ENVIRONMENT as 'sandbox' | 'production') ||
      'sandbox',
    apiKey: import.meta.env.VITE_MTN_API_KEY || '',
    userId: import.meta.env.VITE_MTN_USER_ID || '',
    subscriptionKey: import.meta.env.VITE_MTN_SUBSCRIPTION_KEY || '',
    targetEnvironment: import.meta.env.VITE_MTN_TARGET_ENVIRONMENT || 'sandbox',
    baseUrl:
      import.meta.env.VITE_MTN_BASE_URL ||
      'https://sandbox.momodeveloper.mtn.com',
  };

  return new MTNMomoService(config);
}

// Factory function to create billing manager
export function createBillingManager(): BillingManager {
  const mtnMomoService = createMTNMomoService();
  return new BillingManager(mtnMomoService);
}
