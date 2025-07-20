import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Mail,
  Users,
  Clock,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Welcome to ClientCore 🚀
            </h2>
            <p className='text-muted-foreground'>
              Professional client management and business automation platform
            </p>
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                PDFs Processed
              </CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>1,247</div>
              <p className='text-xs text-muted-foreground'>
                <TrendingUp className='mr-1 inline h-3 w-3' />
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Emails Sent</CardTitle>
              <Mail className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>892</div>
              <p className='text-xs text-muted-foreground'>
                <TrendingUp className='mr-1 inline h-3 w-3' />
                +8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Active Clients
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>156</div>
              <p className='text-xs text-muted-foreground'>
                <TrendingUp className='mr-1 inline h-3 w-3' />
                +5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Time Saved</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>24.5h</div>
              <p className='text-xs text-muted-foreground'>
                <TrendingUp className='mr-1 inline h-3 w-3' />
                +15% efficiency gain
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-3'>
              <Link href='/dashboard/pdf-splitter'>
                <Button
                  className='flex h-20 w-full flex-col gap-2'
                  variant='outline'
                >
                  <FileText className='h-6 w-6' />
                  <span>Process PDFs</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
              <Link href='/dashboard/email-distribution'>
                <Button
                  className='flex h-20 w-full flex-col gap-2'
                  variant='outline'
                >
                  <Mail className='h-6 w-6' />
                  <span>Send Emails</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
              <Link href='/dashboard/clients'>
                <Button
                  className='flex h-20 w-full flex-col gap-2'
                  variant='outline'
                >
                  <Users className='h-6 w-6' />
                  <span>Manage Clients</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales parallel routes */}
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
