// Stripe Service
// This file contains all Stripe API interactions and business logic

import Stripe from 'stripe';
import {
  STRIPE_CONFIG,
  PAYMENT_STATUS_MAP,
  STRIPE_ERROR_MESSAGES
} from './config';

// Initialize Stripe with secret key (server-side only)
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-06-20',
  typescript: true
});

export interface CreateCustomerParams {
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
}

export interface CreateInvoiceParams {
  customerId: string;
  description: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmountCents: number;
  }>;
  dueDate?: Date;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentParams {
  amountCents: number;
  customerId: string;
  description: string;
  invoiceId?: string;
  metadata?: Record<string, string>;
}

export class StripeService {
  // Customer Management
  static async createCustomer(
    params: CreateCustomerParams
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        address: params.address,
        metadata: {
          ...params.metadata,
          source: 'clientcore',
          created_at: new Date().toISOString()
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer in payment system');
    }
  }

  static async getCustomer(
    customerId: string
  ): Promise<Stripe.Customer | null> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error);
      return null;
    }
  }

  static async updateCustomer(
    customerId: string,
    params: Partial<CreateCustomerParams>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.update(customerId, {
        email: params.email,
        name: params.name,
        phone: params.phone,
        address: params.address,
        metadata: params.metadata
      });

      return customer;
    } catch (error) {
      console.error('Error updating Stripe customer:', error);
      throw new Error('Failed to update customer in payment system');
    }
  }

  // Invoice Management
  static async createInvoice(
    params: CreateInvoiceParams
  ): Promise<Stripe.Invoice> {
    try {
      // Create invoice items first
      for (const item of params.lineItems) {
        await stripe.invoiceItems.create({
          customer: params.customerId,
          description: item.description,
          quantity: item.quantity,
          unit_amount: item.unitAmountCents,
          currency: STRIPE_CONFIG.defaultCurrency
        });
      }

      // Create the invoice
      const invoice = await stripe.invoices.create({
        customer: params.customerId,
        description: params.description,
        collection_method: 'send_invoice',
        days_until_due: STRIPE_CONFIG.invoiceSettings.daysUntilDue,
        due_date: params.dueDate
          ? Math.floor(params.dueDate.getTime() / 1000)
          : undefined,
        metadata: {
          ...params.metadata,
          source: 'clientcore',
          created_at: new Date().toISOString()
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error creating Stripe invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  static async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.finalizeInvoice(invoiceId);
      return invoice;
    } catch (error) {
      console.error('Error finalizing Stripe invoice:', error);
      throw new Error('Failed to finalize invoice');
    }
  }

  static async sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await stripe.invoices.sendInvoice(invoiceId);
      return invoice;
    } catch (error) {
      console.error('Error sending Stripe invoice:', error);
      throw new Error('Failed to send invoice');
    }
  }

  static async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice;
    } catch (error) {
      console.error('Error retrieving Stripe invoice:', error);
      return null;
    }
  }

  // Payment Processing
  static async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: params.amountCents,
        currency: STRIPE_CONFIG.defaultCurrency,
        customer: params.customerId,
        description: params.description,
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          ...params.metadata,
          invoice_id: params.invoiceId || '',
          source: 'clientcore',
          created_at: new Date().toISOString()
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  static async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId
        }
      );

      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw new Error('Failed to process payment');
    }
  }

  static async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
    }
  }

  // Webhook Processing
  static async processWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_CONFIG.webhookSecret
      );

      return event;
    } catch (error) {
      console.error('Error processing Stripe webhook:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  // Utility Functions
  static calculateFees(
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

  static formatStripeError(error: any): string {
    if (error.type === 'StripeCardError') {
      const code = error.code as keyof typeof STRIPE_ERROR_MESSAGES;
      return STRIPE_ERROR_MESSAGES[code] || STRIPE_ERROR_MESSAGES.generic;
    }

    return STRIPE_ERROR_MESSAGES.generic;
  }

  static mapStripeStatus(stripeStatus: string): string {
    return (
      PAYMENT_STATUS_MAP[stripeStatus as keyof typeof PAYMENT_STATUS_MAP] ||
      'unknown'
    );
  }

  // Test Connection
  static async testConnection(): Promise<boolean> {
    try {
      await stripe.accounts.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }
}

export default StripeService;
