import React from 'react';

export interface Insight {
  title: string;
  description: string;
  category?: string;
}

export interface InsightsProps {
  insights: Insight[];
  className?: string;
}

function InsightsComponent({ insights, className }: InsightsProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r">
            <div className="font-medium mb-1">{insight.title}</div>
            {insight.category && (
              <div className="text-xs text-gray-600 mb-1">{insight.category}</div>
            )}
            <div className="text-sm text-gray-700">{insight.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Insights = InsightsComponent;