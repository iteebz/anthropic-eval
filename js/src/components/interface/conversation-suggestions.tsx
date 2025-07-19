import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { Badge } from '../ui/badge';

const SuggestionSchema = z.object({
  text: z.string(),
  id: z.string().optional(),
  context: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional()
});

const ConversationSuggestionsSchema = z.object({
  suggestions: z.array(SuggestionSchema),
  title: z.string().optional(),
  className: z.string().optional(),
  onSendMessage: z.function().optional()
});

type ConversationSuggestionsData = z.infer<typeof ConversationSuggestionsSchema>;

export function ConversationSuggestions(props: ConversationSuggestionsData) {
  const { suggestions, title = "Continue the conversation", className, onSendMessage } = props;

  const handleSuggestionClick = (suggestion: z.infer<typeof SuggestionSchema>) => {
    onSendMessage?.(JSON.stringify({
      type: 'suggestion-selected',
      suggestion: suggestion.text,
      suggestionId: suggestion.id,
      context: suggestion.context,
      priority: suggestion.priority
    }));
  };

  if (!suggestions.length) return null;

  return (
    <div className={className}>
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={suggestion.id || i}
            onClick={() => handleSuggestionClick(suggestion)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 border border-border rounded-full transition-colors duration-200 hover:shadow-sm"
          >
            {suggestion.text}
            {suggestion.priority === 'high' && (
              <span className="ml-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

registerComponent({
  type: 'conversation-suggestions',
  schema: ConversationSuggestionsSchema,
  render: ConversationSuggestions
});