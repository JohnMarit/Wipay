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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
    createSubscriptionService,
    SUBSCRIPTION_PLANS,
    UserSubscription
} from '@/lib/subscription';
import {
    Calendar,
    Check,
    CreditCard,
    Crown,
    MessageCircle,
    Settings,
    Star,
    TrendingUp,
    Wifi,
    X,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';

interface SubscriptionManagementProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  userSubscription: UserSubscription;
  onSubscriptionChange: (subscription: UserSubscription) => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  currentUser,
  userSubscription,
  onSubscriptionChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const { toast } = useToast();
  const subscriptionService = createSubscriptionService();

  const currentPlan = subscriptionService.getPlan(userSubscription.planId);
  const remainingTokens = subscriptionService.getRemainingTokens(userSubscription);

  const handlePlanUpgrade = async (planId: string) => {
    if (planId === userSubscription.planId) {
      toast({
        title: 'Already Subscribed',
        description: 'You are already on this plan.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const plan = subscriptionService.getPlan(planId);
      if (!plan) throw new Error('Invalid plan');

      if (plan.id === 'free') {
        // Downgrade to free plan
        const updatedSubscription: UserSubscription = {
          ...userSubscription,
          planId: 'free',
          status: 'active',
          tokensUsedThisMonth: 0,
        };
        onSubscriptionChange(updatedSubscription);

        toast({
          title: 'Plan Updated',
          description: 'Successfully downgraded to Free plan.',
        });
      } else {
        // Upgrade to paid plan - create checkout session
        const successUrl = `${window.location.origin}/subscription/success`;
        const cancelUrl = `${window.location.origin}/subscription/cancel`;

        // In a real implementation, this would redirect to Stripe Checkout
        toast({
          title: 'Redirecting to Payment...',
          description: 'You will be redirected to complete your payment.',
        });

        // Mock successful upgrade for demo
        setTimeout(() => {
          const updatedSubscription: UserSubscription = {
            ...userSubscription,
            planId: planId,
            status: 'active',
            tokensUsedThisMonth: 0,
          };
          onSubscriptionChange(updatedSubscription);

          toast({
            title: 'Subscription Updated!',
            description: `Successfully upgraded to ${plan.name}.`,
          });
        }, 2000);
      }

      setShowPlanSelector(false);
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast({
        title: 'Upgrade Failed',
        description: 'Failed to upgrade plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      // In a real implementation, this would open Stripe Customer Portal
      toast({
        title: 'Opening Billing Portal...',
        description: 'You will be redirected to manage your billing.',
      });
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
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
        return <Wifi className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTokensUsageColor = (used: number, total: number) => {
    if (total === -1) return 'bg-green-500'; // Unlimited
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPlanIcon(userSubscription.planId)}
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentPlan?.name}
                  <Badge className={getStatusColor(userSubscription.status)}>
                    {userSubscription.status.charAt(0).toUpperCase() +
                      userSubscription.status.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {currentPlan?.price === 0
                    ? 'Free Plan'
                    : `$${currentPlan?.price}/${currentPlan?.interval}`}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showPlanSelector} onOpenChange={setShowPlanSelector}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Change Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choose Your Plan</DialogTitle>
                    <DialogDescription>
                      Select the plan that best fits your business needs.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`relative cursor-pointer transition-all duration-200 ${
                          plan.id === userSubscription.planId
                            ? 'ring-2 ring-blue-600 border-blue-600'
                            : 'hover:shadow-lg'
                        } ${plan.popular ? 'ring-2 ring-purple-600' : ''}`}
                        onClick={() => handlePlanUpgrade(plan.id)}
                      >
                        {plan.popular && (
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
                                  ${plan.price}
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
                            <div className="flex items-center gap-2">
                              {plan.features.pdfExport ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <X className="h-3 w-3 text-red-600" />
                              )}
                              <span>PDF export</span>
                            </div>
                            {plan.features.customBranding && (
                              <div className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                <span>Custom branding</span>
                              </div>
                            )}
                            {plan.features.apiAccess && (
                              <div className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                <span>API access</span>
                              </div>
                            )}
                            {plan.features.prioritySupport && (
                              <div className="flex items-center gap-2">
                                <Check className="h-3 w-3 text-green-600" />
                                <span>Priority support</span>
                              </div>
                            )}
                          </div>
                          <Button
                            className="w-full mt-4"
                            variant={
                              plan.id === userSubscription.planId
                                ? 'outline'
                                : 'default'
                            }
                            disabled={
                              isLoading || plan.id === userSubscription.planId
                            }
                          >
                            {plan.id === userSubscription.planId
                              ? 'Current Plan'
                              : plan.price === 0
                              ? 'Downgrade'
                              : 'Upgrade'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {userSubscription.planId !== 'free' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageBilling}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Token Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token Usage</span>
                <span className="text-sm text-muted-foreground">
                  {currentPlan?.features.tokensPerMonth === -1
                    ? `${userSubscription.tokensUsedThisMonth} used`
                    : `${userSubscription.tokensUsedThisMonth} / ${currentPlan?.features.tokensPerMonth}`}
                </span>
              </div>
              <Progress
                value={
                  currentPlan?.features.tokensPerMonth === -1
                    ? 0
                    : (userSubscription.tokensUsedThisMonth /
                        currentPlan?.features.tokensPerMonth!) *
                      100
                }
                className="h-2"
              />
              <div className="text-xs text-muted-foreground">
                {remainingTokens === -1
                  ? 'Unlimited tokens remaining'
                  : `${remainingTokens} tokens remaining this month`}
              </div>
            </div>

            {/* Billing Period */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Billing Period</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(userSubscription.currentPeriodStart)} -{' '}
                {formatDate(userSubscription.currentPeriodEnd)}
              </div>
              <div className="text-xs text-muted-foreground">
                {userSubscription.planId === 'free'
                  ? 'Free forever'
                  : `Renews on ${formatDate(userSubscription.currentPeriodEnd)}`}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Quick Actions</span>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setShowPlanSelector(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() =>
                    window.open('mailto:support@wipay.com', '_blank')
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Features</CardTitle>
          <CardDescription>
            Features available with your current subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlan && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Wifi className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {currentPlan.features.tokensPerMonth === -1
                        ? 'Unlimited WiFi Tokens'
                        : `${currentPlan.features.tokensPerMonth} WiFi Tokens/Month`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Generate WiFi access tokens for your customers
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {currentPlan.features.smsDelivery === 'real'
                        ? 'Real SMS Delivery'
                        : 'SMS Simulation'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentPlan.features.smsDelivery === 'real'
                        ? 'Send real SMS to customers'
                        : 'SMS sending simulated for testing'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {currentPlan.features.wifiNetworks === -1
                        ? 'Unlimited Networks'
                        : `${currentPlan.features.wifiNetworks} WiFi Networks`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Manage multiple WiFi networks
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {currentPlan.features.advancedReports
                        ? 'Advanced Reports'
                        : 'Basic Reports'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currentPlan.features.advancedReports
                        ? 'Detailed analytics and insights'
                        : 'Basic reporting features'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;
