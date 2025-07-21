import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe/service';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      {
        error:
          'Payment processing not configured. Please set up Supabase environment variables.'
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      amount,
      currency = 'usd',
      description,
      customerEmail,
      customerName,
      invoiceId,
      metadata = {}
    } = body;

    // Validate required fields
    if (!amount || !description || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount < 50) {
      // Stripe minimum is $0.50
      return NextResponse.json(
        { error: 'Amount must be at least $0.50' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if customer already exists in Stripe
    let customerId: string;

    try {
      // First, try to find existing customer by email
      const existingCustomer = await StripeService.getCustomer(customerEmail);

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create new customer in Stripe
        const newCustomer = await StripeService.createCustomer({
          email: customerEmail,
          name: customerName,
          metadata: {
            user_id: user.id,
            source: 'clientcore'
          }
        });
        customerId = newCustomer.id;
      }
    } catch (error) {
      console.error('Error handling Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to process customer information' },
        { status: 500 }
      );
    }

    // Create payment intent
    try {
      const paymentIntent = await StripeService.createPaymentIntent({
        amountCents: amount,
        customerId,
        description,
        invoiceId,
        metadata: {
          ...metadata,
          user_id: user.id,
          customer_email: customerEmail,
          customer_name: customerName
        }
      });

      // Log payment intent creation in database
      const { error: dbError } = await supabase.from('payments').insert({
        organization_id: user.user_metadata?.organization_id,
        client_id: metadata.client_id || null,
        invoice_id: invoiceId || null,
        amount_cents: amount,
        payment_method: 'stripe',
        status: 'pending',
        stripe_payment_id: paymentIntent.id,
        description,
        reference_number: `PI-${paymentIntent.id.slice(-8)}`
      });

      if (dbError) {
        console.error('Error logging payment intent:', dbError);
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return NextResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in create-payment-intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
