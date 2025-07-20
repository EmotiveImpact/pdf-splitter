# 🚀 ClientCore Supabase Setup Guide

This guide will help you set up Supabase for your ClientCore SaaS platform.

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Your ClientCore application deployed or running locally

## 🎯 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Fill in project details:**
   - **Name:** ClientCore Production (or ClientCore Dev)
   - **Database Password:** Generate a strong password and save it
   - **Region:** Choose closest to your users
4. **Click "Create new project"**
5. **Wait for setup to complete** (2-3 minutes)

## 🗄️ Step 2: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Create a new query**
3. **Copy and paste** the entire contents of `supabase/schema.sql`
4. **Click "Run"** to execute the schema
5. **Verify tables were created** in the Table Editor

## 🔐 Step 3: Configure Authentication

1. **Go to Authentication > Settings**
2. **Configure Site URL:**
   - **Site URL:** `https://your-domain.com` (or `http://localhost:3000` for dev)
   - **Redirect URLs:** Add your domain + `/auth/callback`
3. **Enable Email Auth** (default)
4. **Optional:** Configure OAuth providers (Google, GitHub, etc.)

## 📁 Step 4: Set Up Storage

1. **Go to Storage**
2. **Create a new bucket:**
   - **Name:** `processed-pdfs`
   - **Public:** No (private bucket)
3. **Set up RLS policies** for the bucket:

```sql
-- Allow authenticated users to upload files to their organization folder
CREATE POLICY "Users can upload PDFs to their organization folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'processed-pdfs' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM user_profiles WHERE id = auth.uid()
  )
);

-- Allow users to read files from their organization folder
CREATE POLICY "Users can read PDFs from their organization folder" ON storage.objects
FOR SELECT USING (
  bucket_id = 'processed-pdfs' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM user_profiles WHERE id = auth.uid()
  )
);
```

## 🔧 Step 5: Add Required Functions

Run these SQL functions in the SQL Editor:

```sql
-- Function to increment client counters
CREATE OR REPLACE FUNCTION increment_client_counter(client_id UUID, counter_field TEXT)
RETURNS VOID AS $$
BEGIN
  IF counter_field = 'total_statements_processed' THEN
    UPDATE clients 
    SET total_statements_processed = total_statements_processed + 1,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE id = client_id;
  ELSIF counter_field = 'total_emails_sent' THEN
    UPDATE clients 
    SET total_emails_sent = total_emails_sent + 1,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE id = client_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment campaign counters
CREATE OR REPLACE FUNCTION increment_campaign_counter(campaign_id UUID, counter_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE email_campaigns SET %I = %I + 1 WHERE id = $1', counter_field, counter_field)
  USING campaign_id;
END;
$$ LANGUAGE plpgsql;
```

## 🔑 Step 6: Get API Keys

1. **Go to Settings > API**
2. **Copy these values:**
   - **Project URL:** `https://your-project-id.supabase.co`
   - **Anon Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

## 🌍 Step 7: Update Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Existing variables
AUTH_SECRET=your-auth-secret-key-here
NEXT_PUBLIC_APP_NAME=ClientCore
NEXT_PUBLIC_APP_DESCRIPTION=Professional Client Management Platform

# Email Configuration (Mailgun)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
```

## 🎯 Step 8: Create Initial Organization & User

Run this SQL to create your first organization and user:

```sql
-- Insert your organization
INSERT INTO organizations (name, slug, description) 
VALUES ('Your Company Name', 'your-company', 'Your company description');

-- Get the organization ID (copy this for next step)
SELECT id FROM organizations WHERE slug = 'your-company';

-- After you sign up through the app, update your user profile
-- Replace 'your-user-id' with your actual auth.users.id
-- Replace 'your-org-id' with the organization ID from above
INSERT INTO user_profiles (id, organization_id, email, full_name, role)
VALUES (
  'your-user-id',
  'your-org-id', 
  'your-email@example.com',
  'Your Full Name',
  'owner'
);
```

## 🧪 Step 9: Test the Integration

1. **Restart your application** to load new environment variables
2. **Sign up** for a new account through your app
3. **Try uploading a PDF** to test the integration
4. **Check the Supabase dashboard** to see data being created

## 📊 Step 10: Set Up Analytics (Optional)

For production monitoring, consider setting up:

1. **Supabase Analytics** - Built-in usage analytics
2. **Custom dashboards** - Using the analytics_events table
3. **Alerts** - For important events or errors

## 🔒 Security Checklist

- ✅ **RLS enabled** on all tables
- ✅ **Storage policies** configured
- ✅ **Service role key** kept secret
- ✅ **CORS settings** configured for your domain
- ✅ **Rate limiting** enabled (in Supabase settings)

## 🚀 Production Deployment

When deploying to production:

1. **Update environment variables** in Vercel/your hosting platform
2. **Update Supabase Site URL** to your production domain
3. **Test all functionality** in production environment
4. **Monitor logs** for any issues

## 📞 Support

If you encounter issues:

1. **Check Supabase logs** in the dashboard
2. **Review RLS policies** if you get permission errors
3. **Verify environment variables** are set correctly
4. **Check network connectivity** between your app and Supabase

## 🎉 You're Ready!

Your ClientCore SaaS platform is now powered by Supabase with:

- ✅ **Multi-tenant database** with proper security
- ✅ **User authentication** and authorization
- ✅ **File storage** for processed PDFs
- ✅ **Real-time capabilities** for live updates
- ✅ **Scalable architecture** ready for thousands of users

**Welcome to the world of professional SaaS! 🚀**
