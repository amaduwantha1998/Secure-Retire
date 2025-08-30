import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Route } from 'lucide-react';

export function GuidedTourButton() {
  const [runTour, setRunTour] = React.useState(false);

  const steps: Step[] = [
    {
      target: '.dashboard-nav',
      content: 'Welcome! This is your main navigation. Access all features from here.',
    },
    {
      target: '[data-tour="overview"]',
      content: 'Start here to see your financial overview and key metrics.',
    },
    {
      target: '[data-tour="financial"]',
      content: 'Manage your assets, income, and debts in the Financial Management section.',
    },
    {
      target: '[data-tour="beneficiaries"]',
      content: 'Add and manage your beneficiaries for estate planning.',
    },
    {
      target: '[data-tour="consultations"]',
      content: 'Book consultations with financial advisors and tax experts.',
    },
    {
      target: '[data-tour="profile"]',
      content: 'Configure your profile settings, privacy, and accessibility options.',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setRunTour(true)}
        className="flex items-center gap-2"
      >
        <Route className="h-4 w-4" />
        Take Tour
      </Button>
      
      <Joyride
        steps={steps}
        run={runTour}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
          }
        }}
      />
    </>
  );
}