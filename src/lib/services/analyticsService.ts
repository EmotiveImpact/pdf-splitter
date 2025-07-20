import { supabase, AnalyticsEvent, AnalyticsEventInsert } from '../supabase';

export class AnalyticsService {
  // Track an analytics event
  static async trackEvent(event: AnalyticsEventInsert) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Track PDF processing event
  static async trackPDFProcessing(
    organizationId: string,
    userId: string,
    batchId: string,
    eventData: {
      totalPages: number;
      processedPages: number;
      failedPages: number;
      processingTime: number;
    }
  ) {
    return this.trackEvent({
      organization_id: organizationId,
      user_id: userId,
      event_type: 'pdf_processing_completed',
      event_data: eventData,
      batch_id: batchId
    });
  }

  // Track email campaign event
  static async trackEmailCampaign(
    organizationId: string,
    userId: string,
    campaignId: string,
    eventType: 'campaign_created' | 'campaign_started' | 'campaign_completed',
    eventData?: any
  ) {
    return this.trackEvent({
      organization_id: organizationId,
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      campaign_id: campaignId
    });
  }

  // Track client activity
  static async trackClientActivity(
    organizationId: string,
    clientId: string,
    eventType:
      | 'client_created'
      | 'client_updated'
      | 'statement_processed'
      | 'email_sent',
    eventData?: any
  ) {
    return this.trackEvent({
      organization_id: organizationId,
      event_type: eventType,
      event_data: eventData,
      client_id: clientId
    });
  }

  // Get dashboard metrics
  static async getDashboardMetrics(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get PDF processing metrics
    const { data: pdfMetrics, error: pdfError } = await supabase
      .from('pdf_batches')
      .select('processed_pages, failed_pages, processing_time_seconds, status')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    if (pdfError) throw pdfError;

    // Get email metrics
    const { data: emailMetrics, error: emailError } = await supabase
      .from('email_campaigns')
      .select('emails_sent, emails_delivered, emails_opened, status')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    if (emailError) throw emailError;

    // Get client metrics
    const { data: clientMetrics, error: clientError } = await supabase
      .from('clients')
      .select('status, created_at')
      .eq('organization_id', organizationId);

    if (clientError) throw clientError;

    const metrics = {
      pdfs: {
        totalProcessed: pdfMetrics.reduce(
          (sum, b) => sum + b.processed_pages,
          0
        ),
        totalFailed: pdfMetrics.reduce((sum, b) => sum + b.failed_pages, 0),
        averageProcessingTime: pdfMetrics
          .filter((b) => b.processing_time_seconds)
          .reduce(
            (sum, b, _, arr) =>
              sum + (b.processing_time_seconds || 0) / arr.length,
            0
          ),
        successRate: 0
      },
      emails: {
        totalSent: emailMetrics.reduce((sum, c) => sum + c.emails_sent, 0),
        totalDelivered: emailMetrics.reduce(
          (sum, c) => sum + c.emails_delivered,
          0
        ),
        totalOpened: emailMetrics.reduce((sum, c) => sum + c.emails_opened, 0),
        deliveryRate: 0,
        openRate: 0
      },
      clients: {
        total: clientMetrics.length,
        active: clientMetrics.filter((c) => c.status === 'active').length,
        newThisMonth: clientMetrics.filter(
          (c) => new Date(c.created_at) >= startDate
        ).length
      }
    };

    // Calculate rates
    const totalPages = metrics.pdfs.totalProcessed + metrics.pdfs.totalFailed;
    if (totalPages > 0) {
      metrics.pdfs.successRate =
        (metrics.pdfs.totalProcessed / totalPages) * 100;
    }

    if (metrics.emails.totalSent > 0) {
      metrics.emails.deliveryRate =
        (metrics.emails.totalDelivered / metrics.emails.totalSent) * 100;
    }

    if (metrics.emails.totalDelivered > 0) {
      metrics.emails.openRate =
        (metrics.emails.totalOpened / metrics.emails.totalDelivered) * 100;
    }

    return metrics;
  }

  // Get activity timeline
  static async getActivityTimeline(organizationId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select(
        `
        *,
        user_profiles(full_name),
        clients(customer_name),
        pdf_batches(batch_name),
        email_campaigns(campaign_name)
      `
      )
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Get event counts by type
  static async getEventCounts(organizationId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const counts = data.reduce(
      (acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return counts;
  }

  // Get usage trends
  static async getUsageTrends(organizationId: string, days: number = 30) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at, event_type')
      .eq('organization_id', organizationId)
      .gte(
        'created_at',
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by day and event type
    const trends = data.reduce(
      (acc, event) => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, events: {} };
        }
        acc[date].events[event.event_type] =
          (acc[date].events[event.event_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(trends);
  }

  // Get top clients by activity
  static async getTopClientsByActivity(
    organizationId: string,
    limit: number = 10
  ) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select(
        `
        client_id,
        clients(customer_name, account_number, email)
      `
      )
      .eq('organization_id', organizationId)
      .not('client_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Count activities per client
    const clientActivity = data.reduce(
      (acc, event) => {
        if (event.client_id) {
          if (!acc[event.client_id]) {
            acc[event.client_id] = {
              client: event.clients,
              activityCount: 0
            };
          }
          acc[event.client_id].activityCount++;
        }
        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(clientActivity)
      .sort((a: any, b: any) => b.activityCount - a.activityCount)
      .slice(0, limit);
  }

  // Get performance insights
  static async getPerformanceInsights(organizationId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get current period metrics
    const currentMetrics = await this.getDashboardMetrics(organizationId, 30);

    // Get previous period metrics for comparison
    const { data: prevPdfMetrics, error: prevPdfError } = await supabase
      .from('pdf_batches')
      .select('processed_pages, failed_pages')
      .eq('organization_id', organizationId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (prevPdfError) throw prevPdfError;

    const { data: prevEmailMetrics, error: prevEmailError } = await supabase
      .from('email_campaigns')
      .select('emails_sent, emails_delivered')
      .eq('organization_id', organizationId)
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (prevEmailError) throw prevEmailError;

    const prevPdfProcessed = prevPdfMetrics.reduce(
      (sum, b) => sum + b.processed_pages,
      0
    );
    const prevEmailsSent = prevEmailMetrics.reduce(
      (sum, c) => sum + c.emails_sent,
      0
    );

    const insights = {
      pdfGrowth:
        prevPdfProcessed > 0
          ? ((currentMetrics.pdfs.totalProcessed - prevPdfProcessed) /
              prevPdfProcessed) *
            100
          : 0,
      emailGrowth:
        prevEmailsSent > 0
          ? ((currentMetrics.emails.totalSent - prevEmailsSent) /
              prevEmailsSent) *
            100
          : 0,
      currentMetrics
    };

    return insights;
  }
}
