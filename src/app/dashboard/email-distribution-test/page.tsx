'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/page-container';

export default function EmailDistributionTestPage() {
  const [step, setStep] = useState(1);

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>Email Distribution (Test)</h1>
          <p className='text-muted-foreground'>
            Testing the email distribution functionality
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a test page to isolate the email distribution issues.</p>
            <p>Current step: {step}</p>
            <Button onClick={() => setStep(step + 1)}>Next Step</Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
