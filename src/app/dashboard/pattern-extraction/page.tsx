'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Search,
  Plus,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePatterns } from '@/hooks/usePatterns';
import * as pdfjsLib from 'pdfjs-dist';

interface ExtractedField {
  name: string;
  value: string;
  pattern: string;
  confidence: number;
}

export default function PatternExtractionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [customFieldName, setCustomFieldName] = useState<string>('');
  const [customPattern, setCustomPattern] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { patterns, savePatterns } = usePatterns();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
      toast({
        title: 'Invalid file',
        description: 'Please upload a PDF file.',
        variant: 'destructive'
      });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      // Extract text from PDF
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
        // Process first 3 pages
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }

      setExtractedText(fullText);

      // Auto-extract common fields
      autoExtractFields(fullText);

      toast({
        title: 'PDF processed successfully',
        description: `Extracted text from ${Math.min(pdf.numPages, 3)} pages.`
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Processing failed',
        description: 'Failed to extract text from PDF.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const autoExtractFields = (text: string) => {
    const fields: ExtractedField[] = [];

    // Try existing patterns
    patterns.accountPatterns.forEach((pattern, index) => {
      const match = text.match(new RegExp(pattern, 'i'));
      if (match && match[1]) {
        fields.push({
          name: 'Account Number',
          value: match[1],
          pattern: pattern,
          confidence: 0.9 - index * 0.1 // Higher confidence for earlier patterns
        });
      }
    });

    patterns.namePatterns.forEach((pattern, index) => {
      const match = text.match(new RegExp(pattern, 'i'));
      if (match && match[1]) {
        fields.push({
          name: 'Customer Name',
          value: match[1],
          pattern: pattern,
          confidence: 0.9 - index * 0.1
        });
      }
    });

    // Try to extract other common fields
    const commonPatterns = [
      {
        name: 'Phone Number',
        pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})',
        confidence: 0.8
      },
      {
        name: 'Email Address',
        pattern: '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
        confidence: 0.9
      },
      {
        name: 'Date',
        pattern: '(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
        confidence: 0.7
      },
      { name: 'Amount', pattern: '\\$([0-9,]+\\.?[0-9]*)', confidence: 0.6 },
      {
        name: 'ZIP Code',
        pattern: '\\b([0-9]{5}(?:-[0-9]{4})?)\\b',
        confidence: 0.7
      }
    ];

    commonPatterns.forEach(({ name, pattern, confidence }) => {
      const matches = text.match(new RegExp(pattern, 'gi'));
      if (matches) {
        // Take the first match for each pattern
        fields.push({
          name,
          value: matches[0],
          pattern,
          confidence
        });
      }
    });

    // Remove duplicates and sort by confidence
    const uniqueFields = fields
      .filter(
        (field, index, self) =>
          index ===
          self.findIndex(
            (f) => f.name === field.name && f.value === field.value
          )
      )
      .sort((a, b) => b.confidence - a.confidence);

    setExtractedFields(uniqueFields);
  };

  const generatePatternFromSelection = () => {
    if (!selectedText || !customFieldName) {
      toast({
        title: 'Missing information',
        description: 'Please select text and enter a field name.',
        variant: 'destructive'
      });
      return;
    }

    // Generate a regex pattern based on the selected text
    let pattern = selectedText
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
      .replace(/\d+/g, '(\\d+)') // Replace numbers with capture groups
      .replace(/[A-Z]+/g, '([A-Z]+)') // Replace uppercase letters
      .replace(/[a-z]+/g, '([a-z]+)') // Replace lowercase letters
      .replace(/\s+/g, '\\s+'); // Replace spaces with flexible whitespace

    // Wrap in a more flexible pattern
    pattern = `${customFieldName.toLowerCase()}[:\\s]+${pattern}`;

    setCustomPattern(pattern);

    toast({
      title: 'Pattern generated',
      description: 'Review and test the generated pattern before saving.'
    });
  };

  const testCustomPattern = () => {
    if (!customPattern || !extractedText) {
      toast({
        title: 'Missing information',
        description: 'Please enter a pattern and ensure text is extracted.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const regex = new RegExp(customPattern, 'i');
      const match = extractedText.match(regex);

      if (match && match[1]) {
        toast({
          title: 'Pattern test successful',
          description: `Found: "${match[1]}"`
        });

        // Add to extracted fields
        const newField: ExtractedField = {
          name: customFieldName,
          value: match[1],
          pattern: customPattern,
          confidence: 0.8
        };

        setExtractedFields((prev) => [...prev, newField]);
      } else {
        toast({
          title: 'Pattern test failed',
          description: 'No matches found with this pattern.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Invalid pattern',
        description: 'The regex pattern is invalid.',
        variant: 'destructive'
      });
    }
  };

  const saveCustomPattern = () => {
    if (!customFieldName || !customPattern) {
      toast({
        title: 'Missing information',
        description: 'Please enter both field name and pattern.',
        variant: 'destructive'
      });
      return;
    }

    // Add to appropriate pattern array based on field name
    const updatedPatterns = { ...patterns };

    if (customFieldName.toLowerCase().includes('account')) {
      updatedPatterns.accountPatterns = [
        ...patterns.accountPatterns,
        customPattern
      ];
    } else if (
      customFieldName.toLowerCase().includes('name') ||
      customFieldName.toLowerCase().includes('customer')
    ) {
      updatedPatterns.namePatterns = [...patterns.namePatterns, customPattern];
    } else {
      // For now, add custom patterns to account patterns
      // In the future, we could create a custom patterns array
      updatedPatterns.accountPatterns = [
        ...patterns.accountPatterns,
        customPattern
      ];
    }

    savePatterns(updatedPatterns);

    toast({
      title: 'Pattern saved',
      description: `Custom pattern for "${customFieldName}" has been saved and will be available in the PDF Splitter.`
    });

    // Clear form
    setCustomFieldName('');
    setCustomPattern('');
    setSelectedText('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Text copied successfully.'
    });
  };

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold'>Pattern Extraction Tool</h1>
        <p className='text-muted-foreground'>
          Upload a PDF to extract text and create custom patterns for the PDF
          Splitter
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-5 w-5' />
            Upload PDF Sample
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center'>
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf'
                onChange={handleFileUpload}
                className='hidden'
              />
              <FileText className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
              <h3 className='mb-2 text-lg font-medium'>Upload a sample PDF</h3>
              <p className='mb-4 text-muted-foreground'>
                Upload a PDF file to extract text and identify patterns
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Choose PDF File'}
              </Button>
            </div>

            {file && (
              <div className='flex items-center gap-2 rounded-lg bg-muted p-3'>
                <FileText className='h-4 w-4' />
                <span className='font-medium'>{file.name}</span>
                <Badge variant='secondary'>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extracted Text */}
      {extractedText && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                Extracted Text
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowFullText(!showFullText)}
              >
                {showFullText ? 'Show Less' : 'Show Full Text'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative'>
              <Textarea
                value={
                  showFullText
                    ? extractedText
                    : extractedText.substring(0, 500) + '...'
                }
                readOnly
                className='min-h-[200px] font-mono text-sm'
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  const selected = target.value.substring(
                    target.selectionStart,
                    target.selectionEnd
                  );
                  if (selected.length > 0) {
                    setSelectedText(selected);
                  }
                }}
              />
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-2 top-2'
                onClick={() => copyToClipboard(extractedText)}
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
            {selectedText && (
              <div className='mt-4 rounded-lg bg-blue-50 p-3'>
                <Label className='text-sm font-medium'>Selected Text:</Label>
                <p className='mt-1 rounded border bg-white p-2 font-mono text-sm'>
                  "{selectedText}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Auto-Extracted Fields */}
      {extractedFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Search className='h-5 w-5' />
              Auto-Extracted Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {extractedFields.map((field, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <Label className='font-medium'>{field.name}</Label>
                      <Badge
                        variant={
                          field.confidence > 0.8 ? 'default' : 'secondary'
                        }
                      >
                        {Math.round(field.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      Value:{' '}
                      <span className='rounded bg-muted px-1 font-mono'>
                        {field.value}
                      </span>
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Pattern:{' '}
                      <span className='font-mono'>{field.pattern}</span>
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => copyToClipboard(field.pattern)}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Pattern Creator */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5' />
            Create Custom Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label htmlFor='fieldName'>Field Name</Label>
                <Input
                  id='fieldName'
                  placeholder='e.g., Account Number, Customer Name'
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='pattern'>Regex Pattern</Label>
                <Input
                  id='pattern'
                  placeholder='e.g., account\\s*number[:\\s]+(\\w+)'
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  className='font-mono'
                />
              </div>
            </div>

            {selectedText && (
              <div className='rounded-lg bg-yellow-50 p-3'>
                <div className='mb-2 flex items-center gap-2'>
                  <Lightbulb className='h-4 w-4 text-yellow-600' />
                  <Label className='text-sm font-medium'>
                    Smart Pattern Generation
                  </Label>
                </div>
                <p className='mb-3 text-sm text-muted-foreground'>
                  You've selected text: "{selectedText}". Generate a pattern
                  automatically?
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={generatePatternFromSelection}
                >
                  Generate Pattern
                </Button>
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={testCustomPattern}
                disabled={!customPattern || !extractedText}
              >
                <TestTube className='mr-2 h-4 w-4' />
                Test Pattern
              </Button>
              <Button
                onClick={saveCustomPattern}
                disabled={!customFieldName || !customPattern}
              >
                <Save className='mr-2 h-4 w-4' />
                Save Pattern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
