
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Download, Calendar, BarChart3 } from "lucide-react";

interface ReportsAnalyticsProps {
  language: string;
}

const ReportsAnalytics = ({ language }: ReportsAnalyticsProps) => {
  const translations = {
    en: {
      title: "Reports & Analytics",
      description: "Business insights and performance metrics",
      revenueReport: "Revenue Report",
      customerAnalytics: "Customer Analytics",
      servicePerformance: "Service Performance",
      paymentAnalysis: "Payment Analysis",
      monthlyRevenue: "Monthly Revenue",
      customerGrowth: "Customer Growth",
      serviceDistribution: "Service Distribution",
      paymentMethods: "Payment Methods",
      totalRevenue: "Total Revenue",
      newCustomers: "New Customers",
      churnRate: "Churn Rate",
      avgRevenue: "Avg. Revenue per Customer",
      downloadReport: "Download Report",
      last30Days: "Last 30 Days",
      last90Days: "Last 90 Days",
      thisYear: "This Year",
      previousPeriod: "vs Previous Period",
      increase: "Increase",
      decrease: "Decrease",
      basicPlan: "Basic Plan",
      standardPlan: "Standard Plan",
      premiumPlan: "Premium Plan",
      businessPlan: "Business Plan",
      mobileMoney: "Mobile Money",
      bankTransfer: "Bank Transfer",
      cash: "Cash",
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun"
    },
    ar: {
      title: "التقارير والتحليلات",
      description: "رؤى الأعمال ومقاييس الأداء",
      revenueReport: "تقرير الإيرادات",
      customerAnalytics: "تحليلات العملاء",
      servicePerformance: "أداء الخدمات",
      paymentAnalysis: "تحليل المدفوعات",
      monthlyRevenue: "الإيرادات الشهرية",
      customerGrowth: "نمو العملاء",
      serviceDistribution: "توزيع الخدمات",
      paymentMethods: "طرق الدفع",
      totalRevenue: "إجمالي الإيرادات",
      newCustomers: "عملاء جدد",
      churnRate: "معدل الإلغاء",
      avgRevenue: "متوسط الإيرادات لكل عميل",
      downloadReport: "تحميل التقرير",
      last30Days: "آخر 30 يوماً",
      last90Days: "آخر 90 يوماً",
      thisYear: "هذا العام",
      previousPeriod: "مقارنة بالفترة السابقة",
      increase: "زيادة",
      decrease: "انخفاض",
      basicPlan: "الخطة الأساسية",
      standardPlan: "الخطة المعيارية",
      premiumPlan: "الخطة المميزة",
      businessPlan: "خطة الأعمال",
      mobileMoney: "الأموال المحمولة",
      bankTransfer: "الحوالة البنكية",
      cash: "نقد",
      jan: "يناير",
      feb: "فبراير",
      mar: "مارس",
      apr: "أبريل",
      may: "مايو",
      jun: "يونيو"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Sample data for charts
  const monthlyRevenueData = [
    { month: t.jan, revenue: 42000, customers: 180 },
    { month: t.feb, revenue: 45000, customers: 195 },
    { month: t.mar, revenue: 48000, customers: 210 },
    { month: t.apr, revenue: 44000, customers: 205 },
    { month: t.may, revenue: 52000, customers: 225 },
    { month: t.jun, revenue: 55000, customers: 247 },
  ];

  const serviceDistributionData = [
    { name: t.basicPlan, value: 45, color: "#8884d8" },
    { name: t.standardPlan, value: 89, color: "#82ca9d" },
    { name: t.premiumPlan, value: 67, color: "#ffc658" },
    { name: t.businessPlan, value: 23, color: "#ff7300" },
  ];

  const paymentMethodsData = [
    { name: t.mobileMoney, value: 65, color: "#8884d8" },
    { name: t.bankTransfer, value: 25, color: "#82ca9d" },
    { name: t.cash, value: 10, color: "#ffc658" },
  ];

  const kpiData = [
    {
      title: t.totalRevenue,
      value: "287,400 SSP",
      change: "+12.5%",
      isIncrease: true,
      icon: DollarSign
    },
    {
      title: t.newCustomers,
      value: "47",
      change: "+8.2%",
      isIncrease: true,
      icon: Users
    },
    {
      title: t.churnRate,
      value: "3.2%",
      change: "-1.1%",
      isIncrease: false,
      icon: TrendingDown
    },
    {
      title: t.avgRevenue,
      value: "1,163 SSP",
      change: "+5.7%",
      isIncrease: true,
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">{t.last30Days}</SelectItem>
              <SelectItem value="90days">{t.last90Days}</SelectItem>
              <SelectItem value="year">{t.thisYear}</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t.downloadReport}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {kpi.isIncrease ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={kpi.isIncrease ? "text-green-600" : "text-red-600"}>
                  {kpi.change}
                </span>
                <span>{t.previousPeriod}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t.monthlyRevenue}
            </CardTitle>
            <CardDescription>Revenue trends over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} SSP`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t.customerGrowth}
            </CardTitle>
            <CardDescription>Customer acquisition over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Customers']} />
                <Line type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.serviceDistribution}</CardTitle>
            <CardDescription>Active customers by service plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>{t.paymentMethods}</CardTitle>
            <CardDescription>Payment method distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
