/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';

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

    this.currentY += 80;
  }

  private addSummarySection(data: any) {
    this.checkPageBreak(80);
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Executive Summary', 20, this.currentY);
    this.currentY += 20;

    // Draw summary box
    this.doc.setDrawColor(41, 128, 185);
    this.doc.setLineWidth(0.5);
    this.doc.rect(20, this.currentY, 170, 60);

    // Summary content
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    
    const summaryItems = [
      `Total Revenue: ${data.revenue?.toLocaleString() || '0'} SSP`,
      `Total Users: ${data.totalUsers || data.customers || '0'}`,
      `Total Transactions: ${data.transactions || '0'}`,
      `Average Transaction: ${data.avgTransactionValue ? data.avgTransactionValue.toFixed(2) : '0'} SSP`
    ];

    summaryItems.forEach((item, index) => {
      this.doc.text(item, 25, this.currentY + 15 + (index * 10));
    });

    this.currentY += 80;
  }

  private addServiceBreakdown(data: any) {
    if (!data.serviceBreakdown || data.serviceBreakdown.length === 0) return;
    
    this.checkPageBreak(100);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Service Breakdown', 20, this.currentY);
    this.currentY += 20;

    // Header
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Service', 25, this.currentY);
    this.doc.text('Count', 80, this.currentY);
    this.doc.text('Revenue', 120, this.currentY);
    this.doc.text('Percentage', 160, this.currentY);
    this.currentY += 10;

    // Draw line under header
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, this.currentY, 190, this.currentY);
    this.currentY += 10;

    // Service data
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);
    
    data.serviceBreakdown.forEach((service: any, index: number) => {
      const percentage = data.revenue > 0 ? ((service.revenue / data.revenue) * 100).toFixed(1) : '0';
      
      this.doc.text(service.service, 25, this.currentY);
      this.doc.text(service.count.toString(), 80, this.currentY);
      this.doc.text(`${service.revenue.toLocaleString()} SSP`, 120, this.currentY);
      this.doc.text(`${percentage}%`, 160, this.currentY);
      
      this.currentY += 12;
      
      if (index < data.serviceBreakdown.length - 1) {
        this.doc.setDrawColor(240, 240, 240);
        this.doc.line(20, this.currentY - 2, 190, this.currentY - 2);
      }
    });

    this.currentY += 10;
  }

  private addPaymentBreakdown(data: any) {
    if (!data.paymentBreakdown || data.paymentBreakdown.length === 0) return;
    
    this.checkPageBreak(80);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Payment Method Analysis', 20, this.currentY);
    this.currentY += 20;

    // Header
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Payment Method', 25, this.currentY);
    this.doc.text('Transactions', 100, this.currentY);
    this.doc.text('Revenue', 150, this.currentY);
    this.currentY += 10;

    // Draw line under header
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, this.currentY, 190, this.currentY);
    this.currentY += 10;

    // Payment data
    this.doc.setFontSize(9);
    this.doc.setTextColor(0, 0, 0);
    
    data.paymentBreakdown.forEach((method: any, index: number) => {
      this.doc.text(method.method, 25, this.currentY);
      this.doc.text(method.count.toString(), 100, this.currentY);
      this.doc.text(`${method.revenue.toLocaleString()} SSP`, 150, this.currentY);
      
      this.currentY += 12;
      
      if (index < data.paymentBreakdown.length - 1) {
        this.doc.setDrawColor(240, 240, 240);
        this.doc.line(20, this.currentY - 2, 190, this.currentY - 2);
      }
    });

    this.currentY += 10;
  }

  private addRecentTransactions(data: any) {
    if (!data.recentTransactions || data.recentTransactions.length === 0) return;
    
    this.checkPageBreak(120);
    
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Recent Transactions', 20, this.currentY);
    this.currentY += 20;

    // Header
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Date', 25, this.currentY);
    this.doc.text('Customer', 60, this.currentY);
    this.doc.text('Service', 110, this.currentY);
    this.doc.text('Amount', 160, this.currentY);
    this.currentY += 8;

    // Draw line under header
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, this.currentY, 190, this.currentY);
    this.currentY += 8;

    // Transaction data (show up to 15 to fit on page)
    this.doc.setFontSize(7);
    this.doc.setTextColor(0, 0, 0);
    
    const transactions = data.recentTransactions.slice(0, 15);
    
    transactions.forEach((tx: any, index: number) => {
      this.doc.text(tx.date, 25, this.currentY);
      this.doc.text(tx.customer.substring(0, 15) + '...', 60, this.currentY);
      this.doc.text(tx.service, 110, this.currentY);
      this.doc.text(`${tx.amount} SSP`, 160, this.currentY);
      
      this.currentY += 10;
      
      if (index < transactions.length - 1) {
        this.doc.setDrawColor(245, 245, 245);
        this.doc.line(20, this.currentY - 2, 190, this.currentY - 2);
      }
    });

    if (data.recentTransactions.length > 15) {
      this.currentY += 5;
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`Showing 15 of ${data.recentTransactions.length} transactions`, 25, this.currentY);
    }

    this.currentY += 20;
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addFooter() {
    const pageCount = (this.doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150, 150, 150);
      this.doc.text(
        `Page ${i} of ${pageCount}`,
        this.doc.internal.pageSize.width - 50,
        this.doc.internal.pageSize.height - 10
      );
      this.doc.text(
        'Generated by Wipay WiFi Token System',
        20,
        this.doc.internal.pageSize.height - 10
      );
    }
  }

  public generateSimpleReport(data: any, type: 'weekly' | 'monthly' | 'yearly'): jsPDF {
    const reportTitle = type === 'weekly' ? this.translations.weeklyReport || 'Weekly Report' 
                      : type === 'monthly' ? this.translations.monthlyReport || 'Monthly Report'
                      : this.translations.yearlyReport || 'Yearly Report';
    
    this.addHeader(
      reportTitle,
      `Period: ${data.period}`
    );
    
    this.addSummarySection(data);
    this.addServiceBreakdown(data);
    this.addPaymentBreakdown(data);
    this.addRecentTransactions(data);
    this.addFooter();
    
    return this.doc;
  }

  // Keep the legacy methods for backward compatibility
  public generateWeeklyReport(data: any): jsPDF {
    return this.generateSimpleReport(data, 'weekly');
  }

  public generateMonthlyReport(data: any): jsPDF {
    return this.generateSimpleReport(data, 'monthly');
  }

  public generateYearlyReport(data: any): jsPDF {
    return this.generateSimpleReport(data, 'yearly');
  }
} 