import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  X
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

interface CustomerData {
  accountNumber: string;
  email: string;
  customerName: string;
}

interface CsvUploadComponentProps {
  onDataLoaded: (data: CustomerData[]) => void;
  customerData: CustomerData[];
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CsvUploadComponent: React.FC<CsvUploadComponentProps> = ({
  onDataLoaded,
  customerData,
  isProcessing,
  setIsProcessing
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CustomerData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload a CSV file',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFile(file);
      setErrors([]);
      setParsedData([]);
      toast({
        title: 'CSV File Uploaded',
        description: `${file.name} is ready for parsing`
      });
    },
    [toast]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];

      if (!file || !file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload a CSV file',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFile(file);
      setErrors([]);
      setParsedData([]);
      toast({
        title: 'CSV File Uploaded',
        description: `${file.name} is ready for parsing`
      });
    },
    [toast]
  );

  const parseCSV = async () => {
    if (!uploadedFile) return;

    setIsParsing(true);
    setErrors([]);

    try {
      const text = await uploadedFile.text();

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as any[];
          const parsedCustomers: CustomerData[] = [];
          const parseErrors: string[] = [];

          // Check for required columns
          const firstRow = data[0];
          const hasAccountNumber =
            firstRow &&
            ('accountNumber' in firstRow ||
              'account_number' in firstRow ||
              'Account Number' in firstRow);
          const hasEmail =
            firstRow &&
            ('email' in firstRow ||
              'Email' in firstRow ||
              'email_address' in firstRow);
          const hasCustomerName =
            firstRow &&
            ('customerName' in firstRow ||
              'customer_name' in firstRow ||
              'Customer Name' in firstRow ||
              'name' in firstRow ||
              'Name' in firstRow);

          if (!hasAccountNumber || !hasEmail || !hasCustomerName) {
            parseErrors.push(
              'CSV must contain columns: Account Number, Email, Customer Name (or similar variations)'
            );
            setErrors(parseErrors);
            setIsParsing(false);
            return;
          }

          data.forEach((row, index) => {
            try {
              // Try different column name variations
              const accountNumber =
                row.accountNumber ||
                row.account_number ||
                row['Account Number'] ||
                '';
              const email = row.email || row.Email || row.email_address || '';
              const customerName =
                row.customerName ||
                row.customer_name ||
                row['Customer Name'] ||
                row.name ||
                row.Name ||
                '';

              if (!accountNumber.trim()) {
                parseErrors.push(`Row ${index + 2}: Missing account number`);
                return;
              }

              if (!email.trim()) {
                parseErrors.push(`Row ${index + 2}: Missing email address`);
                return;
              }

              if (!validateEmail(email.trim())) {
                parseErrors.push(
                  `Row ${index + 2}: Invalid email format: ${email}`
                );
                return;
              }

              if (!customerName.trim()) {
                parseErrors.push(`Row ${index + 2}: Missing customer name`);
                return;
              }

              parsedCustomers.push({
                accountNumber: accountNumber.trim(),
                email: email.trim().toLowerCase(),
                customerName: customerName.trim()
              });
            } catch (error) {
              parseErrors.push(
                `Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          });

          setParsedData(parsedCustomers);
          setErrors(parseErrors);

          if (parsedCustomers.length > 0) {
            onDataLoaded(parsedCustomers);
            toast({
              title: 'CSV Parsed Successfully',
              description: `Imported ${parsedCustomers.length} customer records`
            });
          }

          if (parseErrors.length > 0) {
            toast({
              title: 'Some Issues Found',
              description: `${parseErrors.length} rows had parsing issues`,
              variant: 'destructive'
            });
          }

          setIsParsing(false);
        },
        error: (error: any) => {
          setErrors([`Failed to parse CSV: ${error.message}`]);
          setIsParsing(false);
          toast({
            title: 'Parsing Failed',
            description: error.message,
            variant: 'destructive'
          });
        }
      });
    } catch (error) {
      setErrors([
        `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
      setIsParsing(false);
      toast({
        title: 'File Read Failed',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Account Number', 'Email', 'Customer Name'],
      ['FBNWSTX123456', 'john.smith@email.com', 'John Smith'],
      ['FBNWSTX789012', 'mary.johnson@email.com', 'Mary Johnson'],
      ['FBNWSTX345678', 'bob.wilson@email.com', 'Bob Wilson']
    ];

    const csvContent = sampleData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_customer_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setParsedData([]);
    setErrors([]);
  };

  return (
    <div className='space-y-6'>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Upload Customer Data CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file containing customer email addresses and account
            numbers
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Required columns: Account Number, Email, Customer Name
            </p>
            <Button variant='outline' size='sm' onClick={downloadSampleCSV}>
              <Download className='mr-2 h-3 w-3' />
              Download Sample
            </Button>
          </div>

          <div
            className='cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50'
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
            <p className='text-sm font-medium'>
              Drop CSV file here or click to browse
            </p>
            <p className='text-xs text-muted-foreground'>
              Maximum file size: 10MB
            </p>
          </div>
          <input
            id='csv-upload'
            type='file'
            accept='.csv'
            onChange={handleFileUpload}
            className='hidden'
          />

          {/* Uploaded File */}
          {uploadedFile && (
            <div className='space-y-2'>
              <h4 className='font-medium'>Uploaded File</h4>
              <div className='flex items-center justify-between rounded border p-2'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-green-600' />
                  <span className='text-sm'>{uploadedFile.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={removeFile}
                  disabled={isParsing}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>

              <Button
                onClick={parseCSV}
                disabled={isParsing || isProcessing}
                className='w-full'
              >
                {isParsing ? (
                  <>
                    <FileText className='mr-2 h-4 w-4 animate-pulse' />
                    Parsing CSV...
                  </>
                ) : (
                  <>
                    <FileText className='mr-2 h-4 w-4' />
                    Parse Customer Data
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsed Data Results */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              Customer Data ({parsedData.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='max-h-60 space-y-2 overflow-y-auto'>
              {parsedData.slice(0, 10).map((customer, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded border p-2'
                >
                  <div>
                    <p className='text-sm font-medium'>
                      {customer.customerName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {customer.accountNumber} • {customer.email}
                    </p>
                  </div>
                </div>
              ))}
              {parsedData.length > 10 && (
                <p className='py-2 text-center text-xs text-muted-foreground'>
                  ... and {parsedData.length - 10} more records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card className='border-destructive'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              Parsing Issues ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='max-h-40 space-y-1 overflow-y-auto'>
              {errors.map((error, index) => (
                <p
                  key={index}
                  className='rounded bg-destructive/10 p-2 text-sm text-destructive'
                >
                  {error}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CsvUploadComponent;
