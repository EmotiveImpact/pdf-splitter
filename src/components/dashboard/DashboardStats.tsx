'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Mail,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  MessageSquare,
  Calendar
} from 'lucide-react';
import {
  DashboardDataService,
  DashboardStats
} from '@/lib/dashboardDataService';

export default function DashboardStatsComponent() {
  const [stats, setStats] = useState<DashboardStats>({
    pdfsProcessed: 0,
    emailsSent: 0,
    activeClients: 0,
    timeSavedHours: 0,
    pdfsGrowth: 0,
    emailsGrowth: 0,
    clientsGrowth: 0,
    efficiencyGain: 0,
    // New CRM metrics
    totalRevenue: 0,
    monthlyRevenue: 0,
    outstandingInvoices: 0,
    pendingTasks: 0,
    recentCommunications: 0,
    revenueGrowth: 0,
    invoiceGrowth: 0,
    taskCompletionRate: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = () => {
      try {
        const dashboardStats = DashboardDataService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load stats immediately
    loadStats();

    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatGrowth = (growth: number) => {
    if (growth === 0) return 'No activity yet';
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth}% from usage`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth === 0) return null;
    return growth > 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth: number) => {
    if (growth === 0) return 'text-muted-foreground';
    return growth > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Loading...</CardTitle>
              <div className='h-4 w-4 animate-pulse rounded bg-muted' />
            </CardHeader>
            <CardContent>
              <div className='mb-2 h-8 w-16 animate-pulse rounded bg-muted text-2xl font-bold' />
              <div className='h-4 w-24 animate-pulse rounded bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>PDFs Processed</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>
            {stats.pdfsProcessed.toLocaleString()}
          </div>
          <p className={`text-xs ${getGrowthColor(stats.pdfsGrowth)}`}>
            {getGrowthIcon(stats.pdfsGrowth) && (
              <TrendingUp className='mr-1 inline h-3 w-3' />
            )}
            {formatGrowth(stats.pdfsGrowth)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Emails Sent</CardTitle>
          <Mail className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {stats.emailsSent.toLocaleString()}
          </div>
          <p className={`text-xs ${getGrowthColor(stats.emailsGrowth)}`}>
            {getGrowthIcon(stats.emailsGrowth) && (
              <TrendingUp className='mr-1 inline h-3 w-3' />
            )}
            {formatGrowth(stats.emailsGrowth)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Clients</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-purple-600'>
            {stats.activeClients.toLocaleString()}
          </div>
          <p className={`text-xs ${getGrowthColor(stats.clientsGrowth)}`}>
            {getGrowthIcon(stats.clientsGrowth) && (
              <TrendingUp className='mr-1 inline h-3 w-3' />
            )}
            {formatGrowth(stats.clientsGrowth)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Time Saved</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-orange-600'>
            {stats.timeSavedHours}h
          </div>
          <p className={`text-xs ${getGrowthColor(stats.efficiencyGain)}`}>
            {getGrowthIcon(stats.efficiencyGain) && (
              <TrendingUp className='mr-1 inline h-3 w-3' />
            )}
            {stats.efficiencyGain > 0
              ? `+${stats.efficiencyGain}% efficiency gain`
              : 'Start processing to see savings'}
          </p>
        </CardContent>
      </Card>

      {/* CRM Metrics */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {formatCurrency(stats.totalRevenue || 0)}
          </div>
          <p className={`text-xs ${getGrowthColor(stats.revenueGrowth || 0)}`}>
            {getGrowthIcon(stats.revenueGrowth || 0) && (
              <TrendingUp className='mr-1 inline h-3 w-3' />
            )}
            {formatGrowth(stats.revenueGrowth || 0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Outstanding Invoices
          </CardTitle>
          <CreditCard className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-yellow-600'>
            {(stats.outstandingInvoices || 0).toLocaleString()}
          </div>
          <p className={`text-xs ${getGrowthColor(stats.invoiceGrowth || 0)}`}>
            {getGrowthIcon(stats.invoiceGrowth || 0) && (
              <TrendingUp className='mr-1 inline h-3 w-3' />
            )}
            {formatGrowth(stats.invoiceGrowth || 0)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Communications</CardTitle>
          <MessageSquare className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-indigo-600'>
            {(stats.recentCommunications || 0).toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>Recent interactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Pending Tasks</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-purple-600'>
            {(stats.pendingTasks || 0).toLocaleString()}
          </div>
          <p className='text-xs text-muted-foreground'>
            {stats.taskCompletionRate || 0}% completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
