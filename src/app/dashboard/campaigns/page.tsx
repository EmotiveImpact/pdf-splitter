'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  History,
  Search,
  Eye,
  Download,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  templateName: string;
  status: 'sent' | 'scheduled' | 'draft' | 'failed';
  sentAt: Date;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  createdBy: string;
}

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter]);

  const loadCampaigns = () => {
    setIsLoading(true);
    try {
      // Mock campaign data - in real app, this would come from API
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'January 2025 Statements',
          subject: 'Your January 2025 Statement is Ready',
          templateName: 'Monthly Statement Ready',
          status: 'sent',
          sentAt: new Date('2025-01-20T10:30:00'),
          recipientCount: 1247,
          deliveredCount: 1235,
          openedCount: 892,
          clickedCount: 234,
          bouncedCount: 12,
          unsubscribedCount: 3,
          openRate: 72.2,
          clickRate: 26.2,
          bounceRate: 0.96,
          createdBy: 'John Smith'
        },
        {
          id: '2',
          name: 'Welcome Campaign - New Customers',
          subject: 'Welcome to ClientCore - Your Account is Ready!',
          templateName: 'Welcome New Customer',
          status: 'sent',
          sentAt: new Date('2025-01-18T14:15:00'),
          recipientCount: 45,
          deliveredCount: 45,
          openedCount: 38,
          clickedCount: 22,
          bouncedCount: 0,
          unsubscribedCount: 1,
          openRate: 84.4,
          clickRate: 57.9,
          bounceRate: 0,
          createdBy: 'Sarah Johnson'
        },
        {
          id: '3',
          name: 'Payment Reminders - December',
          subject: 'Friendly Reminder: Payment Due',
          templateName: 'Payment Reminder',
          status: 'sent',
          sentAt: new Date('2025-01-15T09:00:00'),
          recipientCount: 156,
          deliveredCount: 152,
          openedCount: 98,
          clickedCount: 67,
          bouncedCount: 4,
          unsubscribedCount: 2,
          openRate: 64.5,
          clickRate: 68.4,
          bounceRate: 2.56,
          createdBy: 'Mike Wilson'
        },
        {
          id: '4',
          name: 'Service Update Notification',
          subject: 'Important Service Update - Enhanced Security',
          templateName: 'Service Update Notification',
          status: 'sent',
          sentAt: new Date('2025-01-12T16:45:00'),
          recipientCount: 2341,
          deliveredCount: 2298,
          openedCount: 1456,
          clickedCount: 423,
          bouncedCount: 43,
          unsubscribedCount: 8,
          openRate: 63.4,
          clickRate: 29.1,
          bounceRate: 1.84,
          createdBy: 'Admin'
        },
        {
          id: '5',
          name: 'February Statements',
          subject: 'Your February 2025 Statement is Ready',
          templateName: 'Monthly Statement Ready',
          status: 'scheduled',
          sentAt: new Date('2025-02-20T10:30:00'),
          recipientCount: 1289,
          deliveredCount: 0,
          openedCount: 0,
          clickedCount: 0,
          bouncedCount: 0,
          unsubscribedCount: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          createdBy: 'John Smith'
        }
      ];

      setCampaigns(mockCampaigns);
      toast({
        title: 'Campaigns loaded',
        description: `Loaded ${mockCampaigns.length} email campaigns.`
      });
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: 'Error loading campaigns',
        description: 'Failed to load campaign history.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.templateName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }

    // Sort by sent date (most recent first)
    filtered.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

    setFilteredCampaigns(filtered);
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      sent: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Sent'
      },
      scheduled: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: 'Scheduled'
      },
      draft: {
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        label: 'Draft'
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Failed'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className='mr-1 h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  const getTotalStats = () => {
    const sentCampaigns = campaigns.filter((c) => c.status === 'sent');
    return {
      totalCampaigns: campaigns.length,
      sentCampaigns: sentCampaigns.length,
      totalRecipients: sentCampaigns.reduce(
        (sum, c) => sum + c.recipientCount,
        0
      ),
      totalDelivered: sentCampaigns.reduce(
        (sum, c) => sum + c.deliveredCount,
        0
      ),
      totalOpened: sentCampaigns.reduce((sum, c) => sum + c.openedCount, 0),
      totalClicked: sentCampaigns.reduce((sum, c) => sum + c.clickedCount, 0),
      avgOpenRate:
        sentCampaigns.length > 0
          ? sentCampaigns.reduce((sum, c) => sum + c.openRate, 0) /
            sentCampaigns.length
          : 0,
      avgClickRate:
        sentCampaigns.length > 0
          ? sentCampaigns.reduce((sum, c) => sum + c.clickRate, 0) /
            sentCampaigns.length
          : 0
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading campaign history...
          </span>
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
            <h1 className='text-3xl font-bold'>Campaign History</h1>
            <p className='text-muted-foreground'>
              Track and analyze your email campaign performance
            </p>
          </div>
          <Button onClick={loadCampaigns} variant='outline'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalCampaigns}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.sentCampaigns} sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats.totalRecipients.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.totalDelivered.toLocaleString()} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Avg Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {stats.avgOpenRate.toFixed(1)}%
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.totalOpened.toLocaleString()} total opens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Avg Click Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.avgClickRate.toFixed(1)}%
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.totalClicked.toLocaleString()} total clicks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Search & Filter Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                  <Input
                    placeholder='Search campaigns by name, subject, or template...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size='sm'
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'sent' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('sent')}
                  size='sm'
                >
                  Sent
                </Button>
                <Button
                  variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('scheduled')}
                  size='sm'
                >
                  Scheduled
                </Button>
                <Button
                  variant={statusFilter === 'draft' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('draft')}
                  size='sm'
                >
                  Draft
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <History className='h-5 w-5' />
              Campaign History ({filteredCampaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCampaigns.length === 0 ? (
              <div className='py-8 text-center'>
                <History className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>No campaigns found</h3>
                <p className='text-muted-foreground'>
                  {campaigns.length === 0
                    ? 'Start sending email campaigns to see your history here'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{campaign.name}</div>
                            <div className='text-sm text-muted-foreground'>
                              {campaign.subject}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>{campaign.templateName}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div>
                              {campaign.recipientCount.toLocaleString()}
                            </div>
                            {campaign.status === 'sent' && (
                              <div className='text-muted-foreground'>
                                {campaign.deliveredCount.toLocaleString()}{' '}
                                delivered
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'sent' ? (
                            <div className='text-sm'>
                              <div className='font-medium'>
                                {campaign.openRate.toFixed(1)}%
                              </div>
                              <div className='text-muted-foreground'>
                                {campaign.openedCount.toLocaleString()} opens
                              </div>
                            </div>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'sent' ? (
                            <div className='text-sm'>
                              <div className='font-medium'>
                                {campaign.clickRate.toFixed(1)}%
                              </div>
                              <div className='text-muted-foreground'>
                                {campaign.clickedCount.toLocaleString()} clicks
                              </div>
                            </div>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div>{campaign.sentAt.toLocaleDateString()}</div>
                            <div className='text-muted-foreground'>
                              {campaign.sentAt.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => setSelectedCampaign(campaign)}
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className='max-w-2xl'>
                                <DialogHeader>
                                  <DialogTitle>{campaign.name}</DialogTitle>
                                  <DialogDescription>
                                    Campaign details and performance metrics
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCampaign && (
                                  <div className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                      <div>
                                        <Label className='text-sm font-medium'>
                                          Subject
                                        </Label>
                                        <p className='text-sm'>
                                          {selectedCampaign.subject}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className='text-sm font-medium'>
                                          Template
                                        </Label>
                                        <p className='text-sm'>
                                          {selectedCampaign.templateName}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className='text-sm font-medium'>
                                          Created By
                                        </Label>
                                        <p className='text-sm'>
                                          {selectedCampaign.createdBy}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className='text-sm font-medium'>
                                          Status
                                        </Label>
                                        <div className='mt-1'>
                                          {getStatusBadge(
                                            selectedCampaign.status
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {selectedCampaign.status === 'sent' && (
                                      <div className='grid grid-cols-3 gap-4'>
                                        <div className='rounded-lg bg-blue-50 p-4 text-center'>
                                          <div className='text-2xl font-bold text-blue-600'>
                                            {selectedCampaign.recipientCount.toLocaleString()}
                                          </div>
                                          <div className='text-sm text-muted-foreground'>
                                            Recipients
                                          </div>
                                        </div>
                                        <div className='rounded-lg bg-green-50 p-4 text-center'>
                                          <div className='text-2xl font-bold text-green-600'>
                                            {selectedCampaign.openRate.toFixed(
                                              1
                                            )}
                                            %
                                          </div>
                                          <div className='text-sm text-muted-foreground'>
                                            Open Rate
                                          </div>
                                        </div>
                                        <div className='rounded-lg bg-purple-50 p-4 text-center'>
                                          <div className='text-2xl font-bold text-purple-600'>
                                            {selectedCampaign.clickRate.toFixed(
                                              1
                                            )}
                                            %
                                          </div>
                                          <div className='text-sm text-muted-foreground'>
                                            Click Rate
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant='ghost' size='sm'>
                              <Download className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
