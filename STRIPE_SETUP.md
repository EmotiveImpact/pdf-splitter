# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for ClientCore.

## 🎯 Overview

ClientCore integrates with Stripe to provide:
- **Payment Processing**: Accept credit cards, ACH, and bank transfers
- **Invoice Management**: Create and send professional invoices
- **Subscription Billing**: Recurring payments for services
- **Webhook Processing**: Real-time payment status updates
- **Fee Calculation**: Automatic processor fee tracking

## 📋 Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Business Information**: Have your business details ready for verification
3. **Bank Account**: For receiving payments (required for live mode)

## 🔧 Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your business email
3. Complete business verification (required for live payments)
4. Add your bank account for payouts

## 🔑 Step 2: Get API Keys

### Test Mode Keys (for development):
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. Copy the **Secret key** (starts with `sk_test_`)

### Live Mode Keys (for production):
1. Toggle to **Live mode** in Stripe Dashboard
2. Complete account verification if not done
3. Copy the **Live Publishable key** (starts with `pk_live_`)
4. Copy the **Live Secret key** (starts with `sk_live_`)

## 🌐 Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Stripe Test Keys (Development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# For Production, use live keys:
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
```

## 🔗 Step 4: Set Up Webhooks

Webhooks allow Stripe to notify your application about payment events.

### Create Webhook Endpoint:
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.finalized`

### Get Webhook Secret:
1. Click on your webhook endpoint
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add to your environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 💳 Step 5: Configure Payment Methods

### Enable Payment Methods:
1. In Stripe Dashboard, go to **Settings** → **Payment methods**
2. Enable desired payment methods:
   - **Cards**: Visa, Mastercard, American Express
   - **Bank transfers**: ACH Direct Debit (US)
   - **Digital wallets**: Apple Pay, Google Pay

### Set Up ACH Payments (Optional):
1. Go to **Settings** → **Payment methods**
2. Enable **ACH Direct Debit**
3. Configure verification requirements
4. Set up micro-deposit verification

## 📊 Step 6: Create Products and Prices

### For PDF Processing Services:
1. Go to **Products** in Stripe Dashboard
2. Create product: "PDF Processing Services"
3. Add prices:
   - Per document: $2.50
   - Monthly unlimited: $50.00
   - Annual unlimited: $500.00

### For Email Distribution:
1. Create product: "Email Distribution Services"
2. Add prices:
   - Per email: $0.10
   - Monthly (1000 emails): $25.00
   - Annual (12000 emails): $250.00

### For CRM Access:
1. Create product: "CRM Access"
2. Add prices:
   - Monthly: $75.00
   - Annual: $750.00

## 🧪 Step 7: Test Integration

### Test Cards (Test Mode Only):
```
Successful payment: 4242 4242 4242 4242
Declined payment: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

### Test the Integration:
1. Start your development server
2. Go to `/dashboard/invoices`
3. Create a test invoice
4. Use test card numbers to verify payments work
5. Check webhook events in Stripe Dashboard

## 🚀 Step 8: Go Live

### Before Going Live:
1. ✅ Complete Stripe account verification
2. ✅ Add business bank account
3. ✅ Test all payment flows thoroughly
4. ✅ Set up proper error handling
5. ✅ Configure webhook endpoints for production
6. ✅ Update environment variables with live keys

### Switch to Live Mode:
1. Update environment variables with live keys
2. Update webhook endpoint URL to production domain
3. Test with small real transactions
4. Monitor Stripe Dashboard for any issues

## 💰 Pricing & Fees

### Stripe's Standard Pricing:
- **Credit Cards**: 2.9% + $0.30 per transaction
- **ACH Direct Debit**: 0.8% (capped at $5.00)
- **International Cards**: 3.4% + $0.30
- **Disputes**: $15.00 per dispute

### ClientCore Fee Calculation:
The system automatically calculates and tracks processor fees for accurate revenue reporting.

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use HTTPS** for all webhook endpoints
3. **Verify webhook signatures** (automatically handled)
4. **Store sensitive data securely** in environment variables
5. **Monitor for suspicious activity** in Stripe Dashboard

## 📞 Support & Resources

### Stripe Resources:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Status Page](https://status.stripe.com)

### ClientCore Integration:
- Check `/lib/stripe/` directory for implementation details
- Review API routes in `/app/api/stripe/`
- Test with PaymentForm component

## 🐛 Troubleshooting

### Common Issues:

**"Invalid API Key"**
- Check that you're using the correct key for your environment
- Ensure no extra spaces in environment variables

**"Webhook signature verification failed"**
- Verify webhook secret is correct
- Check that endpoint URL is accessible
- Ensure raw body is passed to verification

**"Payment requires authentication"**
- This is normal for European cards (3D Secure)
- The PaymentForm component handles this automatically

**"Insufficient funds"**
- Customer's card was declined
- Suggest alternative payment method

### Getting Help:
1. Check Stripe Dashboard logs
2. Review browser console for errors
3. Check server logs for webhook processing
4. Contact Stripe support for payment-specific issues

---

## ✅ Setup Checklist

- [ ] Created Stripe account
- [ ] Obtained API keys
- [ ] Configured environment variables
- [ ] Set up webhook endpoint
- [ ] Created products and prices
- [ ] Tested payment flow
- [ ] Verified webhook processing
- [ ] Ready for production deployment

Once completed, your ClientCore installation will have full payment processing capabilities!
