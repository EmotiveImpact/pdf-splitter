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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  Target,
  DollarSign,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageContainer from '@/components/layout/page-container';

interface Task {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  taskType:
    | 'follow_up'
    | 'call'
    | 'email'
    | 'meeting'
    | 'payment_reminder'
    | 'document_review'
    | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  dueDate: Date;
  dueTime?: string;
  estimatedDurationMinutes?: number;
  assignedTo: string;
  createdBy: string;
  completedAt?: Date;
  completionNotes?: string;
  createdAt: Date;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state for creating new tasks
  const [taskData, setTaskData] = useState({
    clientId: '',
    title: '',
    description: '',
    taskType: 'follow_up' as Task['taskType'],
    priority: 'normal' as Task['priority'],
    dueDate: '',
    dueTime: '',
    estimatedDurationMinutes: 30
  });

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Mock task data - in real app, this would come from API
      const mockTasks: Task[] = [
        {
          id: '1',
          clientId: 'client-3',
          clientName: 'Bob Wilson',
          title: 'Follow-up on overdue payment',
          description:
            'Contact Bob regarding Invoice INV-2025-003 which is now 5 days overdue. Discuss payment options and potential payment plan.',
          taskType: 'payment_reminder',
          priority: 'high',
          status: 'pending',
          dueDate: new Date('2025-01-22'),
          dueTime: '10:00',
          estimatedDurationMinutes: 15,
          assignedTo: 'Current User',
          createdBy: 'System',
          createdAt: new Date('2025-01-21T08:00:00')
        },
        {
          id: '2',
          clientId: 'client-2',
          clientName: 'Sarah Johnson',
          title: 'Quarterly business review call',
          description:
            'Schedule and conduct quarterly business review to discuss service performance, upcoming needs, and contract renewal.',
          taskType: 'call',
          priority: 'normal',
          status: 'pending',
          dueDate: new Date('2025-01-23'),
          dueTime: '14:00',
          estimatedDurationMinutes: 60,
          assignedTo: 'Current User',
          createdBy: 'Current User',
          createdAt: new Date('2025-01-15T12:00:00')
        },
        {
          id: '3',
          clientId: 'client-1',
          clientName: 'John Smith',
          title: 'Send monthly statement',
          description:
            'Generate and send February 2025 monthly statement via email. Include summary of services provided.',
          taskType: 'email',
          priority: 'normal',
          status: 'completed',
          dueDate: new Date('2025-01-20'),
          dueTime: '09:00',
          estimatedDurationMinutes: 10,
          assignedTo: 'Current User',
          createdBy: 'System',
          completedAt: new Date('2025-01-20T09:15:00'),
          completionNotes:
            'Statement sent successfully. Customer confirmed receipt.',
          createdAt: new Date('2025-01-18T10:00:00')
        },
        {
          id: '4',
          clientId: 'client-4',
          clientName: 'Maria Garcia',
          title: 'Contract renewal discussion',
          description:
            'Meet with Maria to discuss contract renewal terms, pricing adjustments, and additional service requirements.',
          taskType: 'meeting',
          priority: 'urgent',
          status: 'in_progress',
          dueDate: new Date('2025-01-25'),
          dueTime: '11:00',
          estimatedDurationMinutes: 45,
          assignedTo: 'Current User',
          createdBy: 'Current User',
          createdAt: new Date('2025-01-20T15:30:00')
        },
        {
          id: '5',
          clientId: 'client-5',
          clientName: 'David Chen',
          title: 'Review service interruption documentation',
          description:
            "Review and respond to David's service interruption report. Provide resolution timeline and compensation if applicable.",
          taskType: 'document_review',
          priority: 'urgent',
          status: 'overdue',
          dueDate: new Date('2025-01-21'),
          dueTime: '16:00',
          estimatedDurationMinutes: 30,
          assignedTo: 'Current User',
          createdBy: 'System',
          createdAt: new Date('2025-01-20T14:30:00')
        },
        {
          id: '6',
          clientId: 'client-6',
          clientName: 'Tech Solutions Inc',
          title: 'Follow-up on failed payment',
          description:
            'Contact Tech Solutions regarding failed payment attempt. Verify payment method and assist with successful payment processing.',
          taskType: 'follow_up',
          priority: 'high',
          status: 'pending',
          dueDate: new Date('2025-01-23'),
          dueTime: '13:00',
          estimatedDurationMinutes: 20,
          assignedTo: 'Current User',
          createdBy: 'System',
          createdAt: new Date('2025-01-18T16:20:00')
        }
      ];

      setTasks(mockTasks);
      toast({
        title: 'Tasks loaded',
        description: `Loaded ${mockTasks.length} tasks.`
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error loading tasks',
        description: 'Failed to load task data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((task) => task.taskType === typeFilter);
    }

    // Sort by due date (most urgent first), then by priority
    filtered.sort((a, b) => {
      const dateA = a.dueDate.getTime();
      const dateB = b.dueDate.getTime();
      if (dateA !== dateB) return dateA - dateB;

      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setFilteredTasks(filtered);
  };

  const handleCreateTask = () => {
    if (!taskData.clientId || !taskData.title || !taskData.dueDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      clientId: taskData.clientId,
      clientName: 'Selected Client', // In real app, would lookup client name
      title: taskData.title,
      description: taskData.description,
      taskType: taskData.taskType,
      priority: taskData.priority,
      status: 'pending',
      dueDate: new Date(taskData.dueDate),
      dueTime: taskData.dueTime,
      estimatedDurationMinutes: taskData.estimatedDurationMinutes,
      assignedTo: 'Current User',
      createdBy: 'Current User',
      createdAt: new Date()
    };

    setTasks((prev) => [newTask, ...prev]);
    setIsCreateDialogOpen(false);
    resetTaskForm();

    toast({
      title: 'Task created',
      description: `"${taskData.title}" has been created successfully.`
    });
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed' as Task['status'],
              completedAt: new Date(),
              completionNotes: 'Task marked as completed'
            }
          : task
      )
    );

    toast({
      title: 'Task completed',
      description: 'Task has been marked as completed.'
    });
  };

  const resetTaskForm = () => {
    setTaskData({
      clientId: '',
      title: '',
      description: '',
      taskType: 'follow_up',
      priority: 'normal',
      dueDate: '',
      dueTime: '',
      estimatedDurationMinutes: 30
    });
  };

  const getStatusBadge = (status: Task['status']) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        label: 'Pending'
      },
      in_progress: {
        color: 'bg-blue-100 text-blue-800',
        icon: RefreshCw,
        label: 'In Progress'
      },
      completed: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Completed'
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        label: 'Cancelled'
      },
      overdue: {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        label: 'Overdue'
      }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className='mr-1 h-3 w-3' />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getTaskTypeIcon = (type: Task['taskType']) => {
    switch (type) {
      case 'call':
        return <Phone className='h-4 w-4' />;
      case 'email':
        return <Mail className='h-4 w-4' />;
      case 'meeting':
        return <Calendar className='h-4 w-4' />;
      case 'payment_reminder':
        return <DollarSign className='h-4 w-4' />;
      case 'document_review':
        return <FileText className='h-4 w-4' />;
      case 'follow_up':
        return <Target className='h-4 w-4' />;
      default:
        return <Target className='h-4 w-4' />;
    }
  };

  const getTotalStats = () => {
    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === 'pending').length,
      overdueTasks: tasks.filter((t) => t.status === 'overdue').length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      urgentTasks: tasks.filter(
        (t) => t.priority === 'urgent' && t.status !== 'completed'
      ).length,
      todayTasks: tasks.filter(
        (t) =>
          t.dueDate.toDateString() === new Date().toDateString() &&
          t.status !== 'completed'
      ).length
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex h-64 items-center justify-center'>
          <RefreshCw className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>Loading tasks...</span>
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
            <h1 className='text-3xl font-bold'>Tasks & Follow-ups</h1>
            <p className='text-muted-foreground'>
              Manage customer follow-ups, reminders, and action items
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={loadTasks} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Create a follow-up task or reminder for a customer
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='clientId'>Client</Label>
                      <Select
                        value={taskData.clientId}
                        onValueChange={(value) =>
                          setTaskData((prev) => ({ ...prev, clientId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select client' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='client-1'>John Smith</SelectItem>
                          <SelectItem value='client-2'>
                            Sarah Johnson
                          </SelectItem>
                          <SelectItem value='client-3'>Bob Wilson</SelectItem>
                          <SelectItem value='client-4'>Maria Garcia</SelectItem>
                          <SelectItem value='client-5'>David Chen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='taskType'>Task Type</Label>
                      <Select
                        value={taskData.taskType}
                        onValueChange={(value) =>
                          setTaskData((prev) => ({
                            ...prev,
                            taskType: value as Task['taskType']
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='follow_up'>Follow-up</SelectItem>
                          <SelectItem value='call'>Phone Call</SelectItem>
                          <SelectItem value='email'>Email</SelectItem>
                          <SelectItem value='meeting'>Meeting</SelectItem>
                          <SelectItem value='payment_reminder'>
                            Payment Reminder
                          </SelectItem>
                          <SelectItem value='document_review'>
                            Document Review
                          </SelectItem>
                          <SelectItem value='other'>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='title'>Task Title</Label>
                    <Input
                      id='title'
                      placeholder='Enter task title'
                      value={taskData.title}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          title: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      placeholder='Enter task description'
                      rows={3}
                      value={taskData.description}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          description: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <Label htmlFor='dueDate'>Due Date</Label>
                      <Input
                        id='dueDate'
                        type='date'
                        value={taskData.dueDate}
                        onChange={(e) =>
                          setTaskData((prev) => ({
                            ...prev,
                            dueDate: e.target.value
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='dueTime'>Due Time</Label>
                      <Input
                        id='dueTime'
                        type='time'
                        value={taskData.dueTime}
                        onChange={(e) =>
                          setTaskData((prev) => ({
                            ...prev,
                            dueTime: e.target.value
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='priority'>Priority</Label>
                      <Select
                        value={taskData.priority}
                        onValueChange={(value) =>
                          setTaskData((prev) => ({
                            ...prev,
                            priority: value as Task['priority']
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='low'>Low</SelectItem>
                          <SelectItem value='normal'>Normal</SelectItem>
                          <SelectItem value='high'>High</SelectItem>
                          <SelectItem value='urgent'>Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='duration'>
                      Estimated Duration (minutes)
                    </Label>
                    <Input
                      id='duration'
                      type='number'
                      placeholder='30'
                      value={taskData.estimatedDurationMinutes}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          estimatedDurationMinutes:
                            parseInt(e.target.value) || 30
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
                    <Button onClick={handleCreateTask}>
                      <Calendar className='mr-2 h-4 w-4' />
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.totalTasks}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {stats.pendingTasks}
              </div>
              <p className='text-xs text-muted-foreground'>
                {stats.todayTasks} due today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.overdueTasks}
              </div>
              <p className='text-xs text-muted-foreground'>
                Need immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Urgent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.urgentTasks}
              </div>
              <p className='text-xs text-muted-foreground'>
                High priority items
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Filter Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                  <Input
                    placeholder='Search by title, client, or description...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='in_progress'>In Progress</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='overdue'>Overdue</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Priority</SelectItem>
                    <SelectItem value='urgent'>Urgent</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='normal'>Normal</SelectItem>
                    <SelectItem value='low'>Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='follow_up'>Follow-up</SelectItem>
                    <SelectItem value='call'>Call</SelectItem>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='meeting'>Meeting</SelectItem>
                    <SelectItem value='payment_reminder'>Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Tasks ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className='py-8 text-center'>
                <Calendar className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                <h3 className='mb-2 text-lg font-medium'>No tasks found</h3>
                <p className='text-muted-foreground'>
                  {tasks.length === 0
                    ? 'Create your first task to start managing customer follow-ups'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{task.title}</div>
                            <div className='line-clamp-1 text-sm text-muted-foreground'>
                              {task.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            {task.clientName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {getTaskTypeIcon(task.taskType)}
                            <span className='capitalize'>
                              {task.taskType.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {task.dueDate.toLocaleDateString()}
                            </div>
                            {task.dueTime && (
                              <div className='text-muted-foreground'>
                                {task.dueTime}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            {task.status === 'pending' && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleCompleteTask(task.id)}
                              >
                                <CheckCircle className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
