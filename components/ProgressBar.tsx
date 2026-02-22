'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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
    <div className="w-full backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/90 rounded-3xl p-4 border border-white/20 dark:border-white/20 light:border-gray-200">
      <div className="flex justify-between mb-3">
        <span className="text-sm font-bold text-white dark:text-white light:text-gray-900">
          {stepTitles[currentStep - 1]}
        </span>
        <span className="text-sm text-white/80 dark:text-white/80 light:text-gray-600">{currentStep}/{totalSteps}</span>
      </div>
      <div className="w-full bg-white/20 dark:bg-white/20 light:bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={cn(
            "h-3 rounded-full transition-all duration-700 ease-out",
            "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-4 gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300",
              i < currentStep
                ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105"
                : i === currentStep - 1
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ring-4 ring-white/30 dark:ring-white/30 light:ring-blue-200 shadow-2xl scale-110"
                : "bg-white/20 dark:bg-white/20 light:bg-gray-200 text-white/50 dark:text-white/50 light:text-gray-400"
            )}
          >
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
