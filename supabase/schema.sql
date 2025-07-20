-- ClientCore Database Schema
-- Professional Client Management and Business Automation Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table (Multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table (Customer database)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_number VARCHAR(100) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Address information
    address_street TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    address_country VARCHAR(50) DEFAULT 'US',
    
    -- Status and preferences
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    customer_since DATE,
    last_statement_date DATE,
    preferred_contact VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'mail')),
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    
    -- Analytics
    total_statements_processed INTEGER DEFAULT 0,
    total_emails_sent INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Constraints
    UNIQUE(organization_id, account_number)
);

-- PDF Processing batches
CREATE TABLE pdf_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    batch_name VARCHAR(255),
    original_filename VARCHAR(255),
    month_year VARCHAR(50),
    total_pages INTEGER,
    processed_pages INTEGER DEFAULT 0,
    failed_pages INTEGER DEFAULT 0,
    processing_time_seconds DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Individual processed PDF files
CREATE TABLE processed_pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES pdf_batches(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    filename VARCHAR(255) NOT NULL,
    page_number INTEGER,
    file_size_bytes INTEGER,
    storage_path TEXT, -- Path to stored file (Supabase Storage)
    processing_status VARCHAR(20) DEFAULT 'success' CHECK (processing_status IN ('success', 'failed', 'skipped')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    campaign_name VARCHAR(255) NOT NULL,
    subject_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    emails_failed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'completed', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual email sends
CREATE TABLE email_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    processed_pdf_id UUID REFERENCES processed_pdfs(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    mailgun_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System analytics and metrics
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    client_id UUID REFERENCES clients(id),
    batch_id UUID REFERENCES pdf_batches(id),
    campaign_id UUID REFERENCES email_campaigns(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_clients_account_number ON clients(account_number);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_last_activity ON clients(last_activity);

CREATE INDEX idx_pdf_batches_organization_id ON pdf_batches(organization_id);
CREATE INDEX idx_pdf_batches_status ON pdf_batches(status);
CREATE INDEX idx_pdf_batches_created_at ON pdf_batches(created_at);

CREATE INDEX idx_processed_pdfs_batch_id ON processed_pdfs(batch_id);
CREATE INDEX idx_processed_pdfs_client_id ON processed_pdfs(client_id);

CREATE INDEX idx_email_campaigns_organization_id ON email_campaigns(organization_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_created_at ON email_campaigns(created_at);

CREATE INDEX idx_email_sends_campaign_id ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_client_id ON email_sends(client_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);

CREATE INDEX idx_analytics_events_organization_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant security
-- Users can only access data from their organization

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- User profiles: Users can see profiles in their organization
CREATE POLICY "Users can view profiles in their organization" ON user_profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Clients: Users can only access clients in their organization
CREATE POLICY "Users can access clients in their organization" ON clients
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- PDF Batches: Users can only access batches in their organization
CREATE POLICY "Users can access pdf batches in their organization" ON pdf_batches
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Processed PDFs: Users can only access PDFs from their organization's batches
CREATE POLICY "Users can access processed pdfs in their organization" ON processed_pdfs
    FOR ALL USING (
        batch_id IN (
            SELECT id FROM pdf_batches 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Email Campaigns: Users can only access campaigns in their organization
CREATE POLICY "Users can access email campaigns in their organization" ON email_campaigns
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Email Sends: Users can only access email sends from their organization's campaigns
CREATE POLICY "Users can access email sends in their organization" ON email_sends
    FOR ALL USING (
        campaign_id IN (
            SELECT id FROM email_campaigns 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles 
                WHERE id = auth.uid()
            )
        )
    );

-- Analytics Events: Users can only access analytics from their organization
CREATE POLICY "Users can access analytics in their organization" ON analytics_events
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
