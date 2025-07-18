import React from 'react';
import { Mail, ArrowLeft, Clock, CheckCircle, Upload, FileText, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EmailDistributionTool = () => {
  const plannedFeatures = [
    {
      title: 'ZIP File Upload',
      description: 'Upload ZIP files containing split PDF statements',
      icon: Upload,
      status: 'planned'
    },
    {
      title: 'CSV Customer Data',
      description: 'Import customer emails and account numbers via CSV',
      icon: FileText,
      status: 'planned'
    },
    {
      title: 'Smart Matching',
      description: 'Automatically match PDFs to customer emails by account number',
      icon: CheckCircle,
      status: 'planned'
    },
    {
      title: 'Email Templates',
      description: 'Create and customize email templates with variables',
      icon: Mail,
      status: 'planned'
    },
    {
      title: 'Bulk Email Sending',
      description: 'Send personalized emails with PDF attachments via Mailgun',
      icon: Send,
      status: 'planned'
    }
  ];

  const workflow = [
    {
      step: 1,
      title: 'Upload ZIP Files',
      description: 'Upload ZIP files containing your split PDF statements from the PDF Splitter tool'
    },
    {
      step: 2,
      title: 'Import Customer Data',
      description: 'Upload a CSV file with customer emails and account numbers'
    },
    {
      step: 3,
      title: 'Match & Verify',
      description: 'System automatically matches PDFs to customers by account number'
    },
    {
      step: 4,
      title: 'Customize Email',
      description: 'Create or select an email template with personalized variables'
    },
    {
      step: 5,
      title: 'Send Emails',
      description: 'Bulk send personalized emails with correct PDF attachments'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <Badge className="bg-yellow-100 text-yellow-700">Coming Soon</Badge>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Clock className="h-5 w-5" />
            Development in Progress
          </CardTitle>
          <CardDescription className="text-yellow-700">
            This tool is currently being developed and will be available soon. It will integrate seamlessly with the PDF Splitter tool to create a complete workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-700">
            <p><strong>Estimated Release:</strong> Next week</p>
            <p><strong>Integration:</strong> Mailgun API for reliable email delivery</p>
          </div>
        </CardContent>
      </Card>

      {/* Planned Features */}
      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
          <CardDescription>
            Here's what this tool will be able to do when it's ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {plannedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Planned
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Preview */}
      <Card>
        <CardHeader>
          <CardTitle>How It Will Work</CardTitle>
          <CardDescription>
            The complete workflow from PDF splitting to email delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="h-5 w-5" />
            Seamless Integration
          </CardTitle>
          <CardDescription className="text-blue-700">
            This tool will work perfectly with the PDF Splitter tool you're already using.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Use ZIP files directly from the PDF Splitter</p>
            <p>• Account numbers will automatically match between tools</p>
            <p>• Consistent file naming ensures perfect compatibility</p>
            <p>• Complete workflow: Split PDFs → Email Customers</p>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          In the meantime, continue using the PDF Splitter tool to prepare your files.
        </p>
        <Button asChild>
          <Link to="/tools/pdf-splitter">
            <FileText className="h-4 w-4 mr-2" />
            Go to PDF Splitter
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default EmailDistributionTool;
