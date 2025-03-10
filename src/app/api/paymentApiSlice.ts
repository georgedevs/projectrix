import { apiSlice } from './apiSlice';

export interface PricingResponse {
  success: boolean;
  pricing: {
    currency: 'USD' | 'NGN';
    amount: number;
    symbol: string;
  };
}

export interface PaymentSessionResponse {
  success: boolean;
  session?: {
    subscriptionId: string;
    clientSecret: string;
  };
  payment?: {
    paymentLink: string;
    transactionRef: string;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  status: 'active' | 'cancelled' | 'expired' | 'pending' | 'none';
  plan: 'free' | 'pro';
  endDate?: string;
  renewalDate?: string;
}

export const paymentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get pricing based on location
    getPricing: builder.query<PricingResponse, string>({
      query: (countryCode) => ({
        url: `/pricing?countryCode=${countryCode}`,
        method: 'GET',
      }),
    }),
    
    // Create payment session
    createPaymentSession: builder.mutation<
      PaymentSessionResponse, 
      { paymentMethod: 'stripe' | 'flutterwave'; phoneNumber?: string }
    >({
      query: (data) => ({
        url: '/create-payment',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Verify Flutterwave payment
    verifyPayment: builder.mutation<VerifyPaymentResponse, string>({
      query: (transactionId) => ({
        url: '/verify-payment',
        method: 'POST',
        body: { transactionId },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Get subscription status
    getSubscriptionStatus: builder.query<SubscriptionStatusResponse, void>({
      query: () => ({
        url: '/subscription',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    
    // Cancel subscription
    cancelSubscription: builder.mutation<VerifyPaymentResponse, void>({
      query: () => ({
        url: '/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetPricingQuery,
  useCreatePaymentSessionMutation,
  useVerifyPaymentMutation,
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
} = paymentApiSlice;