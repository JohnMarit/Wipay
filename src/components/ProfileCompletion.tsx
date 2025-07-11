import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/lib/firebase';
import {
  createBillingManager,
  createMTNMomoService,
} from '@/lib/mtnMomoService';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription';
import {
  Check,
  CreditCard,
  Smartphone,
  Star,
  User,
  Wifi,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface ProfileCompletionProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  onComplete: () => void;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  currentUser,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();

  const mtnMomoService = createMTNMomoService();
  const billingManager = createBillingManager();

  const selectedPlanDetails = SUBSCRIPTION_PLANS.find(
    p => p.id === selectedPlan
  );

  const validateMomoNumber = (): boolean => {
    if (!momoNumber.trim()) {
      toast({
        title: 'MTN MoMo Number Required',
        description: 'Please enter your MTN Mobile Money number',
        variant: 'destructive',
      });
      return false;
    }

    if (!mtnMomoService.validateMomoNumber(momoNumber)) {
      toast({
        title: 'Invalid MTN MoMo Number',
        description:
          'Please enter a valid MTN Mobile Money number (e.g., 0912345678)',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleStepNext = () => {
    if (step === 1) {
      if (validateMomoNumber()) {
        setStep(2);
      }
    }
  };

  const handleCompleteProfile = async () => {
    if (!validateMomoNumber() || !selectedPlan) return;

    setLoading(true);
    setPaymentLoading(true);

    try {
      // Step 1: Complete user profile
      await userService.completeUserProfile(currentUser.id, {
        momoNumber: mtnMomoService.normalizeMomoNumber(momoNumber),
        selectedPlan: selectedPlan,
      });

      // Step 2: Process first payment if not free plan
      if (selectedPlan !== 'free' && selectedPlanDetails) {
        toast({
          title: 'Processing Payment...',
          description: `Charging ${selectedPlanDetails.price} SSP from your MTN MoMo account`,
        });

        const paymentResult = await billingManager.processSubscriptionPayment(
          currentUser.id,
          `sub_${currentUser.id}`,
          selectedPlanDetails.price,
          momoNumber,
          selectedPlanDetails.name
        );

        if (paymentResult.success) {
          // Update account status as paid
          await userService.updateAccountStatus(
            currentUser.id,
            true,
            paymentResult.referenceId
          );

          toast({
            title: 'Payment Successful! 🎉',
            description: `Your ${selectedPlanDetails.name} subscription is now active. Welcome to Wipay!`,
          });
        } else {
          // Payment failed, but profile is still created
          await userService.updateAccountStatus(currentUser.id, false);

          toast({
            title: 'Payment Failed',
            description:
              paymentResult.error ||
              'Payment could not be processed. You can retry from your profile settings.',
            variant: 'destructive',
          });
        }
      } else {
        // Free plan - no payment needed
        toast({
          title: 'Profile Completed! 🎉',
          description:
            'Welcome to Wipay! You can start generating WiFi tokens right away.',
        });
      }

      // Complete the process
      onComplete();
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Profile Completion Failed',
        description:
          'Please try again or contact support if the issue persists.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPaymentLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Wifi className="h-6 w-6 text-blue-600" />;
      case 'basic':
        return <Star className="h-6 w-6 text-green-600" />;
      case 'pro':
        return <CreditCard className="h-6 w-6 text-purple-600" />;
      case 'enterprise':
        return <User className="h-6 w-6 text-orange-600" />;
      default:
        return <Wifi className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Just a few steps to get started with Wipay
                </CardDescription>
              </div>
              <div className="text-sm text-gray-600">Step {step} of 2</div>
            </div>
            <Progress value={(step / 2) * 100} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Step 1: MTN MoMo Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>MTN Mobile Money Details</CardTitle>
                  <CardDescription>
                    Enter your MTN MoMo number for subscription payments
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="momoNumber">MTN Mobile Money Number</Label>
                <Input
                  id="momoNumber"
                  type="tel"
                  placeholder="e.g., 0912345678"
                  value={momoNumber}
                  onChange={e => setMomoNumber(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-gray-600">
                  Enter your MTN MoMo number (starts with 091, 092, 095, 096,
                  097, or 098)
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleStepNext} disabled={!momoNumber.trim()}>
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Plan Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>
                    Select the plan that best fits your needs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <Card
                    key={plan.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      plan.id === selectedPlan
                        ? 'ring-2 ring-blue-600 border-blue-600'
                        : 'hover:shadow-lg'
                    } ${plan.popular ? 'ring-2 ring-purple-600' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
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
                    <CardContent className="space-y-2 pt-0">
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
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment Summary */}
              {selectedPlanDetails && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Payment Summary</h4>
                        <p className="text-sm text-gray-600">
                          {selectedPlanDetails.price === 0
                            ? 'No payment required for free plan'
                            : `${selectedPlanDetails.price} SSP will be charged from ${momoNumber}`}
                        </p>
                      </div>
                      {selectedPlanDetails.price > 0 && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedPlanDetails.price} SSP
                          </div>
                          <div className="text-sm text-gray-600">
                            Monthly billing
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleCompleteProfile}
                  disabled={loading || !selectedPlan}
                  className="min-w-32"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedPlanDetails?.price === 0
                        ? 'Setting up...'
                        : 'Processing Payment...'}
                    </>
                  ) : (
                    <>
                      {selectedPlanDetails?.price === 0
                        ? 'Complete Setup'
                        : 'Pay & Complete'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletion;
