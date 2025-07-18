import React, { useState } from 'react';
import { Mail, Eye, Save, FileText, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface EmailTemplateComponentProps {
  matchedData: MatchedData[];
  onTemplateReady: (template: string) => void;
  isProcessing: boolean;
}

const EmailTemplateComponent: React.FC<EmailTemplateComponentProps> = ({
  matchedData,
  onTemplateReady,
  isProcessing
}) => {
  const [subject, setSubject] = useState('Your New Water Systems Statement');
  const [emailBody, setEmailBody] = useState(`Dear {{customerName}},

Please find attached your New Water Systems statement for account {{accountNumber}}.

If you have any questions about your statement, please don't hesitate to contact us.

Thank you for choosing New Water Systems.

Best regards,
New Water Systems Team`);
  const [previewData, setPreviewData] = useState<MatchedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const availableVariables = [
    { name: '{{customerName}}', description: 'Customer\'s full name', icon: User },
    { name: '{{accountNumber}}', description: 'Account number', icon: FileText },
    { name: '{{currentDate}}', description: 'Current date', icon: Calendar }
  ];

  const matchedFiles = matchedData.filter(m => m.matched);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = emailBody.substring(0, start) + variable + emailBody.substring(end);
      setEmailBody(newText);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const processTemplate = (template: string, data: MatchedData): string => {
    return template
      .replace(/\{\{customerName\}\}/g, data.customer.customerName)
      .replace(/\{\{accountNumber\}\}/g, data.customer.accountNumber)
      .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString());
  };

  const previewEmail = () => {
    if (matchedFiles.length === 0) {
      toast({
        title: "No Data Available",
        description: "No matched customer data available for preview",
        variant: "destructive",
      });
      return;
    }

    setPreviewData(matchedFiles[0]);
    setShowPreview(true);
  };

  const saveTemplate = () => {
    if (!subject.trim() || !emailBody.trim()) {
      toast({
        title: "Template Incomplete",
        description: "Please provide both subject and email body",
        variant: "destructive",
      });
      return;
    }

    const fullTemplate = `Subject: ${subject}\n\n${emailBody}`;
    onTemplateReady(fullTemplate);
    
    toast({
      title: "Template Saved",
      description: "Email template is ready for sending",
    });
  };

  const loadDefaultTemplate = () => {
    setSubject('Your New Water Systems Statement');
    setEmailBody(`Dear {{customerName}},

Please find attached your New Water Systems statement for account {{accountNumber}}.

If you have any questions about your statement, please don't hesitate to contact us.

Thank you for choosing New Water Systems.

Best regards,
New Water Systems Team`);
  };

  return (
    <div className="space-y-6">
      {/* Template Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template
          </CardTitle>
          <CardDescription>
            Create a personalized email template for your customers ({matchedFiles.length} recipients)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject line"
            />
          </div>

          {/* Available Variables */}
          <div className="space-y-3">
            <Label>Available Variables</Label>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable) => {
                const Icon = variable.icon;
                return (
                  <Button
                    key={variable.name}
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable.name)}
                    className="text-xs"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {variable.name}
                  </Button>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {availableVariables.map((variable) => (
                <div key={variable.name} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {variable.name}
                  </Badge>
                  <span>{variable.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <Label htmlFor="email-body">Email Body</Label>
            <Textarea
              id="email-body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Enter your email message..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* Template Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDefaultTemplate}>
              Load Default Template
            </Button>
            <Button variant="outline" onClick={previewEmail}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Email
            </Button>
            <Button onClick={saveTemplate} disabled={isProcessing}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      {showPreview && previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Email Preview
            </CardTitle>
            <CardDescription>
              Preview of how the email will look for {previewData.customer.customerName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <div className="text-sm text-muted-foreground">To:</div>
                  <div className="font-medium">{previewData.customer.email}</div>
                </div>
                
                <div className="border-b pb-2">
                  <div className="text-sm text-muted-foreground">Subject:</div>
                  <div className="font-medium">{processTemplate(subject, previewData)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Message:</div>
                  <div className="whitespace-pre-wrap text-sm">
                    {processTemplate(emailBody, previewData)}
                  </div>
                </div>
                
                <div className="border-t pt-2">
                  <div className="text-sm text-muted-foreground">Attachment:</div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-red-600" />
                    {previewData.pdf.name}
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Template Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Recipients:</span>
                <span className="font-medium">{matchedFiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subject Length:</span>
                <span className="font-medium">{subject.length} characters</span>
              </div>
              <div className="flex justify-between">
                <span>Body Length:</span>
                <span className="font-medium">{emailBody.length} characters</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Variables Used:</span>
                <span className="font-medium">
                  {availableVariables.filter(v => 
                    subject.includes(v.name) || emailBody.includes(v.name)
                  ).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Template Ready:</span>
                <span className={`font-medium ${subject.trim() && emailBody.trim() ? 'text-green-600' : 'text-red-600'}`}>
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
