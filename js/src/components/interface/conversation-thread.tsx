import React from 'react';
import { type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    reasoning?: string;
    citations?: Array<{
      title: string;
      url: string;
      snippet?: string;
    }>;
  };
  replies?: ConversationMessage[];
}

export interface ConversationThreadData {
  messages: ConversationMessage[];
  title?: string;
  context?: string;
  threadId?: string;
  allowReplies?: boolean;
  showMetadata?: boolean;
  showTimestamps?: boolean;
  showReasons?: boolean;
}

export function ConversationThread({
  content,
  interfaceData,
  className,
  onSendMessage,
}: InterfaceProps) {
  const data = interfaceData as ConversationThreadData;
  const messages = data?.messages || [];
  const { 
    title, 
    context, 
    allowReplies = false,
    showMetadata = false,
    showTimestamps = true,
    showReasons = false
  } = data || {};

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

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

  const renderMessage = (message: ConversationMessage, depth = 0) => {
    return (
      <div 
        key={message.id} 
        className={`${getRoleColor(message.role)} border rounded-lg p-4 ${depth > 0 ? 'ml-6 mt-2' : ''}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRoleIcon(message.role)}</span>
            <span className="font-medium capitalize">{message.role}</span>
            {showTimestamps && (
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
            )}
          </div>
          
          {allowReplies && onSendMessage && (
            <button
              onClick={() => onSendMessage(`Reply to: ${message.content.slice(0, 50)}...`)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Reply
            </button>
          )}
        </div>

        <div className="mb-3">
          <MarkdownRenderer 
            content={message.content}
            className="prose prose-sm max-w-none"
          />
        </div>

        {showMetadata && message.metadata && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              {message.metadata.model && (
                <span>Model: {message.metadata.model}</span>
              )}
              {message.metadata.tokens && (
                <span>Tokens: {message.metadata.tokens}</span>
              )}
            </div>
          </div>
        )}

        {showReasons && message.metadata?.reasoning && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                View reasoning
              </summary>
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                <MarkdownRenderer 
                  content={message.metadata.reasoning}
                  className="prose prose-sm max-w-none"
                />
              </div>
            </details>
          </div>
        )}

        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Citations:</div>
            <div className="space-y-1">
              {message.metadata.citations.map((citation, index) => (
                <div key={index} className="text-sm">
                  <a 
                    href={citation.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {citation.title}
                  </a>
                  {citation.snippet && (
                    <div className="text-gray-600 text-xs mt-1">
                      {citation.snippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {message.replies && message.replies.length > 0 && (
          <div className="mt-3">
            {message.replies.map(reply => renderMessage(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}

      {context && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Context:</strong> {context}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map(message => renderMessage(message))}
        </div>
      )}

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No messages in this conversation thread.
        </div>
      )}
    </div>
  );
}

// Export metadata for the component
ConversationThread.meta = {
  description: 'Display threaded conversations with messages, replies, and metadata',
  category: 'conversation',
  tags: ['chat', 'thread', 'conversation', 'messages'],
  examples: [
    `{{conversation-thread:support-chat|title=Support Chat|showMetadata=true}}`,
    `{{conversation-thread:reasoning-trace|showReasons=true|allowReplies=true}}`
  ],
  schema: {
    messages: {
      type: 'array',
      required: true,
      description: 'Array of conversation messages'
    },
    title: {
      type: 'string',
      description: 'Thread title'
    },
    allowReplies: {
      type: 'boolean',
      description: 'Show reply buttons'
    },
    showMetadata: {
      type: 'boolean',
      description: 'Show message metadata'
    },
    showReasons: {
      type: 'boolean',
      description: 'Show reasoning sections'
    }
  }
};