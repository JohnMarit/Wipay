// Data collector for real WiFi token transactions
import { storage } from './utils';

export interface TokenTransaction {
  id: string;
  recipientPhone: string;
  duration: number;
  price: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  username: string;
  password: string;
  isActive: boolean;
}

export interface CollectedReportData {
  period: string;
  revenue: number;
  transactions: number;
  customers: number;
  avgTransactionValue: number;
  transactions_data: Array<{
    date: string;
    amount: number;
    customer: string;
    service: string;
    payment_method: string;
  }>;
  revenue_by_service: Array<{
    service: string;
    revenue: number;
    count: number;
  }>;
  payment_methods: Array<{
    method: string;
    amount: number;
    percentage: number;
  }>;
}

export class WiFiDataCollector {
  private getStoredTokens(): TokenTransaction[] {
    // Note: With Firebase integration, this fallback localStorage is rarely used
    // The main app uses Firebase for token storage
    return storage.getItem<TokenTransaction[]>('tokens', []) || [];
  }

  private filterTokensByPeriod(tokens: TokenTransaction[], period: 'week' | 'month' | 'year'): TokenTransaction[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return tokens.filter(token => {
      const tokenDate = new Date(token.createdAt);
      return tokenDate >= startDate && tokenDate <= now;
    });
  }

  private getServiceLabel(duration: number): string {
    switch (duration) {
      case 1: return '1 Hour WiFi';
      case 3: return '3 Hours WiFi';
      case 6: return '6 Hours WiFi';
      case 12: return '12 Hours WiFi';
      case 24: return '24 Hours WiFi';
      default: return `${duration} Hours WiFi`;
    }
  }

  public collectDataForPeriod(period: 'week' | 'month' | 'year'): CollectedReportData {
    const allTokens = this.getStoredTokens();
    const filteredTokens = this.filterTokensByPeriod(allTokens, period);

    // Calculate period label
    const now = new Date();
    let periodLabel: string;
    
    switch (period) {
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = `${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`;
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = `${monthStart.toLocaleDateString()} - ${now.toLocaleDateString()}`;
        break;
      case 'year':
        periodLabel = now.getFullYear().toString();
        break;
    }

    // Calculate basic metrics
    const totalRevenue = filteredTokens.reduce((sum, token) => sum + token.price, 0);
    const uniqueCustomers = new Set(filteredTokens.map(token => token.recipientPhone)).size;
    const avgTransactionValue = filteredTokens.length > 0 ? totalRevenue / filteredTokens.length : 0;

    // Transform tokens to transaction data format
    const transactions_data = filteredTokens.map(token => ({
      date: token.createdAt,
      amount: token.price,
      customer: token.recipientPhone,
      service: this.getServiceLabel(token.duration),
      payment_method: token.paymentMethod
    }));

    // Calculate revenue by service
    const serviceMap = new Map<string, { revenue: number; count: number }>();
    filteredTokens.forEach(token => {
      const serviceLabel = this.getServiceLabel(token.duration);
      const current = serviceMap.get(serviceLabel) || { revenue: 0, count: 0 };
      serviceMap.set(serviceLabel, {
        revenue: current.revenue + token.price,
        count: current.count + 1
      });
    });

    const revenue_by_service = Array.from(serviceMap.entries()).map(([service, data]) => ({
      service,
      revenue: data.revenue,
      count: data.count
    })).sort((a, b) => b.revenue - a.revenue);

    // Calculate payment methods distribution
    const paymentMap = new Map<string, number>();
    filteredTokens.forEach(token => {
      const current = paymentMap.get(token.paymentMethod) || 0;
      paymentMap.set(token.paymentMethod, current + token.price);
    });

    const payment_methods = Array.from(paymentMap.entries()).map(([method, amount]) => ({
      method,
      amount,
      percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      period: periodLabel,
      revenue: totalRevenue,
      transactions: filteredTokens.length,
      customers: uniqueCustomers,
      avgTransactionValue,
      transactions_data: transactions_data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      revenue_by_service,
      payment_methods
    };
  }

  public hasData(): boolean {
    const tokens = this.getStoredTokens();
    return tokens.length > 0;
  }

  public getDataSummary(): { totalTokens: number; totalRevenue: number; oldestTransaction: string | null } {
    const tokens = this.getStoredTokens();
    const totalRevenue = tokens.reduce((sum, token) => sum + token.price, 0);
    const oldestTransaction = tokens.length > 0 
      ? tokens.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0].createdAt
      : null;

    return {
      totalTokens: tokens.length,
      totalRevenue,
      oldestTransaction
    };
  }
} 