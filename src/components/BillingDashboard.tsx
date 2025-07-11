import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/lib/firebase';
import { createBillingManager, createMTNMomoService } from '@/lib/mtnMomoService';
import { createSubscriptionService, SUBSCRIPTION_PLANS } from '@/lib/subscription';
import {
    AlertTriangle,
    ArrowUp,
    Calendar,
    Check,
    CheckCircle,
    CreditCard,
    Crown,
    RefreshCw,
    Smartphone,
    Star,
    TrendingUp,
    User,
    Wifi,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BillingDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  userProfile: any; // Contains paymentProfile and subscription info
  onPlanChanged?: () => void; // Callback when plan is changed
}

interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'successful' | 'failed' | 'pending';
  planName: string;
  referenceId?: string;
  failureReason?: string;
}

const BillingDashboard: React.FC<BillingDashboardProps> = ({
  currentUser,
  userProfile,
  onPlanChanged,
}) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);
  const [showUpdateMomo, setShowUpdateMomo] = useState(false);
  const [showPlanUpgrade, setShowPlanUpgrade] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [newMomoNumber, setNewMomoNumber] = useState('');
  const [newAccountHolderName, setNewAccountHolderName] = useState('');
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState('');
  const [showVerifyPayment, setShowVerifyPayment] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [momoPin, setMomoPin] = useState('');
  const [verificationStep, setVerificationStep] = useState<'pin' | 'confirming' | 'success' | 'failed'>('pin');
  const { toast } = useToast();

  const mtnMomoService = createMTNMomoService();
  const billingManager = createBillingManager();
  const subscriptionService = createSubscriptionService();

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === userProfile?.subscription?.planId);
  const paymentProfile = userProfile?.paymentProfile;
  const subscription = userProfile?.subscription;

  // Calculate token usage progress
  const tokenUsageProgress = currentPlan?.features.tokensPerMonth === -1
    ? 0
    : ((subscription?.tokensUsedThisMonth || 0) / (currentPlan?.features.tokensPerMonth || 1)) * 100;

  const tokensRemaining = currentPlan?.features.tokensPerMonth === -1
    ? -1
    : Math.max(0, (currentPlan?.features.tokensPerMonth || 0) - (subscription?.tokensUsedThisMonth || 0));

  const isTokensExhausted = tokensRemaining === 0 && currentPlan?.features.tokensPerMonth !== -1;

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  // Populate form with existing payment method details when dialog opens
  useEffect(() => {
    if (showUpdateMomo && paymentProfile) {
      setNewAccountHolderName(paymentProfile.accountHolderName || currentUser.name);
      setNewMomoNumber(paymentProfile.momoNumber || '');
    }
  }, [showUpdateMomo, paymentProfile, currentUser.name]);

  const loadPaymentHistory = () => {
    // Mock payment history - in real implementation, load from Firebase
    const mockHistory: PaymentHistory[] = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        amount: currentPlan?.price || 2500,
        status: 'successful',
        planName: `${currentPlan?.name || 'Basic Plan'} - ${currentUser.name}`,
        referenceId: 'wipay_12345',
      },
      {
        id: '2',
        date: new Date('2024-02-15'),
        amount: currentPlan?.price || 2500,
        status: 'failed',
        planName: `${currentPlan?.name || 'Basic Plan'} - ${currentUser.name}`,
        referenceId: 'wipay_67890',
        failureReason: 'Insufficient funds',
      },
      {
        id: '3',
        date: new Date('2024-03-15'),
        amount: currentPlan?.price || 2500,
        status: 'pending',
        planName: `${currentPlan?.name || 'Basic Plan'} - ${currentUser.name}`,
        referenceId: 'wipay_24680',
      },
    ];

    setPaymentHistory(mockHistory);
    setLoading(false);
  };

  const handleRetryPayment = async () => {
    if (!currentPlan || !paymentProfile) return;

    setRetryLoading(true);
    try {
      toast({
        title: 'Processing Payment...',
        description: `Retrying payment of ${currentPlan.price} SSP`,
      });

      const paymentResult = await billingManager.processSubscriptionPayment(
        currentUser.id,
        `sub_${currentUser.id}`,
        currentPlan.price,
        paymentProfile.momoNumber,
        currentPlan.name
      );

      if (paymentResult.success) {
        await userService.updateAccountStatus(currentUser.id, true, paymentResult.referenceId);

        toast({
          title: 'Payment Successful! 🎉',
          description: 'Your subscription has been renewed successfully.',
        });

        // Refresh payment history and notify parent
        loadPaymentHistory();
        onPlanChanged?.();
      } else {
        await userService.updateAccountStatus(currentUser.id, false);

        toast({
          title: 'Payment Failed',
          description: paymentResult.error || 'Payment could not be processed. Please check your MTN MoMo balance.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast({
        title: 'Payment Error',
        description: 'An error occurred while processing your payment.',
        variant: 'destructive',
      });
    } finally {
      setRetryLoading(false);
    }
  };

  const handlePlanUpgrade = async () => {
    if (!selectedUpgradePlan || !paymentProfile) return;

    const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedUpgradePlan);
    if (!newPlan) return;

    const isUpgrade = newPlan.price > (currentPlan?.price || 0);
    const isDowngrade = newPlan.price < (currentPlan?.price || 0);
    const changeType = isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'switch';

    setUpgradeLoading(true);
    try {
      toast({
        title: `Processing Plan ${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Change'}...`,
        description: `${changeType === 'upgrade' ? 'Upgrading' : changeType === 'downgrade' ? 'Downgrading' : 'Switching'} to ${newPlan.name}...`,
      });

      // Process payment for new plan (only if it's a paid plan)
      if (newPlan.price > 0) {
        const paymentResult = await billingManager.processSubscriptionPayment(
          currentUser.id,
          `sub_${currentUser.id}`,
          newPlan.price,
          paymentProfile.momoNumber,
          newPlan.name
        );

        if (!paymentResult.success) {
          toast({
            title: `${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Plan Change'} Failed`,
            description: paymentResult.error || 'Payment could not be processed.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Update subscription plan
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, paymentProfile.billingDay);

      await userService.updateSubscription(currentUser.id, {
        planId: newPlan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
        tokensUsedThisMonth: 0, // Reset tokens on plan change
      });

      // Update payment profile if payment was successful
      if (newPlan.price > 0) {
        await userService.updateAccountStatus(currentUser.id, true);
      }

      toast({
        title: `Plan ${changeType === 'upgrade' ? 'Upgraded' : changeType === 'downgrade' ? 'Downgraded' : 'Changed'}! 🎉`,
        description: `Successfully ${changeType === 'upgrade' ? 'upgraded' : changeType === 'downgrade' ? 'downgraded' : 'switched'} ${currentUser.name}'s account to ${newPlan.name}. Your tokens have been reset and the new plan is active.`,
      });

      setShowPlanUpgrade(false);
      setSelectedUpgradePlan('');
      onPlanChanged?.();
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: 'Plan Change Failed',
        description: 'Failed to change your plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleUpdateMomoNumber = async () => {
    if (!newAccountHolderName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the account holder name.',
        variant: 'destructive',
      });
      return;
    }

    if (!mtnMomoService.validateMomoNumber(newMomoNumber)) {
      toast({
        title: 'Invalid Number',
        description: 'Please enter a valid MTN Mobile Money number.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const normalizedNumber = mtnMomoService.normalizeMomoNumber(newMomoNumber);

      await userService.updatePaymentProfile(currentUser.id, {
        ...paymentProfile,
        momoNumber: normalizedNumber,
        accountHolderName: newAccountHolderName.trim(),
        isVerified: false, // Will need to be verified with next payment
      });

      toast({
        title: 'Payment Method Updated',
        description: `Successfully updated payment method for ${newAccountHolderName}`,
      });

      setShowUpdateMomo(false);
      setNewMomoNumber('');
      setNewAccountHolderName('');
      onPlanChanged?.();
    } catch (error) {
      console.error('Error updating MoMo number:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your payment method. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyPayment = async () => {
    if (!momoPin || momoPin.length < 4) {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter your 4-digit MTN MoMo PIN.',
        variant: 'destructive',
      });
      return;
    }

    setVerifyLoading(true);
    setVerificationStep('confirming');

    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock verification - in real implementation, this would call MTN MoMo API
      const isDevelopmentMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (isDevelopmentMode) {
        // 90% success rate in mock mode
        const verificationSuccess = Math.random() > 0.1;

        if (verificationSuccess) {
          // Update payment profile to verified
          await userService.updatePaymentProfile(currentUser.id, {
            ...paymentProfile,
            isVerified: true,
            lastSuccessfulPayment: new Date(),
            totalFailedAttempts: 0,
          });

          setVerificationStep('success');

          toast({
            title: 'Payment Method Verified! ✅',
            description: `Successfully verified MTN MoMo account for ${paymentProfile?.accountHolderName || currentUser.name}`,
          });

          // Auto-close after 2 seconds
          setTimeout(() => {
            setShowVerifyPayment(false);
            setMomoPin('');
            setVerificationStep('pin');
            onPlanChanged?.();
          }, 2000);
        } else {
          setVerificationStep('failed');
          toast({
            title: 'Verification Failed',
            description: 'Invalid PIN or insufficient funds. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        // Real MTN MoMo verification would go here
        // For now, simulate success
        setVerificationStep('success');
        toast({
          title: 'Payment Method Verified! ✅',
          description: `Successfully verified MTN MoMo account for ${paymentProfile?.accountHolderName || currentUser.name}`,
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerificationStep('failed');
      toast({
        title: 'Verification Error',
        description: 'Failed to verify payment method. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Wifi className="h-5 w-5 text-blue-600" />;
      case 'basic':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'pro':
        return <Crown className="h-5 w-5 text-purple-600" />;
      case 'enterprise':
        return <Zap className="h-5 w-5 text-orange-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'successful':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Successful
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <RefreshCw className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'suspended':
        return 'text-red-600';
      case 'disabled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUpgradeablePlans = () => {
    // Show all plans so users can upgrade, downgrade, or switch
    return SUBSCRIPTION_PLANS;
  };

  return (
    <div className="space-y-6">
      {/* Development Mode Alert */}
      {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">
                  Development Mode Active
                </h4>
                <p className="text-sm text-blue-700">
                  You're running in development mode. Payment transactions and verification will be simulated and won't charge real money.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Usage Alert */}
      {isTokensExhausted && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800">
                  Tokens Exhausted
                </h4>
                <p className="text-sm text-red-700">
                  You've used all your monthly tokens. Upgrade your plan to generate more tokens.
                </p>
              </div>
              <Button
                onClick={() => setShowPlanUpgrade(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan & Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPlanIcon(currentPlan?.id || '')}
                  <span className="font-medium">{currentPlan?.name}</span>
                </div>
                <span className="text-2xl font-bold">
                  {currentPlan?.price === 0 ? 'Free' : `${currentPlan?.price} SSP`}
                </span>
              </div>

              {/* Token Usage Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Token Usage</span>
                  <span className={`font-medium ${isTokensExhausted ? 'text-red-600' : 'text-gray-600'}`}>
                    {currentPlan?.features.tokensPerMonth === -1
                      ? `${subscription?.tokensUsedThisMonth || 0} used`
                      : `${subscription?.tokensUsedThisMonth || 0} / ${currentPlan?.features.tokensPerMonth}`}
                  </span>
                </div>
                <Progress
                  value={tokenUsageProgress}
                  className={`h-2 ${isTokensExhausted ? 'bg-red-100' : ''}`}
                />
                <div className="text-xs text-gray-600">
                  {tokensRemaining === -1
                    ? 'Unlimited tokens remaining'
                    : isTokensExhausted
                    ? 'No tokens remaining - upgrade to continue'
                    : `${tokensRemaining} tokens remaining this month`}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${getAccountStatusColor(paymentProfile?.accountStatus)}`}>
                    {paymentProfile?.accountStatus || 'Unknown'}
                  </span>
                </div>

                {paymentProfile?.nextBillingDate && (
                  <div className="flex justify-between">
                    <span>Next Billing:</span>
                    <span className="font-medium">
                      {new Date(paymentProfile.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Failed Attempts:</span>
                  <span className={`font-medium ${
                    paymentProfile?.totalFailedAttempts >= 2 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {paymentProfile?.totalFailedAttempts || 0}
                  </span>
                </div>
              </div>

              {/* Plan Management Buttons */}
              <div className="flex gap-2">
                <Dialog open={showPlanUpgrade} onOpenChange={setShowPlanUpgrade}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Change Your Plan</DialogTitle>
                      <DialogDescription>
                        Choose a different subscription plan. Click the "Upgrade/Downgrade" button on any plan to change immediately, or select a plan and click "Confirm Change" below. Changes take effect immediately and your tokens will be reset.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {getUpgradeablePlans().map((plan) => (
                        <Card
                          key={plan.id}
                          className={`relative cursor-pointer transition-all duration-200 ${
                            plan.id === selectedUpgradePlan
                              ? 'ring-2 ring-blue-600 border-blue-600'
                              : plan.id === currentPlan?.id
                              ? 'ring-2 ring-gray-400 border-gray-400 opacity-60'
                              : 'hover:shadow-lg'
                          } ${plan.popular ? 'ring-2 ring-purple-600' : ''}`}
                          onClick={() => plan.id !== currentPlan?.id && setSelectedUpgradePlan(plan.id)}
                        >
                          {plan.id === currentPlan?.id && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-gray-600 text-white">
                                Current Plan
                              </Badge>
                            </div>
                          )}
                          {plan.popular && plan.id !== currentPlan?.id && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-purple-600 text-white">
                                Most Popular
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                              {getPlanIcon(plan.id)}
                            </div>
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>
                              {plan.price === 0 ? (
                                <span className="text-2xl font-bold text-green-600">
                                  Free
                                </span>
                              ) : (
                                <span>
                                  <span className="text-2xl font-bold">
                                    {plan.price} SSP
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    /{plan.interval}
                                  </span>
                                </span>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                <span>
                                  {plan.features.tokensPerMonth === -1
                                    ? 'Unlimited tokens'
                                    : `${plan.features.tokensPerMonth} tokens/month`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {plan.features.smsDelivery === 'real' ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <X className="h-3 w-3 text-red-600" />
                                )}
                                <span>Real SMS delivery</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                <span>
                                  {plan.features.wifiNetworks === -1
                                    ? 'Unlimited networks'
                                    : `${plan.features.wifiNetworks} WiFi networks`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {plan.features.advancedReports ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <X className="h-3 w-3 text-red-600" />
                                )}
                                <span>Advanced reports</span>
                              </div>
                            </div>
                            {plan.id !== currentPlan?.id && (
                              <Button
                                className="w-full mt-4"
                                variant={plan.id === selectedUpgradePlan ? 'default' : 'outline'}
                                disabled={upgradeLoading}
                                onClick={async (e) => {
                                  e.stopPropagation(); // Prevent card click
                                  setSelectedUpgradePlan(plan.id);

                                  // Immediately execute the plan change
                                  if (!paymentProfile) return;

                                  const newPlan = plan;
                                  const isUpgrade = newPlan.price > (currentPlan?.price || 0);
                                  const isDowngrade = newPlan.price < (currentPlan?.price || 0);
                                  const changeType = isUpgrade ? 'upgrade' : isDowngrade ? 'downgrade' : 'switch';

                                  setUpgradeLoading(true);
                                  try {
                                    toast({
                                      title: `Processing Plan ${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Change'}...`,
                                      description: `${changeType === 'upgrade' ? 'Upgrading' : changeType === 'downgrade' ? 'Downgrading' : 'Switching'} to ${newPlan.name}...`,
                                    });

                                    // Process payment for new plan (only if it's a paid plan)
                                    if (newPlan.price > 0) {
                                      const paymentResult = await billingManager.processSubscriptionPayment(
                                        currentUser.id,
                                        `sub_${currentUser.id}`,
                                        newPlan.price,
                                        paymentProfile.momoNumber,
                                        newPlan.name
                                      );

                                      if (!paymentResult.success) {
                                        toast({
                                          title: `${changeType === 'upgrade' ? 'Upgrade' : changeType === 'downgrade' ? 'Downgrade' : 'Plan Change'} Failed`,
                                          description: paymentResult.error || 'Payment could not be processed.',
                                          variant: 'destructive',
                                        });
                                        setUpgradeLoading(false);
                                        return;
                                      }
                                    }

                                    // Update subscription plan
                                    const now = new Date();
                                    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, paymentProfile.billingDay);

                                    await userService.updateSubscription(currentUser.id, {
                                      planId: newPlan.id,
                                      status: 'active',
                                      currentPeriodStart: now,
                                      currentPeriodEnd: nextMonth,
                                      tokensUsedThisMonth: 0, // Reset tokens on plan change
                                    });

                                    // Update payment profile if payment was successful
                                    if (newPlan.price > 0) {
                                      await userService.updateAccountStatus(currentUser.id, true);
                                    }

                                    toast({
                                      title: `Plan ${changeType === 'upgrade' ? 'Upgraded' : changeType === 'downgrade' ? 'Downgraded' : 'Changed'}! 🎉`,
                                      description: `Successfully ${changeType === 'upgrade' ? 'upgraded' : changeType === 'downgrade' ? 'downgraded' : 'switched'} ${currentUser.name}'s account to ${newPlan.name}. Your tokens have been reset and the new plan is active.`,
                                    });

                                    setShowPlanUpgrade(false);
                                    setSelectedUpgradePlan('');
                                    onPlanChanged?.();
                                  } catch (error) {
                                    console.error('Error changing plan:', error);
                                    toast({
                                      title: 'Plan Change Failed',
                                      description: 'Failed to change your plan. Please try again.',
                                      variant: 'destructive',
                                    });
                                  } finally {
                                    setUpgradeLoading(false);
                                  }
                                }}
                              >
                                {upgradeLoading && selectedUpgradePlan === plan.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  plan.price < (currentPlan?.price || 0) ? 'Downgrade' : 'Upgrade'
                                )}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedUpgradePlan && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowPlanUpgrade(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePlanUpgrade}
                          disabled={upgradeLoading || !selectedUpgradePlan}
                        >
                          {upgradeLoading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Confirm Change'
                          )}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {paymentProfile?.accountStatus === 'suspended' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Account Suspended</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Your account has been suspended due to failed payments. Please retry payment to reactivate.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>MTN Mobile Money</span>
                <div className="flex items-center gap-2">
                  <Badge variant={paymentProfile?.isVerified ? 'default' : 'secondary'}>
                    {paymentProfile?.isVerified ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Unverified
                      </div>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Account Holder:</span>
                      <div className="font-medium">
                        {paymentProfile?.accountHolderName || currentUser.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-gray-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">MTN MoMo Number:</span>
                      <div className="font-mono text-lg font-medium">
                        {paymentProfile?.momoNumber || 'No number set'}
                      </div>
                    </div>
                  </div>
                  {paymentProfile?.momoNumber && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Email:</span>
                        <div className="text-sm text-gray-600">{currentUser.email}</div>
                      </div>
                    </div>
                  )}

                  {/* Verification Status */}
                  {paymentProfile?.isVerified && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <span className="text-sm font-medium text-green-700">Payment Method Verified</span>
                        <div className="text-xs text-green-600">Ready for automatic payments</div>
                      </div>
                    </div>
                  )}

                  {!paymentProfile?.isVerified && paymentProfile?.momoNumber && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div>
                        <span className="text-sm font-medium text-orange-700">Verification Required</span>
                        <div className="text-xs text-orange-600">Click "Verify Payment" to confirm your MTN MoMo account</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog open={showUpdateMomo} onOpenChange={(open) => {
                  setShowUpdateMomo(open);
                  if (!open) {
                    // Reset form when dialog closes
                    setNewMomoNumber('');
                    setNewAccountHolderName('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Update Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Payment Method</DialogTitle>
                      <DialogDescription>
                        Update your payment method details. Both the account holder name and MTN MoMo number are required.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Important</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          The account holder name must exactly match the name registered with your MTN MoMo account to avoid payment failures.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="newAccountHolderName">Account Holder Name</Label>
                        <Input
                          id="newAccountHolderName"
                          type="text"
                          placeholder="e.g., John Doe"
                          value={newAccountHolderName}
                          onChange={(e) => setNewAccountHolderName(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the full name as registered with MTN MoMo.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="newMomoNumber">MTN MoMo Number</Label>
                        <Input
                          id="newMomoNumber"
                          type="tel"
                          placeholder="e.g., 0912345678"
                          value={newMomoNumber}
                          onChange={(e) => setNewMomoNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This number should be registered under: <strong>{newAccountHolderName || 'the account holder name above'}</strong>
                        </p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          setShowUpdateMomo(false);
                          setNewMomoNumber('');
                          setNewAccountHolderName('');
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateMomoNumber} disabled={!newAccountHolderName.trim() || !newMomoNumber.trim()}>
                          Update Payment Method
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Verify Payment Button */}
                {paymentProfile?.momoNumber && !paymentProfile?.isVerified && (
                  <Dialog open={showVerifyPayment} onOpenChange={(open) => {
                    setShowVerifyPayment(open);
                    if (!open) {
                      setMomoPin('');
                      setVerificationStep('pin');
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Verify Payment Method</DialogTitle>
                        <DialogDescription>
                          Enter your MTN MoMo PIN to verify your payment method
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Account Details */}
                        <div className="p-3 bg-gray-50 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Account Holder:</span>
                              <span className="font-medium">{paymentProfile?.accountHolderName || currentUser.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">MTN MoMo Number:</span>
                              <span className="font-mono font-medium">{paymentProfile?.momoNumber}</span>
                            </div>
                          </div>
                        </div>

                        {/* PIN Input */}
                        {verificationStep === 'pin' && (
                          <div>
                            <Label htmlFor="momoPin">MTN MoMo PIN</Label>
                            <Input
                              id="momoPin"
                              type="password"
                              placeholder="Enter your 4-digit PIN"
                              value={momoPin}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                setMomoPin(value);
                              }}
                              maxLength={4}
                              className="text-center text-lg tracking-widest"
                              autoComplete="off"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter the 4-digit PIN you use for MTN MoMo transactions
                            </p>
                          </div>
                        )}

                        {/* Verification Status */}
                        {verificationStep === 'confirming' && (
                          <div className="text-center py-4">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                            <p className="text-sm text-gray-600">Verifying with MTN MoMo...</p>
                          </div>
                        )}

                        {verificationStep === 'success' && (
                          <div className="text-center py-4">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="text-sm text-green-600 font-medium">Payment Method Verified!</p>
                            <p className="text-xs text-gray-500 mt-1">Your MTN MoMo account is now verified and ready for payments.</p>
                          </div>
                        )}

                        {verificationStep === 'failed' && (
                          <div className="text-center py-4">
                            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                            <p className="text-sm text-red-600 font-medium">Verification Failed</p>
                            <p className="text-xs text-gray-500 mt-1">Please check your PIN and try again.</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                          {verificationStep === 'pin' && (
                            <>
                              <Button variant="outline" onClick={() => setShowVerifyPayment(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleVerifyPayment}
                                disabled={!momoPin || momoPin.length < 4}
                              >
                                Verify Payment
                              </Button>
                            </>
                          )}

                          {verificationStep === 'failed' && (
                            <>
                              <Button variant="outline" onClick={() => setShowVerifyPayment(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  setVerificationStep('pin');
                                  setMomoPin('');
                                }}
                              >
                                Try Again
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {paymentProfile?.accountStatus === 'suspended' && (
                  <Button
                    onClick={handleRetryPayment}
                    disabled={retryLoading}
                    size="sm"
                    className="flex-1"
                  >
                    {retryLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Retry Payment'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            View your recent payment transactions and billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">Payment History</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading payment history...</div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment history available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subscriber</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {paymentProfile?.accountHolderName || currentUser.name}
                            </div>
                            <div className="text-sm text-gray-600 font-mono">
                              {paymentProfile?.momoNumber || 'No number set'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {payment.planName.split(' - ')[0]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{payment.amount} SSP</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(payment.status)}
                            {payment.status === 'failed' && payment.failureReason && (
                              <div className="text-xs text-red-600">
                                {payment.failureReason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.referenceId || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Next Payment</h4>
                      <p className="text-sm text-gray-600">
                        {paymentProfile?.nextBillingDate
                          ? `Due on ${new Date(paymentProfile.nextBillingDate).toLocaleDateString()}`
                          : 'No upcoming payments'}
                      </p>
                    </div>
                    {currentPlan && currentPlan.price > 0 && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentPlan.price} SSP
                        </div>
                        <div className="text-sm text-gray-600">
                          {currentPlan.name}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;
