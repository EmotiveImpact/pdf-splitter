import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Mail,
  Users,
  ArrowRight,
  BarChart3,
  CreditCard,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import DashboardStatsComponent from '@/components/dashboard/DashboardStats';

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
              Complete business management platform with CRM, billing, and
              automation
            </p>
          </div>
        </div>

        {/* Real-time Dashboard Stats */}
        <DashboardStatsComponent />
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Link href='/dashboard/crm'>
                <Button
                  className='flex h-20 w-full flex-col gap-2'
                  variant='outline'
                >
                  <BarChart3 className='h-6 w-6' />
                  <span>CRM Dashboard</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
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
              <Link href='/dashboard/invoices'>
                <Button
                  className='flex h-20 w-full flex-col gap-2'
                  variant='outline'
                >
                  <CreditCard className='h-6 w-6' />
                  <span>Create Invoice</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
              <Link href='/dashboard/communications'>
                <Button
                  className='flex h-20 w-full flex-col gap-2'
                  variant='outline'
                >
                  <MessageSquare className='h-6 w-6' />
                  <span>Communications</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
            </div>

            {/* Secondary Actions */}
            <div className='mt-4 grid gap-4 md:grid-cols-3'>
              <Link href='/dashboard/email-distribution'>
                <Button
                  className='flex h-16 w-full flex-col gap-1'
                  variant='ghost'
                  size='sm'
                >
                  <Mail className='h-5 w-5' />
                  <span className='text-sm'>Send Emails</span>
                </Button>
              </Link>
              <Link href='/dashboard/clients'>
                <Button
                  className='flex h-16 w-full flex-col gap-1'
                  variant='ghost'
                  size='sm'
                >
                  <Users className='h-5 w-5' />
                  <span className='text-sm'>Manage Clients</span>
                </Button>
              </Link>
              <Link href='/dashboard/tasks'>
                <Button
                  className='flex h-16 w-full flex-col gap-1'
                  variant='ghost'
                  size='sm'
                >
                  <Calendar className='h-5 w-5' />
                  <span className='text-sm'>Tasks & Follow-ups</span>
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
