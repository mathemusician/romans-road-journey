'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const stepTitles = [
  'All Have Sinned',
  'Consequence of Sin',
  "God's Love",
  'Salvation Through Faith',
  'Call Upon the Lord'
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
        </span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-500 ease-out",
            "bg-gradient-to-r from-blue-500 to-purple-600"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
              i < currentStep
                ? "bg-green-500 text-white"
                : i === currentStep - 1
                ? "bg-blue-600 text-white ring-4 ring-blue-200"
                : "bg-gray-300 text-gray-600"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
