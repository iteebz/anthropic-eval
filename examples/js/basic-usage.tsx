import React from 'react';
import { AgentInterfaceRenderer } from '@agentinterface/react';

// Example 1: Basic markdown response
const markdownExample = `
RESPONSE: This is a simple markdown response with **bold** and *italic* text.
INTERFACE_TYPE: markdown
`;

// Example 2: Project cards response  
const projectCardsExample = `
THINKING: User is asking about my projects, should show project cards
RESPONSE: Here are my latest projects:
INTERFACE_TYPE: project_cards
INTERFACE_DATA: {
  "projects": [
    {
      "title": "AI Agent System",
      "description": "Multi-node reasoning system for conversational AI",
      "technologies": ["Python", "FastAPI", "React", "TypeScript"],
      "status": "active",
      "link": "https://github.com/user/ai-agent"
    },
    {
      "title": "Portfolio Website",
      "description": "Dynamic portfolio with agent-driven UI selection",
      "technologies": ["React", "TanStack Start", "Tailwind"],
      "status": "completed",
      "link": "https://tysonchan.com"
    }
  ]
}
`;

// Example 3: Timeline response
const timelineExample = `
RESPONSE: Here's my professional timeline:
INTERFACE_TYPE: timeline
INTERFACE_DATA: {
  "events": [
    {
      "title": "Started AI Research",
      "date": "2023-01-01",
      "description": "Began research into conversational AI systems",
      "type": "milestone"
    },
    {
      "title": "Launched AgentInterface Protocol",
      "date": "2024-06-15",
      "description": "Released open-source agent-to-UI communication protocol",
      "type": "achievement"
    }
  ]
}
`;

export function BasicUsageExamples() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold mb-6">AgentInterface Examples</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Markdown Response</h2>
          <div className="border rounded-lg p-4">
            <AgentInterfaceRenderer response={markdownExample} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Project Cards</h2>
          <div className="border rounded-lg p-4">
            <AgentInterfaceRenderer response={projectCardsExample} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Timeline</h2>
          <div className="border rounded-lg p-4">
            <AgentInterfaceRenderer response={timelineExample} />
          </div>
        </section>
      </div>
    </div>
  );
}