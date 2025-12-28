'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Header } from '@/components/header';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const questions = [
  {
    id: 'business_type',
    question: 'Industry',
    description: 'Select your primary business type',
    options: [
      { label: 'Restaurant / Food Service', value: 'restaurant', credits: ['TIP', 'WOTC', 'ERC'] },
      { label: 'Hotel / Hospitality', value: 'hotel', credits: ['TIP', 'WOTC', 'ERC'] },
      { label: 'Retail', value: 'retail', credits: ['WOTC', 'ERC'] },
      { label: 'Healthcare', value: 'healthcare', credits: ['WOTC', 'ERC'] },
      { label: 'Construction', value: 'construction', credits: ['WOTC', 'ERC'] },
      { label: 'Professional Services', value: 'professional', credits: ['WOTC', 'ERC'] },
      { label: 'Manufacturing', value: 'manufacturing', credits: ['WOTC', 'ERC'] },
      { label: 'Other', value: 'other', credits: ['WOTC', 'ERC'] },
    ],
  },
  {
    id: 'employee_count',
    question: 'Workforce size',
    description: 'Number of W-2 employees',
    options: [
      { label: '1–10', value: '1-10' },
      { label: '11–50', value: '11-50' },
      { label: '51–100', value: '51-100' },
      { label: '101–500', value: '101-500' },
      { label: '500+', value: '500+' },
    ],
  },
  {
    id: 'tipped_employees',
    question: 'Tipped employees',
    description: 'Do employees receive tips?',
    options: [
      { label: 'Yes', value: 'yes', credits: ['TIP'] },
      { label: 'No', value: 'no' },
    ],
  },
  {
    id: 'covid_impact',
    question: 'COVID-19 impact',
    description: '2020–2021 operational status',
    options: [
      { label: 'Operations suspended or limited', value: 'suspended', credits: ['ERC'] },
      { label: 'Significant revenue decline', value: 'revenue_decline', credits: ['ERC'] },
      { label: 'Both of the above', value: 'both', credits: ['ERC'] },
      { label: 'No significant impact', value: 'no' },
    ],
  },
  {
    id: 'hiring_practices',
    question: 'Hiring practices',
    description: 'Select populations you hire from',
    multiSelect: true,
    options: [
      { label: 'Veterans', value: 'veterans', credits: ['WOTC'] },
      { label: 'SNAP recipients', value: 'snap', credits: ['WOTC'] },
      { label: 'Long-term unemployed', value: 'unemployed', credits: ['WOTC'] },
      { label: 'Ex-felons', value: 'ex_felons', credits: ['WOTC'] },
      { label: 'None of the above', value: 'none' },
    ],
  },
  {
    id: 'annual_payroll',
    question: 'Annual payroll',
    description: 'Approximate total',
    options: [
      { label: 'Under $100K', value: 'under_100k' },
      { label: '$100K – $500K', value: '100k_500k' },
      { label: '$500K – $1M', value: '500k_1m' },
      { label: '$1M – $5M', value: '1m_5m' },
      { label: 'Over $5M', value: 'over_5m' },
    ],
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  function handleAnswer(value: string) {
    const question = questions[currentStep];

    if (question.multiSelect) {
      const current = (answers[question.id] as string[]) || [];
      if (value === 'none') {
        setAnswers({ ...answers, [question.id]: ['none'] });
      } else {
        const filtered = current.filter((v) => v !== 'none');
        if (filtered.includes(value)) {
          setAnswers({ ...answers, [question.id]: filtered.filter((v) => v !== value) });
        } else {
          setAnswers({ ...answers, [question.id]: [...filtered, value] });
        }
      }
    } else {
      setAnswers({ ...answers, [question.id]: value });
    }
  }

  function isSelected(value: string) {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  }

  function canProceed() {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.multiSelect) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  }

  function next() {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  }

  function prev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  function getEligibleCredits() {
    const credits: { code: string; name: string; potential: string }[] = [];

    const covidImpact = answers['covid_impact'];
    if (covidImpact && covidImpact !== 'no') {
      const empCount = answers['employee_count'];
      let potential = '$10,000 – $50,000';
      if (empCount === '51-100') potential = '$50,000 – $250,000';
      if (empCount === '101-500') potential = '$250,000 – $1,000,000';
      if (empCount === '500+') potential = '$1,000,000+';
      credits.push({ code: 'ERC', name: 'Employee Retention Credit', potential });
    }

    if (answers['tipped_employees'] === 'yes') {
      credits.push({ code: 'TIP', name: 'FICA Tip Credit', potential: '$5,000 – $100,000/year' });
    }

    const hiringPractices = answers['hiring_practices'];
    if (Array.isArray(hiringPractices) && hiringPractices.length > 0 && !hiringPractices.includes('none')) {
      credits.push({ code: 'WOTC', name: 'Work Opportunity Tax Credit', potential: '$2,400 – $9,600/hire' });
    }

    return credits;
  }

  if (showResults) {
    const eligibleCredits = getEligibleCredits();

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="min-h-[80vh] flex items-center justify-center px-6">
            <div className="max-w-lg w-full">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Assessment Complete
              </p>
              <h1 className="text-3xl font-light mb-8">
                Preliminary Credit Exposure
              </h1>

              {eligibleCredits.length > 0 ? (
                <div className="space-y-6 mb-12">
                  {eligibleCredits.map((credit) => (
                    <div key={credit.code} className="border border-border/30 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{credit.code}</p>
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-medium mb-1">{credit.name}</h3>
                      <p className="text-2xl font-light text-primary">{credit.potential}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-border/30 rounded-lg p-8 text-center mb-12">
                  <p className="text-muted-foreground">
                    No obvious matches identified. A detailed assessment may reveal additional opportunities.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Link href="/estimator" className="block">
                  <Button className="w-full">
                    Continue to Full Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/calculator" className="block">
                  <Button variant="outline" className="w-full">
                    Try Calculator
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-8">
                Full assessment provides verified estimates with specialist review.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="max-w-lg w-full">
            {/* Progress */}
            <div className="mb-12">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="uppercase tracking-wider">Question {currentStep + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-0.5" />
            </div>

            {/* Question */}
            <div className="mb-10">
              <h2 className="text-2xl font-light mb-2">{currentQuestion.question}</h2>
              <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
              {currentQuestion.multiSelect && (
                <p className="text-xs text-primary mt-2">Select all that apply</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-2 mb-12">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={cn(
                    'w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between',
                    isSelected(option.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border/30 hover:border-border'
                  )}
                >
                  <span className="text-sm">{option.label}</span>
                  {isSelected(option.value) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={prev} disabled={currentStep === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={next} disabled={!canProceed()}>
                {currentStep === questions.length - 1 ? 'View Results' : 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
