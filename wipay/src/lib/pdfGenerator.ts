import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface ReportData {
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

interface TranslationKeys {
  [key: string]: string;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private currentY: number;
  private translations: TranslationKeys;

  constructor(translations: TranslationKeys) {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.currentY = 20;
    this.translations = translations;
  }

  private addHeader(title: string, subtitle: string) {
    // Company logo/header
    this.doc.setFontSize(24);
    this.doc.setTextColor(41, 128, 185);
    this.doc.text('Wipay', 20, this.currentY);
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('WiFi Token Distribution System', 20, this.currentY + 10);

    // Report title
    this.doc.setFontSize(18);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, 20, this.currentY + 30);

    this.doc.setFontSize(12);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(subtitle, 20, this.currentY + 42);

    // Date generated
    const now = new Date();
    this.doc.text(`Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 20, this.currentY + 54);

    this.currentY += 70;
  }

  private addSummarySection(data: ReportData) {
    this.checkPageBreak(60);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.translations.summary || 'Summary', 20, this.currentY);
    this.currentY += 15;

    // Summary table
    const summaryData = [
      [this.translations.totalRevenue || 'Total Revenue', `${data.revenue.toLocaleString()} SSP`],
      [this.translations.totalTransactions || 'Total Transactions', data.transactions.toString()],
      [this.translations.uniqueCustomers || 'Unique Customers', data.customers.toString()],
      [this.translations.avgTransactionValue || 'Average Transaction Value', `${data.avgTransactionValue.toFixed(2)} SSP`]
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [[this.translations.metric || 'Metric', this.translations.value || 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20 },
      tableWidth: 'auto'
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;
  }

  private addRevenueByServiceSection(data: ReportData) {
    this.checkPageBreak(80);
    
    this.doc.setFontSize(14);
    this.doc.text(this.translations.revenueByService || 'Revenue by Service', 20, this.currentY);
    this.currentY += 15;

    const serviceData = data.revenue_by_service.map(item => [
      item.service,
      item.count.toString(),
      `${item.revenue.toLocaleString()} SSP`,
      `${((item.revenue / data.revenue) * 100).toFixed(1)}%`
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [[
        this.translations.service || 'Service',
        this.translations.transactions || 'Transactions',
        this.translations.revenue || 'Revenue',
        this.translations.percentage || 'Percentage'
      ]],
      body: serviceData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;
  }

  private addPaymentMethodsSection(data: ReportData) {
    this.checkPageBreak(80);
    
    this.doc.setFontSize(14);
    this.doc.text(this.translations.paymentMethods || 'Payment Methods', 20, this.currentY);
    this.currentY += 15;

    const paymentData = data.payment_methods.map(method => [
      method.method,
      `${method.amount.toLocaleString()} SSP`,
      `${method.percentage.toFixed(1)}%`
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [[
        this.translations.method || 'Method',
        this.translations.amount || 'Amount',
        this.translations.percentage || 'Percentage'
      ]],
      body: paymentData,
      theme: 'striped',
      headStyles: { fillColor: [46, 204, 113] }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;
  }

  private addTransactionDetails(data: ReportData) {
    this.checkPageBreak(100);
    
    this.doc.setFontSize(14);
    this.doc.text(this.translations.transactionDetails || 'Transaction Details', 20, this.currentY);
    this.currentY += 15;

    const transactionData = data.transactions_data.slice(0, 50).map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.customer,
      tx.service,
      tx.payment_method,
      `${tx.amount.toLocaleString()} SSP`
    ]);

    this.doc.autoTable({
      startY: this.currentY,
      head: [[
        this.translations.date || 'Date',
        this.translations.customer || 'Customer',
        this.translations.service || 'Service',
        this.translations.paymentMethod || 'Payment Method',
        this.translations.amount || 'Amount'
      ]],
      body: transactionData,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 8 }
    });

    if (data.transactions_data.length > 50) {
      this.currentY = this.doc.lastAutoTable.finalY + 10;
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`Note: Showing first 50 of ${data.transactions_data.length} transactions`, 20, this.currentY);
    }
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.width - 50,
        this.doc.internal.pageSize.height - 10
      );
      this.doc.text(
        'Generated by Wipay',
        20,
        this.doc.internal.pageSize.height - 10
      );
    }
  }

  public generateWeeklyReport(data: ReportData): jsPDF {
    this.addHeader(
      this.translations.weeklyReport || 'Weekly Report',
      `${this.translations.period || 'Period'}: ${data.period}`
    );
    
    this.addSummarySection(data);
    this.addRevenueByServiceSection(data);
    this.addPaymentMethodsSection(data);
    this.addTransactionDetails(data);
    this.addFooter();
    
    return this.doc;
  }

  public generateMonthlyReport(data: ReportData): jsPDF {
    this.addHeader(
      this.translations.monthlyReport || 'Monthly Report',
      `${this.translations.period || 'Period'}: ${data.period}`
    );
    
    this.addSummarySection(data);
    this.addRevenueByServiceSection(data);
    this.addPaymentMethodsSection(data);
    this.addTransactionDetails(data);
    this.addFooter();
    
    return this.doc;
  }

  public generateYearlyReport(data: ReportData): jsPDF {
    this.addHeader(
      this.translations.yearlyReport || 'Yearly Report',
      `${this.translations.period || 'Period'}: ${data.period}`
    );
    
    this.addSummarySection(data);
    this.addRevenueByServiceSection(data);
    this.addPaymentMethodsSection(data);
    this.addTransactionDetails(data);
    this.addFooter();
    
    return this.doc;
  }

  public generateSimpleReport(data: any, type: 'weekly' | 'monthly' | 'yearly'): jsPDF {
    const reportTitle = type === 'weekly' ? this.translations.weeklyReport || 'Weekly Report' 
                      : type === 'monthly' ? this.translations.monthlyReport || 'Monthly Report'
                      : this.translations.yearlyReport || 'Yearly Report';
    
    this.addHeader(
      reportTitle,
      `${this.translations.period || 'Period'}: ${data.period}`
    );
    
    this.addSimpleSummarySection(data);
    this.addFooter();
    
    return this.doc;
  }

  private addSimpleSummarySection(data: any) {
    this.checkPageBreak(80);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.translations.summary || 'Summary', 20, this.currentY);
    this.currentY += 20;

    // Simple summary table with only revenue and total users
    const summaryData = [
      [this.translations.totalRevenue || 'Total Revenue', `${data.revenue.toLocaleString()} SSP`],
      ['Total Users', data.totalUsers?.toString() || '0']
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [[this.translations.metric || 'Metric', this.translations.value || 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20 },
      tableWidth: 'auto',
      styles: { fontSize: 12 }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 20;
  }
}

import { WiFiDataCollector } from './dataCollector';

// Helper function to generate report data (real or sample) for different periods
export const generateReportData = (period: 'week' | 'month' | 'year', language: string = 'en'): ReportData => {
  // Try to get real data first
  const dataCollector = new WiFiDataCollector();
  
  if (dataCollector.hasData()) {
    // Use real data from the WiFi token system
    return dataCollector.collectDataForPeriod(period);
  }
  
  // Fall back to sample data if no real data is available
  const now = new Date();
  const transactions: ReportData['transactions_data'] = [];
  const services = ['1 Hour WiFi', '3 Hours WiFi', '6 Hours WiFi', '12 Hours WiFi', '24 Hours WiFi'];
  const payments = ['MTN Mobile Money', 'Cash Payment', 'Bank Transfer'];
  
  let dateRange: { start: Date; end: Date; periodLabel: string };
  let transactionCount: number;
  
  switch (period) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      dateRange = {
        start: weekStart,
        end: now,
        periodLabel: `${weekStart.toLocaleDateString()} - ${now.toLocaleDateString()}`
      };
      transactionCount = 50 + Math.floor(Math.random() * 30);
      break;
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateRange = {
        start: monthStart,
        end: now,
        periodLabel: `${monthStart.toLocaleDateString()} - ${now.toLocaleDateString()}`
      };
      transactionCount = 200 + Math.floor(Math.random() * 100);
      break;
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1);
      dateRange = {
        start: yearStart,
        end: now,
        periodLabel: `${yearStart.getFullYear()}`
      };
      transactionCount = 2000 + Math.floor(Math.random() * 1000);
      break;
  }

  // Generate sample transactions
  for (let i = 0; i < transactionCount; i++) {
    const randomDate = new Date(
      dateRange.start.getTime() + Math.random() * (dateRange.end.getTime() - dateRange.start.getTime())
    );
    
    const service = services[Math.floor(Math.random() * services.length)];
    const payment = payments[Math.floor(Math.random() * payments.length)];
    const amount = 50 + Math.floor(Math.random() * 450); // 50-500 SSP
    
    transactions.push({
      date: randomDate.toISOString(),
      amount,
      customer: `+211${Math.floor(Math.random() * 900000000) + 100000000}`,
      service,
      payment_method: payment
    });
  }

  // Calculate aggregated data
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const uniqueCustomers = new Set(transactions.map(tx => tx.customer)).size;

  // Revenue by service
  const revenueByService = services.map(service => {
    const serviceTransactions = transactions.filter(tx => tx.service === service);
    return {
      service,
      revenue: serviceTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      count: serviceTransactions.length
    };
  }).filter(item => item.count > 0);

  // Payment methods distribution
  const paymentMethods = payments.map(method => {
    const methodTransactions = transactions.filter(tx => tx.payment_method === method);
    const amount = methodTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    return {
      method,
      amount,
      percentage: (amount / totalRevenue) * 100
    };
  }).filter(item => item.amount > 0);

  return {
    period: dateRange.periodLabel,
    revenue: totalRevenue,
    transactions: transactions.length,
    customers: uniqueCustomers,
    avgTransactionValue: totalRevenue / transactions.length,
    transactions_data: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    revenue_by_service: revenueByService.sort((a, b) => b.revenue - a.revenue),
    payment_methods: paymentMethods.sort((a, b) => b.amount - a.amount)
  };
}; 