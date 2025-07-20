import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
  MousePointer,
  TrendingUp
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  analyticsManager,
  type EmailCampaignMetrics
} from '@/lib/analyticsManager';

const EmailAnalytics = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaignMetrics[]>([]);
  const [emailStats, setEmailStats] = useState({
    delivered: 0,
    bounced: 0,
    opened: 0,
    total: 0
  });

  useEffect(() => {
    const campaignData = analyticsManager.getCampaignMetrics();
    const stats = analyticsManager.getEmailDeliveryStats();
    setCampaigns(campaignData);
    setEmailStats(stats);
  }, []);

  const calculateRates = () => {
    if (emailStats.total === 0)
      return { deliveryRate: 0, openRate: 0, bounceRate: 0 };

    return {
      deliveryRate: (emailStats.delivered / emailStats.total) * 100,
      openRate: (emailStats.opened / emailStats.delivered) * 100,
      bounceRate: (emailStats.bounced / emailStats.total) * 100
    };
  };

  const rates = calculateRates();

  const getDeliveryStatus = (
    rate: number
  ): { status: string; color: string; icon: React.ReactNode } => {
    if (rate >= 95)
      return {
        status: 'Excellent',
        color: 'text-green-600 bg-green-100',
        icon: <CheckCircle className='h-4 w-4' />
      };
    if (rate >= 90)
      return {
        status: 'Good',
        color: 'text-blue-600 bg-blue-100',
        icon: <Send className='h-4 w-4' />
      };
    if (rate >= 80)
      return {
        status: 'Fair',
        color: 'text-yellow-600 bg-yellow-100',
        icon: <AlertCircle className='h-4 w-4' />
      };
    return {
      status: 'Poor',
      color: 'text-red-600 bg-red-100',
      icon: <AlertCircle className='h-4 w-4' />
    };
  };

  const deliveryStatus = getDeliveryStatus(rates.deliveryRate);

  const getTemplatePerformance = () => {
    const templateStats = new Map<
      string,
      { sent: number; delivered: number; opened: number }
    >();

    campaigns.forEach((campaign) => {
      const existing = templateStats.get(campaign.templateName) || {
        sent: 0,
        delivered: 0,
        opened: 0
      };
      templateStats.set(campaign.templateName, {
        sent: existing.sent + campaign.sentCount,
        delivered: existing.delivered + campaign.deliveredCount,
        opened: existing.opened + campaign.openedCount
      });
    });

    return Array.from(templateStats.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      deliveryRate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0,
      openRate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0
    }));
  };

  const templatePerformance = getTemplatePerformance();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Email Campaign Analytics</h3>
        <Badge className={deliveryStatus.color}>
          {deliveryStatus.icon}
          <span className='ml-1'>{deliveryStatus.status} Delivery</span>
        </Badge>
      </div>

      {/* Email Statistics */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Sent
                </p>
                <p className='text-2xl font-bold'>{emailStats.total}</p>
              </div>
              <Mail className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mt-2'>
              <Progress value={100} className='h-2' />
              <p className='mt-1 text-xs text-muted-foreground'>
                All email attempts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Delivered
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {emailStats.delivered}
                </p>
              </div>
              <Send className='h-8 w-8 text-green-600' />
            </div>
            <div className='mt-2'>
              <Progress value={rates.deliveryRate} className='h-2' />
              <p className='mt-1 text-xs text-green-600'>
                {rates.deliveryRate.toFixed(1)}% delivery rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Opened
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {emailStats.opened}
                </p>
              </div>
              <Eye className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mt-2'>
              <Progress value={rates.openRate} className='h-2' />
              <p className='mt-1 text-xs text-purple-600'>
                {rates.openRate.toFixed(1)}% open rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Bounced
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {emailStats.bounced}
                </p>
              </div>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <div className='mt-2'>
              <Progress value={rates.bounceRate} className='h-2' />
              <p className='mt-1 text-xs text-red-600'>
                {rates.bounceRate.toFixed(1)}% bounce rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Email Performance Breakdown
          </CardTitle>
          <CardDescription>
            Detailed analysis of email delivery and engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Delivery Funnel */}
          <div className='space-y-4'>
            <h4 className='font-medium'>Email Delivery Funnel</h4>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Emails Sent</span>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-32 rounded-full bg-muted'>
                    <div
                      className='h-2 rounded-full bg-blue-500'
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                  <span className='w-12 text-sm font-medium'>
                    {emailStats.total}
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm'>Successfully Delivered</span>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-32 rounded-full bg-muted'>
                    <div
                      className='h-2 rounded-full bg-green-500'
                      style={{ width: `${rates.deliveryRate}%` }}
                    ></div>
                  </div>
                  <span className='w-12 text-sm font-medium'>
                    {emailStats.delivered}
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm'>Opened by Recipients</span>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-32 rounded-full bg-muted'>
                    <div
                      className='h-2 rounded-full bg-purple-500'
                      style={{ width: `${rates.openRate}%` }}
                    ></div>
                  </div>
                  <span className='w-12 text-sm font-medium'>
                    {emailStats.opened}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='rounded-lg bg-green-50 p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {rates.deliveryRate.toFixed(1)}%
              </div>
              <div className='text-sm text-green-700'>Delivery Rate</div>
              <div className='mt-1 text-xs text-muted-foreground'>
                Industry avg: 85-95%
              </div>
            </div>

            <div className='rounded-lg bg-purple-50 p-4 text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {rates.openRate.toFixed(1)}%
              </div>
              <div className='text-sm text-purple-700'>Open Rate</div>
              <div className='mt-1 text-xs text-muted-foreground'>
                Industry avg: 20-25%
              </div>
            </div>

            <div className='rounded-lg bg-red-50 p-4 text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {rates.bounceRate.toFixed(1)}%
              </div>
              <div className='text-sm text-red-700'>Bounce Rate</div>
              <div className='mt-1 text-xs text-muted-foreground'>
                Target: &lt;2%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Performance */}
      {templatePerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MousePointer className='h-5 w-5' />
              Template Performance
            </CardTitle>
            <CardDescription>
              Performance comparison across different email templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {templatePerformance.map((template) => (
                <div key={template.name} className='rounded-lg border p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <h4 className='font-medium'>{template.name}</h4>
                    <Badge variant='outline'>{template.sent} sent</Badge>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <div className='mb-1 flex items-center justify-between text-sm'>
                        <span>Delivery Rate</span>
                        <span className='font-medium'>
                          {template.deliveryRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={template.deliveryRate} className='h-2' />
                    </div>

                    <div>
                      <div className='mb-1 flex items-center justify-between text-sm'>
                        <span>Open Rate</span>
                        <span className='font-medium'>
                          {template.openRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={template.openRate} className='h-2' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            Recent Email Campaigns
          </CardTitle>
          <CardDescription>
            Latest email campaigns and their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {campaigns.slice(0, 10).map((campaign) => (
              <div
                key={campaign.id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`rounded-full p-2 ${
                      campaign.deliveredCount / campaign.sentCount >= 0.9
                        ? 'bg-green-100'
                        : 'bg-yellow-100'
                    }`}
                  >
                    {campaign.deliveredCount / campaign.sentCount >= 0.9 ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <AlertCircle className='h-4 w-4 text-yellow-600' />
                    )}
                  </div>
                  <div>
                    <div className='text-sm font-medium'>{campaign.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {campaign.sentDate.toLocaleDateString()} •{' '}
                      {campaign.templateName}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-4 text-sm'>
                  <div className='text-center'>
                    <div className='font-medium'>{campaign.sentCount}</div>
                    <div className='text-xs text-muted-foreground'>Sent</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-green-600'>
                      {campaign.deliveredCount}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Delivered
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-purple-600'>
                      {campaign.openedCount}
                    </div>
                    <div className='text-xs text-muted-foreground'>Opened</div>
                  </div>
                  {campaign.bouncedCount > 0 && (
                    <div className='text-center'>
                      <div className='font-medium text-red-600'>
                        {campaign.bouncedCount}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Bounced
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {campaigns.length === 0 && (
              <div className='py-8 text-center text-muted-foreground'>
                <Mail className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No email campaigns yet</p>
                <p className='text-sm'>
                  Send some emails to see analytics here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalytics;
