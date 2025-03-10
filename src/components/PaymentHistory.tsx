import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  Calendar, 
  AlertTriangle, 
} from 'lucide-react';
import { useGetPaymentHistoryQuery } from '@/app/api/paymentApiSlice';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentHistoryProps {
  className?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className }) => {
  const { data, isLoading, error } = useGetPaymentHistoryQuery();
  
  // Format currency based on the currency code
  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Payment History
          </CardTitle>
          <CardDescription>Your recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Payment History
          </CardTitle>
          <CardDescription>Your recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-muted-foreground mb-2">
              Unable to load payment history. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" /> Payment History
        </CardTitle>
        <CardDescription>Your recent payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {data && data.payments && data.payments.length > 0 ? (
          <div className="space-y-4">
            {data.payments.map((payment, index) => (
              <div
                key={payment._id || index}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(payment.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={payment.status === 'successful' 
                      ? 'bg-green-500/10 text-green-500 dark:text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
                    }
                  >
                    {payment.status === 'successful' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {payment.status === 'successful' ? 'Successful' : 'Failed'}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="capitalize"
                  >
                    {payment.provider}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-1">No payment history yet</p>
            <p className="text-xs text-muted-foreground">
              Your payment transactions will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;