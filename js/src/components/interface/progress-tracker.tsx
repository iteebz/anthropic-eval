import React, { useState } from 'react';
import { type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  substeps?: ProgressStep[];
  metadata?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    output?: string;
    error?: string;
    estimatedDuration?: number;
    progress?: number; // 0-100
  };
}

export interface ProgressTrackerData {
  steps: ProgressStep[];
  title?: string;
  description?: string;
  overallStatus?: 'pending' | 'in_progress' | 'completed' | 'failed';
  showTimestamps?: boolean;
  showProgress?: boolean;
  showDetails?: boolean;
  allowRetry?: boolean;
  compact?: boolean;
}

export function ProgressTracker({
  content,
  interfaceData,
  className,
  onSendMessage,
}: InterfaceProps) {
  const data = interfaceData as ProgressTrackerData;
  const { 
    steps = [],
    title,
    description,
    overallStatus = 'pending',
    showTimestamps = true,
    showProgress = true,
    showDetails = false,
    allowRetry = false,
    compact = false
  } = data || {};

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'in_progress': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'skipped': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStepBorderColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-gray-200 bg-gray-50';
      case 'in_progress': return 'border-blue-200 bg-blue-50';
      case 'completed': return 'border-green-200 bg-green-50';
      case 'failed': return 'border-red-200 bg-red-50';
      case 'skipped': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    return `${(duration / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const calculateProgress = (steps: ProgressStep[]): number => {
    if (steps.length === 0) return 0;
    
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const inProgressSteps = steps.filter(s => s.status === 'in_progress').length;
    
    return Math.round(((completedSteps + inProgressSteps * 0.5) / totalSteps) * 100);
  };

  const renderProgressBar = (progress: number) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderStep = (step: ProgressStep, depth = 0) => {
    const isExpanded = expandedSteps.has(step.id);
    const hasDetails = step.metadata?.output || step.metadata?.error || step.substeps?.length;
    
    return (
      <div 
        key={step.id}
        className={`${getStepBorderColor(step.status)} border rounded-lg p-4 ${depth > 0 ? 'ml-6 mt-2' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className={`text-lg ${getStatusColor(step.status)}`}>
              {getStatusIcon(step.status)}
            </span>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{step.title}</h4>
                
                {step.metadata?.progress !== undefined && step.status === 'in_progress' && (
                  <span className="text-sm text-gray-600">
                    ({step.metadata.progress}%)
                  </span>
                )}
                
                {showTimestamps && step.metadata?.startTime && (
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(step.metadata.startTime)}
                  </span>
                )}
                
                {step.metadata?.duration && (
                  <span className="text-xs text-gray-500">
                    {formatDuration(step.metadata.duration)}
                  </span>
                )}
              </div>
              
              {step.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {step.description}
                </div>
              )}
              
              {step.metadata?.progress !== undefined && step.status === 'in_progress' && showProgress && (
                <div className="mt-2">
                  {renderProgressBar(step.metadata.progress)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {allowRetry && step.status === 'failed' && onSendMessage && (
              <button
                onClick={() => onSendMessage(`Retry step: ${step.id}`)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Retry
              </button>
            )}
            
            {hasDetails && !compact && (
              <button
                onClick={() => toggleStepExpansion(step.id)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && hasDetails && (
          <div className="mt-4 space-y-3">
            {step.metadata?.output && (
              <div className="bg-gray-100 border border-gray-200 rounded p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Output:</div>
                <div className="text-sm text-gray-800 font-mono">
                  <MarkdownRenderer 
                    content={step.metadata.output}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </div>
            )}
            
            {step.metadata?.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-sm font-medium text-red-700 mb-1">Error:</div>
                <div className="text-sm text-red-800 font-mono">
                  {step.metadata.error}
                </div>
              </div>
            )}
            
            {step.substeps && step.substeps.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Substeps:</div>
                {step.substeps.map(substep => renderStep(substep, depth + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const overallProgress = calculateProgress(steps);
  
  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}
      
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className={getStatusColor(overallStatus)}>
              {getStatusIcon(overallStatus)}
            </span>
            {title}
          </h2>
        </div>
      )}
      
      {description && (
        <div className="mb-4 text-gray-600">
          <MarkdownRenderer content={description} />
        </div>
      )}
      
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm text-gray-600">
              {overallProgress}% Complete
            </span>
          </div>
          {renderProgressBar(overallProgress)}
        </div>
      )}
      
      {steps.length > 0 && (
        <div className="space-y-4">
          {steps.map(step => renderStep(step))}
        </div>
      )}
      
      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No steps to track.
        </div>
      )}
    </div>
  );
}

// Export metadata for the component
ProgressTracker.meta = {
  description: 'Track progress of multi-step processes with status and timing',
  category: 'workflow',
  tags: ['progress', 'tracker', 'workflow', 'status', 'steps'],
  examples: [
    `{{progress-tracker:deployment|title=Deployment Progress|showProgress=true}}`,
    `{{progress-tracker:build-process|showDetails=true|allowRetry=true}}`
  ],
  schema: {
    steps: {
      type: 'array',
      required: true,
      description: 'Array of progress steps'
    },
    title: {
      type: 'string',
      description: 'Progress tracker title'
    },
    overallStatus: {
      type: 'string',
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      description: 'Overall process status'
    },
    showProgress: {
      type: 'boolean',
      description: 'Show progress bars'
    },
    showDetails: {
      type: 'boolean',
      description: 'Show expandable step details'
    },
    allowRetry: {
      type: 'boolean',
      description: 'Show retry buttons for failed steps'
    }
  }
};