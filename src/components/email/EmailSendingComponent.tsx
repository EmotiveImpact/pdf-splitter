import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Settings,
  Calendar
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import EmailScheduler from './EmailScheduler';

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

interface EmailResult {
  customer: CustomerData;
  success: boolean;
  error?: string;
}

interface EmailSendingComponentProps {
  matchedFiles: MatchedFile[];
  emailTemplate: EmailTemplate;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const EmailSendingComponent: React.FC<EmailSendingComponentProps> = ({
  matchedFiles,
  emailTemplate,
  isProcessing,
  setIsProcessing
}) => {
  const [mailgunDomain, setMailgunDomain] = useState('');
  const [mailgunApiKey, setMailgunApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('statements@newwatersystems.com');
  const [fromName, setFromName] = useState('New Water Systems');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [currentlySending, setCurrentlySending] = useState('');
  const [emailResults, setEmailResults] = useState<EmailResult[]>([]);
  const [showConfig, setShowConfig] = useState(true);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('send');
  const { toast } = useToast();

  // Use the matchedFiles prop directly

  const processTemplate = (
    template: string,
    data: MatchedFile
  ): { subject: string; body: string } => {
    const lines = template.split('\n');
    const subjectLine = lines.find((line) => line.startsWith('Subject:'));
    const subject = subjectLine
      ? subjectLine.replace('Subject:', '').trim()
      : 'Your Statement';
    const body = lines
      .slice(lines.findIndex((line) => line.startsWith('Subject:')) + 1)
      .join('\n')
      .trim();

    const processedSubject = subject
      .replace(/\{\{customerName\}\}/g, data.customer.customerName)
      .replace(/\{\{accountNumber\}\}/g, data.customer.accountNumber)
      .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString());

    const processedBody = body
      .replace(/\{\{customerName\}\}/g, data.customer.customerName)
      .replace(/\{\{accountNumber\}\}/g, data.customer.accountNumber)
      .replace(/\{\{currentDate\}\}/g, new Date().toLocaleDateString());

    return { subject: processedSubject, body: processedBody };
  };

  const sendSingleEmail = async (
    matchData: MatchedFile
  ): Promise<EmailResult> => {
    const { subject, body } = processTemplate(emailTemplate.content, matchData);

    // Create FormData for Mailgun API
    const formData = new FormData();
    formData.append('from', `${fromName} <${fromEmail}>`);
    formData.append('to', matchData.customer.email);
    formData.append('subject', subject);
    formData.append('text', body);

    // Attach PDF
    formData.append('attachment', matchData.file.blob, matchData.file.name);

    try {
      const response = await fetch(
        `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return {
        customer: matchData.customer,
        success: true
      };
    } catch (error) {
      return {
        customer: matchData.customer,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const sendAllEmails = async () => {
    if (!mailgunDomain || !mailgunApiKey) {
      toast({
        title: 'Configuration Required',
        description: 'Please provide Mailgun domain and API key',
        variant: 'destructive'
      });
      return;
    }

    setIsSending(true);
    setSendingProgress(0);
    setEmailResults([]);

    const results: EmailResult[] = [];
    const total = matchedFiles.length;

    for (let i = 0; i < matchedFiles.length; i++) {
      const matchData = matchedFiles[i];
      setCurrentlySending(matchData.customer.customerName);

      const result = await sendSingleEmail(matchData);
      results.push(result);

      const progress = ((i + 1) / total) * 100;
      setSendingProgress(progress);

      // Small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setEmailResults(results);
    setCurrentlySending('');
    setIsSending(false);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    toast({
      title: 'Email Sending Complete',
      description: `${successful} emails sent successfully, ${failed} failed`,
      variant: failed > 0 ? 'destructive' : 'default'
    });
  };

  const testConfiguration = async () => {
    if (!mailgunDomain || !mailgunApiKey) {
      toast({
        title: 'Configuration Required',
        description: 'Please provide Mailgun domain and API key',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(
        `https://api.mailgun.net/v3/${mailgunDomain}`,
        {
          headers: {
            Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: 'Configuration Valid',
          description: 'Mailgun configuration is working correctly'
        });
      } else {
        toast({
          title: 'Configuration Error',
          description: 'Invalid Mailgun domain or API key',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to Mailgun API',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Enhanced Email Sending Interface */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Send className='h-5 w-5' />
            Professional Email Delivery
          </CardTitle>
          <CardDescription>
            Send or schedule personalized emails with PDF attachments to{' '}
            {matchedFiles.length} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='send' className='flex items-center gap-2'>
                <Send className='h-4 w-4' />
                Send Emails
              </TabsTrigger>
              <TabsTrigger value='schedule' className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Schedule
              </TabsTrigger>
              <TabsTrigger value='config' className='flex items-center gap-2'>
                <Settings className='h-4 w-4' />
                Configuration
              </TabsTrigger>
            </TabsList>

            {/* Send Emails Tab */}
            <TabsContent value='send' className='space-y-6'>
              {/* Sending Stats */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {matchedFiles.length}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Ready to Send
                  </div>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {emailResults.filter((r) => r.success).length}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Sent Successfully
                  </div>
                </div>
                <div className='rounded-lg border p-4 text-center'>
                  <div className='text-2xl font-bold text-red-600'>
                    {emailResults.filter((r) => !r.success).length}
                  </div>
                  <div className='text-sm text-muted-foreground'>Failed</div>
                </div>
              </div>

              {/* Sending Progress */}
              {isSending && (
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span>Sending emails...</span>
                    <span>{Math.round(sendingProgress)}%</span>
                  </div>
                  <Progress value={sendingProgress} />
                  {currentlySending && (
                    <p className='text-sm text-muted-foreground'>
                      Currently sending to: {currentlySending}
                    </p>
                  )}
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={sendAllEmails}
                disabled={
                  isSending ||
                  isProcessing ||
                  matchedFiles.length === 0 ||
                  !mailgunDomain ||
                  !mailgunApiKey
                }
                className='w-full'
                size='lg'
              >
                {isSending ? (
                  <>
                    <Clock className='mr-2 h-4 w-4 animate-pulse' />
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    Send All Emails Now
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value='schedule' className='space-y-6'>
              <EmailScheduler
                recipientCount={matchedFiles.length}
                onSchedule={setScheduledFor}
                onSendNow={() => {
                  setActiveTab('send');
                  sendAllEmails();
                }}
                isProcessing={isSending || isProcessing}
              />
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value='config' className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='mailgun-domain'>Mailgun Domain</Label>
                  <Input
                    id='mailgun-domain'
                    value={mailgunDomain}
                    onChange={(e) => setMailgunDomain(e.target.value)}
                    placeholder='mg.yourdomain.com'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='mailgun-api-key'>Mailgun API Key</Label>
                  <Input
                    id='mailgun-api-key'
                    type='password'
                    value={mailgunApiKey}
                    onChange={(e) => setMailgunApiKey(e.target.value)}
                    placeholder='key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='from-email'>From Email</Label>
                  <Input
                    id='from-email'
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder='statements@yourdomain.com'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='from-name'>From Name</Label>
                  <Input
                    id='from-name'
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder='Your Company Name'
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <Button variant='outline' onClick={testConfiguration}>
                  Test Configuration
                </Button>
                <Button
                  onClick={() => setActiveTab('send')}
                  disabled={!mailgunDomain || !mailgunApiKey}
                >
                  Configuration Complete
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sending Results */}
      {emailResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sending Results</CardTitle>
            <CardDescription>
              Detailed results for each email sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {emailResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    result.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    {result.success ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <AlertCircle className='h-4 w-4 text-red-600' />
                    )}
                    <div>
                      <p className='text-sm font-medium'>
                        {result.customer.customerName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {result.customer.email}
                      </p>
                      {result.error && (
                        <p className='text-xs text-red-600'>{result.error}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      result.success
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }
                  >
                    {result.success ? 'Sent' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailSendingComponent;
