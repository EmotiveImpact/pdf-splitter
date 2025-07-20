import React, { useState } from 'react';
import {
  Mail,
  Eye,
  Save,
  FileText,
  User,
  Calendar,
  Library,
  Palette
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from './RichTextEditor';
import TemplateLibrary from './TemplateLibrary';

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

interface MatchedFile {
  file: PDFFile;
  customer: CustomerData;
}

interface EmailTemplate {
  subject: string;
  content: string;
}

interface EmailTemplateComponentProps {
  onTemplateChange: (template: EmailTemplate) => void;
  template: EmailTemplate;
  matchedFiles: MatchedFile[];
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const EmailTemplateComponent: React.FC<EmailTemplateComponentProps> = ({
  onTemplateChange,
  template,
  matchedFiles,
  isProcessing,
  setIsProcessing
}) => {
  const [subject, setSubject] = useState('Your New Water Systems Statement');
  const [emailBody, setEmailBody] = useState(`<p>Dear {{customerName}},</p>

<p>Please find attached your New Water Systems statement for account <strong>{{accountNumber}}</strong>.</p>

<p>If you have any questions about your statement, please don't hesitate to contact us.</p>

<p>Thank you for choosing New Water Systems.</p>

<p>Best regards,<br>
New Water Systems Team</p>`);
  const [previewData, setPreviewData] = useState<MatchedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const { toast } = useToast();

  const availableVariables = [
    {
      name: '{{customerName}}',
      description: "Customer's full name",
      icon: User
    },
    {
      name: '{{accountNumber}}',
      description: 'Account number',
      icon: FileText
    },
    { name: '{{currentDate}}', description: 'Current date', icon: Calendar },
    { name: '{{companyName}}', description: 'Company name', icon: FileText },
    {
      name: '{{supportEmail}}',
      description: 'Support email address',
      icon: Mail
    }
  ];

  // Use the matchedFiles prop directly

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      'email-body'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText =
        emailBody.substring(0, start) + variable + emailBody.substring(end);
      setEmailBody(newText);

      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length,
          start + variable.length
        );
      }, 0);
    }
  };

  const processTemplate = (template: string, data: MatchedFile): string => {
    return template
      .replace(/\{\{customerName\}\}/g, data.customer.customerName)
      .replace(/\{\{accountNumber\}\}/g, data.customer.accountNumber)
      .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{companyName\}\}/g, 'New Water Systems')
      .replace(/\{\{supportEmail\}\}/g, 'support@newwatersystems.com');
  };

  const previewEmail = () => {
    if (matchedFiles.length === 0) {
      toast({
        title: 'No Data Available',
        description: 'No matched customer data available for preview',
        variant: 'destructive'
      });
      return;
    }

    setPreviewData(matchedFiles[0]);
    setActiveTab('preview');
  };

  // Auto-set preview data when component loads
  React.useEffect(() => {
    if (matchedFiles.length > 0 && !previewData) {
      setPreviewData(matchedFiles[0]);
    }
  }, [matchedFiles, previewData]);

  const saveTemplate = () => {
    if (!subject.trim() || !emailBody.trim()) {
      toast({
        title: 'Template Incomplete',
        description: 'Please provide both subject and email body',
        variant: 'destructive'
      });
      return;
    }

    const newTemplate = {
      subject: subject,
      content: emailBody
    };
    onTemplateChange(newTemplate);

    toast({
      title: 'Template Saved',
      description: 'Email template is ready for sending'
    });
  };

  const loadDefaultTemplate = () => {
    setSubject('Your New Water Systems Statement');
    setEmailBody(`<p>Dear {{customerName}},</p>

<p>Please find attached your New Water Systems statement for account <strong>{{accountNumber}}</strong>.</p>

<p>If you have any questions about your statement, please don't hesitate to contact us.</p>

<p>Thank you for choosing New Water Systems.</p>

<p>Best regards,<br>
New Water Systems Team</p>`);
  };

  const handleTemplateSelect = (template: any) => {
    setSubject(template.subject);
    setEmailBody(template.content);
    setActiveTab('editor');
    toast({
      title: 'Template Applied',
      description: `"${template.name}" template has been loaded`
    });
  };

  return (
    <div className='space-y-6'>
      {/* Enhanced Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Mail className='h-5 w-5' />
            Professional Email Template
          </CardTitle>
          <CardDescription>
            Create rich, professional email templates for your customers (
            {matchedFiles.length} recipients)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='library' className='flex items-center gap-2'>
                <Library className='h-4 w-4' />
                Template Library
              </TabsTrigger>
              <TabsTrigger value='editor' className='flex items-center gap-2'>
                <Palette className='h-4 w-4' />
                Rich Editor
              </TabsTrigger>
              <TabsTrigger value='preview' className='flex items-center gap-2'>
                <Eye className='h-4 w-4' />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Template Library Tab */}
            <TabsContent value='library' className='space-y-4'>
              <TemplateLibrary
                onTemplateSelect={handleTemplateSelect}
                currentTemplate={{ subject, content: emailBody }}
                onSaveTemplate={(template) => {
                  toast({
                    title: 'Template Saved',
                    description: `"${template.name}" has been saved to your library`
                  });
                }}
              />
            </TabsContent>

            {/* Rich Editor Tab */}
            <TabsContent value='editor' className='space-y-6'>
              {/* Subject Line */}
              <div className='space-y-2'>
                <Label htmlFor='subject'>Email Subject</Label>
                <Input
                  id='subject'
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder='Enter email subject line'
                />
              </div>

              {/* Rich Text Editor */}
              <div className='space-y-2'>
                <Label>Email Content</Label>
                <RichTextEditor
                  content={emailBody}
                  onChange={setEmailBody}
                  placeholder='Create your professional email content...'
                />
              </div>

              {/* Template Actions */}
              <div className='flex gap-2'>
                <Button variant='outline' onClick={loadDefaultTemplate}>
                  Load Default Template
                </Button>
                <Button variant='outline' onClick={previewEmail}>
                  <Eye className='mr-2 h-4 w-4' />
                  Preview Email
                </Button>
                <Button onClick={saveTemplate} disabled={isProcessing}>
                  <Save className='mr-2 h-4 w-4' />
                  Save Template
                </Button>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value='preview' className='space-y-4'>
              {matchedFiles.length > 0 ? (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Email Preview</h4>
                    <div className='flex gap-2'>
                      {matchedFiles.slice(0, 3).map((match, index) => (
                        <Button
                          key={index}
                          variant={
                            previewData?.customer.email === match.customer.email
                              ? 'default'
                              : 'outline'
                          }
                          size='sm'
                          onClick={() => setPreviewData(match)}
                        >
                          {match.customer.customerName}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {previewData && (
                    <div className='rounded-lg border bg-muted/50 p-4'>
                      <div className='space-y-3'>
                        <div className='border-b pb-2'>
                          <div className='text-sm text-muted-foreground'>
                            To:
                          </div>
                          <div className='font-medium'>
                            {previewData.customer.email}
                          </div>
                        </div>

                        <div className='border-b pb-2'>
                          <div className='text-sm text-muted-foreground'>
                            Subject:
                          </div>
                          <div className='font-medium'>
                            {processTemplate(subject, previewData)}
                          </div>
                        </div>

                        <div>
                          <div className='mb-2 text-sm text-muted-foreground'>
                            Message:
                          </div>
                          <div
                            className='prose prose-sm max-w-none'
                            dangerouslySetInnerHTML={{
                              __html: processTemplate(emailBody, previewData)
                            }}
                          />
                        </div>

                        <div className='border-t pt-2'>
                          <div className='text-sm text-muted-foreground'>
                            Attachment:
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <FileText className='h-4 w-4 text-red-600' />
                            {previewData.file.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <Mail className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-muted-foreground'>
                    No customer data available for preview
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Template Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Template Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Recipients:</span>
                <span className='font-medium'>{matchedFiles.length}</span>
              </div>
              <div className='flex justify-between'>
                <span>Subject Length:</span>
                <span className='font-medium'>{subject.length} characters</span>
              </div>
              <div className='flex justify-between'>
                <span>Body Length:</span>
                <span className='font-medium'>
                  {emailBody.length} characters
                </span>
              </div>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Variables Used:</span>
                <span className='font-medium'>
                  {
                    availableVariables.filter(
                      (v) =>
                        subject.includes(v.name) || emailBody.includes(v.name)
                    ).length
                  }
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Template Ready:</span>
                <span
                  className={`font-medium ${subject.trim() && emailBody.trim() ? 'text-green-600' : 'text-red-600'}`}
                >
                  {subject.trim() && emailBody.trim() ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateComponent;
