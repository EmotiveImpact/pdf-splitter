'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  CreditCard,
  Target,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface CRMStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  pendingTasks: number;
  recentCommunications: number;
  conversionRate: number;
  customerSatisfaction: number;
}

interface RecentActivity {
  id: string;
  type: 'communication' | 'payment' | 'invoice' | 'task';
  clientName: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'overdue';
  amount?: number;
}

interface UpcomingTask {
  id: string;
  title: string;
  clientName: string;
  dueDate: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'follow_up' | 'call' | 'email' | 'meeting' | 'payment_reminder';
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    setIsLoading(true);
    try {
      // Mock CRM data - in real app, this would come from API
      const mockStats: CRMStats = {
        totalClients: 1247,
        activeClients: 1156,
        totalRevenue: 2847650, // $28,476.50 in cents
        monthlyRevenue: 234580, // $2,345.80 in cents
        outstandingInvoices: 156,
        overdueInvoices: 23,
        pendingTasks: 45,
        recentCommunications: 89,
        conversionRate: 68.5,
        customerSatisfaction: 4.7
      };

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'payment',
          clientName: 'John Smith',
          description: 'Payment received for Invoice #INV-2025-001',
          timestamp: new Date('2025-01-21T10:30:00'),
          status: 'completed',
          amount: 125000 // $1,250.00 in cents
        },
        {
          id: '2',
          type: 'communication',
          clientName: 'Sarah Johnson',
          description: 'Responded to billing inquiry via email',
          timestamp: new Date('2025-01-21T09:15:00'),
          status: 'completed'
        },
        {
          id: '3',
          type: 'invoice',
          clientName: 'Bob Wilson',
          description: 'Invoice #INV-2025-045 sent',
          timestamp: new Date('2025-01-21T08:45:00'),
          status: 'pending',
          amount: 89500 // $895.00 in cents
        },
        {
          id: '4',
          type: 'task',
          clientName: 'Maria Garcia',
          description: 'Follow-up call scheduled',
          timestamp: new Date('2025-01-20T16:20:00'),
          status: 'pending'
        },
        {
          id: '5',
          type: 'communication',
          clientName: 'David Chen',
          description: 'Inbound support email received',
          timestamp: new Date('2025-01-20T14:10:00'),
          status: 'pending'
        }
      ];

      const mockTasks: UpcomingTask[] = [
        {
          id: '1',
          title: 'Follow-up on overdue payment',
          clientName: 'Bob Wilson',
          dueDate: new Date('2025-01-22'),
          priority: 'high',
          type: 'payment_reminder'
        },
        {
          id: '2',
          title: 'Quarterly business review call',
          clientName: 'Sarah Johnson',
          dueDate: new Date('2025-01-23'),
          priority: 'normal',
          type: 'call'
        },
        {
          id: '3',
          title: 'Send monthly statement',
          clientName: 'John Smith',
          dueDate: new Date('2025-01-24'),
          priority: 'normal',
          type: 'email'
        },
        {
          id: '4',
          title: 'Contract renewal discussion',
          clientName: 'Maria Garcia',
          dueDate: new Date('2025-01-25'),
          priority: 'urgent',
          type: 'meeting'
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      setUpcomingTasks(mockTasks);

      toast({
        title: 'CRM data loaded',
        description: 'Dashboard updated with latest information.'
      });
    } catch (error) {
      console.error('Error loading CRM data:', error);
      toast({
        title: 'Error loading CRM data',
        description: 'Failed to load dashboard information.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'communication':
        return <MessageSquare className='h-4 w-4' />;
      case 'payment':
        return <CreditCard className='h-4 w-4' />;
      case 'invoice':
        return <FileText className='h-4 w-4' />;
      case 'task':
        return <Calendar className='h-4 w-4' />;
      default:
        return <FileText className='h-4 w-4' />;
    }
  };

  const getTaskIcon = (type: UpcomingTask['type']) => {
    switch (type) {
      case 'call':
        return <Phone className='h-4 w-4' />;
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'meeting':
        return <Calendar className='h-4 w-4' />;
      case 'payment_reminder':
        return <DollarSign className='h-4 w-4' />;
      case 'follow_up':
        return <Target className='h-4 w-4' />;
      default:
        return <Calendar className='h-4 w-4' />;
    }
  };

  const getPriorityColor = (priority: UpcomingTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: RecentActivity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'overdue':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
          <span className='ml-2 text-muted-foreground'>
            Loading CRM dashboard...
          </span>
        </div>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <div className='py-8 text-center'>
          <BarChart3 className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-medium'>No CRM data available</h3>
          <p className='text-muted-foreground'>
            Start managing customers to see your CRM dashboard.
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
            <h1 className='text-3xl font-bold'>CRM Dashboard</h1>
            <p className='text-muted-foreground'>
              Complete customer relationship management and business overview
            </p>
          </div>
          <Button onClick={loadCRMData} variant='outline'>
            <BarChart3 className='mr-2 h-4 w-4' />
            Refresh Data
          </Button>
        </div>

        {/* Key Metrics */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Users className='h-4 w-4' />
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalClients.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.activeClients.toLocaleString()} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <DollarSign className='h-4 w-4' />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(stats.monthlyRevenue)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <FileText className='h-4 w-4' />
                Outstanding Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.outstandingInvoices}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.overdueInvoices} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                <Calendar className='h-4 w-4' />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {stats.pendingTasks}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.recentCommunications} communications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                <div className='text-2xl font-bold text-indigo-600'>
                  {stats.conversionRate}%
                </div>
                <TrendingUp className='h-4 w-4 text-green-600' />
                <span className='text-xs text-green-600'>+5.2%</span>
              </div>
              <p className='text-xs text-muted-foreground'>
                Lead to customer conversion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2'>
                <div className='text-2xl font-bold text-pink-600'>
                  {stats.customerSatisfaction}/5.0
                </div>
                <TrendingUp className='h-4 w-4 text-green-600' />
                <span className='text-xs text-green-600'>+0.3</span>
              </div>
              <p className='text-xs text-muted-foreground'>
                Average rating from surveys
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue='activities' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='activities'>Recent Activities</TabsTrigger>
            <TabsTrigger value='tasks'>Upcoming Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value='activities'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5' />
                  Recent Activities ({recentActivities.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className='flex items-center justify-between rounded-lg bg-muted/50 p-4'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2'>
                          {getActivityIcon(activity.type)}
                          {getStatusIcon(activity.status)}
                        </div>
                        <div>
                          <div className='font-medium'>
                            {activity.clientName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {activity.description}
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        {activity.amount && (
                          <div className='font-medium text-green-600'>
                            {formatCurrency(activity.amount)}
                          </div>
                        )}
                        <div className='text-xs text-muted-foreground'>
                          {activity.timestamp.toLocaleDateString()}{' '}
                          {activity.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='tasks'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='h-5 w-5' />
                  Upcoming Tasks ({upcomingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className='flex items-center justify-between rounded-lg bg-muted/50 p-4'
                    >
                      <div className='flex items-center gap-3'>
                        {getTaskIcon(task.type)}
                        <div>
                          <div className='font-medium'>{task.title}</div>
                          <div className='text-sm text-muted-foreground'>
                            {task.clientName}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <div className='text-sm text-muted-foreground'>
                          {task.dueDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
