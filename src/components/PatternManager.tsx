import { useState } from 'react';
import { Plus, Trash2, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { usePatterns } from '@/hooks/usePatterns';

export default function PatternManager() {
  const {
    patterns,
    addAccountPattern,
    addNamePattern,
    removeAccountPattern,
    removeNamePattern,
    resetToDefaults
  } = usePatterns();

  const [newAccountPattern, setNewAccountPattern] = useState('');
  const [newNamePattern, setNewNamePattern] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddAccountPattern = () => {
    if (newAccountPattern.trim()) {
      addAccountPattern(newAccountPattern.trim());
      setNewAccountPattern('');
    }
  };

  const handleAddNamePattern = () => {
    if (newNamePattern.trim()) {
      addNamePattern(newNamePattern.trim());
      setNewNamePattern('');
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant='outline' className='mb-4 w-full'>
          <Settings className='mr-2 h-4 w-4' />
          {isOpen ? 'Hide' : 'Show'} Pattern Settings
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Extraction Patterns</CardTitle>
            <CardDescription>
              Manage regex patterns for extracting account numbers and customer
              names. Patterns look for &quot;Customer Name:&quot; and
              &quot;account nbr:&quot; field labels.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Account Patterns */}
            <div>
              <Label className='text-base font-medium'>
                Account Number Patterns
              </Label>
              <p className='mb-3 text-sm text-muted-foreground'>
                These patterns extract account numbers after &quot;account
                nbr:&quot; labels
              </p>

              <div className='mb-3 space-y-2'>
                {patterns.accountPatterns.map((pattern, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <code className='flex-1 rounded bg-muted px-2 py-1 font-mono text-sm'>
                      {pattern}
                    </code>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => removeAccountPattern(index)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>

              <div className='flex gap-2'>
                <Input
                  placeholder='e.g., account\s*nbr[:\s]+(NEWSTX\d+)'
                  value={newAccountPattern}
                  onChange={(e) => setNewAccountPattern(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleAddAccountPattern()
                  }
                />
                <Button onClick={handleAddAccountPattern}>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Name Patterns */}
            <div>
              <Label className='text-base font-medium'>
                Customer Name Patterns
              </Label>
              <p className='mb-3 text-sm text-muted-foreground'>
                These patterns extract names after &quot;Customer Name:&quot;
                labels
              </p>

              <div className='mb-3 space-y-2'>
                {patterns.namePatterns.map((pattern, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <code className='flex-1 rounded bg-muted px-2 py-1 font-mono text-sm'>
                      {pattern}
                    </code>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => removeNamePattern(index)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>

              <div className='flex gap-2'>
                <Input
                  placeholder='e.g., customer\s*name[:\s]+([A-Z][a-z]+\s+[A-Z][a-z]+)'
                  value={newNamePattern}
                  onChange={(e) => setNewNamePattern(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNamePattern()}
                />
                <Button onClick={handleAddNamePattern}>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
            </div>

            <Button
              variant='outline'
              onClick={resetToDefaults}
              className='w-full'
            >
              <RotateCcw className='mr-2 h-4 w-4' />
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
