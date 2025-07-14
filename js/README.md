# AgentInterface

AI agents choose UI components. Auto-registry. Zero ceremony.

```typescript
import { createAgentInterface } from 'agentinterface';

// Opt-in components
const ai = createAgentInterface(['markdown', 'card-grid', 'timeline']);

// Agent gets clean options string
const options = ai.getOptions();
```

## Components

Auto-discovered from filesystem. Add component = immediately available.

- `markdown` - Default text
- `card-grid` - Visual cards  
- `timeline` - Events
- `expandable-sections` - Collapsible
- `key-insights` - Categorized insights
- `code-snippet` - Code with highlighting
- `blog-post` - Article layout
- `inline-reference` - Expandable refs