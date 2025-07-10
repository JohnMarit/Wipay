
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomerManagementProps {
  language: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  plan: string;
  status: string;
  joinDate: string;
}

const CustomerManagement = ({ language }: CustomerManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    planType: "",
    status: "active"
  });

  const translations = {
    en: {
      title: "Customer Management",
      description: "Manage customer accounts and service plans",
      addCustomer: "Add New Customer",
      searchCustomers: "Search customers...",
      customerName: "Customer Name",
      phoneNumber: "Phone Number",
      emailAddress: "Email Address",
      address: "Address",
      servicePlan: "Service Plan",
      status: "Status",
      actions: "Actions",
      active: "Active",
      suspended: "Suspended",
      terminated: "Terminated",
      basicPlan: "Basic Plan (5 Mbps)",
      standardPlan: "Standard Plan (10 Mbps)",
      premiumPlan: "Premium Plan (20 Mbps)",
      businessPlan: "Business Plan (50 Mbps)",
      save: "Save Customer",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      customerAdded: "Customer added successfully",
      customerUpdated: "Customer updated successfully"
    },
    ar: {
      title: "إدارة العملاء",
      description: "إدارة حسابات العملاء وخطط الخدمة",
      addCustomer: "إضافة عميل جديد",
      searchCustomers: "البحث عن العملاء...",
      customerName: "اسم العميل",
      phoneNumber: "رقم الهاتف",
      emailAddress: "عنوان البريد الإلكتروني",
      address: "العنوان",
      servicePlan: "خطة الخدمة",
      status: "الحالة",
      actions: "الإجراءات",
      active: "نشط",
      suspended: "معلق",
      terminated: "منتهي",
      basicPlan: "الخطة الأساسية (5 ميجابت)",
      standardPlan: "الخطة المعيارية (10 ميجابت)",
      premiumPlan: "الخطة المميزة (20 ميجابت)",
      businessPlan: "خطة الأعمال (50 ميجابت)",
      save: "حفظ العميل",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      customerAdded: "تم إضافة العميل بنجاح",
      customerUpdated: "تم تحديث العميل بنجاح"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Sample customer data
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: "Ahmed Hassan Mohamed",
      phone: "+211 912 345 678",
      email: "ahmed.hassan@email.com",
      address: "Juba, Central Equatoria",
      plan: "Standard Plan (10 Mbps)",
      status: "active",
      joinDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Mary John Deng",
      phone: "+211 923 456 789",
      email: "mary.john@email.com",
      address: "Wau, Western Bahr el Ghazal",
      plan: "Basic Plan (5 Mbps)",
      status: "active",
      joinDate: "2024-02-20"
    },
    {
      id: 3,
      name: "Peter Garang Mabior",
      phone: "+211 934 567 890",
      email: "peter.garang@email.com",
      address: "Malakal, Upper Nile",
      plan: "Premium Plan (20 Mbps)",
      status: "suspended",
      joinDate: "2024-01-10"
    }
  ]);

  const getPlanName = (planType: string) => {
    const planMap: { [key: string]: string } = {
      basic: t.basicPlan,
      standard: t.standardPlan,
      premium: t.premiumPlan,
      business: t.businessPlan
    };
    return planMap[planType] || planType;
  };

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.phone) {
      const customer: Customer = {
        id: customers.length + 1,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        plan: getPlanName(newCustomer.planType),
        status: newCustomer.status,
        joinDate: new Date().toISOString().split('T')[0]
      };
      setCustomers([...customers, customer]);
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
        planType: "",
        status: "active"
      });
      toast({
        title: t.customerAdded,
        description: `${customer.name} has been added to the system.`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t.active, variant: "default" as const },
      suspended: { label: t.suspended, variant: "destructive" as const },
      terminated: { label: t.terminated, variant: "secondary" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.addCustomer}</DialogTitle>
                  <DialogDescription>
                    {t.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t.customerName}</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t.phoneNumber}</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="+211 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t.emailAddress}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">{t.address}</Label>
                    <Input
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan">{t.servicePlan}</Label>
                    <Select value={newCustomer.planType} onValueChange={(value) => setNewCustomer({...newCustomer, planType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">{t.basicPlan}</SelectItem>
                        <SelectItem value="standard">{t.standardPlan}</SelectItem>
                        <SelectItem value="premium">{t.premiumPlan}</SelectItem>
                        <SelectItem value="business">{t.businessPlan}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">{t.cancel}</Button>
                    <Button onClick={handleAddCustomer}>{t.save}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.customerName}</TableHead>
                  <TableHead>{t.phoneNumber}</TableHead>
                  <TableHead>{t.servicePlan}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>{customer.plan}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
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

export default CustomerManagement;
