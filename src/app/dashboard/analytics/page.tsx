'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  FileText,
  Clock,
  Download
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analyticsManager, type SystemMetrics } from '@/lib/analyticsManager';
import ExecutiveOverview from '@/components/analytics/ExecutiveOverview';
import ProcessingAnalytics from '@/components/analytics/ProcessingAnalytics';
import EmailAnalytics from '@/components/analytics/EmailAnalytics';
import CustomerInsights from '@/components/analytics/CustomerInsights';
import RecentActivity from '@/components/analytics/RecentActivity';
import ReportsExports from '@/components/analytics/ReportsExports';
import PageContainer from '@/components/layout/page-container';

const AnalyticsPage = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(
    analyticsManager.getSystemMetrics()
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics(analyticsManager.getSystemMetrics());
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <PageContainer scrollable={true}>
        <div className='flex h-64 items-center justify-center'>
          <div className='text-center'>
            <BarChart3 className='mx-auto mb-4 h-12 w-12 animate-pulse text-muted-foreground' />
            <p className='text-muted-foreground'>Loading analytics data...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='flex items-center gap-3 text-3xl font-bold'>
              <BarChart3 className='h-8 w-8 text-blue-600' />
              Analytics Dashboard
            </h1>
            <p className='text-muted-foreground'>
              Comprehensive insights into your ClientCore operations
            </p>
          </div>

          <div className='flex items-center gap-4'>
            <Badge className='bg-blue-100 text-blue-700'>Live Data</Badge>
            <div className='text-right'>
              <div className='text-sm text-muted-foreground'>Last Updated</div>
              <div className='text-sm font-medium'>
                {systemMetrics.lastUpdated.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    PDFs Processed
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {formatNumber(systemMetrics.totalPDFsProcessed)}
                  </p>
                </div>
                <FileText className='h-8 w-8 text-blue-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-green-600'>
                <TrendingUp className='mr-1 h-3 w-3' />
                {systemMetrics.successRate.toFixed(1)}% success rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Emails Sent
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    {formatNumber(systemMetrics.totalEmailsSent)}
                  </p>
                </div>
                <Mail className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-green-600'>
                <TrendingUp className='mr-1 h-3 w-3' />
                Professional delivery
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Customers Served
                  </p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {formatNumber(systemMetrics.totalCustomers)}
                  </p>
                </div>
                <Users className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-purple-600'>
                <TrendingUp className='mr-1 h-3 w-3' />
                Growing customer base
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Time Saved
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {formatTime(systemMetrics.totalTimeSaved)}
                  </p>
                </div>
                <Clock className='h-8 w-8 text-orange-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-orange-600'>
                <TrendingUp className='mr-1 h-3 w-3' />
                Automation efficiency
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analytics</CardTitle>
            <CardDescription>
              Comprehensive insights into your business operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-6'>
                <TabsTrigger
                  value='overview'
                  className='flex items-center gap-2'
                >
                  <BarChart3 className='h-4 w-4' />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value='processing'
                  className='flex items-center gap-2'
                >
                  <FileText className='h-4 w-4' />
                  Processing
                </TabsTrigger>
                <TabsTrigger value='emails' className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  Emails
                </TabsTrigger>
                <TabsTrigger
                  value='customers'
                  className='flex items-center gap-2'
                >
                  <Users className='h-4 w-4' />
                  Customers
                </TabsTrigger>
                <TabsTrigger
                  value='activity'
                  className='flex items-center gap-2'
                >
                  <Clock className='h-4 w-4' />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value='reports'
                  className='flex items-center gap-2'
                >
                  <Download className='h-4 w-4' />
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='mt-6 space-y-6'>
                <ExecutiveOverview />
              </TabsContent>

              <TabsContent value='processing' className='mt-6 space-y-6'>
                <ProcessingAnalytics />
              </TabsContent>

              <TabsContent value='emails' className='mt-6 space-y-6'>
                <EmailAnalytics />
              </TabsContent>

              <TabsContent value='customers' className='mt-6 space-y-6'>
                <CustomerInsights />
              </TabsContent>

              <TabsContent value='activity' className='mt-6 space-y-6'>
                <RecentActivity />
              </TabsContent>

              <TabsContent value='reports' className='mt-6 space-y-6'>
                <ReportsExports />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card className='border-blue-200 bg-blue-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-3'>
              <TrendingUp className='mt-0.5 h-5 w-5 text-blue-600' />
              <div className='space-y-2'>
                <h4 className='font-medium text-blue-800'>
                  Performance Insights
                </h4>
                <div className='space-y-1 text-sm text-blue-700'>
                  <p>
                    • Average processing time:{' '}
                    {systemMetrics.averageProcessingTime.toFixed(1)} seconds per
                    PDF
                  </p>
                  <p>
                    • Success rate: {systemMetrics.successRate.toFixed(1)}% -
                    Excellent performance!
                  </p>
                  <p>
                    • Time savings: {formatTime(systemMetrics.totalTimeSaved)}{' '}
                    through automation
                  </p>
                  <p>
                    • Customer satisfaction: Professional email delivery to{' '}
                    {systemMetrics.totalCustomers} customers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AnalyticsPage;
