// src/app/hooks/usePayment.ts
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { 
  useGetPricingQuery, 
  useCreatePaymentSessionMutation,
  useVerifyPaymentMutation,
  useGetSubscriptionStatusQuery
} from '../api/paymentApiSlice';
import { getCountryCode, formatCurrency } from '../utils/locationService';


export function usePayment(forceCountry?: string) {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const [countryCode, setCountryCode] = useState<string>(forceCountry || 'US');
  const [loadingCountry, setLoadingCountry] = useState(!forceCountry);
  
  // Get the pricing based on location
  const { data: pricingData, isLoading: pricingLoading } = useGetPricingQuery(countryCode, {
    skip: !countryCode || countryCode === 'unknown'
  });
  
  // Get the current subscription status
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetSubscriptionStatusQuery(undefined, {
    skip: !user // Skip if not logged in
  });
  
  // Payment mutation hooks
  const [createPaymentSession, { isLoading: creatingPayment }] = useCreatePaymentSessionMutation();
  const [verifyPayment, { isLoading: verifyingPayment }] = useVerifyPaymentMutation();
  
  // Initialize country detection - only if not forced
  useEffect(() => {
    const detectCountry = async () => {
      if (forceCountry) {
        console.log('Using forced country:', forceCountry);
        setCountryCode(forceCountry);
        setLoadingCountry(false);
        return;
      }
      
      try {
        setLoadingCountry(true);
        const detected = await getCountryCode();
        console.log('Detected country code:', detected);
        setCountryCode(detected);
      } catch (error) {
        console.error('Error detecting country:', error);
        setCountryCode('US'); // Default to US
      } finally {
        setLoadingCountry(false);
      }
    };
    
    detectCountry();
  }, [forceCountry]);
  
  // Current pricing information
  const pricing = pricingData?.pricing;
  
  // Loading state
  const isLoading = pricingLoading || loadingCountry || creatingPayment || verifyingPayment || subscriptionLoading;
  
  // Format price for display
  const formattedPrice = pricing 
    ? formatCurrency(pricing.amount, pricing.currency)
    : countryCode === 'NG' ? '₦5,000' : '$5';
  
  // Determine payment provider based on country
  const paymentProvider = countryCode === 'NG' ? 'flutterwave' : 'stripe';
  
  // Handle Stripe payment
  const handleStripePayment = async () => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return;
    }
    
    try {
      // Show loading indicator
      toast.loading('Preparing checkout...');
      
      // Create payment session
      const result = await createPaymentSession({
        paymentMethod: 'stripe'
      }).unwrap();
      
      if (!result.session || !result.session.url) {
        throw new Error('Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout directly using the URL
      window.location.href = result.session.url;
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.dismiss(); // Dismiss the loading toast
      toast.error('Payment initialization failed. Please try again.');
    }
  };
  
  // Handle Flutterwave payment
  const handleFlutterwavePayment = async (phoneNumber: string) => {
    if (!user) {
      toast.error('Please log in to upgrade');
      return;
    }
    
    try {
      // Validate phone number for Nigerian users
      if (!phoneNumber) {
        toast.error('Phone number is required for payment');
        return;
      }
      
      // Create payment session
      const result = await createPaymentSession({
        paymentMethod: 'flutterwave',
        phoneNumber
      }).unwrap();
      
      if (!result.payment?.paymentLink) {
        throw new Error('Failed to create payment link');
      }
      
      // Store the transaction reference for later verification
      if (typeof window !== 'undefined') {
        localStorage.setItem('fw_transaction_ref', result.payment.transactionRef);
      }
      
      // Redirect to Flutterwave payment page
      window.location.href = result.payment.paymentLink;
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed. Please try again.');
    }
  };
  
  // Verify a Flutterwave payment
  const verifyFlutterwavePayment = async (transactionId: string) => {
    try {
      await verifyPayment(transactionId).unwrap();
      
      // Clear transaction reference
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fw_transaction_ref');
      }
      
      // Refresh user data to update subscription status
      await refreshUserData();
      
      // Show success message
      toast.success('Payment successful! Your account has been upgraded to Pro.');
      
      // Redirect to profile
      router.push('/profile');
      
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  };
  
  // Process a payment based on the detected location
  const processPayment = async (phoneNumber: string = '') => {
    if (paymentProvider === 'stripe') {
      await handleStripePayment();
    } else {
      await handleFlutterwavePayment(phoneNumber);
    }
  };
  
  return {
    pricing,
    formattedPrice,
    countryCode,
    paymentProvider,
    isLoading,
    processPayment,
    verifyFlutterwavePayment,
    isPro: subscriptionData?.plan === 'pro',
    subscriptionStatus: subscriptionData?.status || 'none'
  };
}