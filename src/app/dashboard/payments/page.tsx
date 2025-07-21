'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface Payment {
  id: string;
  paymentNumber: string;
  clientId: string;
  clientName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amountCents: number;
  paymentDate: Date;
  paymentMethod:
    | 'stripe'
    | 'square'
    | 'paypal'
    | 'bank_transfer'
    | 'check'
    | 'cash';
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'refunded';
  stripePaymentId?: string;
  processorFeeCents: number;
  netAmountCents: number;
  referenceNumber?: string;
  description: string;
  processedAt?: Date;
  createdAt: Date;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      // Mock payment data - in real app, this would come from API
      const mockPayments: Payment[] = [
        {
          id: '1',
          paymentNumber: 'PAY-2025-001',
          clientId: 'client-1',
          clientName: 'John Smith',
          invoiceId: 'inv-1',
          invoiceNumber: 'INV-2025-001',
          amountCents: 135000, // $1,350.00
          paymentDate: new Date('2025-01-20'),
          paymentMethod: 'stripe',
          status: 'completed',
          stripePaymentId: 'pi_1234567890',
          processorFeeCents: 4185, // 3.1% of $1,350
          netAmountCents: 130815,
          referenceNumber: 'REF-20250120-001',
          description: 'Payment for Invoice INV-2025-001',
          processedAt: new Date('2025-01-20T09:15:00'),
          createdAt: new Date('2025-01-20T09:10:00')
        },
        {
          id: '2',
          paymentNumber: 'PAY-2025-002',
          clientId: 'client-4',
          clientName: 'Maria Garcia',
          invoiceId: 'inv-4',
          invoiceNumber: 'INV-2025-004',
          amountCents: 36450, // $364.50 (partial payment)
          paymentDate: new Date('2025-01-21'),
          paymentMethod: 'stripe',
          status: 'completed',
          stripePaymentId: 'pi_0987654321',
          processorFeeCents: 1130, // 3.1% of $364.50
          netAmountCents: 35320,
          referenceNumber: 'REF-20250121-001',
          description: 'Partial payment for Invoice INV-2025-004',
          processedAt: new Date('2025-01-21T14:30:00'),
          createdAt: new Date('2025-01-21T14:25:00')
        },
        {
          id: '3',
          paymentNumber: 'PAY-2025-003',
          clientId: 'client-5',
          clientName: 'David Chen',
          amountCents: 50000, // $500.00 (credit/advance payment)
          paymentDate: new Date('2025-01-19'),
          paymentMethod: 'bank_transfer',
          status: 'completed',
          processorFeeCents: 0, // No fee for bank transfer
          netAmountCents: 50000,
          referenceNumber: 'WIRE-20250119-001',
          description: 'Advance payment for future services',
          processedAt: new Date('2025-01-19T11:45:00'),
          createdAt: new Date('2025-01-19T11:40:00')
        },
        {
          id: '4',
          paymentNumber: 'PAY-2025-004',
          clientId: 'client-2',
          clientName: 'Sarah Johnson',
          invoiceId: 'inv-2',
          invoiceNumber: 'INV-2025-002',
          amountCents: 96660, // $966.60
          paymentDate: new Date('2025-01-22'),
          paymentMethod: 'stripe',
          status: 'pending',
          processorFeeCents: 2996, // Estimated 3.1%
          netAmountCents: 93664,
          referenceNumber: 'REF-20250122-001',
          description: 'Payment for Invoice INV-2025-002',
          createdAt: new Date('2025-01-22T08:30:00')
        },
        {
          id: '5',
          paymentNumber: 'PAY-2025-005',
          clientId: 'client-6',
          clientName: 'Tech Solutions Inc',
          amountCents: 25000, // $250.00
          paymentDate: new Date('2025-01-18'),
          paymentMethod: 'stripe',
          status: 'failed',
          processorFeeCents: 0, // No fee for failed payment
          netAmountCents: 0,
          referenceNumber: 'REF-20250118-001',
          description: 'Payment failed - insufficient funds',
          createdAt: new Date('2025-01-18T16:20:00')
        }
      ];

      setPayments(mockPayments);
      toast({
        title: 'Payments loaded',
        description: `Loaded ${mockPayments.length} payment records.`
      });
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: 'Error loading payments',
        description: 'Failed to load payment data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.paymentNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.referenceNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(
        (payment) => payment.paymentMethod === methodFilter
      );
    }

    // Sort by payment date (most recent first)
    filtered.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());

    setFilteredPayments(filtered);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      processing: {
        color: 'bg-blue-100 text-blue-800',
        icon: RefreshCw,
        label: 'Processing'
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Completed'
      },
      failed: {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        label: 'Failed'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        label: 'Cancelled'
      },
      refunded: {
        color: 'bg-orange-100 text-orange-800',
        icon: ArrowDownRight,
        label: 'Refunded'
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

  const getMethodBadge = (method: Payment['paymentMethod']) => {
    const methodConfig = {
      stripe: { color: 'bg-purple-100 text-purple-800', label: 'Stripe' },
      square: { color: 'bg-blue-100 text-blue-800', label: 'Square' },
      paypal: { color: 'bg-blue-100 text-blue-800', label: 'PayPal' },
      bank_transfer: {
        color: 'bg-green-100 text-green-800',
        label: 'Bank Transfer'
      },
      check: { color: 'bg-gray-100 text-gray-800', label: 'Check' },
      cash: { color: 'bg-yellow-100 text-yellow-800', label: 'Cash' }
    };

    const config = methodConfig[method];

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTotalStats = () => {
    const completedPayments = payments.filter((p) => p.status === 'completed');
    return {
      totalPayments: payments.length,
      completedPayments: completedPayments.length,
      totalRevenue: completedPayments.reduce(
        (sum, p) => sum + p.amountCents,
        0
      ),
      totalFees: completedPayments.reduce(
        (sum, p) => sum + p.processorFeeCents,
        0
      ),
      netRevenue: completedPayments.reduce(
        (sum, p) => sum + p.netAmountCents,
        0
      ),
      pendingPayments: payments.filter((p) => p.status === 'pending').length,
      failedPayments: payments.filter((p) => p.status === 'failed').length
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading payments...
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
            <h1 className='text-3xl font-bold'>Payments & Transactions</h1>
            <p className='text-muted-foreground'>
              Track all payments, fees, and transaction history
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={loadPayments} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalPayments}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.completedPayments} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className='text-xs text-muted-foreground'>Gross revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Net Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {formatCurrency(stats.netRevenue)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(stats.totalFees)} in fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Pending/Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.pendingPayments + stats.failedPayments}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.pendingPayments} pending, {stats.failedPayments} failed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Filter Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                  <Input
                    placeholder='Search by payment number, client, or reference...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='processing'>Processing</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='failed'>Failed</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                    <SelectItem value='refunded'>Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Methods</SelectItem>
                    <SelectItem value='stripe'>Stripe</SelectItem>
                    <SelectItem value='square'>Square</SelectItem>
                    <SelectItem value='paypal'>PayPal</SelectItem>
                    <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                    <SelectItem value='check'>Check</SelectItem>
                    <SelectItem value='cash'>Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Payment History ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className='py-8 text-center'>
                <CreditCard className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>No payments found</h3>
                <p className='text-muted-foreground'>
                  {payments.length === 0
                    ? 'Payment history will appear here once customers start paying'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Net Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {payment.paymentNumber}
                            </div>
                            {payment.invoiceNumber && (
                              <div className='text-sm text-muted-foreground'>
                                Invoice: {payment.invoiceNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>
                            {payment.clientName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium'>
                            {formatCurrency(payment.amountCents)}
                          </div>
                          {payment.processorFeeCents > 0 && (
                            <div className='text-sm text-muted-foreground'>
                              Fee: {formatCurrency(payment.processorFeeCents)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getMethodBadge(payment.paymentMethod)}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {payment.paymentDate.toLocaleDateString()}
                            </div>
                            {payment.processedAt && (
                              <div className='text-muted-foreground'>
                                {payment.processedAt.toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='font-medium text-green-600'>
                            {formatCurrency(payment.netAmountCents)}
                          </div>
                          {payment.referenceNumber && (
                            <div className='text-xs text-muted-foreground'>
                              Ref: {payment.referenceNumber}
                            </div>
                          )}
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
