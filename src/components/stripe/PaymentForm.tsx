'use client';

import { useState, useEffect } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { STRIPE_CONFIG } from '@/lib/stripe/config';

const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface PaymentFormProps {
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  invoiceId?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
  metadata?: Record<string, string>;
}

interface CheckoutFormProps extends PaymentFormProps {
  clientSecret: string;
}

function CheckoutForm({
  amount,
  description,
  customerEmail,
  customerName,
  invoiceId,
  onSuccess,
  onError,
  clientSecret
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    // Check if payment was already successful (e.g., after redirect)
    const clientSecretParam = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (clientSecretParam) {
      stripe
        .retrievePaymentIntent(clientSecretParam)
        .then(({ paymentIntent }) => {
          switch (paymentIntent?.status) {
            case 'succeeded':
              setMessage('Payment succeeded!');
              setIsComplete(true);
              onSuccess?.(paymentIntent);
              break;
            case 'processing':
              setMessage('Your payment is processing.');
              break;
            case 'requires_payment_method':
              setMessage('Your payment was not successful, please try again.');
              onError?.('Payment was not successful');
              break;
            default:
              setMessage('Something went wrong.');
              onError?.('Something went wrong');
              break;
          }
        });
    }
  }, [stripe, onSuccess, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/payments/success`,
          receipt_email: customerEmail
        },
        redirect: 'if_required'
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'An error occurred');
          onError?.(error.message || 'An error occurred');
        } else {
          setMessage('An unexpected error occurred.');
          onError?.(error.message || 'An unexpected error occurred');
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        setIsComplete(true);
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setMessage('An unexpected error occurred.');
      onError?.('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (isComplete) {
    return (
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
            <CheckCircle className='h-6 w-6 text-green-600' />
          </div>
          <CardTitle className='text-green-900'>Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='mb-4 text-muted-foreground'>
            Your payment of {formatCurrency(amount)} has been processed
            successfully.
          </p>
          <p className='text-sm text-muted-foreground'>
            A receipt has been sent to {customerEmail}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='h-5 w-5' />
          Complete Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-6 rounded-lg bg-muted p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Amount:</span>
            <span className='font-semibold'>{formatCurrency(amount)}</span>
          </div>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Description:</span>
            <span className='text-sm'>{description}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Customer:</span>
            <span className='text-sm'>{customerName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <PaymentElement
            options={{
              layout: 'tabs'
            }}
          />

          {message && (
            <Alert
              variant={
                message.includes('succeeded') ? 'default' : 'destructive'
              }
            >
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type='submit'
            disabled={isLoading || !stripe || !elements}
            className='w-full'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className='mr-2 h-4 w-4' />
                Pay {formatCurrency(amount)}
              </>
            )}
          </Button>

          <p className='text-center text-xs text-muted-foreground'>
            Your payment information is secure and encrypted.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: Math.round(props.amount * 100), // Convert to cents
            description: props.description,
            customerEmail: props.customerEmail,
            customerName: props.customerName,
            invoiceId: props.invoiceId,
            metadata: props.metadata
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMessage);
        props.onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [props]);

  if (isLoading) {
    return (
      <Card className='mx-auto w-full max-w-md'>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Initializing payment...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='mx-auto w-full max-w-md'>
        <CardContent className='py-8'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className='mx-auto w-full max-w-md'>
        <CardContent className='py-8'>
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              Failed to initialize payment. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '6px'
    }
  };

  const options = {
    clientSecret,
    appearance
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
}
