import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileArchive,
  FileText,
  AlertCircle,
  CheckCircle,
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface PDFFile {
  name: string;
  accountNumber: string;
  customerName: string;
  blob: Blob;
}

interface ZipUploadComponentProps {
  onFilesExtracted: (files: PDFFile[]) => void;
  extractedFiles: PDFFile[];
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const ZipUploadComponent: React.FC<ZipUploadComponentProps> = ({
  onFilesExtracted,
  extractedFiles,
  isProcessing,
  setIsProcessing
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [localExtractedFiles, setLocalExtractedFiles] = useState<PDFFile[]>([]);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  // Extract account number and customer name from filename
  const parseFilename = (
    filename: string
  ): { accountNumber: string; customerName: string } => {
    // Expected format: AccountNumber_CustomerName_MonthYear.pdf
    const nameWithoutExt = filename.replace('.pdf', '');
    const parts = nameWithoutExt.split('_');

    if (parts.length >= 2) {
      return {
        accountNumber: parts[0],
        customerName: parts[1]
      };
    }

    // Fallback parsing
    return {
      accountNumber: parts[0] || 'Unknown',
      customerName: parts[1] || 'Unknown'
    };
  };

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const zipFiles = files.filter((file) =>
        file.name.toLowerCase().endsWith('.zip')
      );

      if (zipFiles.length === 0) {
        toast({
          title: 'Invalid Files',
          description: 'Please upload ZIP files only',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFiles(zipFiles);
      setErrors([]);
      toast({
        title: 'ZIP Files Uploaded',
        description: `${zipFiles.length} ZIP file(s) ready for extraction`
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
      const files = Array.from(event.dataTransfer.files);
      const zipFiles = files.filter((file) =>
        file.name.toLowerCase().endsWith('.zip')
      );

      if (zipFiles.length === 0) {
        toast({
          title: 'Invalid Files',
          description: 'Please upload ZIP files only',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFiles(zipFiles);
      setErrors([]);
      toast({
        title: 'ZIP Files Uploaded',
        description: `${zipFiles.length} ZIP file(s) ready for extraction`
      });
    },
    [toast]
  );

  const extractZipFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    setErrors([]);

    const allExtractedFiles: PDFFile[] = [];
    const extractionErrors: string[] = [];

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setExtractionProgress((i / uploadedFiles.length) * 50);

        try {
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);

          const pdfFiles = Object.keys(zipContent.files).filter(
            (filename) =>
              filename.toLowerCase().endsWith('.pdf') &&
              !zipContent.files[filename].dir
          );

          for (let j = 0; j < pdfFiles.length; j++) {
            const filename = pdfFiles[j];
            const zipFile = zipContent.files[filename];

            try {
              const blob = await zipFile.async('blob');
              const { accountNumber, customerName } = parseFilename(filename);

              allExtractedFiles.push({
                name: filename,
                accountNumber,
                customerName,
                blob
              });
            } catch (error) {
              extractionErrors.push(
                `Failed to extract ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }

          if (pdfFiles.length === 0) {
            extractionErrors.push(`No PDF files found in ${file.name}`);
          }
        } catch (error) {
          extractionErrors.push(
            `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      setExtractionProgress(100);
      setLocalExtractedFiles(allExtractedFiles);
      setErrors(extractionErrors);

      if (allExtractedFiles.length > 0) {
        onFilesExtracted(allExtractedFiles);
        toast({
          title: 'Extraction Complete',
          description: `Successfully extracted ${allExtractedFiles.length} PDF files`
        });
      }

      if (extractionErrors.length > 0) {
        toast({
          title: 'Some Issues Found',
          description: `${extractionErrors.length} files had extraction issues`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Extraction Failed',
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setLocalExtractedFiles([]);
      setErrors([]);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Upload ZIP Files
          </CardTitle>
          <CardDescription>
            Upload ZIP files containing the PDF statements from the PDF Splitter
            tool
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div
            className='cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50'
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('zip-upload')?.click()}
          >
            <FileArchive className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
            <p className='text-sm font-medium'>
              Drop ZIP files here or click to browse
            </p>
            <p className='text-xs text-muted-foreground'>
              Supports multiple ZIP files
            </p>
          </div>
          <input
            id='zip-upload'
            type='file'
            accept='.zip'
            multiple
            onChange={handleFileUpload}
            className='hidden'
          />

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className='space-y-2'>
              <h4 className='font-medium'>
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div className='max-h-40 space-y-2 overflow-y-auto'>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between rounded border p-2'
                  >
                    <div className='flex items-center gap-2'>
                      <FileArchive className='h-4 w-4 text-blue-600' />
                      <span className='text-sm'>{file.name}</span>
                      <span className='text-xs text-muted-foreground'>
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => removeFile(index)}
                      disabled={isExtracting}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                onClick={extractZipFiles}
                disabled={isExtracting || isProcessing}
                className='w-full'
              >
                {isExtracting ? (
                  <>
                    <FileText className='mr-2 h-4 w-4 animate-pulse' />
                    Extracting PDFs...
                  </>
                ) : (
                  <>
                    <FileText className='mr-2 h-4 w-4' />
                    Extract PDF Files
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Extraction Progress */}
          {isExtracting && (
            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>Extracting files...</span>
                <span>{Math.round(extractionProgress)}%</span>
              </div>
              <Progress value={extractionProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Files Results */}
      {localExtractedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-600' />
              Extracted PDF Files ({localExtractedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='max-h-60 space-y-2 overflow-y-auto'>
              {localExtractedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded border p-2'
                >
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-red-600' />
                    <div>
                      <p className='text-sm font-medium'>{file.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        Account: {file.accountNumber} • Customer:{' '}
                        {file.customerName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
              Extraction Issues ({errors.length})
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

export default ZipUploadComponent;
