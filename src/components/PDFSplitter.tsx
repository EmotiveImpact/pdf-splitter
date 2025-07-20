import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2
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
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { processPDF } from '@/lib/pdfProcessor';
import PatternManager from './PatternManager';
import ProcessingStatusBar from './ProcessingStatusBar';
import DownloadManager from './DownloadManager';
import { usePatterns } from '@/hooks/usePatterns';

interface ExtractedInfo {
  customerName: string;
  accountNumber: string;
  fileName: string;
  pageIndex: number;
}

interface ProcessedFile {
  info: ExtractedInfo;
  blob: Blob;
}

const PDFSplitter = () => {
  const { patterns } = usePatterns();
  const [file, setFile] = useState<File | null>(null);
  const [monthYear, setMonthYear] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const uploadedFile = event.target.files?.[0];
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        setFile(uploadedFile);
        setProcessedFiles([]);
        setErrors([]);
        toast({
          title: 'PDF Uploaded',
          description: `${uploadedFile.name} is ready for processing`
        });
      } else {
        toast({
          title: 'Invalid File',
          description: 'Please upload a PDF file',
          variant: 'destructive'
        });
      }
    },
    [toast]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile && droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setProcessedFiles([]);
        setErrors([]);
        toast({
          title: 'PDF Uploaded',
          description: `${droppedFile.name} is ready for processing`
        });
      }
    },
    [toast]
  );

  const processPDFFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setErrors([]);

    try {
      // Combine patterns with | separator for multiple pattern support
      const combinedAccountPattern = patterns.accountPatterns.join('|');
      const combinedNamePattern = patterns.namePatterns.join('|');

      const result = await processPDF(
        file,
        combinedAccountPattern,
        combinedNamePattern,
        monthYear,
        (progress) => setProgress(progress)
      );

      setProcessedFiles(result.files);
      setErrors(result.errors);

      if (result.files.length > 0) {
        toast({
          title: 'Processing Complete',
          description: `Successfully processed ${result.files.length} pages`
        });
      }

      if (result.errors.length > 0) {
        toast({
          title: 'Some Issues Found',
          description: `${result.errors.length} pages had extraction issues`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Processing Failed',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSingleFile = (processedFile: ProcessedFile) => {
    const url = URL.createObjectURL(processedFile.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFile.info.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='min-h-screen'>
      {/* New Water Systems Header */}
      <div className='bg-blue-600 px-6 py-3 text-white'>
        <div className='mx-auto flex max-w-4xl items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Building2 className='h-6 w-6' />
            <span className='text-lg font-semibold'>NEW WATER SYSTEMS</span>
          </div>
          <div className='text-sm'>Hi Lisa! 👋</div>
        </div>
      </div>

      <ProcessingStatusBar
        file={file}
        isProcessing={isProcessing}
        progress={progress}
        processedFiles={processedFiles}
        errors={errors}
        onProcess={processPDFFile}
        onDownloadAll={() => {}} // Placeholder - downloads now handled by DownloadManager
      />

      <div className='mx-auto max-w-4xl space-y-6 p-6'>
        {/* Header */}
        <div className='space-y-4 text-center'>
          <h1 className='bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent'>
            PDF Account Splitter
          </h1>
          <div className='space-y-2'>
            <p className='text-lg text-muted-foreground'>
              Welcome Lisa! This tool will help you automatically split PDFs and
              name files by customer account information.
            </p>
            <p className='text-sm font-medium text-blue-600'>
              Optimized for New Water Systems bill statement processing
            </p>
          </div>
        </div>

        <PatternManager />

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              Upload PDF Bill Statements
            </CardTitle>
            <CardDescription>
              Upload your New Water Systems multi-page PDF bill statements to
              automatically split them by customer account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className='cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50'
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {file ? (
                <div className='space-y-2'>
                  <FileText className='mx-auto h-12 w-12 text-primary' />
                  <p className='text-sm font-medium'>{file.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Upload className='mx-auto h-12 w-12 text-muted-foreground' />
                  <p className='text-sm font-medium'>
                    Drop your PDF here or click to browse
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Maximum file size: 50MB
                  </p>
                </div>
              )}
            </div>
            <input
              id='file-upload'
              type='file'
              accept='.pdf'
              onChange={handleFileUpload}
              className='hidden'
            />
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle>File Naming Configuration</CardTitle>
            <CardDescription>
              Set optional month/year for consistent file naming
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='month-year'>Month/Year (optional)</Label>
              <Input
                id='month-year'
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder='May 2025'
              />
              <p className='text-xs text-muted-foreground'>
                Will be included in filename:
                AccountNumber_CustomerName_MonthYear.pdf
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Process Button */}
        {file && (
          <div className='flex justify-center'>
            <Button
              onClick={processPDFFile}
              disabled={isProcessing}
              variant={isProcessing ? 'processing' : 'hero'}
              size='lg'
              className='min-w-48'
            >
              {isProcessing ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                'Split PDF'
              )}
            </Button>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Processing pages...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {(processedFiles.length > 0 || errors.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='text-success h-5 w-5' />
                Processing Results
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Enhanced Download Manager */}
              {processedFiles.length > 0 && (
                <div className='space-y-4'>
                  <DownloadManager
                    files={processedFiles}
                    disabled={isProcessing}
                    monthYear={monthYear}
                  />

                  <div className='space-y-2'>
                    <h4 className='text-success font-medium'>
                      Successfully Processed ({processedFiles.length})
                    </h4>
                    <div className='max-h-60 space-y-2 overflow-y-auto'>
                      {processedFiles.map((file, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between rounded-lg border p-3'
                        >
                          <div className='flex-1'>
                            <p className='font-medium'>{file.info.fileName}</p>
                            <p className='text-sm text-muted-foreground'>
                              {file.info.customerName} •{' '}
                              {file.info.accountNumber}
                            </p>
                          </div>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => downloadSingleFile(file)}
                          >
                            <Download className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='flex items-center gap-2 font-medium text-destructive'>
                    <AlertCircle className='h-4 w-4' />
                    Issues Found ({errors.length})
                  </h4>
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
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Water Systems Footer */}
      <footer className='mt-12 border-t bg-muted/30'>
        <div className='mx-auto max-w-4xl p-6 text-center'>
          <div className='flex items-center justify-center gap-2 text-muted-foreground'>
            <Building2 className='h-4 w-4' />
            <span className='text-sm'>
              © 2024 New Water Systems - Professional PDF Processing Solutions
            </span>
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>
            Designed for efficient bill statement processing and customer
            account management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PDFSplitter;
