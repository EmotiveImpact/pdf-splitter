import React, { useState } from 'react';
import { Mail, ArrowLeft, Upload, FileText, Users, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ZipUploadComponent from '@/components/email/ZipUploadComponent';
import CsvUploadComponent from '@/components/email/CsvUploadComponent';
import AccountMatchingComponent from '@/components/email/AccountMatchingComponent';
import EmailTemplateComponent from '@/components/email/EmailTemplateComponent';
import EmailSendingComponent from '@/components/email/EmailSendingComponent';

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

type WorkflowStep = 'upload-zip' | 'upload-csv' | 'match-data' | 'email-template' | 'send-emails';

const EmailDistributionTool = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload-zip');
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [matchedData, setMatchedData] = useState<MatchedData[]>([]);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = [
    { id: 'upload-zip', title: 'Upload ZIP Files', icon: Upload, description: 'Upload ZIP files containing PDF statements' },
    { id: 'upload-csv', title: 'Import Customer Data', icon: FileText, description: 'Upload CSV with customer emails and account numbers' },
    { id: 'match-data', title: 'Match & Verify', icon: Users, description: 'Match PDFs to customers by account number' },
    { id: 'email-template', title: 'Email Template', icon: Mail, description: 'Create personalized email template' },
    { id: 'send-emails', title: 'Send Emails', icon: Send, description: 'Send emails with PDF attachments' }
  ];

  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const canProceedToStep = (stepId: WorkflowStep): boolean => {
    switch (stepId) {
      case 'upload-csv': return pdfFiles.length > 0;
      case 'match-data': return pdfFiles.length > 0 && customerData.length > 0;
      case 'email-template': return matchedData.length > 0;
      case 'send-emails': return matchedData.length > 0 && emailTemplate.trim() !== '';
      default: return true;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Email Distribution Tool
          </h1>
        </div>
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">
            Send personalized emails with PDF attachments to your customers automatically.
          </p>
          <Badge className="bg-green-100 text-green-700">Now Available</Badge>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
          <CardDescription>
            Follow these steps to send personalized emails to your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step.id as WorkflowStep);

              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' :
                      status === 'current' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                      'bg-gray-100 border-gray-300 text-gray-500'}
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-medium ${
                      status === 'current' ? 'text-blue-700' :
                      status === 'completed' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute w-16 h-0.5 mt-5 ml-10 ${
                      status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                    }`} style={{ transform: 'translateX(20px)' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((getCurrentStepIndex() / (steps.length - 1)) * 100)}%</span>
            </div>
            <Progress value={(getCurrentStepIndex() / (steps.length - 1)) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 'upload-zip' && (
          <ZipUploadComponent
            onFilesExtracted={(files) => {
              setPdfFiles(files);
              if (files.length > 0) {
                setCurrentStep('upload-csv');
              }
            }}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'upload-csv' && (
          <CsvUploadComponent
            onDataParsed={(data) => {
              setCustomerData(data);
              if (data.length > 0) {
                setCurrentStep('match-data');
              }
            }}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'match-data' && (
          <AccountMatchingComponent
            pdfFiles={pdfFiles}
            customerData={customerData}
            onMatchingComplete={(matches) => {
              setMatchedData(matches);
              if (matches.length > 0) {
                setCurrentStep('email-template');
              }
            }}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'email-template' && (
          <EmailTemplateComponent
            matchedData={matchedData}
            onTemplateReady={(template) => {
              setEmailTemplate(template);
              if (template.trim() !== '') {
                setCurrentStep('send-emails');
              }
            }}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === 'send-emails' && (
          <EmailSendingComponent
            matchedData={matchedData}
            emailTemplate={emailTemplate}
            onSendingComplete={() => {
              // Reset or show completion
              setProgress(100);
            }}
            isProcessing={isProcessing}
            onProgressUpdate={setProgress}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = getCurrentStepIndex();
                if (currentIndex > 0) {
                  setCurrentStep(steps[currentIndex - 1].id as WorkflowStep);
                }
              }}
              disabled={getCurrentStepIndex() === 0}
            >
              Previous Step
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset workflow
                  setCurrentStep('upload-zip');
                  setPdfFiles([]);
                  setCustomerData([]);
                  setMatchedData([]);
                  setEmailTemplate('');
                  setProgress(0);
                }}
              >
                Reset Workflow
              </Button>

              <Button
                onClick={() => {
                  const currentIndex = getCurrentStepIndex();
                  if (currentIndex < steps.length - 1) {
                    const nextStep = steps[currentIndex + 1].id as WorkflowStep;
                    if (canProceedToStep(nextStep)) {
                      setCurrentStep(nextStep);
                    }
                  }
                }}
                disabled={getCurrentStepIndex() === steps.length - 1 || !canProceedToStep(steps[getCurrentStepIndex() + 1]?.id as WorkflowStep)}
              >
                Next Step
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDistributionTool;
