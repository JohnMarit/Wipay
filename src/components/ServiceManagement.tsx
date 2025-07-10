import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Wifi, Router, Activity, Settings, Zap, Signal } from 'lucide-react';

interface ServiceManagementProps {
  language: string;
}

const ServiceManagement = ({ language }: ServiceManagementProps) => {
  const translations = {
    en: {
      title: 'Service Management',
      description: 'Monitor and manage internet services and equipment',
      servicePlans: 'Service Plans',
      equipmentTracking: 'Equipment Tracking',
      bandwidthMonitoring: 'Bandwidth Monitoring',
      planName: 'Plan Name',
      speed: 'Speed',
      price: 'Price (SSP)',
      activeUsers: 'Active Users',
      actions: 'Actions',
      equipment: 'Equipment',
      serialNumber: 'Serial Number',
      customer: 'Customer',
      status: 'Status',
      lastSeen: 'Last Seen',
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance',
      online: 'Online',
      offline: 'Offline',
      basicPlan: 'Basic Plan',
      standardPlan: 'Standard Plan',
      premiumPlan: 'Premium Plan',
      businessPlan: 'Business Plan',
      router: 'Router',
      modem: 'Modem',
      accessPoint: 'Access Point',
      usage: 'Usage',
      limit: 'Limit',
      currentUsage: 'Current Usage',
    },
    ar: {
      title: 'إدارة الخدمات',
      description: 'مراقبة وإدارة خدمات الإنترنت والمعدات',
      servicePlans: 'خطط الخدمة',
      equipmentTracking: 'تتبع المعدات',
      bandwidthMonitoring: 'مراقبة النطاق الترددي',
      planName: 'اسم الخطة',
      speed: 'السرعة',
      price: 'السعر (جنيه جنوب سوداني)',
      activeUsers: 'المستخدمون النشطون',
      actions: 'الإجراءات',
      equipment: 'المعدات',
      serialNumber: 'الرقم التسلسلي',
      customer: 'العميل',
      status: 'الحالة',
      lastSeen: 'آخر ظهور',
      active: 'نشط',
      inactive: 'غير نشط',
      maintenance: 'صيانة',
      online: 'متصل',
      offline: 'غير متصل',
      basicPlan: 'الخطة الأساسية',
      standardPlan: 'الخطة المعيارية',
      premiumPlan: 'الخطة المميزة',
      businessPlan: 'خطة الأعمال',
      router: 'موجه',
      modem: 'مودم',
      accessPoint: 'نقطة وصول',
      usage: 'الاستخدام',
      limit: 'الحد الأقصى',
      currentUsage: 'الاستخدام الحالي',
    },
  };

  const t = translations[language as keyof typeof translations];

  // Sample service plans data
  const servicePlans = [
    {
      id: 1,
      name: t.basicPlan,
      speed: '5 Mbps',
      price: 100,
      activeUsers: 45,
      description: 'Perfect for basic browsing and email',
    },
    {
      id: 2,
      name: t.standardPlan,
      speed: '10 Mbps',
      price: 150,
      activeUsers: 89,
      description: 'Great for streaming and small business',
    },
    {
      id: 3,
      name: t.premiumPlan,
      speed: '20 Mbps',
      price: 250,
      activeUsers: 67,
      description: 'High-speed for gaming and video calls',
    },
    {
      id: 4,
      name: t.businessPlan,
      speed: '50 Mbps',
      price: 500,
      activeUsers: 23,
      description: 'Enterprise-grade connectivity',
    },
  ];

  // Sample equipment data
  const equipment = [
    {
      id: 1,
      type: t.router,
      model: 'TP-Link Archer C7',
      serialNumber: 'TPL-AC7-001',
      customer: 'Ahmed Hassan Mohamed',
      status: 'online',
      lastSeen: '2 minutes ago',
      location: 'Juba, Central Equatoria',
    },
    {
      id: 2,
      type: t.modem,
      model: 'Huawei HG8245H',
      serialNumber: 'HW-HG8245-002',
      customer: 'Mary John Deng',
      status: 'online',
      lastSeen: '5 minutes ago',
      location: 'Wau, Western Bahr el Ghazal',
    },
    {
      id: 3,
      type: t.accessPoint,
      model: 'Ubiquiti UniFi AP',
      serialNumber: 'UB-UAP-003',
      customer: 'Peter Garang Mabior',
      status: 'offline',
      lastSeen: '2 hours ago',
      location: 'Malakal, Upper Nile',
    },
  ];

  // Sample bandwidth usage data
  const bandwidthUsage = [
    {
      customer: 'Ahmed Hassan Mohamed',
      plan: 'Standard Plan',
      used: 75,
      limit: 100,
      percentage: 75,
    },
    {
      customer: 'Mary John Deng',
      plan: 'Basic Plan',
      used: 45,
      limit: 50,
      percentage: 90,
    },
    {
      customer: 'Peter Garang Mabior',
      plan: 'Premium Plan',
      used: 120,
      limit: 200,
      percentage: 60,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      online: { label: t.online, variant: 'default' as const },
      offline: { label: t.offline, variant: 'destructive' as const },
      maintenance: { label: t.maintenance, variant: 'secondary' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Service Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            {t.servicePlans}
          </CardTitle>
          <CardDescription>
            Available internet service plans and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {servicePlans.map(plan => (
              <Card
                key={plan.id}
                className="border-2 hover:border-blue-200 transition-colors"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{plan.speed}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t.price}</span>
                      <span className="font-semibold">{plan.price} SSP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {t.activeUsers}
                      </span>
                      <Badge variant="outline">{plan.activeUsers}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                    <Button className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            {t.equipmentTracking}
          </CardTitle>
          <CardDescription>
            Monitor and manage customer equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.equipment}</TableHead>
                  <TableHead>{t.serialNumber}</TableHead>
                  <TableHead>{t.customer}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.lastSeen}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-gray-500">
                          {item.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.serialNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.customer}</div>
                        <div className="text-sm text-gray-500">
                          {item.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm">{item.lastSeen}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Activity className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
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

      {/* Bandwidth Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t.bandwidthMonitoring}
          </CardTitle>
          <CardDescription>
            Real-time bandwidth usage monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {bandwidthUsage.map((usage, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{usage.customer}</h4>
                    <p className="text-sm text-gray-500">{usage.plan}</p>
                  </div>
                  <Badge
                    variant={usage.percentage > 80 ? 'destructive' : 'default'}
                  >
                    {usage.percentage}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {t.currentUsage}: {usage.used} GB
                    </span>
                    <span>
                      {t.limit}: {usage.limit} GB
                    </span>
                  </div>
                  <Progress value={usage.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceManagement;
