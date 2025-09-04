/**
 * Interactive suggestion buttons.
 */
import React from 'react';

export interface Suggestion {
  text: string;
  id?: string;
  context?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface SuggestionsProps {
  suggestions: Suggestion[];
  title?: string;
  className?: string;
  onSendMessage?: (message: string) => void;
}

function SuggestionsComponent({
  suggestions,
  title = 'Continue the conversation',
  className,
  onSendMessage,
}: SuggestionsProps) {
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (onSendMessage) {
      onSendMessage(suggestion.text);
    }
  };

  return (
    <div className={className}>
      {title && (
        <h4 className="text-sm font-medium text-gray-600 mb-3">{title}</h4>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={suggestion.id || i}
            onClick={() => handleSuggestionClick(suggestion)}
            className="bg-gray-100 hover:bg-gray-200 border rounded-full px-3 py-1.5 text-sm transition-colors"
          >
            {suggestion.text}
            {suggestion.priority === 'high' && (
              <span className="bg-blue-500 ml-1.5 w-1.5 h-1.5 rounded-full inline-block" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export const Suggestions = SuggestionsComponent;

// AIP Metadata - autodiscovery pattern
export const metadata = {
  type: 'suggestions',
  description: 'Interactive follow-up prompts for conversation',
  schema: {
    type: 'object',
    properties: {
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            id: { type: 'string', optional: true },
            context: { type: 'string', optional: true },
            priority: { type: 'string', enum: ['high', 'medium', 'low'], optional: true }
          },
          required: ['text']
        }
      },
      title: { type: 'string', optional: true },
      className: { type: 'string', optional: true }
    },
    required: ['suggestions']
  },
  category: 'interactive'
};