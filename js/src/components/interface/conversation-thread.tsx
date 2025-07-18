import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';

const ConversationThreadSchema = z.object({
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string()
  })),
  title: z.string().optional(),
  className: z.string().optional()
});

type ConversationThreadData = z.infer<typeof ConversationThreadSchema>;

export function ConversationThread(props: ConversationThreadData) {
  const { messages, title, className } = props;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-blue-50 border-blue-200';
      case 'assistant': return 'bg-green-50 border-green-200';
      case 'system': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return '👤';
      case 'assistant': return '🤖';
      case 'system': return '⚙️';
      default: return '❓';
    }
  };

  return (
    <div className={className}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className={`${getRoleColor(message.role)} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getRoleIcon(message.role)}</span>
              <span className="font-medium capitalize">{message.role}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="prose prose-sm max-w-none">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'conversation-thread',
  schema: ConversationThreadSchema,
  render: ConversationThread
});