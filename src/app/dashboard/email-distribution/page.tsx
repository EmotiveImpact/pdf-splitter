'use client';

import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Users,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Dynamic imports for email components to avoid SSR issues
const ZipUploadComponent = dynamic(
  () => import('@/components/email/ZipUploadComponent'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading ZIP upload...
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
import dynamic from 'next/dynamic';

// Dynamically import CustomerDatabaseComponent to avoid SSR issues
const CustomerDatabaseComponent = dynamic(
  () => import('@/components/email/CustomerDatabaseComponentSimple'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading customer database...
      </div>
    )
  }
);
const AccountMatchingComponent = dynamic(
  () => import('@/components/email/AccountMatchingComponent'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading account matching...
      </div>
    )
  }
);

const EmailTemplateComponent = dynamic(
  () => import('@/components/email/EmailTemplateComponent'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading email template...
      </div>
    )
  }
);

const EmailSendingComponent = dynamic(
  () => import('@/components/email/EmailSendingComponent'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading email sending...
      </div>
    )
  }
);
const FileCleanupManager = dynamic(
  () => import('@/components/cleanup/FileCleanupManager'),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center py-8'>
        Loading file cleanup...
      </div>
    )
  }
);
import PageContainer from '@/components/layout/page-container';

interface PDFFile {
  name: string;
  accountNumber: string;
  customerName: string;
  blob: Blob;
}

interface ProcessedFile {
  info: {
    customerName: string;
    accountNumber: string;
    fileName: string;
    pageIndex: number;
  };
  blob: Blob;
}

interface CustomerData {
  accountNumber: string;
  email: string;
  customerName: string;
  phone?: string;
  address?: string;
}

interface MatchedFile {
  file: PDFFile;
  customer: CustomerData;
}

const EmailDistributionPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [extractedFiles, setExtractedFiles] = useState<PDFFile[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [customerDataSource, setCustomerDataSource] = useState<
    'csv' | 'database'
  >('csv');
  const [matchedFiles, setMatchedFiles] = useState<MatchedFile[]>([]);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: '',
    content: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Upload ZIP Files',
      description: 'Upload ZIP files containing PDFs'
    },
    {
      id: 2,
      title: 'Customer Data',
      description: 'Select customers from database or upload CSV'
    },
    {
      id: 3,
      title: 'Match Accounts',
      description: 'Match PDFs with customer emails'
    },
    {
      id: 4,
      title: 'Create Email Template',
      description: 'Design your email template'
    },
    {
      id: 5,
      title: 'Send Emails',
      description: 'Send personalized emails to customers'
    }
  ];

  const resetWorkflow = () => {
    setCurrentStep(1);
    setExtractedFiles([]);
    setCustomerData([]);
    setMatchedFiles([]);
    setEmailTemplate({ subject: '', content: '' });
    setIsProcessing(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return extractedFiles.length > 0;
      case 2:
        return customerData.length > 0;
      case 3:
        return matchedFiles.length > 0;
      case 4:
        return (
          emailTemplate.subject.trim() !== '' &&
          emailTemplate.content.trim() !== ''
        );
      default:
        return true;
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Email Distribution</h1>
            <p className='text-muted-foreground'>
              Send personalized emails with PDF attachments to your customers
            </p>
          </div>
          <Button variant='outline' onClick={resetWorkflow}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Reset Workflow
          </Button>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Email Distribution Workflow</CardTitle>
            <CardDescription>
              Follow these steps to send personalized emails to your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='mb-6 flex items-center justify-between'>
              {steps.map((step, index) => (
                <div key={step.id} className='flex items-center'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                        getStepStatus(step.id) === 'completed'
                          ? 'bg-green-500 text-white'
                          : getStepStatus(step.id) === 'current'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {getStepStatus(step.id) === 'completed' ? (
                        <CheckCircle className='h-5 w-5' />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className='mt-2 text-center'>
                      <div className='text-sm font-medium'>{step.title}</div>
                      <div className='text-xs text-muted-foreground'>
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 flex-1 ${
                        getStepStatus(step.id) === 'completed'
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className='flex items-center justify-between'>
              <Button
                variant='outline'
                onClick={prevStep}
                disabled={currentStep === 1 || isProcessing}
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                Previous
              </Button>

              <Badge variant='outline' className='px-4 py-2'>
                Step {currentStep} of {steps.length}
              </Badge>

              <Button
                onClick={nextStep}
                disabled={
                  currentStep === steps.length ||
                  !canProceedToNext() ||
                  isProcessing
                }
              >
                Next Step
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Cleanup Manager */}
        <FileCleanupManager />

        {/* Step Content */}
        {currentStep === 1 && (
          <ZipUploadComponent
            onFilesExtracted={setExtractedFiles}
            extractedFiles={extractedFiles}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}

        {currentStep === 2 && (
          <div className='space-y-4'>
            {/* Data Source Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Data Source</CardTitle>
                <CardDescription>
                  Choose how to provide customer information for email
                  distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4'>
                  <Button
                    variant={
                      customerDataSource === 'database' ? 'default' : 'outline'
                    }
                    onClick={() => setCustomerDataSource('database')}
                    className='flex-1'
                  >
                    <Users className='mr-2 h-4 w-4' />
                    Use Customer Database
                  </Button>
                  <Button
                    variant={
                      customerDataSource === 'csv' ? 'default' : 'outline'
                    }
                    onClick={() => setCustomerDataSource('csv')}
                    className='flex-1'
                  >
                    <Upload className='mr-2 h-4 w-4' />
                    Upload CSV File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Conditional Content */}
            {customerDataSource === 'database' ? (
              <CustomerDatabaseComponent
                onCustomersSelected={(customers) => {
                  const customerData = customers.map((c) => ({
                    accountNumber: c.accountNumber,
                    email: c.email,
                    customerName: c.customerName
                  }));
                  setCustomerData(customerData);
                }}
              />
            ) : (
              <CsvUploadComponent
                onDataLoaded={setCustomerData}
                customerData={customerData}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            )}
          </div>
        )}

        {currentStep === 3 && (
          <AccountMatchingComponent
            extractedFiles={extractedFiles}
            customerData={customerData}
            onMatchingComplete={setMatchedFiles}
            matchedFiles={matchedFiles}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}

        {currentStep === 4 && (
          <EmailTemplateComponent
            onTemplateChange={setEmailTemplate}
            template={emailTemplate}
            matchedFiles={matchedFiles}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}

        {currentStep === 5 && (
          <EmailSendingComponent
            matchedFiles={matchedFiles}
            emailTemplate={emailTemplate}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}

        {/* Summary Card */}
        <Card className='border-blue-200 bg-blue-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-3'>
              <Mail className='mt-0.5 h-5 w-5 text-blue-600' />
              <div className='space-y-2'>
                <h4 className='font-medium text-blue-800'>Workflow Summary</h4>
                <div className='space-y-1 text-sm text-blue-700'>
                  <p>
                    • <strong>{extractedFiles.length}</strong> PDF files
                    extracted from ZIP uploads
                  </p>
                  <p>
                    • <strong>{customerData.length}</strong> customer records
                    loaded from CSV
                  </p>
                  <p>
                    • <strong>{matchedFiles.length}</strong> successful matches
                    ready for email delivery
                  </p>
                  <p>
                    • Email template:{' '}
                    {emailTemplate.subject
                      ? `"${emailTemplate.subject}"`
                      : 'Not created yet'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default EmailDistributionPage;
