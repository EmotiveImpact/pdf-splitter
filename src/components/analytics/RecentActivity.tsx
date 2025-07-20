import React, { useState, useEffect } from 'react';
import {
  Activity,
  FileText,
  Mail,
  FileEdit,
  Download,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { analyticsManager, type ProcessingEvent } from '@/lib/analyticsManager';

const RecentActivity = () => {
  const [events, setEvents] = useState<ProcessingEvent[]>([]);
  const [filter, setFilter] = useState<
    'all' | 'pdf_processing' | 'email_sending' | 'template_creation'
  >('all');

  useEffect(() => {
    const allEvents = analyticsManager.getRecentEvents(50);
    setEvents(allEvents);
  }, []);

  const filteredEvents = events.filter(
    (event) => filter === 'all' || event.type === filter
  );

  const getEventIcon = (type: ProcessingEvent['type']) => {
    switch (type) {
      case 'pdf_processing':
        return <FileText className='h-4 w-4 text-blue-600' />;
      case 'email_sending':
        return <Mail className='h-4 w-4 text-green-600' />;
      case 'template_creation':
        return <FileEdit className='h-4 w-4 text-purple-600' />;
      case 'download':
        return <Download className='h-4 w-4 text-orange-600' />;
      case 'error':
        return <AlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return <Activity className='h-4 w-4 text-gray-600' />;
    }
  };

  const getEventColor = (type: ProcessingEvent['type']) => {
    switch (type) {
      case 'pdf_processing':
        return 'bg-blue-100 text-blue-700';
      case 'email_sending':
        return 'bg-green-100 text-green-700';
      case 'template_creation':
        return 'bg-purple-100 text-purple-700';
      case 'download':
        return 'bg-orange-100 text-orange-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTitle = (event: ProcessingEvent): string => {
    switch (event.type) {
      case 'pdf_processing':
        return `Processed ${event.data.successCount || 0} PDFs`;
      case 'email_sending':
        return `Sent emails to ${event.data.customerCount || 0} customers`;
      case 'template_creation':
        return `Created template: ${event.data.templateName || 'Unknown'}`;
      case 'download':
        return `Downloaded ${event.data.filesCount || 0} files`;
      case 'error':
        return `Error: ${event.data.errorMessage || 'Unknown error'}`;
      default:
        return 'Unknown activity';
    }
  };

  const getEventDescription = (event: ProcessingEvent): string => {
    switch (event.type) {
      case 'pdf_processing':
        const errors = event.data.errorCount || 0;
        const time = event.data.processingTime || 0;
        return `${errors > 0 ? `${errors} errors, ` : ''}${time.toFixed(1)}s processing time`;
      case 'email_sending':
        return `Using template: ${event.data.templateName || 'Default'}`;
      case 'template_creation':
        return 'New email template created';
      case 'download':
        return `Batch: ${event.data.batchId || 'Unknown'}`;
      case 'error':
        return event.data.errorMessage || 'An error occurred';
      default:
        return '';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityStats = () => {
    const stats = {
      total: events.length,
      pdf_processing: events.filter((e) => e.type === 'pdf_processing').length,
      email_sending: events.filter((e) => e.type === 'email_sending').length,
      template_creation: events.filter((e) => e.type === 'template_creation')
        .length,
      errors: events.filter((e) => e.type === 'error').length
    };

    return stats;
  };

  const stats = getActivityStats();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Recent Activity</h3>
        <Badge className='bg-blue-100 text-blue-700'>
          <Activity className='mr-1 h-4 w-4' />
          {stats.total} Activities
        </Badge>
      </div>

      {/* Activity Statistics */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
        <Card
          className='cursor-pointer hover:bg-muted/50'
          onClick={() => setFilter('all')}
        >
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.total}
            </div>
            <div className='text-sm text-muted-foreground'>Total</div>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50'
          onClick={() => setFilter('pdf_processing')}
        >
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.pdf_processing}
            </div>
            <div className='text-sm text-muted-foreground'>PDF Processing</div>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50'
          onClick={() => setFilter('email_sending')}
        >
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.email_sending}
            </div>
            <div className='text-sm text-muted-foreground'>Email Sending</div>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50'
          onClick={() => setFilter('template_creation')}
        >
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.template_creation}
            </div>
            <div className='text-sm text-muted-foreground'>Templates</div>
          </CardContent>
        </Card>

        <Card
          className='cursor-pointer hover:bg-muted/50'
          onClick={() => setFilter('all')}
        >
          <CardContent className='p-4 text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {stats.errors}
            </div>
            <div className='text-sm text-muted-foreground'>Errors</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className='flex gap-2'>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('all')}
        >
          All Activities
        </Button>
        <Button
          variant={filter === 'pdf_processing' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('pdf_processing')}
        >
          <FileText className='mr-1 h-4 w-4' />
          PDF Processing
        </Button>
        <Button
          variant={filter === 'email_sending' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('email_sending')}
        >
          <Mail className='mr-1 h-4 w-4' />
          Email Sending
        </Button>
        <Button
          variant={filter === 'template_creation' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('template_creation')}
        >
          <FileEdit className='mr-1 h-4 w-4' />
          Templates
        </Button>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Activity Timeline
          </CardTitle>
          <CardDescription>
            Real-time feed of all platform activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='max-h-96 space-y-3 overflow-y-auto'>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className='flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50'
              >
                <div
                  className={`rounded-full p-2 ${getEventColor(event.type).replace('text-', 'bg-').replace('-700', '-100')}`}
                >
                  {getEventIcon(event.type)}
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-medium'>
                      {getEventTitle(event)}
                    </h4>
                    <div className='flex items-center gap-2'>
                      <Badge
                        className={getEventColor(event.type)}
                        variant='secondary'
                      >
                        {event.type.replace('_', ' ')}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                  </div>

                  <p className='mt-1 text-sm text-muted-foreground'>
                    {getEventDescription(event)}
                  </p>

                  <div className='mt-2 text-xs text-muted-foreground'>
                    {event.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className='py-8 text-center text-muted-foreground'>
                <Activity className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No activities found</p>
                <p className='text-sm'>
                  {filter === 'all'
                    ? 'Start using the platform to see activities here'
                    : `No ${filter.replace('_', ' ')} activities yet`}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      {events.length > 0 && (
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
              <div className='space-y-2'>
                <h4 className='font-medium text-green-800'>Activity Summary</h4>
                <div className='space-y-1 text-sm text-green-700'>
                  <p>
                    • <strong>{stats.pdf_processing}</strong> PDF processing
                    sessions completed
                  </p>
                  <p>
                    • <strong>{stats.email_sending}</strong> email campaigns
                    sent to customers
                  </p>
                  <p>
                    • <strong>{stats.template_creation}</strong> email templates
                    created
                  </p>
                  <p>
                    • <strong>{stats.errors}</strong> errors encountered and
                    handled
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecentActivity;
