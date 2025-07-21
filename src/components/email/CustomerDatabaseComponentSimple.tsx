'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Database
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

interface CustomerDatabaseComponentSimpleProps {
  onCustomersSelected: (
    customers: Array<{
      accountNumber: string;
      email: string;
      customerName: string;
    }>
  ) => void;
}

export default function CustomerDatabaseComponentSimple({
  onCustomersSelected
}: CustomerDatabaseComponentSimpleProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    try {
      // Mock customer data
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
          status: 'active',
          email_notifications: true,
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

  const handleCustomerToggle = (customerId: string) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId
        ? { ...customer, selected: !customer.selected }
        : customer
    );

    setCustomers(updatedCustomers);

    // Immediately notify parent of selection change
    const selectedCustomers = updatedCustomers
      .filter((customer) => customer.selected)
      .map((customer) => ({
        accountNumber: customer.account_number,
        email: customer.email,
        customerName: customer.customer_name
      }));

    onCustomersSelected(selectedCustomers);
  };

  const handleSelectAll = () => {
    const allSelected = customers.every((c) => c.selected);
    const updatedCustomers = customers.map((customer) => ({
      ...customer,
      selected: !allSelected
    }));

    setCustomers(updatedCustomers);

    // Immediately notify parent of selection change
    const selectedCustomers = updatedCustomers
      .filter((customer) => customer.selected)
      .map((customer) => ({
        accountNumber: customer.account_number,
        email: customer.email,
        customerName: customer.customer_name
      }));

    onCustomersSelected(selectedCustomers);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.account_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = customers.filter((c) => c.selected).length;

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
          <span>Selected: {selectedCount}</span>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
          <Input
            placeholder='Search customers...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Quick Actions */}
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={handleSelectAll}>
            <CheckCircle className='mr-1 h-3 w-3' />
            {customers.every((c) => c.selected) ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Customer Table */}
        <div className='rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-12'>Select</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Checkbox
                      checked={customer.selected || false}
                      onCheckedChange={() => handleCustomerToggle(customer.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className='font-medium'>{customer.customer_name}</div>
                    {customer.phone && (
                      <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                        <Phone className='h-3 w-3' />
                        {customer.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='font-mono text-sm'>
                      {customer.account_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1 text-sm'>
                      <Mail className='h-3 w-3' />
                      {customer.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant={
                          customer.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {customer.status}
                      </Badge>
                      {customer.email_notifications && (
                        <CheckCircle className='h-4 w-4 text-green-600' />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Selection Summary */}
        {selectedCount > 0 && (
          <div className='rounded-lg bg-blue-50 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium'>
                  {selectedCount} customers selected
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Ready for email distribution
                </p>
              </div>
              <Badge variant='default'>{selectedCount} recipients</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
