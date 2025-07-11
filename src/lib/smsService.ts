// SMS Service for WiFi Token Distribution
// Supports multiple SMS providers for global and local delivery

export interface SMSProvider {
  name: string;
  sendSMS: (to: string, message: string) => Promise<boolean>;
}

export interface SMSConfig {
  provider: 'twilio' | 'local_ss' | 'africas_talking' | 'custom';
  apiKey?: string;
  apiSecret?: string;
  senderId?: string;
  baseUrl?: string;
}

// Twilio SMS Provider (Global - Recommended)
class TwilioProvider implements SMSProvider {
  name = 'Twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

      const body = new URLSearchParams();
      body.append('To', to);
      body.append('From', this.fromNumber);
      body.append('Body', message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Twilio SMS sent successfully:', result.sid);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Twilio SMS failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Twilio SMS error:', error);
      return false;
    }
  }
}

// Africa's Talking SMS Provider (East Africa focused)
class AfricasTalkingProvider implements SMSProvider {
  name = "Africa's Talking";
  private apiKey: string;
  private username: string;

  constructor(apiKey: string, username: string) {
    this.apiKey = apiKey;
    this.username = username;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const url = 'https://api.africastalking.com/version1/messaging';

      const body = new URLSearchParams();
      body.append('username', this.username);
      body.append('to', to);
      body.append('message', message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Africa's Talking SMS sent successfully:", result);
        return true;
      } else {
        const error = await response.json();
        console.error("❌ Africa's Talking SMS failed:", error);
        return false;
      }
    } catch (error) {
      console.error("❌ Africa's Talking SMS error:", error);
      return false;
    }
  }
}

// South Sudan Local SMS Provider (Template for local telecom)
class SouthSudanLocalProvider implements SMSProvider {
  name = 'South Sudan Local';
  private apiKey: string;
  private senderId: string;
  private baseUrl: string;

  constructor(apiKey: string, senderId: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.senderId = senderId;
    this.baseUrl = baseUrl;
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      // This is a template - replace with actual local telecom API
      const url = `${this.baseUrl}/send`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          from: this.senderId,
          message: message,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Local SMS sent successfully:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Local SMS failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Local SMS error:', error);
      return false;
    }
  }
}

// SMS Service Manager
export class SMSService {
  private provider: SMSProvider | null = null;
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      switch (this.config.provider) {
        case 'twilio':
          if (this.config.apiKey && this.config.apiSecret && this.config.senderId) {
            this.provider = new TwilioProvider(
              this.config.apiKey,
              this.config.apiSecret,
              this.config.senderId
            );
          }
          break;

        case 'africas_talking':
          if (this.config.apiKey && this.config.senderId) {
            this.provider = new AfricasTalkingProvider(
              this.config.apiKey,
              this.config.senderId
            );
          }
          break;

        case 'local_ss':
          if (this.config.apiKey && this.config.senderId && this.config.baseUrl) {
            this.provider = new SouthSudanLocalProvider(
              this.config.apiKey,
              this.config.senderId,
              this.config.baseUrl
            );
          }
          break;

        default:
          console.warn('⚠️ No SMS provider configured, falling back to simulation');
      }
    } catch (error) {
      console.error('❌ Error initializing SMS provider:', error);
    }
  }

  async sendWiFiToken(
    recipientPhone: string,
    wifiNetwork: string,
    username: string,
    password: string,
    duration: string,
    price: number,
    currency: string,
    expiresAt: string
  ): Promise<boolean> {
    const message = `🔐 WiFi Access Token - Wipay

📶 Network: ${wifiNetwork}
👤 Username: ${username}
🔑 Password: ${password}
⏰ Duration: ${duration}
💰 Price: ${price} ${currency}
⏳ Expires: ${expiresAt}

Thank you for using Wipay!`;

    return this.sendSMS(recipientPhone, message);
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    // Validate phone number format
    if (!this.isValidPhoneNumber(to)) {
      console.error('❌ Invalid phone number format:', to);
      return false;
    }

    // Normalize phone number (add country code if needed)
    const normalizedPhone = this.normalizePhoneNumber(to);

    if (!this.provider) {
      console.warn('⚠️ No SMS provider available, simulating SMS send');
      console.log('📱 SMS to send:', { to: normalizedPhone, message });
      return true; // Return true for simulation
    }

    try {
      console.log(`📤 Sending SMS via ${this.provider.name} to ${normalizedPhone}`);
      const success = await this.provider.sendSMS(normalizedPhone, message);

      if (success) {
        console.log('✅ SMS sent successfully');
      } else {
        console.error('❌ SMS sending failed');
      }

      return success;
    } catch (error) {
      console.error('❌ SMS service error:', error);
      return false;
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove spaces and special characters
    let normalized = phone.replace(/[\s\-()]/g, '');

    // Add South Sudan country code if no country code present
    if (!normalized.startsWith('+')) {
      if (normalized.startsWith('0')) {
        normalized = '+211' + normalized.substring(1); // South Sudan
      } else if (normalized.length <= 10) {
        normalized = '+211' + normalized; // Assume South Sudan
      } else {
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }

  // Get current provider info
  getProviderInfo(): string {
    return this.provider ? this.provider.name : 'Simulation Mode';
  }

  // Test SMS functionality
  async testSMS(testNumber: string): Promise<boolean> {
    const testMessage = '🧪 Test SMS from Wipay WiFi Token System. If you receive this, SMS is working correctly!';
    return this.sendSMS(testNumber, testMessage);
  }
}

// Factory function to create SMS service with environment variables
export function createSMSService(): SMSService {
  const config: SMSConfig = {
    provider: (import.meta.env.VITE_SMS_PROVIDER as SMSConfig['provider']) || 'custom',
    apiKey: import.meta.env.VITE_SMS_API_KEY,
    apiSecret: import.meta.env.VITE_SMS_API_SECRET,
    senderId: import.meta.env.VITE_SMS_SENDER_ID,
    baseUrl: import.meta.env.VITE_SMS_BASE_URL,
  };

  return new SMSService(config);
}
