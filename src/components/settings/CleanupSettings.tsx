import React, { useState, useEffect } from 'react';
import {
  Settings,
  Trash2,
  Clock,
  Shield,
  HardDrive,
  AlertTriangle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CleanupSettings {
  autoClearAfterDownload: boolean;
  showMemoryUsage: boolean;
  sessionWarnings: boolean;
  manualDeleteButtons: boolean;
  confirmBeforeDelete: boolean;
}

interface CleanupSettingsProps {
  onSettingsChange: (settings: CleanupSettings) => void;
  memoryUsage?: {
    filesCount: number;
    estimatedSize: string;
  };
}

const DEFAULT_SETTINGS: CleanupSettings = {
  autoClearAfterDownload: false,
  showMemoryUsage: true,
  sessionWarnings: true,
  manualDeleteButtons: true,
  confirmBeforeDelete: true
};

const CleanupSettingsComponent: React.FC<CleanupSettingsProps> = ({
  onSettingsChange,
  memoryUsage
}) => {
  const [settings, setSettings] = useState<CleanupSettings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pdfCleanupSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load cleanup settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage and notify parent
  const updateSettings = (newSettings: CleanupSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pdfCleanupSettings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);

    toast({
      title: 'Settings Updated',
      description: 'Cleanup preferences have been saved'
    });
  };

  const handleSettingChange = (key: keyof CleanupSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    updateSettings(newSettings);
  };

  const resetToDefaults = () => {
    updateSettings(DEFAULT_SETTINGS);
    toast({
      title: 'Settings Reset',
      description: 'Cleanup settings have been reset to defaults'
    });
  };

  return (
    <div className='space-y-4'>
      {/* Settings Toggle Button */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-2'
        >
          <Settings className='h-4 w-4' />
          Cleanup Settings
        </Button>

        {/* Memory Usage Indicator */}
        {settings.showMemoryUsage &&
          memoryUsage &&
          memoryUsage.filesCount > 0 && (
            <div className='flex items-center gap-2'>
              <HardDrive className='h-4 w-4 text-blue-600' />
              <Badge variant='outline' className='text-xs'>
                {memoryUsage.filesCount} files • {memoryUsage.estimatedSize}
              </Badge>
            </div>
          )}
      </div>

      {/* Settings Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              PDF Cleanup & Memory Management
            </CardTitle>
            <CardDescription>
              Configure how processed PDF files are managed in memory
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Auto-clear Setting */}
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-blue-600' />
                  <Label className='font-medium'>
                    Auto-clear After Download
                  </Label>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Automatically clear processed files from memory after ZIP
                  download
                </p>
              </div>
              <Switch
                checked={settings.autoClearAfterDownload}
                onCheckedChange={(checked) =>
                  handleSettingChange('autoClearAfterDownload', checked)
                }
              />
            </div>

            {/* Memory Usage Display */}
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <HardDrive className='h-4 w-4 text-green-600' />
                  <Label className='font-medium'>Show Memory Usage</Label>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Display memory usage indicator for processed files
                </p>
              </div>
              <Switch
                checked={settings.showMemoryUsage}
                onCheckedChange={(checked) =>
                  handleSettingChange('showMemoryUsage', checked)
                }
              />
            </div>

            {/* Session Warnings */}
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 text-yellow-600' />
                  <Label className='font-medium'>Session Warnings</Label>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Warn before page refresh when processed files will be lost
                </p>
              </div>
              <Switch
                checked={settings.sessionWarnings}
                onCheckedChange={(checked) =>
                  handleSettingChange('sessionWarnings', checked)
                }
              />
            </div>

            {/* Manual Delete Buttons */}
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Trash2 className='h-4 w-4 text-red-600' />
                  <Label className='font-medium'>Manual Delete Buttons</Label>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Show delete buttons for immediate cleanup of processed files
                </p>
              </div>
              <Switch
                checked={settings.manualDeleteButtons}
                onCheckedChange={(checked) =>
                  handleSettingChange('manualDeleteButtons', checked)
                }
              />
            </div>

            {/* Delete Confirmation */}
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-purple-600' />
                  <Label className='font-medium'>Confirm Before Delete</Label>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Show confirmation dialog before deleting processed files
                </p>
              </div>
              <Switch
                checked={settings.confirmBeforeDelete}
                onCheckedChange={(checked) =>
                  handleSettingChange('confirmBeforeDelete', checked)
                }
              />
            </div>

            {/* Privacy Notice */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <div className='flex items-start gap-3'>
                <Shield className='mt-0.5 h-5 w-5 text-blue-600' />
                <div className='space-y-2'>
                  <h4 className='font-medium text-blue-800'>
                    Privacy & Security
                  </h4>
                  <div className='space-y-1 text-sm text-blue-700'>
                    <p>
                      • All PDF files are stored only in browser memory (RAM)
                    </p>
                    <p>• No files are saved to your computer's hard drive</p>
                    <p>
                      • Files are automatically cleared when you close the
                      browser
                    </p>
                    <p>
                      • Page refresh will clear all processed files from memory
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-2 border-t pt-4'>
              <Button variant='outline' onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button variant='outline' onClick={() => setIsOpen(false)}>
                Close Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CleanupSettingsComponent;
