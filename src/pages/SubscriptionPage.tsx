import SubscriptionManagement from '@/components/SubscriptionManagement';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { userService } from '@/lib/firebase';
import { createMockSubscription, UserSubscription } from '@/lib/subscription';
import { ArrowLeft, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ currentUser }) => {
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserSubscription = async () => {
      try {
        const userProfile = await userService.getUserProfile(currentUser.id);

        if (userProfile?.subscription) {
          // Convert Firebase subscription to UserSubscription
          const subscription: UserSubscription = {
            id: `sub_${currentUser.id}`,
            userId: currentUser.id,
            planId: userProfile.subscription.planId,
            status: userProfile.subscription.status,
            currentPeriodStart: userProfile.subscription.currentPeriodStart,
            currentPeriodEnd: userProfile.subscription.currentPeriodEnd,
            tokensUsedThisMonth: userProfile.subscription.tokensUsedThisMonth,
            stripeSubscriptionId: userProfile.subscription.stripeSubscriptionId,
            stripeCustomerId: userProfile.subscription.stripeCustomerId,
            createdAt: userProfile.createdAt,
            updatedAt: new Date(),
          };
          setUserSubscription(subscription);
        } else {
          // Create default free subscription if none exists
          const defaultSubscription = createMockSubscription(
            currentUser.id,
            'free'
          );
          setUserSubscription(defaultSubscription);

          // Save default subscription to Firebase
          await userService.updateSubscription(currentUser.id, {
            planId: defaultSubscription.planId,
            status: defaultSubscription.status,
            currentPeriodStart: defaultSubscription.currentPeriodStart,
            currentPeriodEnd: defaultSubscription.currentPeriodEnd,
            tokensUsedThisMonth: defaultSubscription.tokensUsedThisMonth,
          });
        }
      } catch (error) {
        console.error('Error loading user subscription:', error);
        // Fallback to free subscription
        const fallbackSubscription = createMockSubscription(
          currentUser.id,
          'free'
        );
        setUserSubscription(fallbackSubscription);
      } finally {
        setLoading(false);
      }
    };

    loadUserSubscription();
  }, [currentUser.id]);

  const handleSubscriptionChange = async (
    updatedSubscription: UserSubscription
  ) => {
    try {
      // Update Firebase
      await userService.updateSubscription(currentUser.id, {
        planId: updatedSubscription.planId,
        status: updatedSubscription.status,
        currentPeriodStart: updatedSubscription.currentPeriodStart,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        tokensUsedThisMonth: updatedSubscription.tokensUsedThisMonth,
        stripeSubscriptionId: updatedSubscription.stripeSubscriptionId,
        stripeCustomerId: updatedSubscription.stripeCustomerId,
      });

      // Update local state
      setUserSubscription(updatedSubscription);
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-lg font-medium">
                Loading subscription...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium text-red-600">
                Failed to load subscription
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Please refresh the page or contact support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>
                      Manage your Wipay subscription and billing
                    </CardDescription>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Subscription Management */}
        <SubscriptionManagement
          currentUser={currentUser}
          userSubscription={userSubscription}
          onSubscriptionChange={handleSubscriptionChange}
        />
      </div>
    </div>
  );
};

export default SubscriptionPage;
