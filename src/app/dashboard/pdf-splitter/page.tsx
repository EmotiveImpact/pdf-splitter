'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle
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
import PatternManager from '@/components/PatternManager';
import ProcessingStatusBar from '@/components/ProcessingStatusBar';
import DownloadManager from '@/components/DownloadManager';
import { usePatterns } from '@/hooks/usePatterns';
import CleanupSettingsComponent from '@/components/settings/CleanupSettings';
import FileCleanupManager from '@/components/cleanup/FileCleanupManager';
import {
  memoryManager,
  MemoryManager,
  type MemoryUsage
} from '@/lib/memoryManager';
import { analyticsManager } from '@/lib/analyticsManager';
import PageContainer from '@/components/layout/page-container';

interface ProcessedFile {
  info: {
    customerName: string;
    accountNumber: string;
    fileName: string;
    pageIndex: number;
  };
  blob: Blob;
}

const PDFSplitterPage = () => {
  const { patterns } = usePatterns();
  const [file, setFile] = useState<File | null>(null);
  const [monthYear, setMonthYear] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({
    filesCount: 0,
    totalBytes: 0,
    estimatedSize: '0 B',
    lastUpdated: new Date()
  });
  const { toast } = useToast();

  // Update memory usage
  const updateMemoryUsage = () => {
    setMemoryUsage(memoryManager.getMemoryUsage());
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProcessedFiles([]);
      setErrors([]);
      setProgress(0);
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid PDF file',
        variant: 'destructive'
      });
    }
  };

  const downloadSingleFile = (processedFile: ProcessedFile) => {
    const url = URL.createObjectURL(processedFile.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFile.info.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const processFile = async () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select a PDF file to process',
        variant: 'destructive'
      });
      return;
    }

    if (!monthYear.trim()) {
      toast({
        title: 'Month/Year Required',
        description: 'Please enter the month and year for file naming',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setErrors([]);
    const startTime = Date.now();

    try {
      const result = await processPDF(
        file,
        patterns.accountPatterns,
        patterns.namePatterns,
        monthYear,
        (progress) => setProgress(progress)
      );

      setProcessedFiles(result.files);
      setErrors(result.errors);

      // Store files in memory manager
      if (result.files.length > 0) {
        const batchId = MemoryManager.createBatchId();
        memoryManager.storeFiles(batchId, result.files);
        setCurrentBatchId(batchId);
        updateMemoryUsage();

        // Track analytics
        const processingTime = (Date.now() - startTime) / 1000;
        analyticsManager.trackPDFProcessing(
          result.files.length + result.errors.length,
          result.files.length,
          result.errors.length,
          processingTime,
          batchId
        );

        // Track customer activity
        result.files.forEach((file) => {
          analyticsManager.trackCustomerActivity(
            file.info.accountNumber,
            file.info.customerName
          );
        });

        toast({
          title: 'Processing Complete',
          description: `Successfully processed ${result.files.length} pages`
        });
      }

      if (result.errors.length > 0) {
        toast({
          title: 'Processing Issues',
          description: `${result.errors.length} pages had extraction issues`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: 'Processing Failed',
        description: 'An error occurred while processing the PDF',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>PDF Splitter</h1>
            <p className='text-muted-foreground'>
              Split multi-page PDFs into individual customer statements
            </p>
          </div>
        </div>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              Upload PDF File
            </CardTitle>
            <CardDescription>
              Select a multi-page PDF file containing customer statements
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='pdf-file'>PDF File</Label>
              <Input
                id='pdf-file'
                type='file'
                accept='.pdf'
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='month-year'>Month & Year (for file naming)</Label>
              <Input
                id='month-year'
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder='e.g., May 2025'
                disabled={isProcessing}
              />
            </div>

            <Button
              onClick={processFile}
              disabled={!file || !monthYear.trim() || isProcessing}
              className='w-full'
              size='lg'
            >
              {isProcessing ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing PDF...
                </>
              ) : (
                <>
                  <FileText className='mr-2 h-4 w-4' />
                  Process PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <ProcessingStatusBar
            file={file}
            isProcessing={isProcessing}
            progress={progress}
            processedFiles={processedFiles}
            errors={errors}
            onProcess={processFile}
            onDownloadAll={() => {}}
          />
        )}

        {/* Pattern Manager */}
        <PatternManager />

        {/* Cleanup Settings */}
        <CleanupSettingsComponent
          onSettingsChange={(settings) =>
            memoryManager.updateSettings(settings)
          }
          memoryUsage={memoryUsage}
        />

        {/* File Cleanup Manager */}
        <FileCleanupManager
          currentBatchId={currentBatchId || undefined}
          onFilesCleared={(batchId) => {
            if (batchId === currentBatchId) {
              setProcessedFiles([]);
              setCurrentBatchId(null);
            }
            updateMemoryUsage();
          }}
        />

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
                    onDownloadComplete={() => {
                      if (currentBatchId) {
                        memoryManager.onDownloadComplete(currentBatchId);
                        updateMemoryUsage();
                      }
                    }}
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
    </PageContainer>
  );
};

export default PDFSplitterPage;
