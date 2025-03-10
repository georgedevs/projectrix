'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetSubscriptionStatusQuery, useCancelSubscriptionMutation } from '@/app/api/paymentApiSlice';
import { toast } from 'sonner';
import { usePayment } from '@/app/hooks/usePayment';
import PaymentModal from './PaymentModal';

interface SubscriptionManagementProps {
  className?: string;
}

export default function SubscriptionManagement({ className }: SubscriptionManagementProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Get subscription data
  const { data: subscriptionData, isLoading } = useGetSubscriptionStatusQuery();
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  
  // Get payment information
  const { formattedPrice, paymentProvider } = usePayment();
  
  // Calculate days remaining in subscription
  const daysRemaining = subscriptionData?.endDate 
    ? Math.max(0, Math.ceil((new Date(subscriptionData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription().unwrap();
      setConfirmCancelOpen(false);
      toast.success('Your subscription has been cancelled. You will still have access until the end of your billing period.');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again or contact support.');
    }
  };
  
  // Determine subscription status display
  const getStatusDisplay = () => {
    const isPro = subscriptionData?.plan === 'pro';
    
    if (!isPro) {
      return {
        badge: <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Free Plan</Badge>,
        icon: null
      };
    }
    
    switch (subscriptionData?.status) {
      case 'active':
        return {
          badge: <Badge variant="outline" className="bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20">Active</Badge>,
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        };
      case 'cancelled':
        return {
          badge: <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">Cancelled</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-orange-500" />
        };
      case 'expired':
        return {
          badge: <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">Expired</Badge>,
          icon: <XCircle className="h-4 w-4 text-red-500" />
        };
      default:
        return {
          badge: <Badge variant="outline">Unknown</Badge>,
          icon: null
        };
    }
  };
  
  const { badge, icon } = getStatusDisplay();

  return (
    <div className={className}>
      <Card className="relative bg-white dark:bg-black border border-black/20 dark:border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Subscription {icon}
              </CardTitle>
              <CardDescription>
                Manage your subscription plan
              </CardDescription>
            </div>
            <div>
              {badge}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subscriptionData?.plan === 'pro' ? (
            <>
              {/* Pro Plan Details */}
              <div className="space-y-4">
                {/* Current Price */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Plan:</span>
                  <span className="font-semibold">Pro Plan</span>
                </div>
                
                {/* Monthly Cost */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Cost:</span>
                  <span className="font-semibold">{formattedPrice}</span>
                </div>
                
                {/* Payment Method */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Method:</span>
                  <span className="font-semibold capitalize">{paymentProvider}</span>
                </div>
                
                {/* Next Billing Date */}
                {subscriptionData?.status === 'active' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Billing Date:</span>
                    <span className="font-semibold">{formatDate(subscriptionData.renewalDate)}</span>
                  </div>
                )}
                
                {/* Current Period End */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Period Ends:</span>
                  <span className="font-semibold">{formatDate(subscriptionData.endDate)}</span>
                </div>
                
                {/* Days Remaining */}
                {subscriptionData?.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Days Remaining:</span>
                      <span className="font-semibold">{daysRemaining} days</span>
                    </div>
                    <Progress value={(daysRemaining / 30) * 100} className="h-2" />
                  </div>
                )}
                
                {/* Status alerts */}
                {subscriptionData?.status === 'cancelled' && (
                  <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      Your subscription has been cancelled and will end on {formatDate(subscriptionData.endDate)}. 
                      You can resubscribe anytime to continue enjoying Pro benefits.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Free Plan Details */}
              <div className="space-y-4">
                <div className="py-4 text-center">
                  <h3 className="text-lg font-semibold mb-2">You&apos;re on the Free Plan</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Upgrade to Pro to unlock unlimited access to all features
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Project Ideas</span>
                      <span className="text-sm font-medium">3 per month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Published Projects</span>
                      <span className="text-sm font-medium">1 maximum</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Collaborations</span>
                      <span className="text-sm font-medium">1 maximum</span>
                    </div>
                  </div>
                </div>
                
                <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    Upgrade to Pro for {formattedPrice}/month to remove all limits and unlock advanced features.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter>
          {subscriptionData?.plan === 'pro' && subscriptionData?.status === 'active' ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setConfirmCancelOpen(true)}
            >
              Cancel Subscription
            </Button>
          ) : subscriptionData?.plan === 'pro' && subscriptionData?.status === 'cancelled' ? (
            <Button 
              className="w-full gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)] transform transition-all active:translate-y-1 active:shadow-none"
              onClick={() => setUpgradeModalOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Resubscribe
            </Button>
          ) : (
            <Button 
              className="w-full gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)] transform transition-all active:translate-y-1 active:shadow-none"
              onClick={() => setUpgradeModalOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog for Cancellation */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-black border border-black/20 dark:border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your Pro subscription?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                You will lose access to Pro features at the end of your current billing period on {formatDate(subscriptionData?.endDate)}.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmCancelOpen(false)}
              disabled={isCancelling}
              className="gap-2 bg-white dark:bg-black text-black dark:text-white border-2 border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              variant="destructive"
              className="gap-2"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Modal for Upgrade/Resubscribe */}
      <PaymentModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
      />
    </div>
  );
}