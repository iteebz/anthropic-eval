import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';

const ProgressTrackerSchema = z.object({
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
    description: z.string().optional()
  })),
  title: z.string().optional(),
  className: z.string().optional()
});

type ProgressTrackerData = z.infer<typeof ProgressTrackerSchema>;

export function ProgressTracker(props: ProgressTrackerData) {
  const { steps, title, className } = props;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-muted-foreground bg-muted/30';
      case 'in_progress': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20';
      case 'completed': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20';
      case 'failed': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/30';
    }
  };

  const calculateProgress = () => {
    const completed = steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / steps.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className={className}>
      {title && (
        <h2 className="text-xl font-bold mb-4">{title}</h2>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className={`border rounded-lg p-4 ${getStatusColor(step.status)}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{getStatusIcon(step.status)}</span>
              <div>
                <h4 className="font-medium">{step.title}</h4>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'progress-tracker',
  schema: ProgressTrackerSchema,
  render: ProgressTracker
});