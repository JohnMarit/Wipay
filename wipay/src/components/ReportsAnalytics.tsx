import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Download, Calendar, BarChart3, FileText, Clock, Database, AlertTriangle, CalendarDays } from "lucide-react";
import { PDFReportGenerator } from "@/lib/pdfGenerator";
import { WiFiDataCollector } from "@/lib/dataCollector";
import { useToast } from "@/hooks/use-toast";

interface ReportsAnalyticsProps {
  language: string;
}

const ReportsAnalytics = ({ language }: ReportsAnalyticsProps) => {
  const { toast } = useToast();
  
  // State for custom date range selection
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
    reportType: "custom" as "custom" | "weekly" | "monthly" | "yearly"
  });
  
  // Check if we have real data available
  const dataCollector = new WiFiDataCollector();
  const hasRealData = dataCollector.hasData();
  const dataSummary = hasRealData ? dataCollector.getDataSummary() : null;

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
      jun: "Jun",
      // PDF Report translations
      weeklyReport: "Weekly Report",
      monthlyReport: "Monthly Report",
      yearlyReport: "Yearly Report",
      customReport: "Custom Report",
      generatePDFReports: "Generate PDF Reports",
      downloadWeekly: "Download Weekly",
      downloadMonthly: "Download Monthly",
      downloadYearly: "Download Yearly",
      customDateRange: "Custom Date Range",
      selectDateRange: "Select Date Range",
      startDate: "Start Date",
      endDate: "End Date",
      reportType: "Report Type",
      generateCustomReport: "Generate Custom Report",
      summary: "Executive Summary",
      totalTransactions: "Total Transactions",
      uniqueCustomers: "Unique Customers",
      avgTransactionValue: "Average Transaction Value",
      revenueByService: "Revenue by Service Type",
      transactionDetails: "Recent Transactions",
      period: "Period",
      metric: "Metric",
      value: "Value",
      service: "Service",
      transactions: "Transactions",
      revenue: "Revenue",
      percentage: "Percentage",
      method: "Payment Method",
      amount: "Amount",
      date: "Date",
      customer: "Customer",
      paymentMethod: "Payment Method",
      reportGenerated: "PDF report generated successfully",
      reportError: "Error generating PDF report",
      realDataIndicator: "Using Real Data",
      sampleDataIndicator: "Using Sample Data",
      realDataDesc: "Reports generated from actual WiFi token transactions",
      sampleDataDesc: "Generate some WiFi tokens to see real data in reports",
      dataSource: "Data Source",
      cancel: "Cancel",
      generate: "Generate Report",
      invalidDateRange: "Invalid date range",
      startDateRequired: "Start date is required",
      endDateRequired: "End date is required",
      endDateAfterStart: "End date must be after start date",
      quickReports: "Quick Reports",
      customReports: "Custom Reports"
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
      jun: "يونيو",
      // PDF Report translations
      weeklyReport: "التقرير الأسبوعي",
      monthlyReport: "التقرير الشهري",
      yearlyReport: "التقرير السنوي",
      customReport: "تقرير مخصص",
      generatePDFReports: "إنشاء تقارير PDF",
      downloadWeekly: "تحميل أسبوعي",
      downloadMonthly: "تحميل شهري",
      downloadYearly: "تحميل سنوي",
      customDateRange: "نطاق التاريخ المخصص",
      selectDateRange: "اختر نطاق التاريخ",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      reportType: "نوع التقرير",
      generateCustomReport: "إنشاء تقرير مخصص",
      summary: "الملخص التنفيذي",
      totalTransactions: "إجمالي المعاملات",
      uniqueCustomers: "العملاء الفريدون",
      avgTransactionValue: "متوسط قيمة المعاملة",
      revenueByService: "الإيرادات حسب نوع الخدمة",
      transactionDetails: "تفاصيل المعاملات الحديثة",
      period: "الفترة",
      metric: "المقياس",
      value: "القيمة",
      service: "الخدمة",
      transactions: "المعاملات",
      revenue: "الإيرادات",
      percentage: "النسبة المئوية",
      method: "طريقة الدفع",
      amount: "المبلغ",
      date: "التاريخ",
      customer: "العميل",
      paymentMethod: "طريقة الدفع",
      reportGenerated: "تم إنشاء تقرير PDF بنجاح",
      reportError: "خطأ في إنشاء تقرير PDF",
      realDataIndicator: "استخدام البيانات الحقيقية",
      sampleDataIndicator: "استخدام البيانات النموذجية",
      realDataDesc: "التقارير المُنشأة من معاملات رموز الواي فاي الفعلية",
      sampleDataDesc: "قم بإنشاء بعض رموز الواي فاي لرؤية البيانات الحقيقية في التقارير",
      dataSource: "مصدر البيانات",
      cancel: "إلغاء",
      generate: "إنشاء التقرير",
      invalidDateRange: "نطاق تاريخ غير صالح",
      startDateRequired: "تاريخ البداية مطلوب",
      endDateRequired: "تاريخ النهاية مطلوب",
      endDateAfterStart: "يجب أن يكون تاريخ النهاية بعد تاريخ البداية",
      quickReports: "التقارير السريعة",
      customReports: "التقارير المخصصة"
    }
  };

  const t = translations[language as keyof typeof translations];

  // Function to generate and download PDF reports
  const generatePDFReport = async (period: 'week' | 'month' | 'year' | 'custom', startDate?: string, endDate?: string) => {
    try {
      let reportData;
      let filename;
      
      // Only use real data from WiFiDataCollector
      const dataCollector = new WiFiDataCollector();
      
      if (!dataCollector.hasData()) {
        toast({
          title: "No Data Available",
          description: "Please generate some WiFi tokens first to create reports.",
          variant: "destructive"
        });
        return;
      }
      
      if (period === 'custom' && startDate && endDate) {
        // For custom reports, create custom data with the date range
        reportData = dataCollector.collectDataForDateRange(startDate, endDate);
        if (!reportData || reportData.transactions === 0) {
          toast({
            title: "No Data Found",
            description: "No WiFi tokens found for the selected date range.",
            variant: "destructive"
          });
          return;
        }
        filename = `wipay-custom-report-${startDate}-to-${endDate}.pdf`;
      } else {
        // For predefined periods, use real data from WiFi token system
        reportData = dataCollector.collectDataForPeriod(period);
        if (!reportData || reportData.transactions === 0) {
          toast({
            title: "No Data Found", 
            description: `No WiFi tokens found for the selected ${period} period.`,
            variant: "destructive"
          });
          return;
        }
        
        switch (period) {
          case 'week':
            filename = `wipay-weekly-report-${new Date().toISOString().slice(0, 10)}.pdf`;
            break;
          case 'month':
            filename = `wipay-monthly-report-${new Date().toISOString().slice(0, 7)}.pdf`;
            break;
          case 'year':
            filename = `wipay-yearly-report-${new Date().getFullYear()}.pdf`;
            break;
        }
      }
      
      const generator = new PDFReportGenerator(t);
      const pdf = generator.generateSimpleReport(reportData, 'monthly');
      
      pdf.save(filename);
      
      toast({
        title: t.reportGenerated,
        description: `${period === 'custom' ? t.customReport : period === 'week' ? t.weeklyReport : period === 'month' ? t.monthlyReport : t.yearlyReport} downloaded successfully`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: t.reportError,
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Function to handle custom report generation
  const handleCustomReportGeneration = () => {
    // Validate date inputs
    if (!customDateRange.startDate) {
      toast({
        title: t.invalidDateRange,
        description: t.startDateRequired,
        variant: "destructive"
      });
      return;
    }

    if (!customDateRange.endDate) {
      toast({
        title: t.invalidDateRange,
        description: t.endDateRequired,
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(customDateRange.startDate);
    const endDate = new Date(customDateRange.endDate);

    if (endDate <= startDate) {
      toast({
        title: t.invalidDateRange,
        description: t.endDateAfterStart,
        variant: "destructive"
      });
      return;
    }

    // Generate the report
    generatePDFReport('custom', customDateRange.startDate, customDateRange.endDate);
    setShowCustomReportDialog(false);
    setCustomDateRange({ startDate: "", endDate: "", reportType: "custom" });
  };

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
      <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.description}</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">{t.last30Days}</SelectItem>
              <SelectItem value="90days">{t.last90Days}</SelectItem>
              <SelectItem value="year">{t.thisYear}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Source Indicator */}
      <Card className={hasRealData ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
        <CardContent className="pt-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3">
            {hasRealData ? (
              <Database className="h-5 w-5 text-blue-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${hasRealData ? "text-blue-800" : "text-orange-800"}`}>
                {hasRealData ? t.realDataIndicator : t.sampleDataIndicator}
              </h4>
              <p className={`text-sm ${hasRealData ? "text-blue-700" : "text-orange-700"}`}>
                {hasRealData ? t.realDataDesc : t.sampleDataDesc}
              </p>
              {hasRealData && dataSummary && (
                <div className="text-xs text-blue-600 mt-1">
                  {dataSummary.totalTokens} tokens • {dataSummary.totalRevenue.toLocaleString()} SSP total revenue
                </div>
              )}
            </div>
            <Badge variant={hasRealData ? "default" : "secondary"} className="flex items-center gap-1 self-start sm:self-center">
              {hasRealData ? (
                <Database className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {t.dataSource}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.generatePDFReports}
          </CardTitle>
          <CardDescription>Select date range and generate comprehensive PDF reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Date Range Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select Custom Date Range:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportStartDate" className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {t.startDate}
                </Label>
                <Input
                  id="reportStartDate"
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => {
                    console.log('Start date changed:', e.target.value);
                    setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }));
                  }}
                  max={customDateRange.endDate || new Date().toISOString().split('T')[0]}
                  className="mt-1 cursor-pointer"
                  placeholder="Select start date"
                />
                <p className="text-xs text-gray-500">Click to select start date</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reportEndDate" className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {t.endDate}
                </Label>
                <Input
                  id="reportEndDate"
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => {
                    console.log('End date changed:', e.target.value);
                    setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }));
                  }}
                  min={customDateRange.startDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1 cursor-pointer"
                  placeholder="Select end date"
                />
                <p className="text-xs text-gray-500">Click to select end date</p>
              </div>
            </div>

            {/* Alternative: Text inputs for manual date entry */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Alternative: Manual Date Entry</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manualStartDate" className="text-xs text-gray-600">Start Date (YYYY-MM-DD)</Label>
                  <Input
                    id="manualStartDate"
                    type="text"
                    placeholder="2024-01-01"
                    value={customDateRange.startDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Basic date format validation
                      if (/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '') {
                        setCustomDateRange(prev => ({ ...prev, startDate: value }));
                      }
                    }}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="manualEndDate" className="text-xs text-gray-600">End Date (YYYY-MM-DD)</Label>
                  <Input
                    id="manualEndDate"
                    type="text"
                    placeholder="2024-12-31"
                    value={customDateRange.endDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Basic date format validation
                      if (/^\d{4}-\d{2}-\d{2}$/.test(value) || value === '') {
                        setCustomDateRange(prev => ({ ...prev, endDate: value }));
                      }
                    }}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Current Values Display */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800 mb-2">Current Selection:</h5>
              <div className="text-sm text-blue-700">
                <p><strong>Start Date:</strong> {customDateRange.startDate || 'Not selected'}</p>
                <p><strong>End Date:</strong> {customDateRange.endDate || 'Not selected'}</p>
              </div>
            </div>

            {/* Date Range Preview */}
            {customDateRange.startDate && customDateRange.endDate && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-1">✅ Selected Report Period</h4>
                    <p className="text-sm text-green-700">
                      {new Date(customDateRange.startDate).toLocaleDateString()} - {new Date(customDateRange.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm text-green-600">
                    <strong>{Math.ceil((new Date(customDateRange.endDate).getTime() - new Date(customDateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}</strong> days
                  </div>
                </div>
              </div>
            )}

            {/* Generate Report Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleCustomReportGeneration}
                disabled={!customDateRange.startDate || !customDateRange.endDate}
                className="px-8 py-2 text-base"
                size="lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                {t.generate}
              </Button>
            </div>
          </div>

          {/* Quick Date Range Shortcuts */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Date Ranges:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setCustomDateRange({
                    startDate: lastWeek.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    reportType: "custom"
                  });
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  setCustomDateRange({
                    startDate: lastMonth.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    reportType: "custom"
                  });
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  setCustomDateRange({
                    startDate: firstDayOfMonth.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    reportType: "custom"
                  });
                }}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const today = new Date();
                  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
                  setCustomDateRange({
                    startDate: firstDayOfYear.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                    reportType: "custom"
                  });
                }}
              >
                This Year
              </Button>
            </div>
          </div>

          {/* Month Range Selection */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Monthly Reports:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: "January 2025", start: "2025-01-01", end: "2025-01-31" },
                { label: "December 2024", start: "2024-12-01", end: "2024-12-31" },
                { label: "November 2024", start: "2024-11-01", end: "2024-11-30" },
                { label: "October 2024", start: "2024-10-01", end: "2024-10-31" },
                { label: "September 2024", start: "2024-09-01", end: "2024-09-30" },
                { label: "August 2024", start: "2024-08-01", end: "2024-08-31" }
              ].map((month) => (
                <Button
                  key={month.label}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setCustomDateRange({
                      startDate: month.start,
                      endDate: month.end,
                      reportType: "custom"
                    });
                  }}
                >
                  {month.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {kpi.isIncrease ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={kpi.isIncrease ? "text-green-600" : "text-red-600"}>
                  {kpi.change}
                </span>
                <span className="hidden sm:inline">{t.previousPeriod}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
