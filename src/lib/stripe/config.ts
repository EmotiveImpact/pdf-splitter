// Stripe Configuration
// This file contains all Stripe-related configuration and constants

export const STRIPE_CONFIG = {
  // Stripe API Keys (use environment variables in production)
  publishableKey:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',

  // Webhook configuration
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',

  // Currency settings
  defaultCurrency: 'usd',

  // Payment settings
  paymentMethods: ['card', 'bank_transfer', 'us_bank_account'] as const,

  // Invoice settings
  invoiceSettings: {
    daysUntilDue: 30,
    allowedPaymentMethods: ['card', 'us_bank_account'],
    automaticTax: {
      enabled: false // Set to true when tax calculation is needed
    }
  },

  // Subscription settings (for future use)
  subscriptionSettings: {
    trialPeriodDays: 14,
    gracePeriodDays: 3
  },

  // Fee structure (Stripe's standard rates)
  fees: {
    cardRate: 0.029, // 2.9%
    cardFixed: 30, // $0.30 in cents
    achRate: 0.008, // 0.8%
    achFixed: 5, // $0.05 in cents
    achCap: 500 // $5.00 in cents (max fee)
  }
} as const;

// Stripe product and price IDs (create these in Stripe Dashboard)
export const STRIPE_PRODUCTS = {
  pdfProcessing: {
    productId: 'prod_pdf_processing',
    prices: {
      perDocument: 'price_pdf_per_doc', // e.g., $2.50 per PDF
      monthly: 'price_pdf_monthly', // e.g., $50/month unlimited
      yearly: 'price_pdf_yearly' // e.g., $500/year unlimited
    }
  },
  emailDistribution: {
    productId: 'prod_email_distribution',
    prices: {
      perEmail: 'price_email_per_send', // e.g., $0.10 per email
      monthly: 'price_email_monthly', // e.g., $25/month for 1000 emails
      yearly: 'price_email_yearly' // e.g., $250/year for 12000 emails
    }
  },
  crmAccess: {
    productId: 'prod_crm_access',
    prices: {
      monthly: 'price_crm_monthly', // e.g., $75/month
      yearly: 'price_crm_yearly' // e.g., $750/year
    }
  }
} as const;

// Payment status mappings
export const PAYMENT_STATUS_MAP = {
  // Stripe Payment Intent statuses
  requires_payment_method: 'pending',
  requires_confirmation: 'pending',
  requires_action: 'pending',
  processing: 'processing',
  requires_capture: 'processing',
  canceled: 'cancelled',
  succeeded: 'completed',

  // Stripe Invoice statuses
  draft: 'draft',
  open: 'sent',
  paid: 'paid',
  uncollectible: 'failed',
  void: 'cancelled'
} as const;

// Error messages
export const STRIPE_ERROR_MESSAGES = {
  card_declined:
    'Your card was declined. Please try a different payment method.',
  insufficient_funds: 'Insufficient funds. Please check your account balance.',
  expired_card: 'Your card has expired. Please use a different card.',
  incorrect_cvc: "Your card's security code is incorrect.",
  processing_error:
    'An error occurred while processing your payment. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  generic: 'An unexpected error occurred. Please try again or contact support.'
} as const;

// Webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.finalized',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'charge.dispute.created'
] as const;

export type StripeWebhookEvent = (typeof STRIPE_WEBHOOK_EVENTS)[number];
export type PaymentMethod = (typeof STRIPE_CONFIG.paymentMethods)[number];
export type PaymentStatus =
  (typeof PAYMENT_STATUS_MAP)[keyof typeof PAYMENT_STATUS_MAP];
