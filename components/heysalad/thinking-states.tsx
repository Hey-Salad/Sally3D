'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThinkingState {
  id: string;
  label: string;
}

const defaultStates: ThinkingState[] = [
  { id: 'thinking', label: 'thinking' },
  { id: 'analyzing', label: 'analyzing requirements' },
  { id: 'designing', label: 'designing the model' },
  { id: 'finalizing', label: 'finalising the answer' },
];

interface ThinkingStatesProps {
  active: boolean;
  states?: ThinkingState[];
  title?: string;
  description?: string;
}

export function ThinkingStates({ 
  active,
  states = defaultStates,
  title = 'Sally is thinking',
  description = 'Checking your prompt, thread context, and the right tools.'
}: ThinkingStatesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentIndex(0);
      setElapsed(0);
      return;
    }

    const startTime = Date.now();
    const elapsedInterval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 250);

    const stateInterval = setInterval(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, states.length - 1));
    }, 2500);

    return () => {
      clearInterval(elapsedInterval);
      clearInterval(stateInterval);
    };
  }, [active, states.length]);

  if (!active) return null;

  const currentState = states[currentIndex];
  const dynamicTitle = currentIndex === 0 
    ? title 
    : `Sally is ${currentState.label}`;

  const dynamicDescription = currentIndex === 0
    ? description
    : currentIndex === states.length - 1
    ? 'Putting together a clear, helpful response.'
    : 'Working through the details with care.';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 max-w-2xl">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-medium text-foreground">{dynamicTitle}</h3>
        <span className="text-xs font-medium text-coral bg-coral-glow px-2 py-0.5 rounded-md">
          {elapsed}s
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{dynamicDescription}</p>

      <div className="space-y-2">
        {states.map((state, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;
          
          return (
            <div
              key={state.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                isActive && 'bg-coral-glow border border-coral/30',
                isComplete && 'bg-secondary/40',
                !isActive && !isComplete && 'bg-secondary/20'
              )}
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  isActive && 'bg-coral animate-pulse',
                  isComplete && 'bg-success',
                  !isActive && !isComplete && 'bg-muted-foreground/40'
                )}
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  isActive && 'text-foreground font-medium',
                  isComplete && 'text-foreground/70',
                  !isActive && !isComplete && 'text-muted-foreground'
                )}
              >
                {state.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
