import {
  supabase,
  EmailCampaign,
  EmailCampaignInsert,
  EmailSend,
  EmailSendInsert
} from '../supabase';

export class EmailService {
  // Create a new email campaign
  static async createCampaign(campaign: EmailCampaignInsert) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update campaign
  static async updateCampaign(
    campaignId: string,
    updates: Partial<EmailCampaign>
  ) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all campaigns for an organization
  static async getCampaigns(organizationId: string) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select(
        `
        *,
        email_sends(count)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get campaign with email sends
  static async getCampaignWithSends(campaignId: string) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select(
        `
        *,
        email_sends(
          *,
          clients(customer_name, email)
        )
      `
      )
      .eq('id', campaignId)
      .single();

    if (error) throw error;
    return data;
  }

  // Add email send record
  static async addEmailSend(emailSend: EmailSendInsert) {
    const { data, error } = await supabase
      .from('email_sends')
      .insert(emailSend)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bulk add email sends
  static async bulkAddEmailSends(emailSends: EmailSendInsert[]) {
    const { data, error } = await supabase
      .from('email_sends')
      .insert(emailSends)
      .select();

    if (error) throw error;
    return data;
  }

  // Update email send status
  static async updateEmailSendStatus(
    emailSendId: string,
    status: string,
    metadata?: {
      mailgun_message_id?: string;
      error_message?: string;
    }
  ) {
    const updates: any = {
      status,
      [`${status}_at`]: new Date().toISOString()
    };

    if (metadata?.mailgun_message_id) {
      updates.mailgun_message_id = metadata.mailgun_message_id;
    }

    if (metadata?.error_message) {
      updates.error_message = metadata.error_message;
    }

    const { data, error } = await supabase
      .from('email_sends')
      .update(updates)
      .eq('id', emailSendId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get email statistics for an organization
  static async getEmailStats(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: campaigns, error: campaignError } = await supabase
      .from('email_campaigns')
      .select(
        `
        id,
        status,
        total_recipients,
        emails_sent,
        emails_delivered,
        emails_opened,
        emails_clicked,
        emails_failed,
        created_at
      `
      )
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    if (campaignError) throw campaignError;

    const { data: sends, error: sendsError } = await supabase
      .from('email_sends')
      .select('status, sent_at, delivered_at, opened_at, clicked_at')
      .in(
        'campaign_id',
        campaigns.map((c) => c.id)
      );

    if (sendsError) throw sendsError;

    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'sending').length,
      completedCampaigns: campaigns.filter((c) => c.status === 'completed')
        .length,
      totalEmailsSent: campaigns.reduce((sum, c) => sum + c.emails_sent, 0),
      totalEmailsDelivered: campaigns.reduce(
        (sum, c) => sum + c.emails_delivered,
        0
      ),
      totalEmailsOpened: campaigns.reduce((sum, c) => sum + c.emails_opened, 0),
      totalEmailsClicked: campaigns.reduce(
        (sum, c) => sum + c.emails_clicked,
        0
      ),
      totalEmailsFailed: campaigns.reduce((sum, c) => sum + c.emails_failed, 0),
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0
    };

    if (stats.totalEmailsSent > 0) {
      stats.deliveryRate =
        (stats.totalEmailsDelivered / stats.totalEmailsSent) * 100;
      stats.openRate =
        (stats.totalEmailsOpened / stats.totalEmailsDelivered) * 100;
      stats.clickRate =
        (stats.totalEmailsClicked / stats.totalEmailsOpened) * 100;
    }

    return stats;
  }

  // Get recent email activity
  static async getRecentEmailActivity(
    organizationId: string,
    limit: number = 10
  ) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select(
        `
        id,
        campaign_name,
        status,
        emails_sent,
        total_recipients,
        created_at,
        completed_at,
        user_profiles(full_name)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Start campaign (mark as sending)
  static async startCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'sending',
        started_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Complete campaign
  static async completeCampaign(campaignId: string) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get email trends
  static async getEmailTrends(organizationId: string, days: number = 30) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('created_at, emails_sent, emails_delivered, emails_opened')
      .eq('organization_id', organizationId)
      .gte(
        'created_at',
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const trends = data.reduce(
      (acc, campaign) => {
        const date = new Date(campaign.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, sent: 0, delivered: 0, opened: 0 };
        }
        acc[date].sent += campaign.emails_sent;
        acc[date].delivered += campaign.emails_delivered;
        acc[date].opened += campaign.emails_opened;
        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(trends);
  }

  // Handle Mailgun webhook
  static async handleMailgunWebhook(eventData: any) {
    const { 'message-id': messageId, event, timestamp } = eventData;

    if (!messageId) return;

    const { data: emailSend, error: findError } = await supabase
      .from('email_sends')
      .select('id, campaign_id')
      .eq('mailgun_message_id', messageId)
      .single();

    if (findError || !emailSend) return;

    // Update email send status
    await this.updateEmailSendStatus(emailSend.id, event);

    // Update campaign counters
    const field = `emails_${event}`;
    await supabase.rpc('increment_campaign_counter', {
      campaign_id: emailSend.campaign_id,
      counter_field: field
    });
  }
}

// SQL function to increment campaign counters (needs to be created in Supabase)
/*
CREATE OR REPLACE FUNCTION increment_campaign_counter(campaign_id UUID, counter_field TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE email_campaigns SET %I = %I + 1 WHERE id = $1', counter_field, counter_field)
  USING campaign_id;
END;
$$ LANGUAGE plpgsql;
*/
