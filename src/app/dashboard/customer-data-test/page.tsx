'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Upload } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import dynamic from 'next/dynamic';

// Dynamic import for CustomerDatabaseComponent
const CustomerDatabaseComponent = dynamic(
  () => import('@/components/email/CustomerDatabaseComponent'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading customer database...
      </div>
    )
  }
);

const CsvUploadComponent = dynamic(
  () => import('@/components/email/CsvUploadComponent'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading CSV upload...
      </div>
    )
  }
);

interface CustomerData {
  accountNumber: string;
  email: string;
  customerName: string;
}

export default function CustomerDataTestPage() {
  const [customerDataSource, setCustomerDataSource] = useState<
    'csv' | 'database'
  >('csv');
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold'>Customer Data Source Test</h1>
          <p className='text-muted-foreground'>
            Testing the customer data source selection functionality
          </p>
        </div>

        {/* Data Source Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Data Source</CardTitle>
            <CardDescription>
              Choose how to provide customer information for email distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex gap-4'>
              <Button
                variant={
                  customerDataSource === 'database' ? 'default' : 'outline'
                }
                onClick={() => {
                  console.log('Clicked Use Customer Database');
                  setCustomerDataSource('database');
                }}
                className='flex-1'
              >
                <Users className='mr-2 h-4 w-4' />
                Use Customer Database
              </Button>
              <Button
                variant={customerDataSource === 'csv' ? 'default' : 'outline'}
                onClick={() => {
                  console.log('Clicked Upload CSV File');
                  setCustomerDataSource('csv');
                }}
                className='flex-1'
              >
                <Upload className='mr-2 h-4 w-4' />
                Upload CSV File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Display */}
        <Card>
          <CardHeader>
            <CardTitle>Current Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Selected data source: <strong>{customerDataSource}</strong>
            </p>
            <p>
              Customer data loaded:{' '}
              <strong>{customerData.length} records</strong>
            </p>
          </CardContent>
        </Card>

        {/* Conditional Content */}
        {customerDataSource === 'database' ? (
          <CustomerDatabaseComponent
            onCustomersSelected={(customers) => {
              console.log('Customers selected:', customers);
              const customerData = customers.map((c) => ({
                accountNumber: c.accountNumber,
                email: c.email,
                customerName: c.customerName
              }));
              setCustomerData(customerData);
            }}
            selectedCount={customerData.length}
          />
        ) : (
          <CsvUploadComponent
            onDataLoaded={(data) => {
              console.log('CSV data loaded:', data);
              setCustomerData(data);
            }}
            customerData={customerData}
            isProcessing={false}
            setIsProcessing={() => {}}
          />
        )}
      </div>
    </PageContainer>
  );
}
