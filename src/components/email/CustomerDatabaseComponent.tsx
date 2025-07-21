'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Users,
  Search,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Database,
  Filter,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  account_number: string;
  customer_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  email_notifications: boolean;
  selected?: boolean;
}

interface CustomerDatabaseComponentProps {
  onCustomersSelected: (
    customers: Array<{
      accountNumber: string;
      email: string;
      customerName: string;
    }>
  ) => void;
  selectedCount?: number;
}

export default function CustomerDatabaseComponent({
  onCustomersSelected,
  selectedCount = 0
}: CustomerDatabaseComponentProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      loadCustomers();
    }
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, statusFilter, emailFilter]);

  // Helper function to update parent component with selected customers
  const updateSelectedCustomers = (updatedCustomers: Customer[]) => {
    const selectedCustomers = updatedCustomers
      .filter((customer) => customer.selected)
      .map((customer) => ({
        accountNumber: customer.account_number,
        email: customer.email,
        customerName: customer.customer_name
      }));

    onCustomersSelected(selectedCustomers);
  };

  const loadCustomers = () => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    setIsLoading(true);
    try {
      // Load mock customer data (in real app, this would come from the customer database)
      const mockCustomers: Customer[] = [
        {
          id: '1',
          account_number: 'FBNWSTX123456',
          customer_name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '(555) 123-4567',
          status: 'active',
          email_notifications: true,
          selected: false
        },
        {
          id: '2',
          account_number: 'FBNWSTX234567',
          customer_name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 234-5678',
          status: 'active',
          email_notifications: true,
          selected: false
        },
        {
          id: '3',
          account_number: 'FBNWSTX345678',
          customer_name: 'Bob Wilson',
          email: 'bob.wilson@email.com',
          phone: '(555) 456-7890',
          status: 'inactive',
          email_notifications: false,
          selected: false
        },
        {
          id: '4',
          account_number: 'FBNWSTX456789',
          customer_name: 'Maria Garcia',
          email: 'maria.garcia@email.com',
          status: 'active',
          email_notifications: true,
          selected: false
        },
        {
          id: '5',
          account_number: 'FBNWSTX567890',
          customer_name: 'David Chen',
          email: 'david.chen@email.com',
          phone: '(555) 678-9012',
          status: 'active',
          email_notifications: true,
          selected: false
        }
      ];

      setCustomers(mockCustomers);
      toast({
        title: 'Customers loaded',
        description: `Loaded ${mockCustomers.length} customers from database.`
      });
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Error loading customers',
        description: 'Failed to load customer database.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.customer_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.account_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter
      );
    }

    if (emailFilter === 'with_email') {
      filtered = filtered.filter(
        (customer) => customer.email && customer.email_notifications
      );
    } else if (emailFilter === 'without_email') {
      filtered = filtered.filter(
        (customer) => !customer.email || !customer.email_notifications
      );
    }

    setFilteredCustomers(filtered);
  };

  const toggleCustomerSelection = (customerId: string) => {
    setCustomers((prev) => {
      const updatedCustomers = prev.map((customer) =>
        customer.id === customerId
          ? { ...customer, selected: !customer.selected }
          : customer
      );

      // Update parent component with new selection
      updateSelectedCustomers(updatedCustomers);

      return updatedCustomers;
    });
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    setCustomers((prev) => {
      const updatedCustomers = prev.map((customer) => ({
        ...customer,
        selected: filteredCustomers.some((fc) => fc.id === customer.id)
          ? newSelectAll
          : customer.selected
      }));

      // Update parent component with new selection
      updateSelectedCustomers(updatedCustomers);

      return updatedCustomers;
    });
  };

  const selectActiveWithEmail = () => {
    setCustomers((prev) => {
      const updatedCustomers = prev.map((customer) => ({
        ...customer,
        selected:
          customer.status === 'active' &&
          customer.email &&
          customer.email_notifications
      }));

      // Update parent component with new selection
      updateSelectedCustomers(updatedCustomers);

      return updatedCustomers;
    });

    toast({
      title: 'Selection updated',
      description:
        'Selected all active customers with email notifications enabled.'
    });
  };

  const clearSelection = () => {
    setCustomers((prev) => {
      const updatedCustomers = prev.map((customer) => ({
        ...customer,
        selected: false
      }));

      // Update parent component with new selection (empty array)
      updateSelectedCustomers(updatedCustomers);

      return updatedCustomers;
    });
    setSelectAll(false);
  };

  const getSelectedCount = () => customers.filter((c) => c.selected).length;
  const getEligibleCount = () =>
    customers.filter(
      (c) => c.status === 'active' && c.email && c.email_notifications
    ).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Database className='h-5 w-5' />
            Loading Customer Database...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Database className='h-5 w-5' />
          Customer Database
        </CardTitle>
        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          <span>Total: {customers.length}</span>
          <span>Eligible: {getEligibleCount()}</span>
          <span>Selected: {getSelectedCount()}</span>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search and Filters */}
        <div className='flex flex-col gap-4 sm:flex-row'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
              <Input
                placeholder='Search customers...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={emailFilter === 'with_email' ? 'default' : 'outline'}
              size='sm'
              onClick={() =>
                setEmailFilter(
                  emailFilter === 'with_email' ? 'all' : 'with_email'
                )
              }
            >
              <Mail className='mr-1 h-3 w-3' />
              Email OK
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={selectActiveWithEmail}>
            <CheckCircle className='mr-1 h-3 w-3' />
            Select All Eligible
          </Button>
          <Button variant='outline' size='sm' onClick={toggleSelectAll}>
            {selectAll ? 'Deselect' : 'Select'} All Visible
          </Button>
          <Button variant='outline' size='sm' onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>

        {/* Customer Table */}
        <div className='rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email OK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Checkbox
                      checked={customer.selected || false}
                      onCheckedChange={() =>
                        toggleCustomerSelection(customer.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>{customer.customer_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className='font-mono text-sm'>
                      {customer.account_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-1 text-sm'>
                        <Mail className='h-3 w-3' />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                          <Phone className='h-3 w-3' />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {customer.email_notifications ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <XCircle className='h-4 w-4 text-red-600' />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className='py-8 text-center'>
            <Users className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
            <h3 className='mb-2 text-lg font-medium'>No customers found</h3>
            <p className='text-muted-foreground'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Selection Summary */}
        {getSelectedCount() > 0 && (
          <div className='rounded-lg bg-blue-50 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>
                  {getSelectedCount()} customers selected
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Ready for email distribution
                </p>
              </div>
              <Badge variant='default'>{getSelectedCount()} recipients</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
