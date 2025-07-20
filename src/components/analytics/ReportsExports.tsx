import React, { useState } from 'react';
import {
  Download,
  FileText,
  Table,
  BarChart3,
  Calendar,
  Settings,
  CheckCircle
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { analyticsManager } from '@/lib/analyticsManager';

const ReportsExports = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const generateReport = async (type: 'pdf' | 'excel' | 'json') => {
    setIsGenerating(true);

    try {
      const systemMetrics = analyticsManager.getSystemMetrics();
      const customers = analyticsManager.getCustomerMetrics();
      const campaigns = analyticsManager.getCampaignMetrics();
      const events = analyticsManager.getRecentEvents(100);
      const trends = analyticsManager.getProcessingTrends(30);
      const emailStats = analyticsManager.getEmailDeliveryStats();

      const reportData = {
        generatedAt: new Date().toISOString(),
        dateRange,
        systemMetrics,
        customers: customers.slice(0, 50), // Limit for performance
        campaigns,
        recentEvents: events.slice(0, 20),
        processingTrends: trends,
        emailStats,
        summary: {
          totalCustomers: customers.length,
          totalPDFsProcessed: systemMetrics.totalPDFsProcessed,
          totalEmailsSent: systemMetrics.totalEmailsSent,
          averageProcessingTime: systemMetrics.averageProcessingTime,
          successRate: systemMetrics.successRate,
          timeSaved: systemMetrics.totalTimeSaved
        }
      };

      if (type === 'json') {
        // Export as JSON
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nws-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (type === 'excel') {
        // Export as CSV (simplified Excel format)
        const csvData = [
          ['New Water Systems - Analytics Report'],
          ['Generated:', new Date().toLocaleString()],
          ['Date Range:', `${dateRange.start} to ${dateRange.end}`],
          [''],
          ['SYSTEM METRICS'],
          ['Total PDFs Processed', systemMetrics.totalPDFsProcessed],
          ['Total Emails Sent', systemMetrics.totalEmailsSent],
          ['Total Customers', systemMetrics.totalCustomers],
          ['Success Rate (%)', systemMetrics.successRate.toFixed(2)],
          [
            'Average Processing Time (s)',
            systemMetrics.averageProcessingTime.toFixed(2)
          ],
          ['Time Saved (minutes)', systemMetrics.totalTimeSaved],
          [''],
          ['TOP CUSTOMERS'],
          [
            'Customer Name',
            'Account Number',
            'Files Processed',
            'Emails Sent',
            'Last Activity'
          ],
          ...customers
            .slice(0, 10)
            .map((c) => [
              c.customerName,
              c.accountNumber,
              c.totalProcessed,
              c.emailsSent,
              c.lastProcessed.toLocaleDateString()
            ]),
          [''],
          ['EMAIL CAMPAIGNS'],
          ['Campaign Name', 'Template', 'Sent', 'Delivered', 'Opened', 'Date'],
          ...campaigns
            .slice(0, 10)
            .map((c) => [
              c.name,
              c.templateName,
              c.sentCount,
              c.deliveredCount,
              c.openedCount,
              c.sentDate.toLocaleDateString()
            ])
        ];

        const csvContent = csvData.map((row) => row.join(',')).join('\n');
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nws-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (type === 'pdf') {
        // Generate HTML report for PDF printing
        const htmlReport = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>New Water Systems - Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
              .section { margin: 30px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>New Water Systems</h1>
              <h2>Analytics Report</h2>
              <p>Generated: ${new Date().toLocaleString()}</p>
              <p>Period: ${dateRange.start} to ${dateRange.end}</p>
            </div>
            
            <div class="section">
              <h3>System Metrics</h3>
              <div class="metric">
                <strong>${systemMetrics.totalPDFsProcessed}</strong><br>PDFs Processed
              </div>
              <div class="metric">
                <strong>${systemMetrics.totalEmailsSent}</strong><br>Emails Sent
              </div>
              <div class="metric">
                <strong>${systemMetrics.totalCustomers}</strong><br>Customers
              </div>
              <div class="metric">
                <strong>${systemMetrics.successRate.toFixed(1)}%</strong><br>Success Rate
              </div>
            </div>

            <div class="section">
              <h3>Top Customers</h3>
              <table>
                <tr><th>Customer</th><th>Account</th><th>Processed</th><th>Emails</th></tr>
                ${customers
                  .slice(0, 10)
                  .map(
                    (c) =>
                      `<tr><td>${c.customerName}</td><td>${c.accountNumber}</td><td>${c.totalProcessed}</td><td>${c.emailsSent}</td></tr>`
                  )
                  .join('')}
              </table>
            </div>

            <div class="section">
              <h3>Email Campaigns</h3>
              <table>
                <tr><th>Campaign</th><th>Template</th><th>Sent</th><th>Delivered</th><th>Opened</th></tr>
                ${campaigns
                  .slice(0, 10)
                  .map(
                    (c) =>
                      `<tr><td>${c.name}</td><td>${c.templateName}</td><td>${c.sentCount}</td><td>${c.deliveredCount}</td><td>${c.openedCount}</td></tr>`
                  )
                  .join('')}
              </table>
            </div>
          </body>
          </html>
        `;

        const htmlBlob = new Blob([htmlReport], { type: 'text/html' });
        const url = URL.createObjectURL(htmlBlob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      toast({
        title: 'Report Generated',
        description: `${type.toUpperCase()} report has been generated successfully`
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all analytics data? This action cannot be undone.'
      )
    ) {
      analyticsManager.clearData();
      toast({
        title: 'Data Cleared',
        description: 'All analytics data has been cleared'
      });
    }
  };

  const exportRawData = () => {
    const rawData = analyticsManager.exportData();
    const dataBlob = new Blob([rawData], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nws-raw-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Raw Data Exported',
      description: 'Complete analytics database exported as JSON'
    });
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Reports & Exports</h3>
        <Badge className='bg-green-100 text-green-700'>
          <Download className='mr-1 h-4 w-4' />
          Professional Reports
        </Badge>
      </div>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Report Configuration
          </CardTitle>
          <CardDescription>
            Configure date range and report parameters
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='start-date'>Start Date</Label>
              <Input
                id='start-date'
                type='date'
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='end-date'>End Date</Label>
              <Input
                id='end-date'
                type='date'
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>PDF Report</h4>
                <p className='text-sm text-muted-foreground'>
                  Professional formatted report
                </p>
              </div>
              <FileText className='h-8 w-8 text-red-600' />
            </div>
            <Button
              onClick={() => generateReport('pdf')}
              disabled={isGenerating}
              className='w-full'
            >
              <FileText className='mr-2 h-4 w-4' />
              Generate PDF
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>Excel Export</h4>
                <p className='text-sm text-muted-foreground'>
                  Spreadsheet data export
                </p>
              </div>
              <Table className='h-8 w-8 text-green-600' />
            </div>
            <Button
              onClick={() => generateReport('excel')}
              disabled={isGenerating}
              className='w-full'
              variant='outline'
            >
              <Table className='mr-2 h-4 w-4' />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>JSON Data</h4>
                <p className='text-sm text-muted-foreground'>
                  Structured data export
                </p>
              </div>
              <BarChart3 className='h-8 w-8 text-blue-600' />
            </div>
            <Button
              onClick={() => generateReport('json')}
              disabled={isGenerating}
              className='w-full'
              variant='outline'
            >
              <Download className='mr-2 h-4 w-4' />
              Export JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Report Templates
          </CardTitle>
          <CardDescription>
            Pre-configured reports for different business needs
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                <h4 className='font-medium'>Executive Summary</h4>
              </div>
              <p className='mb-3 text-sm text-muted-foreground'>
                High-level overview with key metrics and trends
              </p>
              <Button
                size='sm'
                variant='outline'
                onClick={() => generateReport('pdf')}
              >
                Generate Report
              </Button>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <BarChart3 className='h-5 w-5 text-blue-600' />
                <h4 className='font-medium'>Operational Report</h4>
              </div>
              <p className='mb-3 text-sm text-muted-foreground'>
                Detailed processing statistics and performance metrics
              </p>
              <Button
                size='sm'
                variant='outline'
                onClick={() => generateReport('excel')}
              >
                Export Data
              </Button>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <Table className='h-5 w-5 text-purple-600' />
                <h4 className='font-medium'>Customer Analysis</h4>
              </div>
              <p className='mb-3 text-sm text-muted-foreground'>
                Customer activity, engagement, and communication history
              </p>
              <Button
                size='sm'
                variant='outline'
                onClick={() => generateReport('excel')}
              >
                Export Data
              </Button>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='mb-2 flex items-center gap-3'>
                <Download className='h-5 w-5 text-orange-600' />
                <h4 className='font-medium'>Complete Backup</h4>
              </div>
              <p className='mb-3 text-sm text-muted-foreground'>
                Full analytics database export for backup purposes
              </p>
              <Button size='sm' variant='outline' onClick={exportRawData}>
                Export All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className='border-yellow-200 bg-yellow-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your analytics data and storage
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border border-yellow-200 bg-white p-4'>
            <div>
              <h4 className='font-medium text-yellow-800'>Clear All Data</h4>
              <p className='text-sm text-yellow-700'>
                Permanently delete all analytics data. This action cannot be
                undone.
              </p>
            </div>
            <Button variant='destructive' onClick={clearAllData}>
              Clear Data
            </Button>
          </div>

          <div className='flex items-center justify-between rounded-lg border border-yellow-200 bg-white p-4'>
            <div>
              <h4 className='font-medium text-yellow-800'>Export Raw Data</h4>
              <p className='text-sm text-yellow-700'>
                Export complete analytics database for backup or migration
              </p>
            </div>
            <Button variant='outline' onClick={exportRawData}>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsExports;
