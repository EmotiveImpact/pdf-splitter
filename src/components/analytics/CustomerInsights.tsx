import React, { useState, useEffect } from 'react';
import {
  Users,
  User,
  Mail,
  FileText,
  Calendar,
  MapPin,
  TrendingUp
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
import { Input } from '@/components/ui/input';
import { analyticsManager, type CustomerMetrics } from '@/lib/analyticsManager';

const CustomerInsights = () => {
  const [customers, setCustomers] = useState<CustomerMetrics[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'processed' | 'recent'>(
    'processed'
  );

  useEffect(() => {
    const customerData = analyticsManager.getCustomerMetrics();
    setCustomers(customerData);
  }, []);

  const filteredAndSortedCustomers = customers
    .filter(
      (customer) =>
        customer.customerName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        customer.accountNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (customer.email &&
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.customerName.localeCompare(b.customerName);
        case 'processed':
          return b.totalProcessed - a.totalProcessed;
        case 'recent':
          return b.lastProcessed.getTime() - a.lastProcessed.getTime();
        default:
          return 0;
      }
    });

  const getCustomerStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => {
      const daysSinceLastProcessed =
        (Date.now() - c.lastProcessed.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastProcessed <= 30;
    }).length;

    const totalProcessed = customers.reduce(
      (sum, c) => sum + c.totalProcessed,
      0
    );
    const totalEmails = customers.reduce((sum, c) => sum + c.emailsSent, 0);
    const averageProcessed =
      totalCustomers > 0 ? totalProcessed / totalCustomers : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalProcessed,
      totalEmails,
      averageProcessed
    };
  };

  const getTopCustomers = (limit: number = 5) => {
    return customers
      .sort((a, b) => b.totalProcessed - a.totalProcessed)
      .slice(0, limit);
  };

  const getAccountPrefixDistribution = () => {
    const prefixCount = new Map<string, number>();

    customers.forEach((customer) => {
      const prefix = customer.accountNumber.substring(0, 7); // e.g., "FBNWSTX"
      prefixCount.set(prefix, (prefixCount.get(prefix) || 0) + 1);
    });

    return Array.from(prefixCount.entries())
      .map(([prefix, count]) => ({ prefix, count }))
      .sort((a, b) => b.count - a.count);
  };

  const stats = getCustomerStats();
  const topCustomers = getTopCustomers();
  const prefixDistribution = getAccountPrefixDistribution();

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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Customer Insights</h3>
        <Badge className='bg-blue-100 text-blue-700'>
          <Users className='mr-1 h-4 w-4' />
          {stats.totalCustomers} Total Customers
        </Badge>
      </div>

      {/* Customer Statistics */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Customers
                </p>
                <p className='text-2xl font-bold'>{stats.totalCustomers}</p>
              </div>
              <Users className='h-8 w-8 text-blue-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-blue-600'>
              <TrendingUp className='mr-1 h-3 w-3' />
              Growing customer base
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Active (30 days)
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {stats.activeCustomers}
                </p>
              </div>
              <User className='h-8 w-8 text-green-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-green-600'>
              <Calendar className='mr-1 h-3 w-3' />
              {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(
                1
              )}
              % active rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Avg Processed
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {stats.averageProcessed.toFixed(1)}
                </p>
              </div>
              <FileText className='h-8 w-8 text-purple-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-purple-600'>
              <FileText className='mr-1 h-3 w-3' />
              Per customer
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Emails Sent
                </p>
                <p className='text-2xl font-bold text-orange-600'>
                  {stats.totalEmails}
                </p>
              </div>
              <Mail className='h-8 w-8 text-orange-600' />
            </div>
            <div className='mt-2 flex items-center text-xs text-orange-600'>
              <Mail className='mr-1 h-3 w-3' />
              Total communications
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Top Customers by Activity
          </CardTitle>
          <CardDescription>
            Customers with the highest processing volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {topCustomers.map((customer, index) => (
              <div
                key={customer.accountNumber}
                className='flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600'>
                    {index + 1}
                  </div>
                  <div>
                    <div className='font-medium'>{customer.customerName}</div>
                    <div className='text-sm text-muted-foreground'>
                      {customer.accountNumber}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-4 text-sm'>
                  <div className='text-center'>
                    <div className='font-medium text-blue-600'>
                      {customer.totalProcessed}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Processed
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-green-600'>
                      {customer.emailsSent}
                    </div>
                    <div className='text-xs text-muted-foreground'>Emails</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-purple-600'>
                      {formatDate(customer.lastProcessed)}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Last Activity
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {topCustomers.length === 0 && (
              <div className='py-8 text-center text-muted-foreground'>
                <Users className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No customer data available yet</p>
                <p className='text-sm'>
                  Process some PDFs to see customer insights
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Distribution */}
      {prefixDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MapPin className='h-5 w-5' />
              Account Distribution
            </CardTitle>
            <CardDescription>
              Customer distribution by account type/region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {prefixDistribution.map((item) => {
                const percentage = (item.count / stats.totalCustomers) * 100;
                return (
                  <div
                    key={item.prefix}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-3'>
                      <Badge variant='outline' className='font-mono'>
                        {item.prefix}
                      </Badge>
                      <span className='text-sm'>{item.count} customers</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-24 rounded-full bg-muted'>
                        <div
                          className='h-2 rounded-full bg-blue-500'
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className='w-12 text-sm font-medium'>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Directory */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Customer Directory
          </CardTitle>
          <CardDescription>Search and browse all customers</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Search and Sort Controls */}
          <div className='flex gap-4'>
            <Input
              placeholder='Search customers...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='flex-1'
            />
            <div className='flex gap-2'>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSortBy('name')}
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'processed' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSortBy('processed')}
              >
                Activity
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSortBy('recent')}
              >
                Recent
              </Button>
            </div>
          </div>

          {/* Customer List */}
          <div className='max-h-96 space-y-2 overflow-y-auto'>
            {filteredAndSortedCustomers.map((customer) => (
              <div
                key={customer.accountNumber}
                className='flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                    <User className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <div className='font-medium'>{customer.customerName}</div>
                    <div className='text-sm text-muted-foreground'>
                      {customer.accountNumber}
                      {customer.email && ` • ${customer.email}`}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-4 text-sm'>
                  <div className='text-center'>
                    <div className='font-medium'>{customer.totalProcessed}</div>
                    <div className='text-xs text-muted-foreground'>Files</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium'>{customer.emailsSent}</div>
                    <div className='text-xs text-muted-foreground'>Emails</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium'>
                      {formatDate(customer.lastProcessed)}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      Last Seen
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAndSortedCustomers.length === 0 && searchTerm && (
              <div className='py-8 text-center text-muted-foreground'>
                <Users className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p>No customers found matching &quot;{searchTerm}&quot;</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerInsights;
