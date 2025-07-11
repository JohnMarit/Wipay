import Dexie, { Table } from 'dexie';

// Database interfaces
export interface Customer {
  id?: number;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  plan: string;
  planType: 'prepaid' | 'postpaid';
  status: 'active' | 'suspended' | 'terminated';
  joinDate: string;
  lastPayment?: string;
  balance: number;
  creditLimit?: number;
  nationalId?: string;
  secondaryPhone?: string;
  billingAddress?: string;
  installationDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface Invoice {
  id?: number;
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  generatedDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  billingPeriod: string;
  serviceCharges: number;
  additionalCharges?: number;
  discount?: number;
  paymentMethod?: string;
  paidDate?: string;
  remindersSent: number;
  lastReminderDate?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface Payment {
  id?: number;
  paymentId: string;
  customerId: string;
  customerName: string;
  invoiceId?: string;
  amount: number;
  method:
    | 'orange_money'
    | 'mtn_money'
    | 'bank_transfer'
    | 'cash'
    | 'credit_card';
  reference: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  verifiedBy?: string;
  verificationDate?: string;
  notes?: string;
  receiptNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface ServicePlan {
  id?: number;
  planId: string;
  name: string;
  description: string;
  speed: string;
  speedMbps: number;
  price: number;
  currency: string;
  type: 'unlimited' | 'limited';
  dataLimit?: number;
  fupLimit?: number;
  fupSpeed?: number;
  isActive: boolean;
  installationFee?: number;
  equipmentFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id?: number;
  equipmentId: string;
  type: 'router' | 'modem' | 'access_point' | 'switch' | 'cable';
  brand: string;
  model: string;
  serialNumber: string;
  macAddress?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'damaged' | 'retired';
  condition: 'new' | 'good' | 'fair' | 'poor';
  customerId?: string;
  customerName?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface ServiceRequest {
  id?: number;
  requestId: string;
  customerId: string;
  customerName: string;
  type:
    | 'installation'
    | 'maintenance'
    | 'upgrade'
    | 'downgrade'
    | 'termination'
    | 'support';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTechnician?: string;
  technicianNotes?: string;
  equipmentRequired?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  customerSatisfaction?: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface UsageRecord {
  id?: number;
  customerId: string;
  month: string;
  year: number;
  downloadMB: number;
  uploadMB: number;
  totalMB: number;
  peakUsageTime?: string;
  averageSpeed?: number;
  connectionTime?: number;
  fupTriggered?: boolean;
  fupDate?: string;
  overage?: number;
  overageCharge?: number;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface NotificationLog {
  id?: number;
  customerId: string;
  type: 'sms' | 'email' | 'system';
  category: 'billing' | 'payment' | 'service' | 'maintenance' | 'promotional';
  message: string;
  sentDate: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  retryCount: number;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database class
export class WipayDatabase extends Dexie {
  // Define tables
  customers!: Table<Customer>;
  services!: Table<Service>;
  payments!: Table<Payment>;
  bills!: Table<Bill>;
  tickets!: Table<Ticket>;

  constructor() {
    super('WipayBillingDB');

    // Define schemas
    this.version(1).stores({
      customers:
        '++id, customerCode, name, email, phone, location, status, createdAt',
      services:
        '++id, customerId, serviceType, planName, speed, price, status, activatedAt',
      payments:
        '++id, customerId, amount, method, reference, status, createdAt',
      bills: '++id, customerId, billNumber, amount, dueDate, status, createdAt',
      tickets:
        '++id, customerId, title, priority, status, createdAt, assignedTo',
    });
  }

  // Customer methods
  async addCustomer(customer: Omit<Customer, 'id'>): Promise<number> {
    return await this.customers.add(customer);
  }

  async getCustomers(): Promise<Customer[]> {
    return await this.customers.toArray();
  }

  async getCustomerById(id: number): Promise<Customer | undefined> {
    return await this.customers.get(id);
  }

  async updateCustomer(
    id: number,
    changes: Partial<Customer>
  ): Promise<number> {
    return await this.customers.update(id, changes);
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.customers.delete(id);
  }

  // Service methods
  async addService(service: Omit<Service, 'id'>): Promise<number> {
    return await this.services.add(service);
  }

  async getServicesByCustomer(customerId: number): Promise<Service[]> {
    return await this.services.where('customerId').equals(customerId).toArray();
  }

  async updateService(id: number, changes: Partial<Service>): Promise<number> {
    return await this.services.update(id, changes);
  }

  // Payment methods
  async addPayment(payment: Omit<Payment, 'id'>): Promise<number> {
    return await this.payments.add(payment);
  }

  async getPaymentsByCustomer(customerId: number): Promise<Payment[]> {
    return await this.payments.where('customerId').equals(customerId).toArray();
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Payment[]> {
    return await this.payments
      .where('createdAt')
      .between(startDate, endDate)
      .toArray();
  }

  // Bill methods
  async addBill(bill: Omit<Bill, 'id'>): Promise<number> {
    return await this.bills.add(bill);
  }

  async getBillsByCustomer(customerId: number): Promise<Bill[]> {
    return await this.bills.where('customerId').equals(customerId).toArray();
  }

  async getOverdueBills(): Promise<Bill[]> {
    const today = new Date();
    return await this.bills
      .where('dueDate')
      .below(today)
      .and(bill => bill.status !== 'paid')
      .toArray();
  }

  // Ticket methods
  async addTicket(ticket: Omit<Ticket, 'id'>): Promise<number> {
    return await this.tickets.add(ticket);
  }

  async getTicketsByCustomer(customerId: number): Promise<Ticket[]> {
    return await this.tickets.where('customerId').equals(customerId).toArray();
  }

  async getOpenTickets(): Promise<Ticket[]> {
    return await this.tickets
      .where('status')
      .anyOf(['open', 'in-progress'])
      .toArray();
  }

  // Analytics methods
  async getCustomerCount(): Promise<number> {
    return await this.customers.count();
  }

  async getActiveServicesCount(): Promise<number> {
    return await this.services.where('status').equals('active').count();
  }

  async getMonthlyRevenue(): Promise<number> {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const payments = await this.getPaymentsByDateRange(
      startOfMonth,
      endOfMonth
    );
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  async getPendingPaymentsTotal(): Promise<number> {
    const bills = await this.bills.where('status').equals('pending').toArray();
    return bills.reduce((total, bill) => total + bill.amount, 0);
  }

  // Data export/backup methods
  async exportData(): Promise<DatabaseExport> {
    const [customers, services, payments, bills, tickets] = await Promise.all([
      this.customers.toArray(),
      this.services.toArray(),
      this.payments.toArray(),
      this.bills.toArray(),
      this.tickets.toArray(),
    ]);

    return {
      customers,
      services,
      payments,
      bills,
      tickets,
      exportDate: new Date(),
    };
  }

  async importData(data: DatabaseExport): Promise<void> {
    await this.transaction(
      'rw',
      this.customers,
      this.services,
      this.payments,
      this.bills,
      this.tickets,
      async () => {
        // Clear existing data
        await this.customers.clear();
        await this.services.clear();
        await this.payments.clear();
        await this.bills.clear();
        await this.tickets.clear();

        // Import new data
        await this.customers.bulkAdd(data.customers);
        await this.services.bulkAdd(data.services);
        await this.payments.bulkAdd(data.payments);
        await this.bills.bulkAdd(data.bills);
        await this.tickets.bulkAdd(data.tickets);
      }
    );
  }

  // Search methods
  async searchCustomers(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return await this.customers
      .filter(
        customer =>
          customer.name.toLowerCase().includes(lowerQuery) ||
          customer.email.toLowerCase().includes(lowerQuery) ||
          customer.phone.includes(query) ||
          customer.customerCode.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    const [recentPayments, recentBills, recentTickets] = await Promise.all([
      this.payments.orderBy('createdAt').reverse().limit(limit).toArray(),
      this.bills.orderBy('createdAt').reverse().limit(limit).toArray(),
      this.tickets.orderBy('createdAt').reverse().limit(limit).toArray(),
    ]);

    const activities: ActivityItem[] = [
      ...recentPayments.map(payment => ({
        id: `payment-${payment.id}`,
        type: 'payment' as const,
        description: `Payment of ${payment.amount} SSP via ${payment.method}`,
        date: payment.createdAt,
        customerId: payment.customerId,
      })),
      ...recentBills.map(bill => ({
        id: `bill-${bill.id}`,
        type: 'bill' as const,
        description: `Bill ${bill.billNumber} generated for ${bill.amount} SSP`,
        date: bill.createdAt,
        customerId: bill.customerId,
      })),
      ...recentTickets.map(ticket => ({
        id: `ticket-${ticket.id}`,
        type: 'ticket' as const,
        description: `Ticket created: ${ticket.title}`,
        date: ticket.createdAt,
        customerId: ticket.customerId,
      })),
    ];

    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }
}

// Create database instance
export const db = new WipayDatabase();
