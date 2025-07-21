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
          'Invoice processing not configured. Please set up Supabase environment variables.'
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      customerId,
      description,
      lineItems,
      dueDate,
      metadata = {},
      clientId,
      autoSend = false
    } = body;

    // Validate required fields
    if (
      !customerId ||
      !description ||
      !lineItems ||
      !Array.isArray(lineItems) ||
      lineItems.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate line items
    for (const item of lineItems) {
      if (!item.description || !item.quantity || !item.unitAmount) {
        return NextResponse.json(
          { error: 'Invalid line item format' },
          { status: 400 }
        );
      }
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

    try {
      // Create invoice in Stripe
      const stripeInvoice = await StripeService.createInvoice({
        customerId,
        description,
        lineItems: lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitAmountCents: item.unitAmount // Already in cents from client
        })),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        metadata: {
          ...metadata,
          user_id: user.id,
          client_id: clientId || ''
        }
      });

      // Calculate totals
      const subtotalCents = lineItems.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitAmount,
        0
      );
      const taxCents = 0; // TODO: Implement tax calculation
      const totalCents = subtotalCents + taxCents;

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // Save invoice to database
      const { data: dbInvoice, error: dbError } = await supabase
        .from('invoices')
        .insert({
          organization_id: user.user_metadata?.organization_id,
          client_id: clientId,
          user_id: user.id,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date:
            dueDate ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          subtotal_cents: subtotalCents,
          tax_cents: taxCents,
          total_cents: totalCents,
          status: 'draft',
          payment_status: 'unpaid',
          stripe_invoice_id: stripeInvoice.id,
          description
        })
        .select()
        .single();

      if (dbError) {
        console.error('Error saving invoice to database:', dbError);
        return NextResponse.json(
          { error: 'Failed to save invoice' },
          { status: 500 }
        );
      }

      // Save line items to database
      const lineItemsData = lineItems.map((item: any, index: number) => ({
        invoice_id: dbInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: item.unitAmount,
        total_cents: item.quantity * item.unitAmount
      }));

      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(lineItemsData);

      if (lineItemsError) {
        console.error('Error saving line items:', lineItemsError);
        // Don't fail the request, just log the error
      }

      // Finalize the invoice in Stripe
      const finalizedInvoice = await StripeService.finalizeInvoice(
        stripeInvoice.id
      );

      // Update invoice status in database
      await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', dbInvoice.id);

      // Optionally send the invoice immediately
      if (autoSend) {
        try {
          await StripeService.sendInvoice(finalizedInvoice.id);

          // Update database to reflect sent status
          await supabase
            .from('invoices')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', dbInvoice.id);
        } catch (sendError) {
          console.error('Error sending invoice:', sendError);
          // Don't fail the request, invoice is created but not sent
        }
      }

      return NextResponse.json({
        invoiceId: dbInvoice.id,
        stripeInvoiceId: finalizedInvoice.id,
        invoiceNumber: invoiceNumber,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        status: autoSend ? 'sent' : 'draft',
        totalAmount: totalCents
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in create-invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
