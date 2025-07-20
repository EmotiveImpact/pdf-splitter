interface ProcessingEvent {
  id: string;
  timestamp: Date;
  type:
    | 'pdf_processing'
    | 'email_sending'
    | 'template_creation'
    | 'download'
    | 'error';
  data: {
    filesCount?: number;
    successCount?: number;
    errorCount?: number;
    processingTime?: number;
    customerCount?: number;
    templateName?: string;
    errorMessage?: string;
    batchId?: string;
  };
}

interface CustomerMetrics {
  accountNumber: string;
  customerName: string;
  email?: string;
  totalProcessed: number;
  lastProcessed: Date;
  emailsSent: number;
  lastEmailSent?: Date;
  processingHistory: ProcessingEvent[];
}

interface EmailCampaignMetrics {
  id: string;
  name: string;
  templateName: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  bouncedCount: number;
  failedCount: number;
  sentDate: Date;
  customers: string[]; // account numbers
}

interface SystemMetrics {
  totalPDFsProcessed: number;
  totalEmailsSent: number;
  totalCustomers: number;
  totalTimeSaved: number; // in minutes
  averageProcessingTime: number; // in seconds
  successRate: number; // percentage
  lastUpdated: Date;
}

interface AnalyticsData {
  events: ProcessingEvent[];
  customers: Map<string, CustomerMetrics>;
  campaigns: EmailCampaignMetrics[];
  systemMetrics: SystemMetrics;
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private data: AnalyticsData;
  private readonly STORAGE_KEY = 'nws_analytics_data';

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private loadData(): AnalyticsData {
    const defaultData: AnalyticsData = {
      events: [],
      customers: new Map(),
      campaigns: [],
      systemMetrics: {
        totalPDFsProcessed: 0,
        totalEmailsSent: 0,
        totalCustomers: 0,
        totalTimeSaved: 0,
        averageProcessingTime: 0,
        successRate: 100,
        lastUpdated: new Date()
      }
    };

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert dates back from strings
        parsed.events = parsed.events.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));

        // Convert customers map
        parsed.customers = new Map(
          parsed.customers.map(([key, customer]: [string, any]) => [
            key,
            {
              ...customer,
              lastProcessed: new Date(customer.lastProcessed),
              lastEmailSent: customer.lastEmailSent
                ? new Date(customer.lastEmailSent)
                : undefined,
              processingHistory: customer.processingHistory.map(
                (event: any) => ({
                  ...event,
                  timestamp: new Date(event.timestamp)
                })
              )
            }
          ])
        );

        parsed.campaigns = parsed.campaigns.map((campaign: any) => ({
          ...campaign,
          sentDate: new Date(campaign.sentDate)
        }));

        parsed.systemMetrics.lastUpdated = new Date(
          parsed.systemMetrics.lastUpdated
        );

        return { ...defaultData, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }

    return defaultData;
  }

  private saveData(): void {
    try {
      const dataToSave = {
        ...this.data,
        customers: Array.from(this.data.customers.entries())
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save analytics data:', error);
    }
  }

  // Event tracking methods
  public trackPDFProcessing(
    filesCount: number,
    successCount: number,
    errorCount: number,
    processingTime: number,
    batchId: string
  ): void {
    const event: ProcessingEvent = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'pdf_processing',
      data: {
        filesCount,
        successCount,
        errorCount,
        processingTime,
        batchId
      }
    };

    this.data.events.push(event);
    this.updateSystemMetrics();
    this.saveData();

    console.log('📊 Analytics: PDF processing tracked', event);
  }

  public trackEmailCampaign(
    campaignData: Omit<EmailCampaignMetrics, 'id' | 'sentDate'>
  ): string {
    const campaign: EmailCampaignMetrics = {
      ...campaignData,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentDate: new Date()
    };

    this.data.campaigns.push(campaign);

    const event: ProcessingEvent = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'email_sending',
      data: {
        customerCount: campaign.sentCount,
        templateName: campaign.templateName
      }
    };

    this.data.events.push(event);
    this.updateSystemMetrics();
    this.saveData();

    console.log('📊 Analytics: Email campaign tracked', campaign);
    return campaign.id;
  }

  public trackCustomerActivity(
    accountNumber: string,
    customerName: string,
    email?: string
  ): void {
    const existing = this.data.customers.get(accountNumber);

    if (existing) {
      existing.totalProcessed++;
      existing.lastProcessed = new Date();
      if (email) existing.email = email;
    } else {
      const newCustomer: CustomerMetrics = {
        accountNumber,
        customerName,
        email,
        totalProcessed: 1,
        lastProcessed: new Date(),
        emailsSent: 0,
        processingHistory: []
      };
      this.data.customers.set(accountNumber, newCustomer);
    }

    this.updateSystemMetrics();
    this.saveData();
  }

  public trackTemplateCreation(templateName: string): void {
    const event: ProcessingEvent = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'template_creation',
      data: {
        templateName
      }
    };

    this.data.events.push(event);
    this.saveData();

    console.log('📊 Analytics: Template creation tracked', event);
  }

  private updateSystemMetrics(): void {
    const metrics = this.data.systemMetrics;

    // Calculate totals from events
    metrics.totalPDFsProcessed = this.data.events
      .filter((e) => e.type === 'pdf_processing')
      .reduce((sum, e) => sum + (e.data.successCount || 0), 0);

    metrics.totalEmailsSent = this.data.campaigns.reduce(
      (sum, c) => sum + c.sentCount,
      0
    );

    metrics.totalCustomers = this.data.customers.size;

    // Calculate average processing time
    const processingEvents = this.data.events.filter(
      (e) => e.type === 'pdf_processing' && e.data.processingTime
    );
    if (processingEvents.length > 0) {
      metrics.averageProcessingTime =
        processingEvents.reduce(
          (sum, e) => sum + (e.data.processingTime || 0),
          0
        ) / processingEvents.length;
    }

    // Calculate success rate
    const totalAttempts = this.data.events
      .filter((e) => e.type === 'pdf_processing')
      .reduce((sum, e) => sum + (e.data.filesCount || 0), 0);

    const totalSuccesses = this.data.events
      .filter((e) => e.type === 'pdf_processing')
      .reduce((sum, e) => sum + (e.data.successCount || 0), 0);

    if (totalAttempts > 0) {
      metrics.successRate = (totalSuccesses / totalAttempts) * 100;
    }

    // Estimate time saved (assuming 5 minutes per manual PDF + 2 minutes per manual email)
    metrics.totalTimeSaved =
      metrics.totalPDFsProcessed * 5 + metrics.totalEmailsSent * 2;

    metrics.lastUpdated = new Date();
  }

  // Data retrieval methods
  public getSystemMetrics(): SystemMetrics {
    return { ...this.data.systemMetrics };
  }

  public getRecentEvents(limit: number = 10): ProcessingEvent[] {
    return this.data.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getCustomerMetrics(): CustomerMetrics[] {
    return Array.from(this.data.customers.values()).sort(
      (a, b) => b.totalProcessed - a.totalProcessed
    );
  }

  public getCampaignMetrics(): EmailCampaignMetrics[] {
    return this.data.campaigns.sort(
      (a, b) => b.sentDate.getTime() - a.sentDate.getTime()
    );
  }

  public getProcessingTrends(
    days: number = 30
  ): { date: string; count: number }[] {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const trends: { [key: string]: number } = {};

    // Initialize all dates with 0
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      trends[d.toISOString().split('T')[0]] = 0;
    }

    // Count events by date
    this.data.events
      .filter((e) => e.type === 'pdf_processing' && e.timestamp >= startDate)
      .forEach((event) => {
        const date = event.timestamp.toISOString().split('T')[0];
        trends[date] = (trends[date] || 0) + (event.data.successCount || 0);
      });

    return Object.entries(trends).map(([date, count]) => ({ date, count }));
  }

  public getEmailDeliveryStats(): {
    delivered: number;
    bounced: number;
    opened: number;
    total: number;
  } {
    const stats = this.data.campaigns.reduce(
      (acc, campaign) => ({
        delivered: acc.delivered + campaign.deliveredCount,
        bounced: acc.bounced + campaign.bouncedCount,
        opened: acc.opened + campaign.openedCount,
        total: acc.total + campaign.sentCount
      }),
      { delivered: 0, bounced: 0, opened: 0, total: 0 }
    );

    return stats;
  }

  // Utility methods
  public exportData(): string {
    return JSON.stringify(
      {
        ...this.data,
        customers: Array.from(this.data.customers.entries())
      },
      null,
      2
    );
  }

  public clearData(): void {
    this.data = {
      events: [],
      customers: new Map(),
      campaigns: [],
      systemMetrics: {
        totalPDFsProcessed: 0,
        totalEmailsSent: 0,
        totalCustomers: 0,
        totalTimeSaved: 0,
        averageProcessingTime: 0,
        successRate: 100,
        lastUpdated: new Date()
      }
    };
    this.saveData();
  }
}

// Export singleton instance
export const analyticsManager = AnalyticsManager.getInstance();

// Export types
export type {
  ProcessingEvent,
  CustomerMetrics,
  EmailCampaignMetrics,
  SystemMetrics,
  AnalyticsData
};
export { AnalyticsManager };
