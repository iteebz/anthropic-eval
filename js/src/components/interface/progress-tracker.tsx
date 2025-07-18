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
      case 'pending': return 'text-gray-500 bg-gray-50';
      case 'in_progress': return 'text-blue-500 bg-blue-50';
      case 'completed': return 'text-green-500 bg-green-50';
      case 'failed': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
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
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
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