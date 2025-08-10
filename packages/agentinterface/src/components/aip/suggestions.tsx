import React from 'react';
import { z } from 'zod';
import { register } from '../../registry';

export const SuggestionsSchema = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          id: { type: 'string' },
          context: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['text'],
      },
    },
    title: { type: 'string' },
    className: { type: 'string' },
    onSendMessage: { type: 'object' },
  },
  required: ['suggestions'],
} as const;

export const metadata = {
  type: 'suggestions',
  description:
    'Interactive suggestion buttons for continuing conversations with MCP callback support',
  schema: SuggestionsSchema,
  category: 'interface',
  tags: ['suggestions', 'interactive', 'conversation'],
} as const;

const SuggestionValidator = z.object({
  text: z.string(),
  id: z.string().optional(),
  context: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

const SuggestionsValidator = z.object({
  suggestions: z.array(SuggestionValidator),
  title: z.string().optional(),
  className: z.string().optional(),
  onSendMessage: z.any().optional(),
});

type SuggestionsData = z.infer<typeof SuggestionsValidator>;

export function Suggestions(props: SuggestionsData) {
  const {
    suggestions,
    title = 'Continue the conversation',
    className,
    onSendMessage,
  } = props;

  const handleSuggestionClick = (
    suggestion: z.infer<typeof SuggestionValidator>,
  ) => {
    onSendMessage?.(
      JSON.stringify({
        type: 'suggestion-selected',
        suggestion: suggestion.text,
        suggestionId: suggestion.id,
        context: suggestion.context,
        priority: suggestion.priority,
      }),
    );
  };

  if (!suggestions.length) return null;

  return (
    <div className={className}>
      {title && (
        <h4 className="text-muted-foreground mb-3 text-sm font-medium">
          {title}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={suggestion.id || i}
            onClick={() => handleSuggestionClick(suggestion)}
            className="bg-muted hover:bg-muted/80 border-border inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors duration-200 hover:shadow-sm"
          >
            {suggestion.text}
            {suggestion.priority === 'high' && (
              <span className="bg-primary ml-1.5 size-1.5 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

register({
  type: 'suggestions',
  schema: SuggestionsValidator,
  render: Suggestions,
});
