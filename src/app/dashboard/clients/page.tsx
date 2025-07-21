'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Upload,
  Download,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface Client {
  id: string;
  account_number: string;
  customer_name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  customer_since: Date;
  last_statement_date?: Date;
  preferred_contact: 'email' | 'phone' | 'mail';
  email_notifications: boolean;
  sms_notifications: boolean;
  total_statements_processed: number;
  total_emails_sent: number;
  last_activity: Date;
  created_at: Date;
  updated_at: Date;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive' | 'suspended'
  >('all');
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockClients: Client[] = [
      {
        id: '1',
        account_number: 'FBNWSTX123456',
        customer_name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        address: {
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zip: '78701'
        },
        status: 'active',
        customer_since: new Date('2023-01-15'),
        last_statement_date: new Date('2025-07-15'),
        preferred_contact: 'email',
        email_notifications: true,
        sms_notifications: false,
        total_statements_processed: 12,
        total_emails_sent: 8,
        last_activity: new Date('2025-07-18'),
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2025-07-18')
      },
      {
        id: '2',
        account_number: 'DNWSTX789012',
        customer_name: 'Mary Johnson',
        email: 'mary.johnson@email.com',
        phone: '(555) 987-6543',
        status: 'active',
        customer_since: new Date('2023-03-20'),
        last_statement_date: new Date('2025-07-10'),
        preferred_contact: 'email',
        email_notifications: true,
        sms_notifications: true,
        total_statements_processed: 11,
        total_emails_sent: 9,
        last_activity: new Date('2025-07-12'),
        created_at: new Date('2023-03-20'),
        updated_at: new Date('2025-07-12')
      },
      {
        id: '3',
        account_number: 'FBNWSTX345678',
        customer_name: 'Bob Wilson',
        email: 'bob.wilson@email.com',
        phone: '(555) 456-7890',
        status: 'inactive',
        customer_since: new Date('2022-11-10'),
        last_statement_date: new Date('2025-06-15'),
        preferred_contact: 'phone',
        email_notifications: false,
        sms_notifications: true,
        total_statements_processed: 10,
        total_emails_sent: 5,
        last_activity: new Date('2025-06-15'),
        created_at: new Date('2022-11-10'),
        updated_at: new Date('2025-06-15')
      }
    ];
    setClients(mockClients);
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getClientStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'active').length;
    const withEmail = clients.filter((c) => c.email).length;
    const withPhone = clients.filter((c) => c.phone).length;
    const completeness = Math.round((withEmail / totalClients) * 100);

    return { totalClients, activeClients, withEmail, withPhone, completeness };
  };

  const stats = getClientStats();

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleCSVImport = () => {
    // This would open a CSV import dialog
    toast({
      title: 'CSV Import',
      description:
        'CSV import functionality will be implemented with Supabase integration'
    });
  };

  const handleExportData = () => {
    // Export current client data as CSV
    const csvData = [
      [
        'Account Number',
        'Customer Name',
        'Email',
        'Phone',
        'Status',
        'Last Activity'
      ],
      ...filteredClients.map((client) => [
        client.account_number,
        client.customer_name,
        client.email,
        client.phone || '',
        client.status,
        client.last_activity.toLocaleDateString()
      ])
    ];

    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientcore-clients-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${filteredClients.length} client records`
    });
  };

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Customer Management</h1>
            <p className='text-muted-foreground'>
              Manage your customer database and communication preferences
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleCSVImport}>
              <Upload className='mr-2 h-4 w-4' />
              Import CSV
            </Button>
            <Button variant='outline' onClick={handleExportData}>
              <Download className='mr-2 h-4 w-4' />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Total Clients
                  </p>
                  <p className='text-2xl font-bold text-blue-600'>
                    {stats.totalClients}
                  </p>
                </div>
                <Users className='h-8 w-8 text-blue-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-blue-600'>
                <TrendingUp className='mr-1 h-3 w-3' />
                Growing database
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Active Clients
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    {stats.activeClients}
                  </p>
                </div>
                <Users className='h-8 w-8 text-green-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-green-600'>
                <Calendar className='mr-1 h-3 w-3' />
                {Math.round((stats.activeClients / stats.totalClients) * 100)}%
                active rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    With Email
                  </p>
                  <p className='text-2xl font-bold text-purple-600'>
                    {stats.withEmail}
                  </p>
                </div>
                <Mail className='h-8 w-8 text-purple-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-purple-600'>
                <Mail className='mr-1 h-3 w-3' />
                {Math.round((stats.withEmail / stats.totalClients) * 100)}%
                coverage
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    With Phone
                  </p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {stats.withPhone}
                  </p>
                </div>
                <Phone className='h-8 w-8 text-orange-600' />
              </div>
              <div className='mt-2 flex items-center text-xs text-orange-600'>
                <Phone className='mr-1 h-3 w-3' />
                {Math.round((stats.withPhone / stats.totalClients) * 100)}%
                coverage
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Client Database</CardTitle>
            <CardDescription>
              Search, filter, and manage your client information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='import'>Import/Export</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-6'>
                {/* Search and Filter */}
                <div className='flex gap-4'>
                  <div className='relative flex-1'>
                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search clients...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className='rounded-md border px-3 py-2'
                  >
                    <option value='all'>All Status</option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                    <option value='suspended'>Suspended</option>
                  </select>
                </div>

                {/* Client List */}
                <div className='space-y-3'>
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className='flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                          <Users className='h-6 w-6 text-blue-600' />
                        </div>
                        <div>
                          <div className='font-medium'>
                            {client.customer_name}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {client.account_number} • {client.email}
                          </div>
                          {client.phone && (
                            <div className='text-sm text-muted-foreground'>
                              📞 {client.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-4'>
                        <div className='text-right'>
                          <Badge
                            variant={
                              client.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              client.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : ''
                            }
                          >
                            {client.status}
                          </Badge>
                          <div className='mt-1 text-sm text-muted-foreground'>
                            {formatDate(client.last_activity)}
                          </div>
                        </div>

                        <div className='text-center'>
                          <div className='font-medium'>
                            {client.total_statements_processed}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Statements
                          </div>
                        </div>

                        <div className='text-center'>
                          <div className='font-medium'>
                            {client.total_emails_sent}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            Emails
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredClients.length === 0 && (
                    <div className='py-8 text-center text-muted-foreground'>
                      <Users className='mx-auto mb-4 h-12 w-12 opacity-50' />
                      <p>No clients found matching your criteria</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value='import' className='space-y-6'>
                <div className='py-8 text-center'>
                  <Upload className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <h3 className='mb-2 text-lg font-medium'>
                    CSV Import/Export
                  </h3>
                  <p className='mb-4 text-muted-foreground'>
                    Import client data from CSV files or export current data
                  </p>
                  <div className='flex justify-center gap-4'>
                    <Button onClick={handleCSVImport}>
                      <Upload className='mr-2 h-4 w-4' />
                      Import CSV
                    </Button>
                    <Button variant='outline' onClick={handleExportData}>
                      <Download className='mr-2 h-4 w-4' />
                      Export Data
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='analytics' className='space-y-6'>
                <div className='py-8 text-center'>
                  <TrendingUp className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <h3 className='mb-2 text-lg font-medium'>Client Analytics</h3>
                  <p className='text-muted-foreground'>
                    Detailed analytics will be available with full database
                    integration
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ClientsPage;
