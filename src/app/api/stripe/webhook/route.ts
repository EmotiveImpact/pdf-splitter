import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe/service';
import { createServerClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Check if Supabase is configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      {
        error:
          'Webhook processing not configured. Please set up Supabase environment variables.'
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature and construct event
    let event: Stripe.Event;
    try {
      event = await StripeService.processWebhook(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Create Supabase client (service role for webhook processing)
    const supabase = createServerClient();

    // Process the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(
            event.data.object as Stripe.PaymentIntent,
            supabase
          );
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(
            event.data.object as Stripe.PaymentIntent,
            supabase
          );
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
            supabase
          );
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
            supabase
          );
          break;

        case 'invoice.finalized':
          await handleInvoiceFinalized(
            event.data.object as Stripe.Invoice,
            supabase
          );
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log('Processing payment_intent.succeeded:', paymentIntent.id);

  try {
    // Update payment record in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        net_amount_cents:
          paymentIntent.amount -
          StripeService.calculateFees(paymentIntent.amount),
        processor_fee_cents: StripeService.calculateFees(paymentIntent.amount)
      })
      .eq('stripe_payment_id', paymentIntent.id);

    if (updateError) {
      console.error('Error updating payment record:', updateError);
      return;
    }

    // If this payment is for an invoice, update the invoice
    const invoiceId = paymentIntent.metadata?.invoice_id;
    if (invoiceId) {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          payment_status: 'paid',
          status: 'paid',
          paid_at: new Date().toISOString(),
          paid_cents: paymentIntent.amount
        })
        .eq('stripe_invoice_id', invoiceId);

      if (invoiceError) {
        console.error('Error updating invoice record:', invoiceError);
      }
    }

    // Create a communication record for the successful payment
    const clientId = paymentIntent.metadata?.client_id;
    if (clientId) {
      await supabase.from('communications').insert({
        client_id: clientId,
        type: 'note',
        direction: 'outbound',
        subject: 'Payment Received',
        content: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received successfully via Stripe.`,
        status: 'completed',
        priority: 'normal'
      });
    }

    console.log('Payment succeeded processing completed');
  } catch (error) {
    console.error('Error in handlePaymentSucceeded:', error);
  }
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

  try {
    // Update payment record in database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString()
      })
      .eq('stripe_payment_id', paymentIntent.id);

    if (updateError) {
      console.error('Error updating payment record:', updateError);
      return;
    }

    // Create a communication record for the failed payment
    const clientId = paymentIntent.metadata?.client_id;
    if (clientId) {
      await supabase.from('communications').insert({
        client_id: clientId,
        type: 'note',
        direction: 'outbound',
        subject: 'Payment Failed',
        content: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} failed. Reason: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
        status: 'completed',
        priority: 'high'
      });

      // Create a follow-up task for failed payment
      await supabase.from('tasks').insert({
        client_id: clientId,
        title: 'Follow up on failed payment',
        description: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} failed. Contact customer to resolve payment issue.`,
        task_type: 'payment_reminder',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // Tomorrow
        assigned_to: paymentIntent.metadata?.user_id || null,
        created_by: paymentIntent.metadata?.user_id || null
      });
    }

    console.log('Payment failed processing completed');
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  console.log('Processing invoice.payment_succeeded:', invoice.id);

  try {
    // Update invoice record in database
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        payment_status: 'paid',
        status: 'paid',
        paid_at: new Date().toISOString(),
        paid_cents: invoice.amount_paid,
        stripe_payment_intent_id: invoice.payment_intent
      })
      .eq('stripe_invoice_id', invoice.id);

    if (updateError) {
      console.error('Error updating invoice record:', updateError);
      return;
    }

    // Create payment record
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('client_id, organization_id')
      .eq('stripe_invoice_id', invoice.id)
      .single();

    if (invoiceData) {
      await supabase.from('payments').insert({
        organization_id: invoiceData.organization_id,
        client_id: invoiceData.client_id,
        invoice_id: invoice.id,
        amount_cents: invoice.amount_paid,
        payment_method: 'stripe',
        status: 'completed',
        stripe_payment_id: invoice.payment_intent as string,
        processed_at: new Date().toISOString(),
        net_amount_cents:
          invoice.amount_paid -
          StripeService.calculateFees(invoice.amount_paid),
        processor_fee_cents: StripeService.calculateFees(invoice.amount_paid),
        description: `Payment for invoice ${invoice.number}`
      });
    }

    console.log('Invoice payment succeeded processing completed');
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error);
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  console.log('Processing invoice.payment_failed:', invoice.id);

  try {
    // Update invoice record in database
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        payment_status: 'failed'
      })
      .eq('stripe_invoice_id', invoice.id);

    if (updateError) {
      console.error('Error updating invoice record:', updateError);
    }

    console.log('Invoice payment failed processing completed');
  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error);
  }
}

async function handleInvoiceFinalized(invoice: Stripe.Invoice, supabase: any) {
  console.log('Processing invoice.finalized:', invoice.id);

  try {
    // Update invoice record in database
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('stripe_invoice_id', invoice.id);

    if (updateError) {
      console.error('Error updating invoice record:', updateError);
    }

    console.log('Invoice finalized processing completed');
  } catch (error) {
    console.error('Error in handleInvoiceFinalized:', error);
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
