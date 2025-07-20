import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Target
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
import { analyticsManager, type ProcessingEvent } from '@/lib/analyticsManager';

const ProcessingAnalytics = () => {
  const [processingEvents, setProcessingEvents] = useState<ProcessingEvent[]>(
    []
  );
  const [systemMetrics, setSystemMetrics] = useState(
    analyticsManager.getSystemMetrics()
  );

  useEffect(() => {
    const events = analyticsManager
      .getRecentEvents(50)
      .filter((e) => e.type === 'pdf_processing');
    setProcessingEvents(events);
    setSystemMetrics(analyticsManager.getSystemMetrics());
  }, []);

  const calculateStats = () => {
    const totalFiles = processingEvents.reduce(
      (sum, e) => sum + (e.data.filesCount || 0),
      0
    );
    const totalSuccess = processingEvents.reduce(
      (sum, e) => sum + (e.data.successCount || 0),
      0
    );
    const totalErrors = processingEvents.reduce(
      (sum, e) => sum + (e.data.errorCount || 0),
      0
    );
    const totalTime = processingEvents.reduce(
      (sum, e) => sum + (e.data.processingTime || 0),
      0
    );

    return {
      totalFiles,
      totalSuccess,
      totalErrors,
      averageTime: totalFiles > 0 ? totalTime / totalFiles : 0,
      successRate: totalFiles > 0 ? (totalSuccess / totalFiles) * 100 : 0,
      errorRate: totalFiles > 0 ? (totalErrors / totalFiles) * 100 : 0
    };
  };

  const stats = calculateStats();

  const getPerformanceLevel = (
    successRate: number
  ): { level: string; color: string; icon: React.ReactNode } => {
    if (successRate >= 95)
      return {
        level: 'Excellent',
        color: 'text-green-600 bg-green-100',
        icon: <Target className='h-4 w-4' />
      };
    if (successRate >= 90)
      return {
        level: 'Good',
        color: 'text-blue-600 bg-blue-100',
        icon: <CheckCircle className='h-4 w-4' />
      };
    if (successRate >= 80)
      return {
        level: 'Fair',
        color: 'text-yellow-600 bg-yellow-100',
        icon: <AlertCircle className='h-4 w-4' />
      };
    return {
      level: 'Needs Improvement',
      color: 'text-red-600 bg-red-100',
      icon: <AlertCircle className='h-4 w-4' />
    };
  };

  const performance = getPerformanceLevel(stats.successRate);

  const formatTime = (seconds: number): string => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${(seconds / 60).toFixed(1)}m`;
  };

  const getRecentBatches = () => {
    return processingEvents.slice(0, 10).map((event) => ({
      id: event.id,
      timestamp: event.timestamp,
      filesCount: event.data.filesCount || 0,
      successCount: event.data.successCount || 0,
      errorCount: event.data.errorCount || 0,
      processingTime: event.data.processingTime || 0,
      batchId: event.data.batchId || 'Unknown'
    }));
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>PDF Processing Analytics</h3>
        <Badge className={performance.color}>
          {performance.icon}
          <span className='ml-1'>{performance.level}</span>
        </Badge>
      </div>

      {/* Processing Statistics */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Files
                </p>
                <p className='text-2xl font-bold'>{stats.totalFiles}</p>
              </div>
              <FileText className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mt-2'>
              <Progress value={100} className='h-2' />
              <p className='mt-1 text-xs text-muted-foreground'>
                All processing attempts
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Successful
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.totalSuccess}
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='mt-2'>
              <Progress value={stats.successRate} className='h-2' />
              <p className='mt-1 text-xs text-green-600'>
                {stats.successRate.toFixed(1)}% success rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Errors
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {stats.totalErrors}
                </p>
              </div>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <div className='mt-2'>
              <Progress value={stats.errorRate} className='h-2' />
              <p className='mt-1 text-xs text-red-600'>
                {stats.errorRate.toFixed(1)}% error rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Avg Time
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {formatTime(stats.averageTime)}
                </p>
              </div>
              <Clock className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-purple-600'>
              <Zap className='mr-1 h-3 w-3' />
              Per file processing
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Performance Analysis
          </CardTitle>
          <CardDescription>
            Detailed breakdown of processing performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Success Rate Breakdown */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Success Rate</span>
              <span className='text-sm font-medium text-green-600'>
                {stats.successRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={stats.successRate} className='h-3' />
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Successful:</span>
                <span className='font-medium text-green-600'>
                  {stats.totalSuccess}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Failed:</span>
                <span className='font-medium text-red-600'>
                  {stats.totalErrors}
                </span>
              </div>
            </div>
          </div>

          {/* Processing Speed */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Processing Speed</span>
              <span className='text-sm font-medium text-purple-600'>
                {formatTime(stats.averageTime)} per file
              </span>
            </div>
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div className='rounded bg-muted/50 p-3 text-center'>
                <div className='font-medium text-green-600'>Fast</div>
                <div className='text-xs text-muted-foreground'>&lt; 1s</div>
              </div>
              <div className='rounded bg-muted/50 p-3 text-center'>
                <div className='font-medium text-yellow-600'>Normal</div>
                <div className='text-xs text-muted-foreground'>1-3s</div>
              </div>
              <div className='rounded bg-muted/50 p-3 text-center'>
                <div className='font-medium text-red-600'>Slow</div>
                <div className='text-xs text-muted-foreground'>&gt; 3s</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Processing Batches */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Recent Processing Batches
          </CardTitle>
          <CardDescription>
            Latest PDF processing activities and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {getRecentBatches().map((batch) => (
              <div
                key={batch.id}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`rounded-full p-2 ${
                      batch.errorCount === 0 ? 'bg-green-100' : 'bg-yellow-100'
                    }`}
                  >
                    {batch.errorCount === 0 ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <AlertCircle className='h-4 w-4 text-yellow-600' />
                    )}
                  </div>
                  <div>
                    <div className='text-sm font-medium'>
                      Batch{' '}
                      {batch.batchId.split('_')[1]?.slice(-4) || 'Unknown'}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {batch.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-4 text-sm'>
                  <div className='text-center'>
                    <div className='font-medium'>{batch.filesCount}</div>
                    <div className='text-xs text-muted-foreground'>Files</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-green-600'>
                      {batch.successCount}
                    </div>
                    <div className='text-xs text-muted-foreground'>Success</div>
                  </div>
                  {batch.errorCount > 0 && (
                    <div className='text-center'>
                      <div className='font-medium text-red-600'>
                        {batch.errorCount}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Errors
                      </div>
                    </div>
                  )}
                  <div className='text-center'>
                    <div className='font-medium text-purple-600'>
                      {formatTime(batch.processingTime)}
                    </div>
                    <div className='text-xs text-muted-foreground'>Time</div>
                  </div>
                </div>
              </div>
            ))}

            {getRecentBatches().length === 0 && (
              <div className='py-8 text-center text-muted-foreground'>
                <FileText className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No processing data available yet</p>
                <p className='text-sm'>
                  Process some PDFs to see analytics here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingAnalytics;
