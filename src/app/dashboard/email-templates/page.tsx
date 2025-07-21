'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  FileEdit,
  Plus,
  Search,
  Eye,
  Copy,
  Trash2,
  Mail,
  Users,
  Calendar,
  TrendingUp,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category:
    | 'welcome'
    | 'invoice'
    | 'followup'
    | 'notification'
    | 'marketing'
    | 'custom';
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isActive: boolean;
}

const templateCategories = [
  { value: 'welcome', label: 'Welcome & Onboarding' },
  { value: 'invoice', label: 'Invoices & Billing' },
  { value: 'followup', label: 'Follow-up & Reminders' },
  { value: 'notification', label: 'Notifications' },
  { value: 'marketing', label: 'Marketing & Promotions' },
  { value: 'custom', label: 'Custom Templates' }
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for creating/editing templates
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'custom' as EmailTemplate['category']
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, categoryFilter]);

  const loadTemplates = () => {
    setIsLoading(true);
    try {
      // Mock template data - in real app, this would come from API
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome New Customer',
          subject: 'Welcome to ClientCore - Your Account is Ready!',
          content: `Dear {{customerName}},

Welcome to ClientCore! We're excited to have you on board.

Your account has been successfully created and you can now access all our services:
- PDF Processing and Splitting
- Automated Email Distribution
- Customer Management Tools
- Analytics and Reporting

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
The ClientCore Team`,
          category: 'welcome',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          usageCount: 45,
          isActive: true
        },
        {
          id: '2',
          name: 'Monthly Statement Ready',
          subject: 'Your {{monthYear}} Statement is Ready',
          content: `Dear {{customerName}},

Your monthly statement for {{monthYear}} is now available.

Account Number: {{accountNumber}}
Statement Period: {{statementPeriod}}
Total Amount: {{totalAmount}}

Please find your detailed statement attached to this email.

If you have any questions about your statement, please contact us at your convenience.

Best regards,
ClientCore Billing Team`,
          category: 'invoice',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20'),
          usageCount: 128,
          isActive: true
        },
        {
          id: '3',
          name: 'Payment Reminder',
          subject:
            'Friendly Reminder: Payment Due for Account {{accountNumber}}',
          content: `Dear {{customerName}},

This is a friendly reminder that your payment for account {{accountNumber}} is due on {{dueDate}}.

Amount Due: {{amountDue}}
Due Date: {{dueDate}}

You can make your payment online through our customer portal or contact our billing department.

Thank you for your prompt attention to this matter.

Best regards,
ClientCore Billing Team`,
          category: 'followup',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-25'),
          usageCount: 67,
          isActive: true
        },
        {
          id: '4',
          name: 'Service Update Notification',
          subject: 'Important Service Update - {{updateTitle}}',
          content: `Dear {{customerName}},

We wanted to inform you about an important update to our services.

Update: {{updateTitle}}
Effective Date: {{effectiveDate}}
Impact: {{updateDescription}}

What this means for you:
{{impactDetails}}

If you have any questions or concerns, please don't hesitate to contact our support team.

Thank you for your continued trust in ClientCore.

Best regards,
ClientCore Support Team`,
          category: 'notification',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
          usageCount: 23,
          isActive: true
        }
      ];

      setTemplates(mockTemplates);
      toast({
        title: 'Templates loaded',
        description: `Loaded ${mockTemplates.length} email templates.`
      });
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error loading templates',
        description: 'Failed to load email templates.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (template) => template.category === categoryFilter
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.subject || !formData.content) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      category: formData.category,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isActive: true
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: 'Template created',
      description: `"${formData.name}" has been created successfully.`
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
  };

  const handleUpdateTemplate = () => {
    if (
      !editingTemplate ||
      !formData.name ||
      !formData.subject ||
      !formData.content
    ) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setTemplates((prev) =>
      prev.map((template) =>
        template.id === editingTemplate.id
          ? {
              ...template,
              name: formData.name,
              subject: formData.subject,
              content: formData.content,
              category: formData.category,
              updatedAt: new Date()
            }
          : template
      )
    );

    setEditingTemplate(null);
    resetForm();

    toast({
      title: 'Template updated',
      description: `"${formData.name}" has been updated successfully.`
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.filter((template) => template.id !== templateId)
    );
    toast({
      title: 'Template deleted',
      description: 'Template has been deleted successfully.'
    });
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicatedTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    setTemplates((prev) => [duplicatedTemplate, ...prev]);
    toast({
      title: 'Template duplicated',
      description: `"${duplicatedTemplate.name}" has been created.`
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'custom'
    });
  };

  const getCategoryBadgeColor = (category: EmailTemplate['category']) => {
    const colors = {
      welcome: 'bg-green-100 text-green-800',
      invoice: 'bg-blue-100 text-blue-800',
      followup: 'bg-yellow-100 text-yellow-800',
      notification: 'bg-purple-100 text-purple-800',
      marketing: 'bg-pink-100 text-pink-800',
      custom: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.custom;
  };

  const getTotalUsage = () =>
    templates.reduce((sum, template) => sum + template.usageCount, 0);
  const getActiveTemplates = () =>
    templates.filter((template) => template.isActive).length;

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
          <span className='ml-2 text-muted-foreground'>
            Loading email templates...
          </span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Email Templates</h1>
            <p className='text-muted-foreground'>
              Create and manage email templates for consistent communication
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Create New Email Template</DialogTitle>
                <DialogDescription>
                  Create a reusable email template with placeholders for
                  personalization
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='templateName'>Template Name</Label>
                    <Input
                      id='templateName'
                      placeholder='e.g., Welcome Email'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='category'>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: value as EmailTemplate['category']
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor='subject'>Email Subject</Label>
                  <Input
                    id='subject'
                    placeholder='e.g., Welcome to {{companyName}}!'
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='content'>Email Content</Label>
                  <Textarea
                    id='content'
                    placeholder='Write your email content here. Use {{variableName}} for placeholders.'
                    rows={10}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value
                      }))
                    }
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    <Save className='mr-2 h-4 w-4' />
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {templates.length}
              </div>
              <p className='text-xs text-muted-foreground'>
                {getActiveTemplates()} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {getTotalUsage()}
              </div>
              <p className='text-xs text-muted-foreground'>Times used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-600'>
                {templateCategories.length}
              </div>
              <p className='text-xs text-muted-foreground'>
                Available categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Most Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {templates.length > 0
                  ? Math.max(...templates.map((t) => t.usageCount))
                  : 0}
              </div>
              <p className='text-xs text-muted-foreground'>Usage count</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Search className='h-5 w-5' />
              Search & Filter Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                  <Input
                    placeholder='Search templates by name, subject, or content...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter('all')}
                  size='sm'
                >
                  All
                </Button>
                {templateCategories.map((category) => (
                  <Button
                    key={category.value}
                    variant={
                      categoryFilter === category.value ? 'default' : 'outline'
                    }
                    onClick={() => setCategoryFilter(category.value)}
                    size='sm'
                  >
                    {category.label.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className='transition-shadow hover:shadow-lg'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg'>{template.name}</CardTitle>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {template.subject}
                    </p>
                  </div>
                  <Badge className={getCategoryBadgeColor(template.category)}>
                    {
                      templateCategories
                        .find((c) => c.value === template.category)
                        ?.label.split(' ')[0]
                    }
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='line-clamp-3 text-sm text-muted-foreground'>
                    {template.content.substring(0, 150)}...
                  </div>

                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-1'>
                        <TrendingUp className='h-3 w-3' />
                        {template.usageCount} uses
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {template.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' className='flex-1'>
                      <Eye className='mr-1 h-3 w-3' />
                      Preview
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className='py-8 text-center'>
              <FileEdit className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
              <h3 className='mb-2 text-lg font-medium'>No templates found</h3>
              <p className='mb-4 text-muted-foreground'>
                {templates.length === 0
                  ? 'Create your first email template to get started'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {templates.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Your First Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Template Dialog */}
        <Dialog
          open={!!editingTemplate}
          onOpenChange={() => setEditingTemplate(null)}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
              <DialogDescription>
                Update your email template content and settings
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='editTemplateName'>Template Name</Label>
                  <Input
                    id='editTemplateName'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='editCategory'>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: value as EmailTemplate['category']
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor='editSubject'>Email Subject</Label>
                <Input
                  id='editSubject'
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='editContent'>Email Content</Label>
                <Textarea
                  id='editContent'
                  rows={10}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value
                    }))
                  }
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setEditingTemplate(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateTemplate}>
                  <Save className='mr-2 h-4 w-4' />
                  Update Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
