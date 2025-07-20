import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Mail
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PDFFile {
  name: string;
  accountNumber: string;
  customerName: string;
  blob: Blob;
}

interface CustomerData {
  accountNumber: string;
  email: string;
  customerName: string;
}

interface MatchedData {
  pdf: PDFFile;
  customer: CustomerData;
  matched: boolean;
}

interface AccountMatchingComponentProps {
  extractedFiles: PDFFile[];
  customerData: CustomerData[];
  onMatchingComplete: (matches: MatchedFile[]) => void;
  matchedFiles: MatchedFile[];
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

interface MatchedFile {
  file: PDFFile;
  customer: CustomerData;
}

const AccountMatchingComponent: React.FC<AccountMatchingComponentProps> = ({
  extractedFiles,
  customerData,
  onMatchingComplete,
  matchedFiles,
  isProcessing,
  setIsProcessing
}) => {
  const [matchedData, setMatchedData] = useState<MatchedData[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchStats, setMatchStats] = useState({
    total: 0,
    matched: 0,
    unmatched: 0
  });
  const { toast } = useToast();

  const performMatching = () => {
    setIsMatching(true);

    // Create a map of customer data by account number for faster lookup
    const customerMap = new Map<string, CustomerData>();
    customerData.forEach((customer) => {
      customerMap.set(customer.accountNumber.toLowerCase(), customer);
    });

    const matches: MatchedData[] = [];
    const matchedFiles: MatchedFile[] = [];

    extractedFiles.forEach((pdf) => {
      const customer = customerMap.get(pdf.accountNumber.toLowerCase());

      const matchedData = {
        pdf,
        customer: customer || {
          accountNumber: pdf.accountNumber,
          email: '',
          customerName: pdf.customerName
        },
        matched: !!customer
      };

      matches.push(matchedData);

      // Only add successfully matched files
      if (customer) {
        matchedFiles.push({
          file: pdf,
          customer: customer
        });
      }
    });

    const stats = {
      total: matches.length,
      matched: matches.filter((m) => m.matched).length,
      unmatched: matches.filter((m) => !m.matched).length
    };

    setMatchedData(matches);
    setMatchStats(stats);
    onMatchingComplete(matchedFiles);
    setIsMatching(false);

    toast({
      title: 'Matching Complete',
      description: `${stats.matched} of ${stats.total} PDFs matched with customer data`,
      variant: stats.unmatched > 0 ? 'destructive' : 'default'
    });
  };

  // Auto-perform matching when data is available
  useEffect(() => {
    if (
      extractedFiles.length > 0 &&
      customerData.length > 0 &&
      matchedData.length === 0
    ) {
      performMatching();
    }
  }, [extractedFiles, customerData]);

  const getMatchStatusBadge = (matched: boolean) => {
    return matched ? (
      <Badge className='bg-green-100 text-green-700'>
        <CheckCircle className='mr-1 h-3 w-3' />
        Matched
      </Badge>
    ) : (
      <Badge className='bg-red-100 text-red-700'>
        <AlertCircle className='mr-1 h-3 w-3' />
        No Match
      </Badge>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Matching Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Account Matching
          </CardTitle>
          <CardDescription>
            Automatically match PDF files with customer email addresses using
            account numbers
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Stats */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='rounded-lg border p-4 text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {extractedFiles.length}
              </div>
              <div className='text-sm text-muted-foreground'>PDF Files</div>
            </div>
            <div className='rounded-lg border p-4 text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {customerData.length}
              </div>
              <div className='text-sm text-muted-foreground'>
                Customer Records
              </div>
            </div>
            <div className='rounded-lg border p-4 text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {matchStats.matched}
              </div>
              <div className='text-sm text-muted-foreground'>Matches Found</div>
            </div>
          </div>

          {/* Matching Results Summary */}
          {matchedData.length > 0 && (
            <div className='rounded-lg border bg-muted/50 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <h4 className='font-medium'>Matching Results</h4>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={performMatching}
                  disabled={isMatching || isProcessing}
                >
                  <RefreshCw className='mr-2 h-3 w-3' />
                  Re-match
                </Button>
              </div>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <span>{matchStats.matched} Successfully Matched</span>
                </div>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                  <span>{matchStats.unmatched} Unmatched</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {matchedData.length === 0 && (
            <Button
              onClick={performMatching}
              disabled={
                isMatching ||
                isProcessing ||
                extractedFiles.length === 0 ||
                customerData.length === 0
              }
              className='w-full'
            >
              {isMatching ? (
                <>
                  <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  Matching Accounts...
                </>
              ) : (
                <>
                  <Users className='mr-2 h-4 w-4' />
                  Match Accounts
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Detailed Matching Results */}
      {matchedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Details</CardTitle>
            <CardDescription>
              Review the matching results and verify accuracy before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='max-h-96 space-y-3 overflow-y-auto'>
              {matchedData.map((match, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${
                    match.matched
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 space-y-2'>
                      {/* PDF Info */}
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4 text-blue-600' />
                        <div>
                          <p className='text-sm font-medium'>
                            {match.pdf.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Account: {match.pdf.accountNumber} • PDF Customer:{' '}
                            {match.pdf.customerName}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      {match.matched ? (
                        <div className='ml-6 flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-green-600' />
                          <div>
                            <p className='text-sm font-medium text-green-700'>
                              {match.customer.email}
                            </p>
                            <p className='text-xs text-green-600'>
                              CSV Customer: {match.customer.customerName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='ml-6 flex items-center gap-2'>
                          <AlertCircle className='h-4 w-4 text-red-600' />
                          <p className='text-sm text-red-700'>
                            No customer record found for account{' '}
                            {match.pdf.accountNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className='ml-4'>
                      {getMatchStatusBadge(match.matched)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Actions */}
            <div className='mt-6 border-t pt-4'>
              <div className='flex items-center justify-between'>
                <div className='text-sm text-muted-foreground'>
                  {matchStats.matched > 0 ? (
                    <span className='text-green-600'>
                      ✓ Ready to proceed with {matchStats.matched} matched files
                    </span>
                  ) : (
                    <span className='text-red-600'>
                      ⚠ No matches found - check your data and try again
                    </span>
                  )}
                </div>

                {matchStats.unmatched > 0 && (
                  <div className='text-sm text-muted-foreground'>
                    {matchStats.unmatched} files will be skipped
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unmatched Files Warning */}
      {matchStats.unmatched > 0 && (
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-yellow-800'>
              <AlertCircle className='h-5 w-5' />
              Unmatched Files Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm text-yellow-700'>
              <p>
                <strong>{matchStats.unmatched} PDF files</strong> could not be
                matched with customer email addresses.
              </p>
              <p>
                These files will be skipped during email sending. To include
                them:
              </p>
              <ul className='ml-4 list-inside list-disc space-y-1'>
                <li>
                  Check that account numbers in your CSV match those in the PDF
                  filenames
                </li>
                <li>Verify the CSV contains all necessary customer records</li>
                <li>Account number matching is case-insensitive</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountMatchingComponent;
