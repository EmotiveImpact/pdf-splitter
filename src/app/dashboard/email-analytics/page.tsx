'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Mail,
  Users,
  Eye,
  MousePointer,
  XCircle,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface AnalyticsData {
  totalCampaigns: number;
  totalRecipients: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  clickToOpenRate: number;
}

interface TrendData {
  period: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface TopPerformer {
  name: string;
  metric: string;
  value: number;
  change: number;
}

export default function EmailAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    setIsLoading(true);
    try {
      // Mock analytics data - in real app, this would come from API
      const mockAnalytics: AnalyticsData = {
        totalCampaigns: 24,
        totalRecipients: 5234,
        totalSent: 5234,
        totalDelivered: 5156,
        totalOpened: 3421,
        totalClicked: 1234,
        totalBounced: 78,
        totalUnsubscribed: 23,
        deliveryRate: 98.5,
        openRate: 66.4,
        clickRate: 36.1,
        bounceRate: 1.5,
        unsubscribeRate: 0.4,
        clickToOpenRate: 54.3
      };

      const mockTrends: TrendData[] = [
        {
          period: 'Week 1',
          sent: 1200,
          delivered: 1185,
          opened: 789,
          clicked: 285,
          bounced: 15
        },
        {
          period: 'Week 2',
          sent: 1350,
          delivered: 1332,
          opened: 912,
          clicked: 334,
          bounced: 18
        },
        {
          period: 'Week 3',
          sent: 1100,
          delivered: 1089,
          opened: 723,
          clicked: 267,
          bounced: 11
        },
        {
          period: 'Week 4',
          sent: 1584,
          delivered: 1550,
          opened: 997,
          clicked: 348,
          bounced: 34
        }
      ];

      const mockTopPerformers: TopPerformer[] = [
        {
          name: 'Welcome New Customer',
          metric: 'Open Rate',
          value: 84.4,
          change: 12.3
        },
        {
          name: 'Payment Reminder',
          metric: 'Click Rate',
          value: 68.4,
          change: -5.2
        },
        {
          name: 'Monthly Statement Ready',
          metric: 'Delivery Rate',
          value: 99.2,
          change: 2.1
        },
        {
          name: 'Service Update Notification',
          metric: 'Engagement',
          value: 76.8,
          change: 8.7
        }
      ];

      setAnalytics(mockAnalytics);
      setTrends(mockTrends);
      setTopPerformers(mockTopPerformers);

      toast({
        title: 'Analytics loaded',
        description: `Email analytics for ${timeRange} period loaded successfully.`
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error loading analytics',
        description: 'Failed to load email analytics data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className='h-3 w-3 text-green-600' />;
    if (change < 0) return <TrendingDown className='h-3 w-3 text-red-600' />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading email analytics...
          </span>
        </div>
      </PageContainer>
    );
  }

  if (!analytics) {
    return (
      <PageContainer>
        <div className='py-8 text-center'>
          <BarChart3 className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-medium'>
            No analytics data available
          </h3>
          <p className='text-muted-foreground'>
            Start sending email campaigns to see analytics here.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Email Analytics</h1>
            <p className='text-muted-foreground'>
              Comprehensive email performance metrics and insights
            </p>
          </div>
          <div className='flex gap-2'>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7d'>Last 7 days</SelectItem>
                <SelectItem value='30d'>Last 30 days</SelectItem>
                <SelectItem value='90d'>Last 90 days</SelectItem>
                <SelectItem value='1y'>Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadAnalytics} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Mail className='h-4 w-4' />
                Total Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {formatNumber(analytics.totalSent)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {analytics.totalCampaigns} campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <CheckCircle className='h-4 w-4' />
                Delivery Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {formatPercentage(analytics.deliveryRate)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatNumber(analytics.totalDelivered)} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Eye className='h-4 w-4' />
                Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {formatPercentage(analytics.openRate)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatNumber(analytics.totalOpened)} opens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <MousePointer className='h-4 w-4' />
                Click Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {formatPercentage(analytics.clickRate)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatNumber(analytics.totalClicked)} clicks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <XCircle className='h-4 w-4' />
                Bounce Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {formatPercentage(analytics.bounceRate)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatNumber(analytics.totalBounced)} bounces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Unsubscribe Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {formatPercentage(analytics.unsubscribeRate)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatNumber(analytics.totalUnsubscribed)} unsubscribes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Click-to-Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-indigo-600'>
                {formatPercentage(analytics.clickToOpenRate)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Engagement quality
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Simple trend visualization */}
              <div className='grid grid-cols-4 gap-4 text-center'>
                {trends.map((trend, index) => (
                  <div key={index} className='rounded-lg bg-muted/50 p-4'>
                    <div className='mb-2 text-sm font-medium'>
                      {trend.period}
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs text-muted-foreground'>
                        Sent: {formatNumber(trend.sent)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Opened: {formatNumber(trend.opened)}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Clicked: {formatNumber(trend.clicked)}
                      </div>
                      <div className='text-xs font-medium text-green-600'>
                        {formatPercentage((trend.opened / trend.sent) * 100)}{' '}
                        open rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Top Performing Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg bg-muted/50 p-4'
                >
                  <div className='flex-1'>
                    <div className='font-medium'>{performer.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {performer.metric}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold'>
                      {formatPercentage(performer.value)}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs ${getChangeColor(performer.change)}`}
                    >
                      {getChangeIcon(performer.change)}
                      {Math.abs(performer.change).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='rounded-lg bg-blue-50 p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 text-blue-600' />
                  <span className='font-medium text-blue-900'>
                    Strong Performance
                  </span>
                </div>
                <p className='text-sm text-blue-800'>
                  Your open rate of {formatPercentage(analytics.openRate)} is
                  above industry average. Consider A/B testing subject lines to
                  push it even higher.
                </p>
              </div>

              <div className='rounded-lg bg-yellow-50 p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <Eye className='h-4 w-4 text-yellow-600' />
                  <span className='font-medium text-yellow-900'>
                    Optimization Opportunity
                  </span>
                </div>
                <p className='text-sm text-yellow-800'>
                  Your click-to-open rate of{' '}
                  {formatPercentage(analytics.clickToOpenRate)} suggests room
                  for improvement in email content and call-to-action placement.
                </p>
              </div>

              <div className='rounded-lg bg-green-50 p-4'>
                <div className='mb-2 flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span className='font-medium text-green-900'>
                    Excellent Deliverability
                  </span>
                </div>
                <p className='text-sm text-green-800'>
                  Your delivery rate of{' '}
                  {formatPercentage(analytics.deliveryRate)} and low bounce rate
                  indicate excellent list hygiene and sender reputation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
