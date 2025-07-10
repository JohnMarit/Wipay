import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus, Edit, Trash2, Phone, Mail, MapPin, CreditCard, History, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancedCustomerManagementProps {
  language: string;
}

interface Customer {
  id: number;
  customerId: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  nationalId?: string;
  plan: string;
  planType: 'prepaid' | 'postpaid';
  status: 'active' | 'suspended' | 'terminated';
  joinDate: string;
  lastPayment?: string;
  balance: number;
  creditLimit?: number;
  installationDate?: string;
  notes?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const EnhancedCustomerManagement = ({ language }: EnhancedCustomerManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlanType, setFilterPlanType] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const translations = {
    en: {
      title: "Enhanced Customer Management",
      description: "Complete customer relationship management with CRM features",
      addCustomer: "Add New Customer",
      editCustomer: "Edit Customer",
      customerDetails: "Customer Details",
      basicInfo: "Basic Information",
      contactInfo: "Contact Information", 
      serviceInfo: "Service Information",
      billingInfo: "Billing Information",
      notes: "Notes & History",
      customerId: "Customer ID",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      secondaryPhone: "Secondary Phone",
      emailAddress: "Email Address",
      address: "Street Address",
      city: "City",
      state: "State",
      nationalId: "National ID",
      servicePlan: "Service Plan",
      planType: "Plan Type",
      prepaid: "Prepaid",
      postpaid: "Postpaid",
      status: "Status",
      balance: "Current Balance",
      creditLimit: "Credit Limit",
      installationDate: "Installation Date",
      lastPayment: "Last Payment",
      riskLevel: "Risk Level",
      customerNotes: "Customer Notes",
      active: "Active",
      suspended: "Suspended",
      terminated: "Terminated",
      low: "Low",
      medium: "Medium",
      high: "High",
      southSudanStates: ["Central Equatoria", "Eastern Equatoria", "Western Equatoria", "Jonglei", "Unity", "Upper Nile", "Northern Bahr el Ghazal", "Western Bahr el Ghazal", "Lakes", "Warrap"],
      filterByStatus: "Filter by Status",
      filterByPlan: "Filter by Plan Type",
      searchCustomers: "Search customers...",
      save: "Save Customer",
      cancel: "Cancel",
      actions: "Actions",
      viewDetails: "View Details",
      suspend: "Suspend",
      activate: "Activate",
      terminate: "Terminate",
      all: "All"
    },
    ar: {
      title: "إدارة العملاء المحسنة",
      description: "إدارة علاقات العملاء الكاملة مع ميزات إدارة علاقات العملاء",
      addCustomer: "إضافة عميل جديد",
      editCustomer: "تعديل العميل",
      customerDetails: "تفاصيل العميل",
      basicInfo: "المعلومات الأساسية",
      contactInfo: "معلومات الاتصال",
      serviceInfo: "معلومات الخدمة",
      billingInfo: "معلومات الفوترة",
      notes: "الملاحظات والتاريخ",
      customerId: "رقم العميل",
      fullName: "الاسم الكامل",
      phoneNumber: "رقم الهاتف",
      secondaryPhone: "هاتف ثانوي",
      emailAddress: "عنوان البريد الإلكتروني",
      address: "عنوان الشارع",
      city: "المدينة",
      state: "الولاية",
      nationalId: "الرقم الوطني",
      servicePlan: "خطة الخدمة",
      planType: "نوع الخطة",
      prepaid: "مدفوع مسبقاً",
      postpaid: "مدفوع لاحقاً",
      status: "الحالة",
      balance: "الرصيد الحالي",
      creditLimit: "حد الائتمان",
      installationDate: "تاريخ التركيب",
      lastPayment: "آخر دفعة",
      riskLevel: "مستوى المخاطر",
      customerNotes: "ملاحظات العميل",
      active: "نشط",
      suspended: "معلق",
      terminated: "منتهي",
      low: "منخفض",
      medium: "متوسط",
      high: "عالي",
      southSudanStates: ["وسط الاستوائية", "شرق الاستوائية", "غرب الاستوائية", "جونقلي", "الوحدة", "أعالي النيل", "شمال بحر الغزال", "غرب بحر الغزال", "البحيرات", "وراب"],
      filterByStatus: "تصفية حسب الحالة",
      filterByPlan: "تصفية حسب نوع الخطة",
      searchCustomers: "البحث عن العملاء...",
      save: "حفظ العميل",
      cancel: "إلغاء",
      actions: "الإجراءات",
      viewDetails: "عرض التفاصيل",
      suspend: "تعليق",
      activate: "تفعيل",
      terminate: "إنهاء",
      all: "الكل"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Sample enhanced customer data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      customerId: "CUST-2024-001",
      name: "Ahmed Hassan Mohamed",
      phone: "+211 912 345 678",
      secondaryPhone: "+211 925 123 456",
      email: "ahmed.hassan@email.com",
      address: "Hai Malakal, Block 15",
      city: "Juba",
      state: "Central Equatoria",
      nationalId: "SS12345678901",
      plan: "Standard Plan (10 Mbps)",
      planType: "postpaid",
      status: "active",
      joinDate: "2024-01-15",
      lastPayment: "2024-01-20",
      balance: -50,
      creditLimit: 300,
      installationDate: "2024-01-16",
      riskLevel: "low",
      notes: "Reliable customer, always pays on time"
    },
    {
      id: 2,
      customerId: "CUST-2024-002",
      name: "Mary John Deng",
      phone: "+211 923 456 789",
      email: "mary.john@email.com",
      address: "Hai Jebel, Street 12",
      city: "Wau",
      state: "Western Bahr el Ghazal",
      plan: "Basic Plan (5 Mbps)",
      planType: "prepaid",
      status: "active",
      joinDate: "2024-02-20",
      balance: 25,
      installationDate: "2024-02-22",
      riskLevel: "low",
      notes: "Prepaid customer, good payment history"
    }
  ]);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    secondaryPhone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    nationalId: "",
    planType: "postpaid" as 'prepaid' | 'postpaid',
    plan: "",
    creditLimit: 0,
    notes: ""
  });

  const servicePlans = [
    "Basic Plan (5 Mbps)",
    "Standard Plan (10 Mbps)", 
    "Premium Plan (20 Mbps)",
    "Business Plan (50 Mbps)"
  ];

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: t.active, variant: "default" as const },
      suspended: { label: t.suspended, variant: "destructive" as const },
      terminated: { label: t.terminated, variant: "secondary" as const }
    };
    const config = configs[status as keyof typeof configs];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const configs = {
      low: { label: t.low, variant: "default" as const },
      medium: { label: t.medium, variant: "secondary" as const },
      high: { label: t.high, variant: "destructive" as const }
    };
    const config = configs[risk as keyof typeof configs];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    const matchesPlanType = filterPlanType === "all" || customer.planType === filterPlanType;
    
    return matchesSearch && matchesStatus && matchesPlanType;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t.title}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t.addCustomer}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t.addCustomer}</DialogTitle>
                  <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">{t.basicInfo}</TabsTrigger>
                    <TabsTrigger value="contact">{t.contactInfo}</TabsTrigger>
                    <TabsTrigger value="service">{t.serviceInfo}</TabsTrigger>
                    <TabsTrigger value="billing">{t.billingInfo}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{t.fullName}</Label>
                        <Input id="name" placeholder="Full name" />
                      </div>
                      <div>
                        <Label htmlFor="nationalId">{t.nationalId}</Label>
                        <Input id="nationalId" placeholder="SS12345678901" />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="contact" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">{t.phoneNumber}</Label>
                        <Input id="phone" placeholder="+211 XXX XXX XXX" />
                      </div>
                      <div>
                        <Label htmlFor="secondaryPhone">{t.secondaryPhone}</Label>
                        <Input id="secondaryPhone" placeholder="+211 XXX XXX XXX" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="email">{t.emailAddress}</Label>
                        <Input id="email" type="email" placeholder="customer@email.com" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="address">{t.address}</Label>
                        <Input id="address" placeholder="Street address" />
                      </div>
                      <div>
                        <Label htmlFor="city">{t.city}</Label>
                        <Input id="city" placeholder="City" />
                      </div>
                      <div>
                        <Label htmlFor="state">{t.state}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {t.southSudanStates.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="service" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="planType">{t.planType}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prepaid">{t.prepaid}</SelectItem>
                            <SelectItem value="postpaid">{t.postpaid}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="plan">{t.servicePlan}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {servicePlans.map((plan) => (
                              <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="creditLimit">{t.creditLimit} (SSP)</Label>
                        <Input id="creditLimit" type="number" placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">{t.customerNotes}</Label>
                      <Textarea id="notes" placeholder="Add any notes about the customer..." />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline">{t.cancel}</Button>
                  <Button>{t.save}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.searchCustomers}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="suspended">{t.suspended}</SelectItem>
                <SelectItem value="terminated">{t.terminated}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlanType} onValueChange={setFilterPlanType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.filterByPlan} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="prepaid">{t.prepaid}</SelectItem>
                <SelectItem value="postpaid">{t.postpaid}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Customer Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.customerId}</TableHead>
                  <TableHead>{t.fullName}</TableHead>
                  <TableHead>{t.planType}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.balance}</TableHead>
                  <TableHead>{t.riskLevel}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-mono text-sm">{customer.customerId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.city}, {customer.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.planType === 'prepaid' ? 'default' : 'secondary'}>
                        {customer.planType === 'prepaid' ? t.prepaid : t.postpaid}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>
                      <div className={`font-medium ${customer.balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {customer.balance > 0 ? '+' : ''}{customer.balance} SSP
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(customer.riskLevel)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          {customer.status === 'active' ? t.suspend : t.activate}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCustomerManagement; 