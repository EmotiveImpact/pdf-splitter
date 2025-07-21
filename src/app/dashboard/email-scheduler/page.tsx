'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Users,
  Mail,
  RefreshCw,
  CalendarDays,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  count: number;
  criteria: {
    status?: 'active' | 'inactive' | 'all';
    emailEnabled?: boolean;
    location?: string;
    accountType?: string;
    lastActivityDays?: number;
  };
}

interface ScheduledCampaign {
  id: string;
  name: string;
  subject: string;
  templateName: string;
  recipientSegment: CustomerSegment;
  scheduledDate: Date;
  scheduledTime: string;
  timezone: string;
  status: 'scheduled' | 'paused' | 'sent' | 'cancelled';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  createdBy: string;
  createdAt: Date;
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' }
];

const frequencies = [
  { value: 'once', label: 'Send Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

// Predefined customer segments with realistic counts
const predefinedSegments: CustomerSegment[] = [
  {
    id: 'all-active',
    name: 'All Active Customers',
    description:
      'All customers with active status and email notifications enabled',
    count: 1247,
    criteria: { status: 'active', emailEnabled: true }
  },
  {
    id: 'email-enabled',
    name: 'Email Enabled Only',
    description: 'Customers who have opted in to email communications',
    count: 1156,
    criteria: { emailEnabled: true }
  },
  {
    id: 'overdue-payments',
    name: 'Overdue Payments',
    description: 'Customers with outstanding payment obligations',
    count: 156,
    criteria: { status: 'active', accountType: 'overdue' }
  },
  {
    id: 'new-customers',
    name: 'New Customers (Last 30 Days)',
    description: 'Recently onboarded customers within the past month',
    count: 45,
    criteria: { status: 'active', lastActivityDays: 30 }
  },
  {
    id: 'vip-customers',
    name: 'VIP Customers',
    description: 'High-value customers with premium account status',
    count: 89,
    criteria: { status: 'active', accountType: 'vip' }
  },
  {
    id: 'inactive-customers',
    name: 'Inactive Customers',
    description: "Customers who haven't been active recently",
    count: 234,
    criteria: { status: 'inactive', emailEnabled: true }
  }
];

export default function EmailSchedulerPage() {
  const [scheduledCampaigns, setScheduledCampaigns] = useState<
    ScheduledCampaign[]
  >([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<ScheduledCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for creating/editing scheduled campaigns
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    templateName: '',
    selectedSegment: predefinedSegments[0], // Default to "All Active Customers"
    scheduledDate: '',
    scheduledTime: '',
    timezone: 'America/New_York',
    frequency: 'once' as ScheduledCampaign['frequency']
  });

  useEffect(() => {
    loadScheduledCampaigns();
  }, []);

  const loadScheduledCampaigns = () => {
    setIsLoading(true);
    try {
      // Mock scheduled campaign data - in real app, this would come from API
      const mockCampaigns: ScheduledCampaign[] = [
        {
          id: '1',
          name: 'February 2025 Statements',
          subject: 'Your February 2025 Statement is Ready',
          templateName: 'Monthly Statement Ready',
          recipientSegment: predefinedSegments[0], // All Active Customers
          scheduledDate: new Date('2025-02-20'),
          scheduledTime: '10:30',
          timezone: 'America/New_York',
          status: 'scheduled',
          frequency: 'once',
          createdBy: 'John Smith',
          createdAt: new Date('2025-01-15')
        },
        {
          id: '2',
          name: 'Weekly Newsletter',
          subject: 'ClientCore Weekly Update - {{weekOf}}',
          templateName: 'Weekly Newsletter',
          recipientSegment: predefinedSegments[1], // Email Enabled Only
          scheduledDate: new Date('2025-01-27'),
          scheduledTime: '09:00',
          timezone: 'America/New_York',
          status: 'scheduled',
          frequency: 'weekly',
          createdBy: 'Sarah Johnson',
          createdAt: new Date('2025-01-10')
        },
        {
          id: '3',
          name: 'Payment Reminder Campaign',
          subject: 'Friendly Reminder: Payment Due Soon',
          templateName: 'Payment Reminder',
          recipientSegment: predefinedSegments[2], // Overdue Payments
          scheduledDate: new Date('2025-01-25'),
          scheduledTime: '14:00',
          timezone: 'America/Chicago',
          status: 'paused',
          frequency: 'monthly',
          createdBy: 'Mike Wilson',
          createdAt: new Date('2025-01-05')
        },
        {
          id: '4',
          name: 'Welcome Series - Day 3',
          subject: 'Getting Started with ClientCore Features',
          templateName: 'Welcome Series Day 3',
          recipientSegment: predefinedSegments[3], // New Customers
          scheduledDate: new Date('2025-01-24'),
          scheduledTime: '11:00',
          timezone: 'America/Los_Angeles',
          status: 'sent',
          frequency: 'once',
          createdBy: 'Admin',
          createdAt: new Date('2025-01-20')
        }
      ];

      setScheduledCampaigns(mockCampaigns);
      toast({
        title: 'Scheduled campaigns loaded',
        description: `Loaded ${mockCampaigns.length} scheduled campaigns.`
      });
    } catch (error) {
      console.error('Error loading scheduled campaigns:', error);
      toast({
        title: 'Error loading campaigns',
        description: 'Failed to load scheduled campaigns.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    if (
      !formData.name ||
      !formData.subject ||
      !formData.scheduledDate ||
      !formData.scheduledTime
    ) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newCampaign: ScheduledCampaign = {
      id: Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      templateName: formData.templateName || 'Custom Template',
      recipientSegment: formData.selectedSegment,
      scheduledDate: new Date(formData.scheduledDate),
      scheduledTime: formData.scheduledTime,
      timezone: formData.timezone,
      status: 'scheduled',
      frequency: formData.frequency,
      createdBy: 'Current User',
      createdAt: new Date()
    };

    setScheduledCampaigns((prev) => [newCampaign, ...prev]);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: 'Campaign scheduled',
      description: `"${formData.name}" has been scheduled successfully.`
    });
  };

  const handleEditCampaign = (campaign: ScheduledCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      templateName: campaign.templateName,
      selectedSegment: campaign.recipientSegment,
      scheduledDate: campaign.scheduledDate.toISOString().split('T')[0],
      scheduledTime: campaign.scheduledTime,
      timezone: campaign.timezone,
      frequency: campaign.frequency
    });
  };

  const handleUpdateCampaign = () => {
    if (
      !editingCampaign ||
      !formData.name ||
      !formData.subject ||
      !formData.scheduledDate ||
      !formData.scheduledTime
    ) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setScheduledCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === editingCampaign.id
          ? {
              ...campaign,
              name: formData.name,
              subject: formData.subject,
              templateName: formData.templateName,
              recipientSegment: formData.selectedSegment,
              scheduledDate: new Date(formData.scheduledDate),
              scheduledTime: formData.scheduledTime,
              timezone: formData.timezone,
              frequency: formData.frequency
            }
          : campaign
      )
    );

    setEditingCampaign(null);
    resetForm();

    toast({
      title: 'Campaign updated',
      description: `"${formData.name}" has been updated successfully.`
    });
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setScheduledCampaigns((prev) =>
      prev.filter((campaign) => campaign.id !== campaignId)
    );
    toast({
      title: 'Campaign deleted',
      description: 'Scheduled campaign has been deleted successfully.'
    });
  };

  const handleToggleCampaignStatus = (campaignId: string) => {
    setScheduledCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status:
                campaign.status === 'scheduled'
                  ? 'paused'
                  : ('scheduled' as ScheduledCampaign['status'])
            }
          : campaign
      )
    );

    const campaign = scheduledCampaigns.find((c) => c.id === campaignId);
    const newStatus = campaign?.status === 'scheduled' ? 'paused' : 'scheduled';

    toast({
      title: `Campaign ${newStatus}`,
      description: `Campaign has been ${newStatus} successfully.`
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      templateName: '',
      selectedSegment: predefinedSegments[0], // Reset to default segment
      scheduledDate: '',
      scheduledTime: '',
      timezone: 'America/New_York',
      frequency: 'once'
    });
  };

  const getStatusBadge = (status: ScheduledCampaign['status']) => {
    const statusConfig = {
      scheduled: {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: 'Scheduled'
      },
      paused: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Pause,
        label: 'Paused'
      },
      sent: { color: 'bg-green-100 text-green-800', icon: Mail, label: 'Sent' },
      cancelled: {
        color: 'bg-red-100 text-red-800',
        icon: Trash2,
        label: 'Cancelled'
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

  const getFrequencyBadge = (frequency: ScheduledCampaign['frequency']) => {
    const colors = {
      once: 'bg-gray-100 text-gray-800',
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[frequency]}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  const getUpcomingCampaigns = () => {
    const now = new Date();
    return scheduledCampaigns.filter(
      (campaign) =>
        campaign.status === 'scheduled' && campaign.scheduledDate >= now
    ).length;
  };

  const getPausedCampaigns = () => {
    return scheduledCampaigns.filter((campaign) => campaign.status === 'paused')
      .length;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading scheduled campaigns...
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
            <h1 className='text-3xl font-bold'>Email Scheduler</h1>
            <p className='text-muted-foreground'>
              Schedule and manage automated email campaigns
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Schedule Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Schedule New Campaign</DialogTitle>
                <DialogDescription>
                  Set up an automated email campaign with custom timing and
                  frequency
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                {/* Recipient Count Display */}
                <div className='rounded-lg bg-blue-50 p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-blue-900'>
                        Selected Recipients
                      </h4>
                      <p className='text-sm text-blue-700'>
                        {formData.selectedSegment.name}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {formData.selectedSegment.count.toLocaleString()}
                      </div>
                      <div className='text-xs text-blue-600'>recipients</div>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='campaignName'>Campaign Name</Label>
                    <Input
                      id='campaignName'
                      placeholder='e.g., Monthly Newsletter'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='templateName'>Template</Label>
                    <Input
                      id='templateName'
                      placeholder='e.g., Newsletter Template'
                      value={formData.templateName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          templateName: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='subject'>Email Subject</Label>
                  <Input
                    id='subject'
                    placeholder='e.g., Your Monthly Update from ClientCore'
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value
                      }))
                    }
                  />
                </div>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <Label htmlFor='scheduledDate'>Date</Label>
                    <Input
                      id='scheduledDate'
                      type='date'
                      value={formData.scheduledDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduledDate: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='scheduledTime'>Time</Label>
                    <Input
                      id='scheduledTime'
                      type='time'
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          scheduledTime: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='timezone'>Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, timezone: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='frequency'>Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          frequency: value as ScheduledCampaign['frequency']
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='customerSegment'>Customer Segment</Label>
                    <Select
                      value={formData.selectedSegment.id}
                      onValueChange={(value) => {
                        const segment = predefinedSegments.find(
                          (s) => s.id === value
                        );
                        if (segment) {
                          setFormData((prev) => ({
                            ...prev,
                            selectedSegment: segment
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedSegments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            <div className='flex w-full items-center justify-between'>
                              <span>{segment.name}</span>
                              <Badge variant='secondary' className='ml-2'>
                                {segment.count.toLocaleString()} recipients
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {formData.selectedSegment.description}
                    </p>
                  </div>
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign}>
                    <Calendar className='mr-2 h-4 w-4' />
                    Schedule Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {scheduledCampaigns.length}
              </div>
              <p className='text-xs text-muted-foreground'>All campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {getUpcomingCampaigns()}
              </div>
              <p className='text-xs text-muted-foreground'>Ready to send</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Paused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {getPausedCampaigns()}
              </div>
              <p className='text-xs text-muted-foreground'>
                Temporarily stopped
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {
                  scheduledCampaigns.filter((c) => {
                    const now = new Date();
                    const weekFromNow = new Date(
                      now.getTime() + 7 * 24 * 60 * 60 * 1000
                    );
                    return (
                      c.scheduledDate >= now &&
                      c.scheduledDate <= weekFromNow &&
                      c.status === 'scheduled'
                    );
                  }).length
                }
              </div>
              <p className='text-xs text-muted-foreground'>Next 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarDays className='h-5 w-5' />
              Scheduled Campaigns ({scheduledCampaigns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledCampaigns.length === 0 ? (
              <div className='py-8 text-center'>
                <Calendar className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>
                  No scheduled campaigns
                </h3>
                <p className='mb-4 text-muted-foreground'>
                  Create your first scheduled campaign to automate your email
                  marketing
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Schedule Your First Campaign
                </Button>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledCampaigns.map((campaign) => (
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
                        <TableCell>
                          <div className='text-sm'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {campaign.scheduledDate.toLocaleDateString()}
                            </div>
                            <div className='flex items-center gap-1 text-muted-foreground'>
                              <Clock className='h-3 w-3' />
                              {campaign.scheduledTime}{' '}
                              {campaign.timezone.split('/')[1]}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getFrequencyBadge(campaign.frequency)}
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div className='font-medium'>
                              {campaign.recipientSegment.name}
                            </div>
                            <div className='flex items-center gap-1 text-muted-foreground'>
                              <Users className='h-3 w-3' />
                              {campaign.recipientSegment.count.toLocaleString()}{' '}
                              recipients
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            {(campaign.status === 'scheduled' ||
                              campaign.status === 'paused') && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleToggleCampaignStatus(campaign.id)
                                }
                              >
                                {campaign.status === 'scheduled' ? (
                                  <Pause className='h-4 w-4' />
                                ) : (
                                  <Play className='h-4 w-4' />
                                )}
                              </Button>
                            )}
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className='h-4 w-4' />
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

        {/* Edit Campaign Dialog */}
        <Dialog
          open={!!editingCampaign}
          onOpenChange={() => setEditingCampaign(null)}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Scheduled Campaign</DialogTitle>
              <DialogDescription>
                Update your scheduled campaign settings
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editCampaignName'>Campaign Name</Label>
                  <Input
                    id='editCampaignName'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='editTemplateName'>Template</Label>
                  <Input
                    id='editTemplateName'
                    value={formData.templateName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        templateName: e.target.value
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='editSubject'>Email Subject</Label>
                <Input
                  id='editSubject'
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value
                    }))
                  }
                />
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='editScheduledDate'>Date</Label>
                  <Input
                    id='editScheduledDate'
                    type='date'
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledDate: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='editScheduledTime'>Time</Label>
                  <Input
                    id='editScheduledTime'
                    type='time'
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledTime: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='editTimezone'>Timezone</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editFrequency'>Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        frequency: value as ScheduledCampaign['frequency']
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='editCustomerSegment'>Customer Segment</Label>
                  <Select
                    value={formData.selectedSegment.id}
                    onValueChange={(value) => {
                      const segment = predefinedSegments.find(
                        (s) => s.id === value
                      );
                      if (segment) {
                        setFormData((prev) => ({
                          ...prev,
                          selectedSegment: segment
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedSegments.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id}>
                          <div className='flex w-full items-center justify-between'>
                            <span>{segment.name}</span>
                            <Badge variant='secondary' className='ml-2'>
                              {segment.count.toLocaleString()} recipients
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {formData.selectedSegment.description}
                  </p>
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setEditingCampaign(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateCampaign}>
                  <Calendar className='mr-2 h-4 w-4' />
                  Update Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
