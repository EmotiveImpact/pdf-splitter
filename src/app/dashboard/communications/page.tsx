'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Mail,
  Phone,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Reply,
  Forward,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface Communication {
  id: string;
  clientId: string;
  clientName: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'sms';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  fromEmail?: string;
  toEmail?: string;
  status:
    | 'draft'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'replied'
    | 'failed'
    | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  hasAttachments: boolean;
  attachmentCount: number;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  repliedAt?: Date;
}

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [filteredCommunications, setFilteredCommunications] = useState<
    Communication[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCommunication, setSelectedCommunication] =
    useState<Communication | null>(null);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for composing new communications
  const [composeData, setComposeData] = useState({
    clientId: '',
    type: 'email' as Communication['type'],
    subject: '',
    content: '',
    priority: 'normal' as Communication['priority']
  });

  useEffect(() => {
    loadCommunications();
  }, []);

  useEffect(() => {
    filterCommunications();
  }, [communications, searchTerm, typeFilter, statusFilter]);

  const loadCommunications = async () => {
    setIsLoading(true);
    try {
      // Mock communication data - in real app, this would come from API
      const mockCommunications: Communication[] = [
        {
          id: '1',
          clientId: 'client-1',
          clientName: 'John Smith',
          type: 'email',
          direction: 'inbound',
          subject: 'Question about January statement',
          content:
            "Hi, I have a question about my January statement. I noticed a charge that I don't recognize. Could you please help me understand what this is for?",
          fromEmail: 'john.smith@email.com',
          toEmail: 'support@clientcore.com',
          status: 'read',
          priority: 'normal',
          hasAttachments: false,
          attachmentCount: 0,
          createdAt: new Date('2025-01-21T10:30:00'),
          sentAt: new Date('2025-01-21T10:30:00'),
          readAt: new Date('2025-01-21T11:15:00')
        },
        {
          id: '2',
          clientId: 'client-2',
          clientName: 'Sarah Johnson',
          type: 'email',
          direction: 'outbound',
          subject: 'Re: Payment confirmation needed',
          content:
            'Thank you for your payment. Your account has been updated and your next statement will reflect the payment.',
          fromEmail: 'support@clientcore.com',
          toEmail: 'sarah.johnson@email.com',
          status: 'delivered',
          priority: 'normal',
          hasAttachments: false,
          attachmentCount: 0,
          createdAt: new Date('2025-01-21T09:45:00'),
          sentAt: new Date('2025-01-21T09:45:00')
        },
        {
          id: '3',
          clientId: 'client-3',
          clientName: 'Bob Wilson',
          type: 'phone',
          direction: 'inbound',
          subject: 'Billing inquiry call',
          content:
            'Customer called regarding overdue payment. Explained payment options and set up payment plan. Follow-up scheduled for next week.',
          status: 'completed',
          priority: 'high',
          hasAttachments: false,
          attachmentCount: 0,
          createdAt: new Date('2025-01-21T08:20:00')
        },
        {
          id: '4',
          clientId: 'client-4',
          clientName: 'Maria Garcia',
          type: 'email',
          direction: 'inbound',
          subject: 'Request for account update',
          content:
            'Please update my mailing address. My new address is: 123 New Street, City, State 12345. Please confirm when this has been updated.',
          fromEmail: 'maria.garcia@email.com',
          toEmail: 'support@clientcore.com',
          status: 'read',
          priority: 'normal',
          hasAttachments: false,
          attachmentCount: 0,
          createdAt: new Date('2025-01-20T16:10:00'),
          sentAt: new Date('2025-01-20T16:10:00'),
          readAt: new Date('2025-01-20T16:45:00')
        },
        {
          id: '5',
          clientId: 'client-5',
          clientName: 'David Chen',
          type: 'email',
          direction: 'inbound',
          subject: 'URGENT: Service interruption',
          content:
            'We are experiencing issues with our service and need immediate assistance. Please contact us as soon as possible.',
          fromEmail: 'david.chen@email.com',
          toEmail: 'support@clientcore.com',
          status: 'read',
          priority: 'urgent',
          hasAttachments: true,
          attachmentCount: 2,
          createdAt: new Date('2025-01-20T14:30:00'),
          sentAt: new Date('2025-01-20T14:30:00'),
          readAt: new Date('2025-01-20T14:35:00')
        }
      ];

      setCommunications(mockCommunications);
      toast({
        title: 'Communications loaded',
        description: `Loaded ${mockCommunications.length} communications.`
      });
    } catch (error) {
      console.error('Error loading communications:', error);
      toast({
        title: 'Error loading communications',
        description: 'Failed to load communication history.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCommunications = () => {
    let filtered = communications;

    if (searchTerm) {
      filtered = filtered.filter(
        (comm) =>
          comm.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comm.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((comm) => comm.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((comm) => comm.status === statusFilter);
    }

    // Sort by created date (most recent first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    setFilteredCommunications(filtered);
  };

  const handleCompose = () => {
    if (!composeData.clientId || !composeData.subject || !composeData.content) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newCommunication: Communication = {
      id: Date.now().toString(),
      clientId: composeData.clientId,
      clientName: 'Selected Client', // In real app, would lookup client name
      type: composeData.type,
      direction: 'outbound',
      subject: composeData.subject,
      content: composeData.content,
      status: 'sent',
      priority: composeData.priority,
      hasAttachments: false,
      attachmentCount: 0,
      createdAt: new Date(),
      sentAt: new Date()
    };

    setCommunications((prev) => [newCommunication, ...prev]);
    setIsComposeDialogOpen(false);
    resetComposeForm();

    toast({
      title: 'Communication sent',
      description: `${composeData.type} sent successfully.`
    });
  };

  const resetComposeForm = () => {
    setComposeData({
      clientId: '',
      type: 'email',
      subject: '',
      content: '',
      priority: 'normal'
    });
  };

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'phone':
        return <Phone className='h-4 w-4' />;
      case 'sms':
        return <MessageSquare className='h-4 w-4' />;
      case 'meeting':
        return <Calendar className='h-4 w-4' />;
      case 'note':
        return <MessageSquare className='h-4 w-4' />;
      default:
        return <MessageSquare className='h-4 w-4' />;
    }
  };

  const getStatusBadge = (status: Communication['status']) => {
    const statusConfig = {
      draft: {
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        label: 'Draft'
      },
      sent: {
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        label: 'Sent'
      },
      delivered: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Delivered'
      },
      read: {
        color: 'bg-purple-100 text-purple-800',
        icon: CheckCircle,
        label: 'Read'
      },
      replied: {
        color: 'bg-indigo-100 text-indigo-800',
        icon: Reply,
        label: 'Replied'
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        label: 'Failed'
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Completed'
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

  const getPriorityBadge = (priority: Communication['priority']) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getUnreadCount = () => {
    return communications.filter(
      (comm) =>
        comm.direction === 'inbound' &&
        (comm.status === 'sent' || comm.status === 'delivered')
    ).length;
  };

  const getInboundCount = () => {
    return communications.filter((comm) => comm.direction === 'inbound').length;
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading communications...
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
            <h1 className='text-3xl font-bold'>Communication Hub</h1>
            <p className='text-muted-foreground'>
              Manage all customer communications in one place
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={loadCommunications} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Dialog
              open={isComposeDialogOpen}
              onOpenChange={setIsComposeDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Compose New Communication</DialogTitle>
                  <DialogDescription>
                    Send an email, make a note, or schedule a call with a
                    customer
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='clientId'>Client</Label>
                      <Select
                        value={composeData.clientId}
                        onValueChange={(value) =>
                          setComposeData((prev) => ({
                            ...prev,
                            clientId: value
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select client' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='client-1'>John Smith</SelectItem>
                          <SelectItem value='client-2'>
                            Sarah Johnson
                          </SelectItem>
                          <SelectItem value='client-3'>Bob Wilson</SelectItem>
                          <SelectItem value='client-4'>Maria Garcia</SelectItem>
                          <SelectItem value='client-5'>David Chen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='type'>Type</Label>
                      <Select
                        value={composeData.type}
                        onValueChange={(value) =>
                          setComposeData((prev) => ({
                            ...prev,
                            type: value as Communication['type']
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='email'>Email</SelectItem>
                          <SelectItem value='phone'>Phone Call</SelectItem>
                          <SelectItem value='meeting'>Meeting</SelectItem>
                          <SelectItem value='note'>Note</SelectItem>
                          <SelectItem value='sms'>SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='subject'>Subject</Label>
                      <Input
                        id='subject'
                        placeholder='Enter subject'
                        value={composeData.subject}
                        onChange={(e) =>
                          setComposeData((prev) => ({
                            ...prev,
                            subject: e.target.value
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='priority'>Priority</Label>
                      <Select
                        value={composeData.priority}
                        onValueChange={(value) =>
                          setComposeData((prev) => ({
                            ...prev,
                            priority: value as Communication['priority']
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='low'>Low</SelectItem>
                          <SelectItem value='normal'>Normal</SelectItem>
                          <SelectItem value='high'>High</SelectItem>
                          <SelectItem value='urgent'>Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='content'>Content</Label>
                    <Textarea
                      id='content'
                      placeholder='Enter your message'
                      rows={6}
                      value={composeData.content}
                      onChange={(e) =>
                        setComposeData((prev) => ({
                          ...prev,
                          content: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setIsComposeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCompose}>
                      <Mail className='mr-2 h-4 w-4' />
                      Send
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {communications.length}
              </div>
              <p className='text-xs text-muted-foreground'>
                {getInboundCount()} inbound
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Unread Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {getUnreadCount()}
              </div>
              <p className='text-xs text-muted-foreground'>Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {
                  communications.filter(
                    (c) =>
                      c.createdAt.toDateString() === new Date().toDateString()
                  ).length
                }
              </div>
              <p className='text-xs text-muted-foreground'>
                Communications today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>2.3h</div>
              <p className='text-xs text-muted-foreground'>Average response</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Filter Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                  <Input
                    placeholder='Search by client, subject, or content...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='phone'>Phone</SelectItem>
                    <SelectItem value='meeting'>Meeting</SelectItem>
                    <SelectItem value='note'>Note</SelectItem>
                    <SelectItem value='sms'>SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='sent'>Sent</SelectItem>
                    <SelectItem value='delivered'>Delivered</SelectItem>
                    <SelectItem value='read'>Read</SelectItem>
                    <SelectItem value='replied'>Replied</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communications Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Communications ({filteredCommunications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCommunications.length === 0 ? (
              <div className='py-8 text-center'>
                <MessageSquare className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>
                  No communications found
                </h3>
                <p className='text-muted-foreground'>
                  {communications.length === 0
                    ? 'Start communicating with customers to see your history here'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommunications.map((communication) => (
                      <TableRow key={communication.id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getTypeIcon(communication.type)}
                            <span className='capitalize'>
                              {communication.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            {communication.clientName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {communication.subject}
                            </div>
                            <div className='line-clamp-1 text-sm text-muted-foreground'>
                              {communication.content.substring(0, 60)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              communication.direction === 'inbound'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {communication.direction}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(communication.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(communication.priority)}
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div>
                              {communication.createdAt.toLocaleDateString()}
                            </div>
                            <div className='text-muted-foreground'>
                              {communication.createdAt.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Button variant='ghost' size='sm'>
                              <Reply className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Forward className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Archive className='h-4 w-4' />
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
