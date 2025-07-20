import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Download,
  AlertTriangle,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  memoryManager,
  type MemoryUsage,
  type ProcessedFile
} from '@/lib/memoryManager';

interface FileCleanupManagerProps {
  currentBatchId?: string;
  onFilesCleared?: (batchId: string) => void;
  showSettings?: boolean;
}

const FileCleanupManager: React.FC<FileCleanupManagerProps> = ({
  currentBatchId,
  onFilesCleared,
  showSettings = true
}) => {
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({
    filesCount: 0,
    totalBytes: 0,
    estimatedSize: '0 B',
    lastUpdated: new Date()
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Update memory usage
  const updateMemoryUsage = () => {
    setMemoryUsage(memoryManager.getMemoryUsage());
  };

  // Refresh memory usage periodically
  useEffect(() => {
    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearBatch = async (batchId: string) => {
    setIsRefreshing(true);
    try {
      const success = memoryManager.clearBatch(batchId);
      if (success) {
        updateMemoryUsage();
        onFilesCleared?.(batchId);
        toast({
          title: 'Files Cleared',
          description: 'Processed files have been removed from memory'
        });
      }
    } catch (error) {
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear files from memory',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearAll = async () => {
    setIsRefreshing(true);
    try {
      const success = memoryManager.clearAllFiles();
      if (success) {
        updateMemoryUsage();
        memoryManager.getBatchIds().forEach((batchId) => {
          onFilesCleared?.(batchId);
        });
        toast({
          title: 'All Files Cleared',
          description: 'All processed files have been removed from memory'
        });
      }
    } catch (error) {
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear all files from memory',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadBatch = (batchId: string) => {
    const files = memoryManager.getFiles(batchId);
    if (files.length === 0) return;

    // This would integrate with existing download functionality
    // For now, just show a toast
    toast({
      title: 'Download Started',
      description: `Downloading ${files.length} files...`
    });
  };

  const getBatches = () => {
    return memoryManager.getBatchIds().map((batchId) => {
      const info = memoryManager.getBatchInfo(batchId);
      return {
        id: batchId,
        count: info?.count || 0,
        size: info?.size || '0 B',
        isCurrent: batchId === currentBatchId
      };
    });
  };

  const getMemoryUsagePercentage = () => {
    // Estimate based on typical browser memory limits (rough calculation)
    const estimatedLimit = 100 * 1024 * 1024; // 100MB rough estimate
    return Math.min((memoryUsage.totalBytes / estimatedLimit) * 100, 100);
  };

  const settings = memoryManager.getSettings();
  const batches = getBatches();

  if (!settings.manualDeleteButtons && memoryUsage.filesCount === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      {/* Memory Usage Overview */}
      {settings.showMemoryUsage && memoryUsage.filesCount > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <HardDrive className='h-4 w-4' />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Usage Stats */}
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-lg font-bold text-blue-600'>
                  {memoryUsage.filesCount}
                </div>
                <div className='text-xs text-muted-foreground'>Files</div>
              </div>
              <div>
                <div className='text-lg font-bold text-green-600'>
                  {memoryUsage.estimatedSize}
                </div>
                <div className='text-xs text-muted-foreground'>Memory</div>
              </div>
              <div>
                <div className='text-lg font-bold text-purple-600'>
                  {batches.length}
                </div>
                <div className='text-xs text-muted-foreground'>Batches</div>
              </div>
            </div>

            {/* Memory Usage Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-xs'>
                <span>Memory Usage</span>
                <span>{Math.round(getMemoryUsagePercentage())}%</span>
              </div>
              <Progress value={getMemoryUsagePercentage()} className='h-2' />
            </div>

            {/* Quick Actions */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={updateMemoryUsage}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`mr-1 h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>

              {memoryUsage.filesCount > 0 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleClearAll}
                  disabled={isRefreshing}
                  className='text-red-600 hover:text-red-700'
                >
                  <Trash2 className='mr-1 h-3 w-3' />
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Management */}
      {settings.manualDeleteButtons && batches.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Trash2 className='h-4 w-4' />
              File Batches
            </CardTitle>
            <CardDescription className='text-xs'>
              Manage processed file batches in memory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    batch.isCurrent ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium'>
                          Batch {batch.id.split('_')[1]?.slice(-4) || 'Unknown'}
                        </span>
                        {batch.isCurrent && (
                          <Badge className='bg-blue-100 text-xs text-blue-700'>
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {batch.count} files • {batch.size}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => downloadBatch(batch.id)}
                      disabled={isRefreshing}
                    >
                      <Download className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleClearBatch(batch.id)}
                      disabled={isRefreshing}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Warning */}
      {getMemoryUsagePercentage() > 80 && (
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-600' />
              <div className='space-y-2'>
                <h4 className='font-medium text-yellow-800'>
                  High Memory Usage
                </h4>
                <p className='text-sm text-yellow-700'>
                  You&apos;re using a significant amount of browser memory.
                  Consider clearing some files or downloading and clearing
                  batches to free up memory.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleClearAll}
                  className='border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                >
                  Clear All Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileCleanupManager;
