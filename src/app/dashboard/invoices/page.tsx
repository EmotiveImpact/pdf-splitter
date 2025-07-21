'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  invoiceDate: Date;
  dueDate: Date;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  paidCents: number;
  status:
    | 'draft'
    | 'sent'
    | 'viewed'
    | 'partial'
    | 'paid'
    | 'overdue'
    | 'cancelled'
    | 'refunded';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded' | 'failed';
  description: string;
  lineItems: InvoiceLineItem[];
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for creating new invoices
  const [invoiceData, setInvoiceData] = useState({
    clientId: '',
    description: '',
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, unitPriceCents: 0 }]
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      // Mock invoice data - in real app, this would come from API
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2025-001',
          clientId: 'client-1',
          clientName: 'John Smith',
          clientEmail: 'john.smith@email.com',
          invoiceDate: new Date('2025-01-15'),
          dueDate: new Date('2025-02-15'),
          subtotalCents: 125000, // $1,250.00
          taxCents: 10000, // $100.00
          totalCents: 135000, // $1,350.00
          paidCents: 135000, // $1,350.00 (fully paid)
          status: 'paid',
          paymentStatus: 'paid',
          description: 'Monthly PDF processing services',
          lineItems: [
            {
              id: '1',
              description: 'PDF Processing - January 2025',
              quantity: 1,
              unitPriceCents: 125000,
              totalCents: 125000
            }
          ],
          sentAt: new Date('2025-01-15T10:00:00'),
          viewedAt: new Date('2025-01-15T14:30:00'),
          paidAt: new Date('2025-01-20T09:15:00'),
          createdAt: new Date('2025-01-15T09:30:00')
        },
        {
          id: '2',
          invoiceNumber: 'INV-2025-002',
          clientId: 'client-2',
          clientName: 'Sarah Johnson',
          clientEmail: 'sarah.johnson@email.com',
          invoiceDate: new Date('2025-01-18'),
          dueDate: new Date('2025-02-18'),
          subtotalCents: 89500, // $895.00
          taxCents: 7160, // $71.60
          totalCents: 96660, // $966.60
          paidCents: 0,
          status: 'sent',
          paymentStatus: 'unpaid',
          description: 'Custom PDF processing and email distribution',
          lineItems: [
            {
              id: '2',
              description: 'PDF Processing Services',
              quantity: 1,
              unitPriceCents: 75000,
              totalCents: 75000
            },
            {
              id: '3',
              description: 'Email Distribution Setup',
              quantity: 1,
              unitPriceCents: 14500,
              totalCents: 14500
            }
          ],
          sentAt: new Date('2025-01-18T11:00:00'),
          viewedAt: new Date('2025-01-18T15:45:00'),
          createdAt: new Date('2025-01-18T10:30:00')
        },
        {
          id: '3',
          invoiceNumber: 'INV-2025-003',
          clientId: 'client-3',
          clientName: 'Bob Wilson',
          clientEmail: 'bob.wilson@email.com',
          invoiceDate: new Date('2025-01-10'),
          dueDate: new Date('2025-01-25'), // Overdue
          subtotalCents: 156000, // $1,560.00
          taxCents: 12480, // $124.80
          totalCents: 168480, // $1,684.80
          paidCents: 0,
          status: 'overdue',
          paymentStatus: 'unpaid',
          description: 'Quarterly PDF processing services',
          lineItems: [
            {
              id: '4',
              description: 'Quarterly PDF Processing',
              quantity: 3,
              unitPriceCents: 52000,
              totalCents: 156000
            }
          ],
          sentAt: new Date('2025-01-10T09:00:00'),
          viewedAt: new Date('2025-01-12T10:20:00'),
          createdAt: new Date('2025-01-10T08:30:00')
        },
        {
          id: '4',
          invoiceNumber: 'INV-2025-004',
          clientId: 'client-4',
          clientName: 'Maria Garcia',
          clientEmail: 'maria.garcia@email.com',
          invoiceDate: new Date('2025-01-20'),
          dueDate: new Date('2025-02-20'),
          subtotalCents: 67500, // $675.00
          taxCents: 5400, // $54.00
          totalCents: 72900, // $729.00
          paidCents: 36450, // $364.50 (partial payment)
          status: 'partial',
          paymentStatus: 'partial',
          description: 'PDF processing and customer management setup',
          lineItems: [
            {
              id: '5',
              description: 'PDF Processing Setup',
              quantity: 1,
              unitPriceCents: 45000,
              totalCents: 45000
            },
            {
              id: '6',
              description: 'Customer Database Setup',
              quantity: 1,
              unitPriceCents: 22500,
              totalCents: 22500
            }
          ],
          sentAt: new Date('2025-01-20T13:00:00'),
          viewedAt: new Date('2025-01-20T16:15:00'),
          createdAt: new Date('2025-01-20T12:30:00')
        }
      ];

      setInvoices(mockInvoices);
      toast({
        title: 'Invoices loaded',
        description: `Loaded ${mockInvoices.length} invoices.`
      });
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error loading invoices',
        description: 'Failed to load invoice data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Sort by invoice date (most recent first)
    filtered.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());

    setFilteredInvoices(filtered);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: {
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
        label: 'Draft'
      },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send, label: 'Sent' },
      viewed: {
        color: 'bg-purple-100 text-purple-800',
        icon: Eye,
        label: 'Viewed'
      },
      partial: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: CreditCard,
        label: 'Partial'
      },
      paid: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Paid'
      },
      overdue: {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        label: 'Overdue'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        label: 'Cancelled'
      },
      refunded: {
        color: 'bg-orange-100 text-orange-800',
        icon: AlertCircle,
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

  const getTotalStats = () => {
    return {
      totalInvoices: invoices.length,
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalCents, 0),
      paidRevenue: invoices.reduce((sum, inv) => sum + inv.paidCents, 0),
      outstandingRevenue: invoices.reduce(
        (sum, inv) => sum + (inv.totalCents - inv.paidCents),
        0
      ),
      overdueCount: invoices.filter((inv) => inv.status === 'overdue').length,
      paidCount: invoices.filter((inv) => inv.status === 'paid').length
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading invoices...
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
            <h1 className='text-3xl font-bold'>Invoices & Billing</h1>
            <p className='text-muted-foreground'>
              Manage invoices, track payments, and monitor revenue
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={loadInvoices} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-3xl'>
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a professional invoice for your client
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='clientId'>Client</Label>
                      <Select
                        value={invoiceData.clientId}
                        onValueChange={(value) =>
                          setInvoiceData((prev) => ({
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
                      <Label htmlFor='dueDate'>Due Date</Label>
                      <Input
                        id='dueDate'
                        type='date'
                        value={invoiceData.dueDate}
                        onChange={(e) =>
                          setInvoiceData((prev) => ({
                            ...prev,
                            dueDate: e.target.value
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='description'>Description</Label>
                    <Input
                      id='description'
                      placeholder='Brief description of services'
                      value={invoiceData.description}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Line Items</Label>
                    <div className='space-y-2'>
                      {invoiceData.lineItems.map((item, index) => (
                        <div key={index} className='grid grid-cols-4 gap-2'>
                          <Input
                            placeholder='Description'
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...invoiceData.lineItems];
                              newItems[index].description = e.target.value;
                              setInvoiceData((prev) => ({
                                ...prev,
                                lineItems: newItems
                              }));
                            }}
                          />
                          <Input
                            type='number'
                            placeholder='Qty'
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...invoiceData.lineItems];
                              newItems[index].quantity =
                                parseInt(e.target.value) || 1;
                              setInvoiceData((prev) => ({
                                ...prev,
                                lineItems: newItems
                              }));
                            }}
                          />
                          <Input
                            type='number'
                            placeholder='Unit Price'
                            value={item.unitPriceCents / 100}
                            onChange={(e) => {
                              const newItems = [...invoiceData.lineItems];
                              newItems[index].unitPriceCents = Math.round(
                                (parseFloat(e.target.value) || 0) * 100
                              );
                              setInvoiceData((prev) => ({
                                ...prev,
                                lineItems: newItems
                              }));
                            }}
                          />
                          <div className='flex items-center'>
                            <span className='text-sm font-medium'>
                              {formatCurrency(
                                item.quantity * item.unitPriceCents
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='mt-2'
                      onClick={() => {
                        setInvoiceData((prev) => ({
                          ...prev,
                          lineItems: [
                            ...prev.lineItems,
                            { description: '', quantity: 1, unitPriceCents: 0 }
                          ]
                        }));
                      }}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add Line Item
                    </Button>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button>
                      <FileText className='mr-2 h-4 w-4' />
                      Create Invoice
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalInvoices}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.paidCount} paid
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
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(stats.paidRevenue)} collected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {formatCurrency(stats.outstandingRevenue)}
              </div>
              <p className='text-xs text-muted-foreground'>Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.overdueCount}
              </div>
              <p className='text-xs text-muted-foreground'>Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Filter Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                  <Input
                    placeholder='Search by invoice number, client, or description...'
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
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='sent'>Sent</SelectItem>
                    <SelectItem value='viewed'>Viewed</SelectItem>
                    <SelectItem value='partial'>Partial</SelectItem>
                    <SelectItem value='paid'>Paid</SelectItem>
                    <SelectItem value='overdue'>Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Invoices ({filteredInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className='py-8 text-center'>
                <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>No invoices found</h3>
                <p className='text-muted-foreground'>
                  {invoices.length === 0
                    ? 'Create your first invoice to start billing customers'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {invoice.invoiceNumber}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {invoice.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {invoice.clientName}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {invoice.clientEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>
                              {formatCurrency(invoice.totalCents)}
                            </div>
                            {invoice.paidCents > 0 && (
                              <div className='text-sm text-green-600'>
                                {formatCurrency(invoice.paidCents)} paid
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {invoice.dueDate.toLocaleDateString()}
                            </div>
                            {invoice.status === 'overdue' && (
                              <div className='text-xs text-red-600'>
                                {Math.ceil(
                                  (new Date().getTime() -
                                    invoice.dueDate.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}{' '}
                                days overdue
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Download className='h-4 w-4' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Send className='h-4 w-4' />
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
