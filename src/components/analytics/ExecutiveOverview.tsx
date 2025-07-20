import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar
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
import { analyticsManager } from '@/lib/analyticsManager';

interface TrendData {
  date: string;
  count: number;
}

const ExecutiveOverview = () => {
  const [processingTrends, setProcessingTrends] = useState<TrendData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  useEffect(() => {
    const trends = analyticsManager.getProcessingTrends(selectedPeriod);
    setProcessingTrends(trends);
  }, [selectedPeriod]);

  const calculateTrendPercentage = (data: TrendData[]): number => {
    if (data.length < 2) return 0;

    const recent = data.slice(-7).reduce((sum, d) => sum + d.count, 0) / 7;
    const previous =
      data.slice(-14, -7).reduce((sum, d) => sum + d.count, 0) / 7;

    if (previous === 0) return recent > 0 ? 100 : 0;
    return ((recent - previous) / previous) * 100;
  };

  const getMaxValue = (data: TrendData[]): number => {
    return Math.max(...data.map((d) => d.count), 1);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const trendPercentage = calculateTrendPercentage(processingTrends);
  const maxValue = getMaxValue(processingTrends);
  const totalProcessed = processingTrends.reduce((sum, d) => sum + d.count, 0);
  const averageDaily = totalProcessed / processingTrends.length;

  return (
    <div className='space-y-6'>
      {/* Period Selection */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Executive Overview</h3>
        <div className='flex gap-2'>
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={selectedPeriod === days ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedPeriod(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Processed
                </p>
                <p className='text-2xl font-bold'>{totalProcessed}</p>
              </div>
              <Activity className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mt-2 flex items-center text-xs'>
              {trendPercentage >= 0 ? (
                <div className='flex items-center text-green-600'>
                  <TrendingUp className='mr-1 h-3 w-3' />+
                  {trendPercentage.toFixed(1)}%
                </div>
              ) : (
                <div className='flex items-center text-red-600'>
                  <TrendingDown className='mr-1 h-3 w-3' />
                  {trendPercentage.toFixed(1)}%
                </div>
              )}
              <span className='ml-2 text-muted-foreground'>
                vs previous period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Daily Average
                </p>
                <p className='text-2xl font-bold'>{averageDaily.toFixed(1)}</p>
              </div>
              <Target className='h-8 w-8 text-green-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-green-600'>
              <Calendar className='mr-1 h-3 w-3' />
              Consistent performance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Peak Day
                </p>
                <p className='text-2xl font-bold'>{maxValue}</p>
              </div>
              <TrendingUp className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-purple-600'>
              <Activity className='mr-1 h-3 w-3' />
              Maximum daily processing
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Processing Trends
          </CardTitle>
          <CardDescription>
            Daily PDF processing volume over the last {selectedPeriod} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Simple Bar Chart */}
            <div className='flex h-64 items-end justify-between gap-1 rounded-lg bg-muted/30 p-4'>
              {processingTrends.map((data, index) => {
                const height = maxValue > 0 ? (data.count / maxValue) * 100 : 0;
                const isWeekend = new Date(data.date).getDay() % 6 === 0;

                return (
                  <div
                    key={data.date}
                    className='group relative flex flex-col items-center'
                    style={{ width: `${100 / processingTrends.length}%` }}
                  >
                    {/* Tooltip */}
                    <div className='absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:block'>
                      {formatDate(data.date)}: {data.count} files
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-200 ${
                        isWeekend
                          ? 'bg-gray-300 hover:bg-gray-400'
                          : data.count > averageDaily
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-blue-300 hover:bg-blue-400'
                      }`}
                      style={{
                        height: `${height}%`,
                        minHeight: data.count > 0 ? '4px' : '0px'
                      }}
                    />

                    {/* Date Label */}
                    {index % Math.ceil(processingTrends.length / 8) === 0 && (
                      <div className='mt-2 origin-left -rotate-45 transform text-xs text-muted-foreground'>
                        {formatDate(data.date)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className='flex items-center justify-center gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded bg-blue-500'></div>
                <span>Above Average</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded bg-blue-300'></div>
                <span>Below Average</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded bg-gray-300'></div>
                <span>Weekends</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Impact Summary */}
      <Card className='border-green-200 bg-green-50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <Target className='mt-0.5 h-5 w-5 text-green-600' />
            <div className='space-y-2'>
              <h4 className='font-medium text-green-800'>
                Business Impact Summary
              </h4>
              <div className='grid grid-cols-1 gap-4 text-sm text-green-700 md:grid-cols-2'>
                <div className='space-y-1'>
                  <p>
                    • <strong>{totalProcessed}</strong> PDFs processed in{' '}
                    {selectedPeriod} days
                  </p>
                  <p>
                    • <strong>{averageDaily.toFixed(1)}</strong> average daily
                    processing
                  </p>
                  <p>
                    • <strong>{(totalProcessed * 5).toFixed(0)}</strong> minutes
                    saved through automation
                  </p>
                </div>
                <div className='space-y-1'>
                  <p>
                    •{' '}
                    <strong>
                      {trendPercentage >= 0 ? '+' : ''}
                      {trendPercentage.toFixed(1)}%
                    </strong>{' '}
                    trend vs previous period
                  </p>
                  <p>
                    • <strong>Consistent</strong> daily operations
                  </p>
                  <p>
                    • <strong>Professional</strong> customer service delivery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveOverview;
