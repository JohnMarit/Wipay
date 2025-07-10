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
  method: 'orange_money' | 'mtn_money' | 'bank_transfer' | 'cash' | 'credit_card';
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
  type: 'installation' | 'maintenance' | 'upgrade' | 'downgrade' | 'termination' | 'support';
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
export class ISPDatabase extends Dexie {
  customers!: Table<Customer>;
  invoices!: Table<Invoice>;
  payments!: Table<Payment>;
  servicePlans!: Table<ServicePlan>;
  equipment!: Table<Equipment>;
  serviceRequests!: Table<ServiceRequest>;
  usageRecords!: Table<UsageRecord>;
  notificationLogs!: Table<NotificationLog>;

  constructor() {
    super('ISPBillingDB');
    
    this.version(1).stores({
      customers: '++id, customerId, name, phone, email, status, planType, syncStatus, updatedAt',
      invoices: '++id, invoiceId, customerId, status, dueDate, syncStatus, updatedAt',
      payments: '++id, paymentId, customerId, invoiceId, method, status, date, syncStatus, updatedAt',
      servicePlans: '++id, planId, name, isActive, price',
      equipment: '++id, equipmentId, type, serialNumber, status, customerId, syncStatus, updatedAt',
      serviceRequests: '++id, requestId, customerId, type, status, assignedTechnician, syncStatus, updatedAt',
      usageRecords: '++id, customerId, month, year, syncStatus, updatedAt',
      notificationLogs: '++id, customerId, type, category, sentDate, status'
    });
  }

  // Sync methods for offline capability
  async getUnsyncedRecords(): Promise<{
    customers: Customer[];
    invoices: Invoice[];
    payments: Payment[];
    equipment: Equipment[];
    serviceRequests: ServiceRequest[];
    usageRecords: UsageRecord[];
  }> {
    return {
      customers: await this.customers.where('syncStatus').equals('pending').toArray(),
      invoices: await this.invoices.where('syncStatus').equals('pending').toArray(),
      payments: await this.payments.where('syncStatus').equals('pending').toArray(),
      equipment: await this.equipment.where('syncStatus').equals('pending').toArray(),
      serviceRequests: await this.serviceRequests.where('syncStatus').equals('pending').toArray(),
      usageRecords: await this.usageRecords.where('syncStatus').equals('pending').toArray(),
    };
  }

  async markAsSynced(table: string, id: number): Promise<void> {
    const tableRef = this[table as keyof this] as Table;
    await tableRef.update(id, { syncStatus: 'synced', updatedAt: new Date() });
  }

  async markAsFailed(table: string, id: number): Promise<void> {
    const tableRef = this[table as keyof this] as Table;
    await tableRef.update(id, { syncStatus: 'failed', updatedAt: new Date() });
  }

  // Utility methods
  async getCustomerBalance(customerId: string): Promise<number> {
    const customer = await this.customers.where('customerId').equals(customerId).first();
    return customer?.balance || 0;
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];
    return await this.invoices
      .where('status').equals('sent')
      .and(invoice => invoice.dueDate < today)
      .toArray();
  }

  async getCustomerUsage(customerId: string, year: number): Promise<UsageRecord[]> {
    return await this.usageRecords
      .where(['customerId', 'year'])
      .equals([customerId, year])
      .toArray();
  }

  async getEquipmentByCustomer(customerId: string): Promise<Equipment[]> {
    return await this.equipment
      .where('customerId')
      .equals(customerId)
      .toArray();
  }

  async getActiveServiceRequests(): Promise<ServiceRequest[]> {
    return await this.serviceRequests
      .where('status')
      .anyOf(['open', 'assigned', 'in_progress'])
      .toArray();
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    const planCount = await this.servicePlans.count();
    if (planCount === 0) {
      await this.servicePlans.bulkAdd([
        {
          planId: 'BASIC_5M',
          name: 'Basic Plan',
          description: 'Perfect for basic browsing and email',
          speed: '5 Mbps',
          speedMbps: 5,
          price: 100,
          currency: 'SSP',
          type: 'unlimited',
          fupLimit: 50,
          fupSpeed: 1,
          isActive: true,
          installationFee: 200,
          equipmentFee: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          planId: 'STANDARD_10M',
          name: 'Standard Plan',
          description: 'Great for streaming and small business',
          speed: '10 Mbps',
          speedMbps: 10,
          price: 150,
          currency: 'SSP',
          type: 'unlimited',
          fupLimit: 100,
          fupSpeed: 2,
          isActive: true,
          installationFee: 200,
          equipmentFee: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          planId: 'PREMIUM_20M',
          name: 'Premium Plan',
          description: 'High-speed for gaming and video calls',
          speed: '20 Mbps',
          speedMbps: 20,
          price: 250,
          currency: 'SSP',
          type: 'unlimited',
          fupLimit: 200,
          fupSpeed: 5,
          isActive: true,
          installationFee: 200,
          equipmentFee: 150,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          planId: 'BUSINESS_50M',
          name: 'Business Plan',
          description: 'Enterprise-grade connectivity',
          speed: '50 Mbps',
          speedMbps: 50,
          price: 500,
          currency: 'SSP',
          type: 'unlimited',
          fupLimit: 500,
          fupSpeed: 10,
          isActive: true,
          installationFee: 300,
          equipmentFee: 250,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  }
}

// Create and export database instance
export const db = new ISPDatabase(); 