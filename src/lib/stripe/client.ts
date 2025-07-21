// Stripe Client-Side Utilities
// This file contains client-side Stripe functionality

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from './config';

// Singleton Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
};

export interface PaymentFormData {
  amount: number;
  currency?: string;
  description: string;
  customerEmail: string;
  customerName: string;
  invoiceId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: any;
  error?: string;
}

export class StripeClient {
  private stripe: Stripe | null = null;

  async initialize(): Promise<void> {
    this.stripe = await getStripe();
    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  }

  async createPaymentIntent(
    data: PaymentFormData
  ): Promise<{ clientSecret: string }> {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || STRIPE_CONFIG.defaultCurrency,
        description: data.description,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        invoiceId: data.invoiceId,
        metadata: data.metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
  }

  async confirmPayment(
    clientSecret: string,
    paymentElement: any,
    returnUrl?: string
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: paymentElement,
        clientSecret,
        confirmParams: {
          return_url:
            returnUrl || `${window.location.origin}/dashboard/payments/success`
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        paymentIntent
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  async createSetupIntent(
    customerId: string
  ): Promise<{ clientSecret: string }> {
    const response = await fetch('/api/stripe/create-setup-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create setup intent');
    }

    return response.json();
  }

  async getPaymentMethods(customerId: string): Promise<any[]> {
    const response = await fetch(
      `/api/stripe/payment-methods?customerId=${customerId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get payment methods');
    }

    const data = await response.json();
    return data.paymentMethods || [];
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    const response = await fetch('/api/stripe/detach-payment-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentMethodId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove payment method');
    }
  }

  // Invoice-specific methods
  async createInvoice(invoiceData: {
    customerId: string;
    description: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitAmount: number;
    }>;
    dueDate?: string;
    metadata?: Record<string, string>;
  }): Promise<{ invoiceId: string; invoiceUrl: string }> {
    const response = await fetch('/api/stripe/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...invoiceData,
        lineItems: invoiceData.lineItems.map((item) => ({
          ...item,
          unitAmount: Math.round(item.unitAmount * 100) // Convert to cents
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    return response.json();
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    const response = await fetch('/api/stripe/send-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invoiceId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send invoice');
    }
  }

  async getInvoice(invoiceId: string): Promise<any> {
    const response = await fetch(`/api/stripe/invoice?invoiceId=${invoiceId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get invoice');
    }

    return response.json();
  }

  // Customer management
  async createCustomer(customerData: {
    email: string;
    name: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    metadata?: Record<string, string>;
  }): Promise<{ customerId: string }> {
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create customer');
    }

    return response.json();
  }

  async updateCustomer(
    customerId: string,
    customerData: Partial<{
      email: string;
      name: string;
      phone: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      metadata: Record<string, string>;
    }>
  ): Promise<void> {
    const response = await fetch('/api/stripe/update-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId,
        ...customerData
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update customer');
    }
  }

  // Utility methods
  formatAmount(amountCents: number, currency = 'usd'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amountCents / 100);
  }

  validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999.99; // Stripe's limits
  }

  calculateFees(
    amountCents: number,
    paymentMethod: 'card' | 'ach' = 'card'
  ): number {
    if (paymentMethod === 'card') {
      return (
        Math.round(amountCents * STRIPE_CONFIG.fees.cardRate) +
        STRIPE_CONFIG.fees.cardFixed
      );
    } else {
      const achFee =
        Math.round(amountCents * STRIPE_CONFIG.fees.achRate) +
        STRIPE_CONFIG.fees.achFixed;
      return Math.min(achFee, STRIPE_CONFIG.fees.achCap);
    }
  }
}

// Export singleton instance
export const stripeClient = new StripeClient();
